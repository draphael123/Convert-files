import { Converter } from '../types'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export class TextConverter implements Converter {
  id = 'text'
  name = 'Text Converter'
  supportedInputMimeTypes = [
    'text/plain',
    'text/csv',
    'application/json',
  ]
  supportedOutputFormats = ['csv', 'json', 'txt']
  constraints = {
    maxFileSizeMB: 10,
    timeoutMs: 30000,
  }

  async run(inputPath: string, outputFormat: string): Promise<string> {
    const content = await readFile(inputPath, 'utf-8')
    const outputPath = join(tmpdir(), `convert-${Date.now()}-${Math.random().toString(36).substring(7)}.${outputFormat}`)
    
    let output: string

    // Detect input format from content
    const isJson = this.isJson(content)
    const isCsv = this.isCsv(content)

    if (outputFormat === 'json') {
      if (isJson) {
        output = content // Already JSON
      } else if (isCsv) {
        output = this.csvToJson(content)
      } else {
        // Plain text to JSON
        output = JSON.stringify({ content: content.split('\n') }, null, 2)
      }
    } else if (outputFormat === 'csv') {
      if (isCsv) {
        output = content // Already CSV
      } else if (isJson) {
        output = this.jsonToCsv(content)
      } else {
        // Plain text to CSV (one column)
        output = content.split('\n').map(line => `"${line.replace(/"/g, '""')}"`).join('\n')
      }
    } else {
      // txt output
      if (isJson) {
        const parsed = JSON.parse(content)
        output = typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(parsed)
      } else if (isCsv) {
        output = content // CSV is already text
      } else {
        output = content
      }
    }

    await writeFile(outputPath, output, 'utf-8')
    return outputPath
  }

  private isJson(str: string): boolean {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  private isCsv(str: string): boolean {
    const lines = str.trim().split('\n')
    if (lines.length < 2) return false
    // Check if first line looks like headers
    return lines[0].includes(',')
  }

  private csvToJson(csv: string): string {
    const lines = csv.trim().split('\n')
    if (lines.length === 0) return '[]'
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const rows = lines.slice(1).map(line => {
      const values = this.parseCsvLine(line)
      const obj: any = {}
      headers.forEach((header, i) => {
        obj[header] = values[i] || ''
      })
      return obj
    })
    
    return JSON.stringify(rows, null, 2)
  }

  private jsonToCsv(json: string): string {
    try {
      const data = JSON.parse(json)
      if (!Array.isArray(data) || data.length === 0) {
        return ''
      }

      const headers = Object.keys(data[0])
      const csvLines = [headers.map(h => `"${h}"`).join(',')]
      
      data.forEach((row: any) => {
        const values = headers.map(header => {
          const value = row[header] ?? ''
          return `"${String(value).replace(/"/g, '""')}"`
        })
        csvLines.push(values.join(','))
      })
      
      return csvLines.join('\n')
    } catch {
      return ''
    }
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    values.push(current.trim())
    return values
  }
}

