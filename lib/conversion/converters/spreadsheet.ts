import { Converter } from '../types'
import { join } from 'path'
import { tmpdir } from 'os'
import { writeFile, readFile } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Spreadsheet Converter
 * Supports XLSX, XLS, ODS, CSV conversions
 * Uses LibreOffice for Office formats, native for CSV
 */
export class SpreadsheetConverter implements Converter {
  id = 'spreadsheet'
  name = 'Spreadsheet Converter'
  supportedInputMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.oasis.opendocument.spreadsheet', // .ods
    'text/csv',
  ]
  supportedOutputFormats = ['xlsx', 'xls', 'ods', 'csv', 'pdf', 'html']
  constraints = {
    maxFileSizeMB: 50,
    timeoutMs: 120000,
  }

  async run(inputPath: string, outputFormat: string): Promise<string> {
    const outputPath = join(tmpdir(), `convert-${Date.now()}-${Math.random().toString(36).substring(7)}.${outputFormat}`)
    
    // CSV to other formats
    if (inputPath.endsWith('.csv') || inputPath.endsWith('.CSV')) {
      if (outputFormat === 'csv') {
        // Copy CSV
        const content = await readFile(inputPath, 'utf-8')
        await writeFile(outputPath, content, 'utf-8')
        return outputPath
      } else if (outputFormat === 'html') {
        // CSV to HTML table
        const content = await readFile(inputPath, 'utf-8')
        const lines = content.split('\n').filter(line => line.trim())
        const html = this.csvToHtml(lines)
        await writeFile(outputPath, html, 'utf-8')
        return outputPath
      } else {
        // CSV to Office formats requires LibreOffice
        try {
          const command = `libreoffice --headless --convert-to ${outputFormat} --outdir "${tmpdir()}" "${inputPath}"`
          await execAsync(command, {
            timeout: this.constraints.timeoutMs,
            maxBuffer: 10 * 1024 * 1024,
          })
          const inputName = inputPath.split(/[/\\]/).pop()?.replace(/\.[^/.]+$/, '') || 'output'
          const libreOfficeOutput = join(tmpdir(), `${inputName}.${outputFormat}`)
          const content = await readFile(libreOfficeOutput)
          await writeFile(outputPath, content)
          return outputPath
        } catch (error: any) {
          throw new Error(`Spreadsheet conversion requires LibreOffice. Error: ${error.message}`)
        }
      }
    }
    
    // Office formats to other formats
    try {
      const command = `libreoffice --headless --convert-to ${outputFormat} --outdir "${tmpdir()}" "${inputPath}"`
      await execAsync(command, {
        timeout: this.constraints.timeoutMs,
        maxBuffer: 10 * 1024 * 1024,
      })
      
      const inputName = inputPath.split(/[/\\]/).pop()?.replace(/\.[^/.]+$/, '') || 'output'
      const libreOfficeOutput = join(tmpdir(), `${inputName}.${outputFormat}`)
      const content = await readFile(libreOfficeOutput)
      await writeFile(outputPath, content)
      return outputPath
    } catch (error: any) {
      throw new Error(`Spreadsheet conversion requires LibreOffice. Error: ${error.message}`)
    }
  }

  private csvToHtml(lines: string[]): string {
    if (lines.length === 0) return '<table></table>'
    
    let html = '<table border="1" cellpadding="5" cellspacing="0">\n'
    
    lines.forEach((line, index) => {
      const cells = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      const tag = index === 0 ? 'th' : 'td'
      html += '  <tr>\n'
      cells.forEach(cell => {
        html += `    <${tag}>${this.escapeHtml(cell)}</${tag}>\n`
      })
      html += '  </tr>\n'
    })
    
    html += '</table>'
    return html
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}

