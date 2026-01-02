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
    // If file-type detection fails, try to infer from filename
    console.warn('file-type detection failed, trying filename inference:', error)
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
        if (originalName?.endsWith('.xml')) {
          return { valid: true, mimeType: 'application/xml' }
        }
        if (originalName?.endsWith('.md') || originalName?.endsWith('.markdown')) {
          return { valid: true, mimeType: 'text/markdown' }
        }
        if (originalName?.endsWith('.html') || originalName?.endsWith('.htm')) {
          return { valid: true, mimeType: 'text/html' }
        }
        if (originalName?.endsWith('.yaml') || originalName?.endsWith('.yml')) {
          return { valid: true, mimeType: 'text/yaml' }
        }
      }
    } catch {
      // Not valid UTF-8
    }

    // If we still don't have a type, try to infer from extension
    if (originalName) {
      const ext = originalName.split('.').pop()?.toLowerCase()
      const extensionMimeMap: Record<string, string> = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        doc: 'application/msword',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xls: 'application/vnd.ms-excel',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        mp4: 'video/mp4',
        zip: 'application/zip',
      }
      
      if (ext && extensionMimeMap[ext]) {
        return { valid: true, mimeType: extensionMimeMap[ext] }
      }
    }

    // Last resort: allow with generic type if file is small enough
    if (buffer.length < 10 * 1024 * 1024) { // 10MB
      return { valid: true, mimeType: 'application/octet-stream' }
    }

    return {
      valid: false,
      error: 'File type could not be determined. Please ensure the file has a valid extension.',
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



