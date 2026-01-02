'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SuggestionsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim() || null,
          suggestion: suggestion.trim(),
          category: category || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit suggestion')
      }

      setSubmitted(true)
      setName('')
      setEmail('')
      setSuggestion('')
      setCategory('')
    } catch (err: any) {
      setError(err.message || 'Failed to submit suggestion')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-12 text-center shadow-xl">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">Thank You!</h2>
          <p className="text-lg text-gray-700 mb-6">
            Your suggestion has been submitted successfully. We appreciate your feedback and will review it soon!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Back to Home
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          💡 Share Your Suggestions
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          We&apos;d love to hear your ideas and feedback!
        </p>
        <p className="text-sm text-gray-600">
          Help us improve OmniConvert by sharing your thoughts, feature requests, or reporting issues.
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">
              Category (Optional)
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">Select a category...</option>
              <option value="feature">New Feature Request</option>
              <option value="improvement">Improvement Suggestion</option>
              <option value="bug">Bug Report</option>
              <option value="converter">New Converter Request</option>
              <option value="ui">UI/UX Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="suggestion" className="block text-sm font-bold text-gray-700 mb-2">
              Your Suggestion <span className="text-red-500">*</span>
            </label>
            <textarea
              id="suggestion"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              rows={8}
              required
              maxLength={5000}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              placeholder="Tell us what you think! Share your ideas, feature requests, or feedback..."
            />
            <p className="text-xs text-gray-500 mt-2">
              {suggestion.length}/5000 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !suggestion.trim()}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              '✨ Submit Suggestion'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💭 What kind of suggestions are we looking for?</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
              <div className="font-bold text-purple-700 mb-2">🆕 New Features</div>
              <p className="text-sm text-gray-700">Ideas for new converters, tools, or capabilities</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
              <div className="font-bold text-blue-700 mb-2">⚡ Improvements</div>
              <p className="text-sm text-gray-700">Ways to make existing features better</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
              <div className="font-bold text-green-700 mb-2">🐛 Bug Reports</div>
              <p className="text-sm text-gray-700">Issues you&apos;ve encountered that need fixing</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl">
              <div className="font-bold text-orange-700 mb-2">🎨 UI/UX Feedback</div>
              <p className="text-sm text-gray-700">Suggestions to improve the user experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

