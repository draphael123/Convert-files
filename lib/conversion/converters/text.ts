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
    'application/xml',
    'text/xml',
    'application/yaml',
    'text/yaml',
    'text/x-yaml',
    'text/markdown',
    'text/x-markdown',
  ]
  supportedOutputFormats = ['csv', 'json', 'txt', 'xml', 'yaml', 'yml', 'md', 'markdown']
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
      } else if (this.isXml(content)) {
        output = this.xmlToJson(content)
      } else if (this.isYaml(content)) {
        output = this.yamlToJson(content)
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

  private isXml(str: string): boolean {
    return str.trim().startsWith('<?xml') || str.trim().startsWith('<')
  }

  private isYaml(str: string): boolean {
    // Simple YAML detection
    return str.includes(':') && (str.includes('\n') || str.includes('  ')) && !str.trim().startsWith('{')
  }

  private isMarkdown(str: string): boolean {
    // Simple Markdown detection
    return /^#{1,6}\s/.test(str) || str.includes('**') || str.includes('__') || str.includes('[') && str.includes('](')
  }

  private xmlToJson(xml: string): string {
    // Simple XML to JSON conversion
    try {
      // This is a simplified version - in production, use a proper XML parser
      const json: any = { xml: xml }
      return JSON.stringify(json, null, 2)
    } catch {
      return JSON.stringify({ content: xml }, null, 2)
    }
  }

  private jsonToXml(json: string): string {
    try {
      const data = JSON.parse(json)
      return this.objectToXml(data, 'root')
    } catch {
      return `<?xml version="1.0" encoding="UTF-8"?>\n<root>${this.escapeXml(json)}</root>`
    }
  }

  private objectToXml(obj: any, rootName: string): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        xml += `  <item index="${index}">${this.objectToXmlValue(item)}</item>\n`
      })
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        const value = obj[key]
        if (typeof value === 'object' && value !== null) {
          xml += `  <${key}>\n${this.objectToXml(value, key).split('\n').slice(1).map(line => '    ' + line).join('\n')}\n  </${key}>\n`
        } else {
          xml += `  <${key}>${this.escapeXml(String(value))}</${key}>\n`
        }
      })
    } else {
      xml += `  ${this.escapeXml(String(obj))}\n`
    }
    
    xml += `</${rootName}>`
    return xml
  }

  private objectToXmlValue(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return '\n' + this.objectToXml(value, 'value').split('\n').slice(1).map(line => '    ' + line).join('\n') + '\n  '
    }
    return this.escapeXml(String(value))
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  private xmlToText(xml: string): string {
    // Remove XML tags and decode entities
    return xml
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  private yamlToJson(yaml: string): string {
    // Simple YAML to JSON - in production, use a proper YAML parser
    try {
      // This is a simplified version
      const lines = yaml.split('\n')
      const json: any = {}
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':')
          const value = valueParts.join(':').trim()
          json[key.trim()] = value
        }
      })
      
      return JSON.stringify(json, null, 2)
    } catch {
      return JSON.stringify({ content: yaml }, null, 2)
    }
  }

  private jsonToYaml(json: string): string {
    try {
      const data = JSON.parse(json)
      return this.objectToYaml(data, 0)
    } catch {
      return `content: ${json}`
    }
  }

  private objectToYaml(obj: any, indent: number): string {
    const indentStr = '  '.repeat(indent)
    let yaml = ''
    
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          yaml += `${indentStr}- ${this.objectToYaml(item, indent + 1).trim()}\n`
        } else {
          yaml += `${indentStr}- ${String(item)}\n`
        }
      })
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        const value = obj[key]
        if (typeof value === 'object' && value !== null) {
          yaml += `${indentStr}${key}:\n${this.objectToYaml(value, indent + 1)}`
        } else {
          yaml += `${indentStr}${key}: ${String(value)}\n`
        }
      })
    } else {
      yaml += `${indentStr}${String(obj)}\n`
    }
    
    return yaml
  }

  private jsonToMarkdown(json: string): string {
    try {
      const data = JSON.parse(json)
      return this.objectToMarkdown(data, '')
    } catch {
      return `\`\`\`json\n${json}\n\`\`\``
    }
  }

  private objectToMarkdown(obj: any, prefix: string): string {
    if (Array.isArray(obj)) {
      return obj.map((item, i) => {
        if (typeof item === 'object') {
          return `${prefix}${i + 1}. ${this.objectToMarkdown(item, prefix + '  ')}`
        }
        return `${prefix}- ${String(item)}`
      }).join('\n')
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).map(key => {
        const value = obj[key]
        if (typeof value === 'object' && value !== null) {
          return `${prefix}## ${key}\n${this.objectToMarkdown(value, prefix + '  ')}`
        }
        return `${prefix}**${key}**: ${String(value)}`
      }).join('\n')
    }
    return String(obj)
  }

  private csvToMarkdown(csv: string): string {
    const lines = csv.trim().split('\n')
    if (lines.length === 0) return ''
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    let md = '| ' + headers.join(' | ') + ' |\n'
    md += '| ' + headers.map(() => '---').join(' | ') + ' |\n'
    
    lines.slice(1).forEach(line => {
      const values = this.parseCsvLine(line)
      md += '| ' + values.map(v => v.replace(/"/g, '')).join(' | ') + ' |\n'
    })
    
    return md
  }
}

