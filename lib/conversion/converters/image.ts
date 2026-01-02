import sharp from 'sharp'
import { Converter, ConversionOptions } from '../types'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export class ImageConverter implements Converter {
  id = 'image'
  name = 'Image Converter'
  supportedInputMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
  ]
  supportedOutputFormats = ['png', 'jpg', 'jpeg', 'webp']
  constraints = {
    maxFileSizeMB: 50,
    timeoutMs: 60000,
  }

  async run(inputPath: string, outputFormat: string, options?: ConversionOptions): Promise<string> {
    const outputPath = join(tmpdir(), `convert-${Date.now()}-${Math.random().toString(36).substring(7)}.${outputFormat}`)
    
    let pipeline = sharp(inputPath)

    // Handle format-specific options
    if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: options?.quality || 90 })
    } else if (outputFormat === 'webp') {
      pipeline = pipeline.webp({ quality: options?.quality || 90 })
    } else if (outputFormat === 'png') {
      pipeline = pipeline.png()
    }

    await pipeline.toFile(outputPath)
    return outputPath
  }
}

