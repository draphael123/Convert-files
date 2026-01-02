import { Converter } from '../types'

/**
 * Document Converter - Stubbed for MVP
 * 
 * In production, this would use LibreOffice headless mode:
 * libreoffice --headless --convert-to pdf --outdir /tmp input.docx
 * 
 * This requires LibreOffice to be installed and available in the system PATH.
 * For MVP, we'll return an error indicating this feature is not yet implemented.
 */
export class DocumentConverter implements Converter {
  id = 'document'
  name = 'Document Converter'
  supportedInputMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
  ]
  supportedOutputFormats = ['pdf']
  constraints = {
    maxFileSizeMB: 50,
    timeoutMs: 120000,
  }

  async run(inputPath: string, outputFormat: string): Promise<string> {
    // Stub implementation - would use LibreOffice in production
    throw new Error(
      'Document conversion is not yet implemented. ' +
      'This requires LibreOffice headless mode to be set up in a containerized environment.'
    )
  }
}

