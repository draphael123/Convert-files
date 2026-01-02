import { NextRequest, NextResponse } from 'next/server'
import { converterRegistry } from '@/lib/conversion/registry'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const inputMime = searchParams.get('inputMime')

    if (!inputMime) {
      return NextResponse.json(
        { error: 'inputMime query parameter is required' },
        { status: 400 }
      )
    }

    const formats = converterRegistry.getAvailableOutputFormats(inputMime)

    return NextResponse.json({ formats })
  } catch (error: any) {
    console.error('Formats fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch formats' }, { status: 500 })
  }
}

