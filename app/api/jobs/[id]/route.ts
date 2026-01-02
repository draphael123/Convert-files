import { NextRequest, NextResponse } from 'next/server'
import { getJob, getJobEvents } from '@/lib/db/queries'
import { getStorage } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await getJob(params.id)

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    let downloadUrl: string | null = null
    if (job.status === 'succeeded' && job.outputFileKey) {
      const storage = getStorage()
      downloadUrl = await storage.getSignedUrl(job.outputFileKey, 3600) // 1 hour expiry
    }

    // Get job events (logs)
    const events = await getJobEvents(params.id)

    return NextResponse.json({
      ...job,
      downloadUrl,
      events,
    })
  } catch (error: any) {
    console.error('Job fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}

