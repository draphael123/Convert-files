'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [availableFormats, setAvailableFormats] = useState<any[]>([])
  const [selectedFormat, setSelectedFormat] = useState<string>('')
  const [error, setError] = useState<string>('')
  const router = useRouter()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const selectedFile = acceptedFiles[0]
    setFile(selectedFile)
    setError('')
    setSelectedFormat('')

    // Get available output formats
    try {
      // Detect MIME type (simplified - in production use file-type)
      let mimeType = selectedFile.type
      if (!mimeType || mimeType === 'application/octet-stream') {
        // Try to infer from extension
        const ext = selectedFile.name.split('.').pop()?.toLowerCase()
        const mimeMap: Record<string, string> = {
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
        }
        mimeType = mimeMap[ext || ''] || 'application/octet-stream'
      }

      const response = await fetch(`/api/formats?inputMime=${encodeURIComponent(mimeType)}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableFormats(data.formats || [])
        if (data.formats && data.formats.length > 0) {
          setSelectedFormat(data.formats[0].format)
        }
      } else {
        setError('Unable to determine supported output formats')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process file')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
      'text/*': ['.txt', '.csv', '.json'],
      'audio/*': ['.mp3', '.wav'],
      'video/*': ['.mp4', '.webm'],
    },
  })

  const handleConvert = async () => {
    if (!file || !selectedFormat) {
      setError('Please select a file and output format')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadData = await uploadResponse.json()

      // Create conversion job
      const jobResponse = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey: uploadData.fileKey,
          inputMime: uploadData.mimeType,
          outputFormat: selectedFormat,
        }),
      })

      if (!jobResponse.ok) {
        const errorData = await jobResponse.json()
        throw new Error(errorData.error || 'Job creation failed')
      }

      const jobData = await jobResponse.json()

      // Redirect to job detail page
      router.push(`/jobs/${jobData.id}`)
    } catch (err: any) {
      setError(err.message || 'Conversion failed')
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Convert Your Files
        </h1>
        <p className="text-lg text-gray-600">
          Upload a file and choose your desired output format
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  Drag and drop a file here, or click to select
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Supports images, documents, text, audio, and video
                </p>
              </div>
            )}
          </div>
        </div>

        {file && availableFormats.length > 0 && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {availableFormats.map((format) => (
                <option key={format.format} value={format.format}>
                  {format.format.toUpperCase()} ({format.converterName})
                </option>
              ))}
            </select>
          </div>
        )}

        {file && selectedFormat && (
          <button
            onClick={handleConvert}
            disabled={uploading}
            className="mt-6 w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Processing...' : 'Start Conversion'}
          </button>
        )}
      </div>
    </div>
  )
}

