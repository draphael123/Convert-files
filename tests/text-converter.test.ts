import { TextConverter } from '../lib/conversion/converters/text'
import { writeFile, unlink, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('Text Converter', () => {
  let converter: TextConverter
  let testCsvPath: string
  let testJsonPath: string

  beforeAll(async () => {
    converter = new TextConverter()
    
    // Create test CSV file
    testCsvPath = join(tmpdir(), `test-${Date.now()}.csv`)
    await writeFile(testCsvPath, 'name,age\nJohn,30\nJane,25', 'utf-8')

    // Create test JSON file
    testJsonPath = join(tmpdir(), `test-${Date.now()}.json`)
    await writeFile(testJsonPath, '[{"name":"John","age":30}]', 'utf-8')
  })

  afterAll(async () => {
    try {
      await unlink(testCsvPath)
      await unlink(testJsonPath)
    } catch {
      // Ignore cleanup errors
    }
  })

  it('should have correct metadata', () => {
    expect(converter.id).toBe('text')
    expect(converter.supportedInputMimeTypes).toContain('text/csv')
    expect(converter.supportedOutputFormats).toContain('json')
  })

  it('should convert CSV to JSON', async () => {
    const outputPath = await converter.run(testCsvPath, 'json')
    expect(outputPath).toBeDefined()
    
    const content = await readFile(outputPath, 'utf-8')
    const parsed = JSON.parse(content)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed.length).toBeGreaterThan(0)
    
    // Clean up
    try {
      await unlink(outputPath)
    } catch {
      // Ignore cleanup errors
    }
  }, 30000)

  it('should convert JSON to CSV', async () => {
    const outputPath = await converter.run(testJsonPath, 'csv')
    expect(outputPath).toBeDefined()
    
    const content = await readFile(outputPath, 'utf-8')
    expect(content).toContain('name')
    expect(content).toContain('age')
    
    // Clean up
    try {
      await unlink(outputPath)
    } catch {
      // Ignore cleanup errors
    }
  }, 30000)
})

