'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'

interface Job {
  id: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  inputMime: string
  outputFormat: string
  createdAt: string
  updatedAt: string
  errorCode?: string | null
  errorMessage?: string | null
  downloadUrl?: string | null
  events?: Array<{
    id: number
    timestamp: string
    level: 'info' | 'warn' | 'error'
    message: string
  }>
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchJob = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data)
        return data
      } else if (response.status === 404) {
        setJob(null)
        return null
      }
      return null
    } catch (error) {
      console.error('Failed to fetch job:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (!params.id) return

    fetchJob()
    
    // Poll for updates if job is not completed
    const interval = setInterval(() => {
      fetchJob().then((fetchedJob) => {
        if (fetchedJob && (fetchedJob.status === 'queued' || fetchedJob.status === 'running')) {
          // Job is still processing, will continue polling
        } else {
          // Job completed or failed, stop polling
          clearInterval(interval)
        }
      })
    }, 2000)
    
    return () => clearInterval(interval)
  }, [params.id, fetchJob])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'queued':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">Loading job details...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Job not found</p>
          <Link
            href="/jobs"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          href="/jobs"
          className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block"
        >
          ← Back to Jobs
        </Link>
        <h1 className="text-4xl font-bold gradient-text">Job Details</h1>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Job ID</h2>
          <p className="text-sm font-mono text-gray-900">{job.id}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Status</h2>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                job.status
              )}`}
            >
              {job.status}
            </span>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Conversion</h2>
            <p className="text-sm text-gray-900">
              {job.inputMime.split('/')[1]?.toUpperCase() || 'Unknown'} →{' '}
              {job.outputFormat.toUpperCase()}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Created</h2>
            <p className="text-sm text-gray-900">
              {format(new Date(job.createdAt), 'MMM d, yyyy HH:mm:ss')}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Updated</h2>
            <p className="text-sm text-gray-900">
              {format(new Date(job.updatedAt), 'MMM d, yyyy HH:mm:ss')}
            </p>
          </div>
        </div>

        {job.status === 'failed' && job.errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
            <p className="text-sm text-red-700">{job.errorMessage}</p>
            {job.errorCode && (
              <p className="text-xs text-red-600 mt-1">Code: {job.errorCode}</p>
            )}
          </div>
        )}

        {job.status === 'succeeded' && job.downloadUrl && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Conversion Complete!</h3>
            <a
              href={job.downloadUrl}
              download
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Download Converted File
            </a>
          </div>
        )}

        {job.status === 'running' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-sm text-blue-800">Conversion in progress...</p>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              This may take a few moments depending on file size
            </p>
          </div>
        )}

        {job.status === 'queued' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="animate-pulse rounded-full h-4 w-4 bg-yellow-600 mr-2"></div>
              <p className="text-sm text-yellow-800">Job queued, waiting for worker...</p>
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              If this status persists, ensure the conversion worker is running
            </p>
          </div>
        )}

        {job.events && job.events.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">Logs</h2>
            <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2 font-mono text-xs">
                {job.events.map((event) => (
                  <div
                    key={event.id}
                    className={`${
                      event.level === 'error'
                        ? 'text-red-600'
                        : event.level === 'warn'
                        ? 'text-yellow-600'
                        : 'text-gray-600'
                    }`}
                  >
                    <span className="text-gray-400">
                      [{format(new Date(event.timestamp), 'HH:mm:ss')}]
                    </span>{' '}
                    <span className="uppercase font-semibold">{event.level}:</span>{' '}
                    {event.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

