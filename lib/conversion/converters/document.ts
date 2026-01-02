import { Converter } from '../types'
import { join } from 'path'
import { tmpdir } from 'os'
import { writeFile, readFile } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Document Converter
 * Supports Word documents (DOCX) to PDF, TXT, and HTML
 * Uses LibreOffice headless for Word to PDF (best quality)
 * Falls back to mammoth for Word to text/HTML if LibreOffice not available
 */
export class DocumentConverter implements Converter {
  id = 'document'
  name = 'Document Converter'
  supportedInputMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
  ]
  supportedOutputFormats = ['pdf', 'txt', 'html', 'docx']
  constraints = {
    maxFileSizeMB: 50,
    timeoutMs: 120000,
  }

  async run(inputPath: string, outputFormat: string): Promise<string> {
    const outputPath = join(tmpdir(), `convert-${Date.now()}-${Math.random().toString(36).substring(7)}.${outputFormat}`)
    
    if (outputFormat === 'pdf') {
      // Try LibreOffice first (best quality)
      try {
        const command = `libreoffice --headless --convert-to pdf --outdir "${tmpdir()}" "${inputPath}"`
        await execAsync(command, {
          timeout: this.constraints.timeoutMs,
          maxBuffer: 10 * 1024 * 1024,
        })
        
        // LibreOffice creates output with same name but .pdf extension
        const inputName = inputPath.split(/[/\\]/).pop()?.replace(/\.[^/.]+$/, '') || 'output'
        const libreOfficeOutput = join(tmpdir(), `${inputName}.pdf`)
        
        // Check if LibreOffice created the file
        try {
          await readFile(libreOfficeOutput)
          // Move to our output path
          const content = await readFile(libreOfficeOutput)
          await writeFile(outputPath, content)
          return outputPath
        } catch {
          throw new Error('LibreOffice conversion failed')
        }
      } catch (error: any) {
        // LibreOffice not available or failed, provide helpful error
        throw new Error(
          'PDF conversion requires LibreOffice to be installed. ' +
          'Please install LibreOffice or use TXT/HTML conversion instead. ' +
          `Error: ${error.message}`
        )
      }
    } else if (outputFormat === 'txt' || outputFormat === 'html') {
      // Use mammoth for Word to text/HTML
      try {
        const mammoth = await import('mammoth')
        const docxBuffer = await readFile(inputPath)
        const result = await mammoth.default.convertToHtml({ buffer: docxBuffer })
        
        if (outputFormat === 'html') {
          await writeFile(outputPath, result.value, 'utf-8')
        } else {
          // Convert HTML to plain text (simple approach)
          const text = result.value
            .replace(/<[^>]+>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
            .trim()
          await writeFile(outputPath, text, 'utf-8')
        }
        
        return outputPath
      } catch (error: any) {
        throw new Error(`Word document conversion failed: ${error.message}`)
      }
    }
    
    throw new Error(`Unsupported output format: ${outputFormat}`)
  }
}

