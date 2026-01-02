export interface Converter {
  id: string
  name: string
  supportedInputMimeTypes: string[]
  supportedOutputFormats: string[]
  constraints?: {
    maxFileSizeMB?: number
    timeoutMs?: number
  }
  run(inputPath: string, outputFormat: string, options?: ConversionOptions): Promise<string>
}

export interface ConversionOptions {
  quality?: number
  [key: string]: any
}

export interface FormatInfo {
  format: string
  mimeType: string
  converterId: string
  converterName: string
}

