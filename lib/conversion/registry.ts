import { Converter, FormatInfo } from './types'
import { ImageConverter } from './converters/image'
import { TextConverter } from './converters/text'
import { AudioConverter } from './converters/audio'
import { VideoConverter } from './converters/video'
import { DocumentConverter } from './converters/document'
import { PdfConverter } from './converters/pdf'
import { PdfToWordConverter } from './converters/pdf-to-word'
import { SpreadsheetConverter } from './converters/spreadsheet'
import { ArchiveConverter } from './converters/archive'

class ConverterRegistry {
  private converters: Map<string, Converter> = new Map()

  constructor() {
    // Register all converters
    this.register(new ImageConverter())
    this.register(new TextConverter())
    this.register(new AudioConverter())
    this.register(new VideoConverter())
    this.register(new DocumentConverter())
    this.register(new PdfConverter())
    this.register(new PdfToWordConverter())
    this.register(new SpreadsheetConverter())
    this.register(new ArchiveConverter())
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
      // Images
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/gif',
      bmp: 'image/bmp',
      tiff: 'image/tiff',
      tif: 'image/tiff',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      avif: 'image/avif',
      heic: 'image/heic',
      heif: 'image/heif',
      // Text & Data
      csv: 'text/csv',
      json: 'application/json',
      txt: 'text/plain',
      xml: 'application/xml',
      yaml: 'application/yaml',
      yml: 'application/yaml',
      md: 'text/markdown',
      markdown: 'text/markdown',
      html: 'text/html',
      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      flac: 'audio/flac',
      aac: 'audio/aac',
      ogg: 'audio/ogg',
      m4a: 'audio/x-m4a',
      wma: 'audio/x-ms-wma',
      // Video
      mp4: 'video/mp4',
      webm: 'video/webm',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      mkv: 'video/x-matroska',
      flv: 'video/x-flv',
      wmv: 'video/x-ms-wmv',
      mpeg: 'video/mpeg',
      // Documents
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      rtf: 'application/rtf',
      odt: 'application/vnd.oasis.opendocument.text',
      epub: 'application/epub+zip',
      // Spreadsheets
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      ods: 'application/vnd.oasis.opendocument.spreadsheet',
      // Presentations
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ppt: 'application/vnd.ms-powerpoint',
      odp: 'application/vnd.oasis.opendocument.presentation',
      // Archives
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      tar: 'application/x-tar',
      gz: 'application/gzip',
      tgz: 'application/gzip',
    }
    return mimeMap[format.toLowerCase()] || 'application/octet-stream'
  }
}

// Singleton instance
export const converterRegistry = new ConverterRegistry()

