import { Converter } from '../types'
import { join } from 'path'
import { tmpdir } from 'os'
import { writeFile, readFile } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
// Using dynamic imports for optional dependencies

const execAsync = promisify(exec)

/**
 * PDF to Word Converter
 * Converts PDF to DOCX format
 * Uses LibreOffice for best quality, falls back to text extraction + DOCX creation
 */
export class PdfToWordConverter implements Converter {
  id = 'pdf-to-word'
  name = 'PDF to Word Converter'
  supportedInputMimeTypes = [
    'application/pdf',
  ]
  supportedOutputFormats = ['docx']
  constraints = {
    maxFileSizeMB: 50,
    timeoutMs: 120000,
  }

  async run(inputPath: string, outputFormat: string): Promise<string> {
    const outputPath = join(tmpdir(), `convert-${Date.now()}-${Math.random().toString(36).substring(7)}.docx`)
    
    // Try LibreOffice first (best quality, preserves formatting)
    try {
      const command = `libreoffice --headless --convert-to docx --outdir "${tmpdir()}" "${inputPath}"`
      await execAsync(command, {
        timeout: this.constraints.timeoutMs,
        maxBuffer: 10 * 1024 * 1024,
      })
      
      // LibreOffice creates output with same name but .docx extension
      const inputName = inputPath.split(/[/\\]/).pop()?.replace(/\.[^/.]+$/, '') || 'output'
      const libreOfficeOutput = join(tmpdir(), `${inputName}.docx`)
      
      try {
        const content = await readFile(libreOfficeOutput)
        await writeFile(outputPath, content)
        return outputPath
      } catch {
        throw new Error('LibreOffice conversion failed')
      }
    } catch (error: any) {
      // LibreOffice not available, fall back to text extraction + simple DOCX
      try {
        const pdfParse = await import('pdf-parse')
        const pdfBuffer = await readFile(inputPath)
        const data = await pdfParse.default(pdfBuffer)
        
        // Try to use docx library if available, otherwise create a simple text-based DOCX
        try {
          const { Document, Packer, Paragraph, TextRun } = await import('docx')
          
          const paragraphs = data.text
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => new Paragraph({
              children: [new TextRun(line.trim())],
            }))
          
          if (paragraphs.length === 0) {
            paragraphs.push(new Paragraph({
              children: [new TextRun('(PDF content extracted as text)')],
            }))
          }
          
          const doc = new Document({
            sections: [{
              children: paragraphs,
            }],
          })
          
          const buffer = await Packer.toBuffer(doc)
          await writeFile(outputPath, buffer)
        } catch {
          // If docx library not available, provide helpful error
          throw new Error(
            'PDF to Word conversion requires LibreOffice or docx library. ' +
            'Please install LibreOffice for best results.'
          )
        }
        
        return outputPath
      } catch (fallbackError: any) {
        throw new Error(
          'PDF to Word conversion failed. ' +
          'For best results, install LibreOffice. ' +
          `Error: ${fallbackError.message}`
        )
      }
    }
  }
}

