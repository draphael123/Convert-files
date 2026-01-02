import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OmniConvert - Free File Conversion Tool',
  description: '100% free file conversion tool. Convert images, documents, audio, video, and text files between various formats. No sign up required.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/" className="flex items-center group">
                  <span className="text-2xl font-bold text-white group-hover:scale-105 transition-transform">
                    OmniConvert
                  </span>
                  <span className="ml-2 text-xs bg-white text-purple-600 px-3 py-1 rounded-full font-bold shadow-md animate-pulse-slow">
                    FREE
                  </span>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/"
                    className="border-transparent text-white/90 hover:text-white hover:border-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Convert
                  </Link>
                  <Link
                    href="/jobs"
                    className="border-transparent text-white/90 hover:text-white hover:border-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">{children}</main>
      </body>
    </html>
  )
}

