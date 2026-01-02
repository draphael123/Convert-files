import { ImageConverter } from '../lib/conversion/converters/image'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('Image Converter', () => {
  let converter: ImageConverter
  let testInputPath: string

  beforeAll(async () => {
    converter = new ImageConverter()
    // Create a simple test PNG file (1x1 pixel)
    testInputPath = join(tmpdir(), `test-${Date.now()}.png`)
    // Minimal PNG file (1x1 red pixel)
    const pngBuffer = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108020000009077534e0000000a49444154789c6300010000000500010d0a2db40000000049454e44ae426082',
      'hex'
    )
    await writeFile(testInputPath, pngBuffer)
  })

  afterAll(async () => {
    try {
      await unlink(testInputPath)
    } catch {
      // Ignore cleanup errors
    }
  })

  it('should have correct metadata', () => {
    expect(converter.id).toBe('image')
    expect(converter.supportedInputMimeTypes).toContain('image/png')
    expect(converter.supportedOutputFormats).toContain('jpg')
  })

  it('should convert PNG to JPG', async () => {
    const outputPath = await converter.run(testInputPath, 'jpg')
    expect(outputPath).toBeDefined()
    // Clean up
    try {
      await unlink(outputPath)
    } catch {
      // Ignore cleanup errors
    }
  }, 30000)

  it('should convert PNG to WebP', async () => {
    const outputPath = await converter.run(testInputPath, 'webp')
    expect(outputPath).toBeDefined()
    // Clean up
    try {
      await unlink(outputPath)
    } catch {
      // Ignore cleanup errors
    }
  }, 30000)
})



