import { Converter, FormatInfo } from './types'
import { ImageConverter } from './converters/image'
import { TextConverter } from './converters/text'
import { AudioConverter } from './converters/audio'
import { VideoConverter } from './converters/video'
import { DocumentConverter } from './converters/document'

class ConverterRegistry {
  private converters: Map<string, Converter> = new Map()

  constructor() {
    // Register all converters
    this.register(new ImageConverter())
    this.register(new TextConverter())
    this.register(new AudioConverter())
    this.register(new VideoConverter())
    this.register(new DocumentConverter())
  }

  register(converter: Converter): void {
    this.converters.set(converter.id, converter)
  }

  getConverter(id: string): Converter | undefined {
    return this.converters.get(id)
  }

  getAllConverters(): Converter[] {
    return Array.from(this.converters.values())
  }

  getAvailableOutputFormats(inputMimeType: string): FormatInfo[] {
    const formats: FormatInfo[] = []

    for (const converter of this.converters.values()) {
      if (converter.supportedInputMimeTypes.includes(inputMimeType)) {
        for (const format of converter.supportedOutputFormats) {
          formats.push({
            format,
            mimeType: this.getMimeTypeForFormat(format),
            converterId: converter.id,
            converterName: converter.name,
          })
        }
      }
    }

    return formats
  }

  findConverterForConversion(inputMimeType: string, outputFormat: string): Converter | null {
    for (const converter of this.converters.values()) {
      if (
        converter.supportedInputMimeTypes.includes(inputMimeType) &&
        converter.supportedOutputFormats.includes(outputFormat)
      ) {
        return converter
      }
    }
    return null
  }

  getMimeTypeForFormat(format: string): string {
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/gif',
      csv: 'text/csv',
      json: 'application/json',
      txt: 'text/plain',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      mp4: 'video/mp4',
      webm: 'video/webm',
      pdf: 'application/pdf',
    }
    return mimeMap[format.toLowerCase()] || 'application/octet-stream'
  }
}

// Singleton instance
export const converterRegistry = new ConverterRegistry()

