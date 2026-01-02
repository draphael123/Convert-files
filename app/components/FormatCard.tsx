'use client'

interface FormatCardProps {
  format: string
  converterName: string
  isSelected: boolean
  onClick: () => void
}

const formatColors: Record<string, string> = {
  png: 'from-blue-400 to-cyan-500',
  jpg: 'from-orange-400 to-red-500',
  jpeg: 'from-orange-400 to-red-500',
  webp: 'from-purple-400 to-pink-500',
  gif: 'from-green-400 to-emerald-500',
  csv: 'from-yellow-400 to-orange-500',
  json: 'from-indigo-400 to-purple-500',
  txt: 'from-gray-400 to-slate-500',
  mp3: 'from-pink-400 to-rose-500',
  wav: 'from-blue-400 to-indigo-500',
  mp4: 'from-red-400 to-pink-500',
  webm: 'from-purple-400 to-violet-500',
  pdf: 'from-red-500 to-red-600',
}

export default function FormatCard({ format, converterName, isSelected, onClick }: FormatCardProps) {
  const colorClass = formatColors[format.toLowerCase()] || 'from-gray-400 to-gray-500'
  
  return (
    <button
      onClick={onClick}
      className={`
        relative p-5 border-2 rounded-xl transition-all duration-300 transform
        ${isSelected
          ? `border-transparent bg-gradient-to-br ${colorClass} text-white shadow-xl scale-105`
          : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg hover:scale-105'
        }
        focus:outline-none focus:ring-4 focus:ring-purple-300
      `}
    >
      <div className="text-center">
        <div className={`text-3xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
          {format.toUpperCase()}
        </div>
        <div className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
          {converterName}
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 animate-bounce">
            <svg
              className="w-6 h-6 text-white drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}

