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
    'image/bmp',
    'image/tiff',
    'image/tif',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/avif',
    'image/heic',
    'image/heif',
  ]
  supportedOutputFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'ico', 'avif']
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
    } else if (outputFormat === 'gif') {
      pipeline = pipeline.gif()
    } else if (outputFormat === 'bmp') {
      pipeline = pipeline.bmp()
    } else if (outputFormat === 'tiff') {
      pipeline = pipeline.tiff({ compression: 'lzw' })
    } else if (outputFormat === 'avif') {
      pipeline = pipeline.avif({ quality: options?.quality || 90 })
    } else if (outputFormat === 'ico') {
      // ICO is typically a container format, convert to PNG first then handle
      pipeline = pipeline.png()
    } else if (outputFormat === 'svg') {
      // SVG conversion is complex, would need specialized library
      // For now, convert raster formats to SVG (simplified)
      throw new Error('SVG output requires specialized conversion. Please use PNG, JPG, or WebP instead.')
    }

    await pipeline.toFile(outputPath)
    return outputPath
  }
}

