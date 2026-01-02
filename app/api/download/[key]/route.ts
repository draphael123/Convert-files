import { NextRequest, NextResponse } from 'next/server'
import { getStorage } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const storage = getStorage()
    const buffer = await storage.download(params.key)

    // Determine content type from file extension
    const extension = params.key.split('.').pop()?.toLowerCase()
    const contentTypeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      csv: 'text/csv',
      json: 'application/json',
      txt: 'text/plain',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      mp4: 'video/mp4',
      webm: 'video/webm',
      pdf: 'application/pdf',
    }

    const contentType = contentTypeMap[extension || ''] || 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${params.key.split('/').pop()}"`,
      },
    })
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}

