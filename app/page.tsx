'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import FormatCard from './components/FormatCard'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loadingFormats, setLoadingFormats] = useState(false)
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
    setAvailableFormats([])
    setLoadingFormats(true)

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
          gif: 'image/gif',
          csv: 'text/csv',
          json: 'application/json',
          txt: 'text/plain',
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          mp4: 'video/mp4',
          webm: 'video/webm',
        }
        mimeType = mimeMap[ext || ''] || 'application/octet-stream'
      }

      const response = await fetch(`/api/formats?inputMime=${encodeURIComponent(mimeType)}`)
      if (response.ok) {
        const data = await response.json()
        const formats = data.formats || []
        setAvailableFormats(formats)
        if (formats.length > 0) {
          // Auto-select first format
          setSelectedFormat(formats[0].format)
        } else {
          setError('No conversion formats available for this file type')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Unable to determine supported output formats')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process file')
    } finally {
      setLoadingFormats(false)
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
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold gradient-text mb-4 animate-float">
          Convert Your Files
        </h1>
        <p className="text-xl text-gray-700 mb-3 font-medium">
          Upload a file and choose your desired output format
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-sm bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-1.5 rounded-full font-semibold shadow-md">
            ✨ 100% Free
          </span>
          <span className="text-sm bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-4 py-1.5 rounded-full font-semibold shadow-md">
            🚀 No Sign Up
          </span>
          <span className="text-sm bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-1.5 rounded-full font-semibold shadow-md">
            ⚡ No Limits
          </span>
        </div>
      </div>

      {/* Why Conversion Matters Section */}
      <div className="mb-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-white/20 shadow-xl">
        <h2 className="text-3xl font-bold gradient-text mb-6 text-center">
          Why File Conversion Matters
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/40">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Compatibility</h3>
            <p className="text-gray-700">
              Different devices and platforms require different file formats. Convert files to ensure they work perfectly on any device, browser, or application.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/40">
            <div className="text-4xl mb-3">💾</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">File Size Optimization</h3>
            <p className="text-gray-700">
              Reduce file sizes without losing quality. Convert images to WebP for smaller sizes, or compress videos for faster sharing and storage.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/40">
            <div className="text-4xl mb-3">🔧</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Workflow Integration</h3>
            <p className="text-gray-700">
              Transform data formats for seamless integration. Convert CSV to JSON for APIs, or transform documents for different software requirements.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/40">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Universal Access</h3>
            <p className="text-gray-700">
              Make your content accessible everywhere. Convert files to web-friendly formats like WebP, WebM, or PDF for maximum compatibility.
            </p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-700 font-medium">
            <span className="text-purple-600 font-bold">Quick & Easy:</span> No technical knowledge required. 
            Just upload, select your format, and download. It's that simple!
          </p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 scale-105 shadow-lg'
              : 'border-purple-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 hover:shadow-md'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <svg
              className="mx-auto h-16 w-16 text-purple-500 animate-float"
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
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-base font-bold text-gray-900">{file.name}</p>
                </div>
                <p className="text-sm text-purple-600 font-medium">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-base font-semibold text-gray-700">
                  Drag and drop a file here, or click to select
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ✨ Supports images, documents, text, audio, and video
                </p>
              </div>
            )}
          </div>
        </div>

        {file && (
          <div className="mt-6">
            {loadingFormats ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading available formats...</p>
              </div>
            ) : availableFormats.length > 0 ? (
              <>
                <label className="block text-lg font-bold gradient-text mb-4">
                  🎯 Select Output Format ({availableFormats.length} options available)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableFormats.map((format) => (
                    <FormatCard
                      key={format.format}
                      format={format.format}
                      converterName={format.converterName}
                      isSelected={selectedFormat === format.format}
                      onClick={() => setSelectedFormat(format.format)}
                    />
                  ))}
                </div>
                {selectedFormat && (
                  <button
                    onClick={handleConvert}
                    disabled={uploading}
                    className="mt-6 w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading and converting...
                      </span>
                    ) : (
                      `Convert to ${selectedFormat.toUpperCase()}`
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-red-600">
                  No conversion formats available for this file type.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported types: Images (PNG, JPG, WebP), Text (CSV, JSON, TXT), Audio (MP3, WAV), Video (MP4, WebM)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

