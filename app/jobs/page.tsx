'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Job {
  id: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  inputMime: string
  outputFormat: string
  createdAt: string
  errorMessage?: string | null
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md'
      case 'failed':
        return 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md'
      case 'running':
        return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-md animate-pulse'
      case 'queued':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
      default:
        return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-md'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-3">Conversion Jobs</h1>
        <p className="text-lg text-gray-700 mb-2">View all your file conversion jobs</p>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full font-semibold">
            Free to use
          </span>
          <span className="text-sm bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-3 py-1 rounded-full font-semibold">
            No account required
          </span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-lg text-gray-700 mb-4">No jobs yet. Start converting files to see them here.</p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Convert a file →
          </Link>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {job.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.inputMime.split('/')[1]?.toUpperCase() || 'Unknown'} →{' '}
                    {job.outputFormat.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(job.createdAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

