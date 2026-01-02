import { FileTypeResult } from 'file-type'
import { fileTypeFromBuffer } from 'file-type'

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '100')
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export interface ValidationResult {
  valid: boolean
  mimeType?: string
  error?: string
}

export async function validateFile(buffer: Buffer, originalName?: string): Promise<ValidationResult> {
  // Check file size
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB`,
    }
  }

  // Detect MIME type from magic bytes
  let detectedType: FileTypeResult | undefined
  try {
    detectedType = await fileTypeFromBuffer(buffer)
  } catch (error) {
    return {
      valid: false,
      error: 'Unable to detect file type',
    }
  }

  if (!detectedType) {
    // Some text files might not be detected by file-type
    // Try to detect text files by checking if it's valid UTF-8
    try {
      const text = buffer.toString('utf-8')
      // If it's valid UTF-8 and looks like text, allow it
      if (text.length > 0 && !/[^\x20-\x7E\n\r\t]/.test(text.substring(0, 1000))) {
        // Try to infer from extension or content
        if (originalName?.endsWith('.txt')) {
          return { valid: true, mimeType: 'text/plain' }
        }
        if (originalName?.endsWith('.csv')) {
          return { valid: true, mimeType: 'text/csv' }
        }
        if (originalName?.endsWith('.json')) {
          return { valid: true, mimeType: 'application/json' }
        }
      }
    } catch {
      // Not valid UTF-8
    }

    return {
      valid: false,
      error: 'File type could not be determined',
    }
  }

  return {
    valid: true,
    mimeType: detectedType.mime,
  }
}

// Stub for antivirus scanning
export async function scanForMalware(buffer: Buffer): Promise<{ safe: boolean; reason?: string }> {
  // In production, integrate with ClamAV or similar
  // For MVP, we'll do basic checks
  return { safe: true }
}

