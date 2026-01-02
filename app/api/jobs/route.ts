import { NextRequest, NextResponse } from 'next/server'
import { createJob } from '@/lib/db/queries'
import { createConversionJob } from '@/lib/queue'
import { converterRegistry } from '@/lib/conversion/registry'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileKey, inputMime, outputFormat } = body

    if (!fileKey || !inputMime || !outputFormat) {
      return NextResponse.json(
        { error: 'Missing required fields: fileKey, inputMime, outputFormat' },
        { status: 400 }
      )
    }

    // Check if conversion is supported
    const converter = converterRegistry.findConverterForConversion(inputMime, outputFormat)
    if (!converter) {
      return NextResponse.json(
        { error: `Conversion from ${inputMime} to ${outputFormat} is not supported` },
        { status: 400 }
      )
    }

    // Create job in database
    const jobId = nanoid()
    await createJob({
      id: jobId,
      inputFileKey: fileKey,
      inputMime,
      outputFormat,
    })

    // Queue conversion job
    await createConversionJob({
      jobId,
      inputFileKey: fileKey,
      inputMime,
      outputFormat,
    })

    return NextResponse.json({
      id: jobId,
      status: 'queued',
    })
  } catch (error: any) {
    console.error('Job creation error:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { listJobs } = await import('@/lib/db/queries')
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const jobs = await listJobs(limit, offset)

    return NextResponse.json({ jobs })
  } catch (error: any) {
    console.error('Jobs list error:', error)
    return NextResponse.json({ error: 'Failed to list jobs' }, { status: 500 })
  }
}

