import { converterRegistry } from '../lib/conversion/registry'

describe('Converter Registry', () => {
  it('should register all converters', () => {
    const converters = converterRegistry.getAllConverters()
    expect(converters.length).toBeGreaterThan(0)
  })

  it('should find image converter', () => {
    const converter = converterRegistry.getConverter('image')
    expect(converter).toBeDefined()
    expect(converter?.id).toBe('image')
  })

  it('should get available output formats for image/png', () => {
    const formats = converterRegistry.getAvailableOutputFormats('image/png')
    expect(formats.length).toBeGreaterThan(0)
    expect(formats.some((f) => f.format === 'jpg')).toBe(true)
    expect(formats.some((f) => f.format === 'webp')).toBe(true)
  })

  it('should find converter for image conversion', () => {
    const converter = converterRegistry.findConverterForConversion('image/png', 'jpg')
    expect(converter).toBeDefined()
    expect(converter?.id).toBe('image')
  })

  it('should return null for unsupported conversion', () => {
    const converter = converterRegistry.findConverterForConversion('image/png', 'pdf')
    expect(converter).toBeNull()
  })

  it('should get available output formats for text/csv', () => {
    const formats = converterRegistry.getAvailableOutputFormats('text/csv')
    expect(formats.length).toBeGreaterThan(0)
    expect(formats.some((f) => f.format === 'json')).toBe(true)
  })
})



