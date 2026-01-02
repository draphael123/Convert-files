import { Worker } from 'bullmq'
import { getQueueConnection, ConversionJobData } from '../lib/queue'
import { converterRegistry } from '../lib/conversion/registry'
import { getStorage } from '../lib/storage'
import { updateJobStatus, addJobEvent } from '../lib/db/queries'
import { readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { nanoid } from 'nanoid'

const worker = new Worker<ConversionJobData>(
  'conversions',
  async (job) => {
    const { jobId, inputFileKey, inputMime, outputFormat } = job.data

    try {
      // Update job status to running
      await updateJobStatus(jobId, 'running')
      await addJobEvent(jobId, 'info', 'Conversion started')

      // Get storage adapter
      const storage = getStorage()

      // Download input file
      await addJobEvent(jobId, 'info', 'Downloading input file')
      const inputBuffer = await storage.download(inputFileKey)
      
      // Save to temp file
      const inputTempPath = join(tmpdir(), `input-${nanoid()}`)
      const { writeFile: writeFileSync } = await import('fs/promises')
      await writeFileSync(inputTempPath, inputBuffer)

      // Find converter
      const converter = converterRegistry.findConverterForConversion(inputMime, outputFormat)
      if (!converter) {
        throw new Error(`No converter found for ${inputMime} → ${outputFormat}`)
      }

      // Check constraints
      const fileSizeMB = inputBuffer.length / (1024 * 1024)
      if (converter.constraints?.maxFileSizeMB && fileSizeMB > converter.constraints.maxFileSizeMB) {
        throw new Error(`File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum (${converter.constraints.maxFileSizeMB}MB)`)
      }

      // Run conversion with timeout
      await addJobEvent(jobId, 'info', `Running conversion with ${converter.name}`)
      const timeoutMs = converter.constraints?.timeoutMs || 300000
      
      const outputTempPath = await Promise.race([
        converter.run(inputTempPath, outputFormat),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Conversion timeout')), timeoutMs)
        ),
      ])

      // Upload output file
      await addJobEvent(jobId, 'info', 'Uploading output file')
      const outputBuffer = await readFile(outputTempPath)
      const outputFileKey = `outputs/${jobId}/${nanoid()}.${outputFormat}`
      const outputMimeType = converterRegistry.getMimeTypeForFormat(outputFormat)
      await storage.upload(outputBuffer, outputFileKey, outputMimeType)

      // Clean up temp files
      try {
        await unlink(inputTempPath)
        await unlink(outputTempPath)
      } catch (error) {
        // Ignore cleanup errors
      }

      // Update job status
      await updateJobStatus(jobId, 'succeeded', outputFileKey)
      await addJobEvent(jobId, 'info', 'Conversion completed successfully')

      return { outputFileKey }
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error'
      await updateJobStatus(jobId, 'failed', null, 'CONVERSION_ERROR', errorMessage)
      await addJobEvent(jobId, 'error', errorMessage)
      throw error
    }
  },
  {
    connection: getQueueConnection(),
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3'),
  }
)

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message)
})

console.log('🚀 Conversion worker started')

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...')
  await worker.close()
  process.exit(0)
})

