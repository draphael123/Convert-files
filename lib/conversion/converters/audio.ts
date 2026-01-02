import { Converter } from '../types'
import { join } from 'path'
import { tmpdir } from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class AudioConverter implements Converter {
  id = 'audio'
  name = 'Audio Converter'
  supportedInputMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
  ]
  supportedOutputFormats = ['mp3', 'wav']
  constraints = {
    maxFileSizeMB: 100,
    timeoutMs: 300000, // 5 minutes
  }

  async run(inputPath: string, outputFormat: string): Promise<string> {
    const outputPath = join(tmpdir(), `convert-${Date.now()}-${Math.random().toString(36).substring(7)}.${outputFormat}`)
    
    // Use ffmpeg to convert
    const command = `ffmpeg -i "${inputPath}" -y "${outputPath}"`
    
    try {
      await execAsync(command, {
        timeout: this.constraints.timeoutMs,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      })
      return outputPath
    } catch (error: any) {
      throw new Error(`FFmpeg conversion failed: ${error.message}`)
    }
  }
}

