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
    
    try {
      await storage.upload(buffer, fileKey, validation.mimeType)
    } catch (storageError: any) {
      console.error('Storage upload error:', storageError)
      // Check if we're on Vercel and using local storage (which won't work)
      if (process.env.VERCEL && process.env.STORAGE_TYPE !== 's3') {
        return NextResponse.json({ 
          error: 'File storage not configured. Please configure S3 storage for production deployments.' 
        }, { status: 500 })
      }
      throw storageError
    }

    return NextResponse.json({
      fileKey,
      mimeType: validation.mimeType,
      size: buffer.length,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    // Return more specific error message
    const errorMessage = error.message || 'Upload failed'
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

