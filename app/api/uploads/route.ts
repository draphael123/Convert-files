import { NextRequest, NextResponse } from 'next/server'
import { getStorage } from '@/lib/storage'
import { validateFile, scanForMalware } from '@/lib/security/file-validation'
import { nanoid } from 'nanoid'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate file
    const validation = await validateFile(buffer, file.name)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Scan for malware (stub)
    const scanResult = await scanForMalware(buffer)
    if (!scanResult.safe) {
      return NextResponse.json({ error: 'File failed security scan' }, { status: 400 })
    }

    // Upload to storage
    const storage = getStorage()
    const fileKey = `uploads/${nanoid()}/${file.name}`
    await storage.upload(buffer, fileKey, validation.mimeType)

    return NextResponse.json({
      fileKey,
      mimeType: validation.mimeType,
      size: buffer.length,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

