import { Converter } from '../types'
import { join } from 'path'
import { tmpdir } from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class VideoConverter implements Converter {
  id = 'video'
  name = 'Video Converter'
  supportedInputMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/x-msvideo', // AVI
  ]
  supportedOutputFormats = ['webm', 'mp4']
  constraints = {
    maxFileSizeMB: 500,
    timeoutMs: 600000, // 10 minutes
  }

  async run(inputPath: string, outputFormat: string): Promise<string> {
    const outputPath = join(tmpdir(), `convert-${Date.now()}-${Math.random().toString(36).substring(7)}.${outputFormat}`)
    
    // Use ffmpeg to convert
    const command = `ffmpeg -i "${inputPath}" -c:v libvpx-vp9 -c:a libopus -y "${outputPath}"`
    
    try {
      await execAsync(command, {
        timeout: this.constraints.timeoutMs,
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      })
      return outputPath
    } catch (error: any) {
      throw new Error(`FFmpeg conversion failed: ${error.message}`)
    }
  }
}

