'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
          // Images
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          webp: 'image/webp',
          gif: 'image/gif',
          bmp: 'image/bmp',
          tiff: 'image/tiff',
          tif: 'image/tiff',
          svg: 'image/svg+xml',
          ico: 'image/x-icon',
          avif: 'image/avif',
          heic: 'image/heic',
          heif: 'image/heif',
          // Text & Data
          csv: 'text/csv',
          json: 'application/json',
          txt: 'text/plain',
          xml: 'application/xml',
          yaml: 'application/yaml',
          yml: 'application/yaml',
          md: 'text/markdown',
          markdown: 'text/markdown',
          html: 'text/html',
          // Audio
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          flac: 'audio/flac',
          aac: 'audio/aac',
          ogg: 'audio/ogg',
          m4a: 'audio/x-m4a',
          wma: 'audio/x-ms-wma',
          // Video
          mp4: 'video/mp4',
          webm: 'video/webm',
          avi: 'video/x-msvideo',
          mov: 'video/quicktime',
          mkv: 'video/x-matroska',
          flv: 'video/x-flv',
          wmv: 'video/x-ms-wmv',
          mpeg: 'video/mpeg',
          // Documents
          pdf: 'application/pdf',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          doc: 'application/msword',
          rtf: 'application/rtf',
          odt: 'application/vnd.oasis.opendocument.text',
          epub: 'application/epub+zip',
          // Spreadsheets
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          xls: 'application/vnd.ms-excel',
          ods: 'application/vnd.oasis.opendocument.spreadsheet',
          // Presentations
          pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          ppt: 'application/vnd.ms-powerpoint',
          odp: 'application/vnd.oasis.opendocument.presentation',
          // Archives
          zip: 'application/zip',
          rar: 'application/x-rar-compressed',
          '7z': 'application/x-7z-compressed',
          tar: 'application/x-tar',
          gz: 'application/gzip',
          tgz: 'application/gzip',
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
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.svg', '.ico', '.avif', '.heic'],
      'text/*': ['.txt', '.csv', '.json', '.xml', '.yaml', '.yml', '.md', '.html'],
      'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'],
      'video/*': ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.mpeg'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'application/x-tar': ['.tar'],
      'application/gzip': ['.gz', '.tgz'],
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
        let errorData
        try {
          errorData = await uploadResponse.json()
        } catch {
          errorData = { error: `Upload failed with status ${uploadResponse.status}` }
        }
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
          Convert Your Files Instantly
        </h1>
        <p className="text-xl text-gray-700 mb-2 font-medium">
          The free, fast, and secure way to convert files between any format
        </p>
        <p className="text-base text-gray-600 mb-3 max-w-2xl mx-auto">
          Transform images, documents, audio, video, spreadsheets, and archives with our powerful conversion engine. 
          No sign-up required, no limits, no hassle.
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

      {/* Value Proposition Section */}
      <div className="mb-12 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-4">Your Universal File Conversion Solution</h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
            OmniConvert is a powerful, free file conversion tool that transforms your files between hundreds of formats instantly. 
            Whether you need to convert images, documents, audio, video, spreadsheets, or archives, we&apos;ve got you covered.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-bold mb-2">Universal Compatibility</h3>
            <p className="text-white/90 text-sm">
              Convert between images, documents, audio, video, spreadsheets, and archives. Support for 50+ file formats with more added regularly.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-white/90 text-sm">
              No waiting, no queues. Your files are processed instantly with our optimized conversion engine. Get your converted files in seconds.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-xl font-bold mb-2">Privacy First</h3>
            <p className="text-white/90 text-sm">
              Your files are processed securely and automatically deleted after conversion. No storage, no tracking, no account required. Your privacy is our priority.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
            <span className="text-sm font-semibold">✅ No Credit Card Required</span>
            <span className="text-white/60">•</span>
            <span className="text-sm font-semibold">✅ No File Size Limits</span>
            <span className="text-white/60">•</span>
            <span className="text-sm font-semibold">✅ No Watermarks</span>
            <span className="text-white/60">•</span>
            <span className="text-sm font-semibold">✅ Unlimited Conversions</span>
          </div>
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
            Just upload, select your format, and download. It&apos;s that simple!
          </p>
        </div>
      </div>

      {/* Suggestions Call-to-Action */}
      <div className="mt-12 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-8 text-center shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-3">
          💡 Have a Suggestion?
        </h2>
        <p className="text-white/90 mb-6 text-lg">
          We&apos;re always looking to improve! Share your ideas, feature requests, or feedback with us.
        </p>
        <Link
          href="/suggestions"
          className="inline-block bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
        >
          Share Your Suggestions →
        </Link>
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

      {/* Instructions Section */}
      <div className="mt-12 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 rounded-2xl p-8 border-2 border-yellow-200 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          Setup Instructions for Vercel Deployment
        </h2>
        <div className="space-y-4 text-gray-700">
          <div className="bg-white/80 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-bold text-lg mb-2 text-orange-700">⚠️ Important: Storage Configuration Required</h3>
            <p className="mb-3">
              Vercel uses a read-only filesystem, so <strong>local file storage won&apos;t work</strong>. You must configure S3 (or S3-compatible) storage for uploads to function.
            </p>
          </div>

          <div className="bg-white/80 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-bold text-lg mb-2 text-blue-700">🔧 Step 1: Set Up S3 Storage</h3>
            <p className="mb-2">Choose one of these options:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
              <li><strong>AWS S3</strong> - Standard cloud storage</li>
              <li><strong>Cloudflare R2</strong> - Free tier available (recommended)</li>
              <li><strong>DigitalOcean Spaces</strong> - Simple and affordable</li>
              <li><strong>Backblaze B2</strong> - Cost-effective option</li>
            </ul>
          </div>

          <div className="bg-white/80 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-bold text-lg mb-2 text-purple-700">⚙️ Step 2: Configure Environment Variables</h3>
            <p className="mb-2">In your Vercel project settings, add these environment variables:</p>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
              <div>STORAGE_TYPE=s3</div>
              <div>AWS_ACCESS_KEY_ID=your_access_key</div>
              <div>AWS_SECRET_ACCESS_KEY=your_secret_key</div>
              <div>AWS_REGION=us-east-1</div>
              <div>S3_BUCKET=your-bucket-name</div>
              <div className="text-yellow-400 mt-2"># For S3-compatible services, also add:</div>
              <div>S3_ENDPOINT=https://your-endpoint.com</div>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-bold text-lg mb-2 text-green-700">🚀 Step 3: Redeploy</h3>
            <p>After adding the environment variables, redeploy your application. Uploads should now work correctly!</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> For local development, you can use <code className="bg-blue-100 px-1 rounded">STORAGE_TYPE=local</code>, but remember this won&apos;t work on Vercel.
            </p>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Need more help? Check the <code className="bg-gray-200 px-2 py-1 rounded">VERCEL_STORAGE_SETUP.md</code> file in the repository for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

