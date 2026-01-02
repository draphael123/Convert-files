'use client'

interface FormatCardProps {
  format: string
  converterName: string
  isSelected: boolean
  onClick: () => void
}

export default function FormatCard({ format, converterName, isSelected, onClick }: FormatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 border-2 rounded-lg transition-all duration-200
        ${isSelected
          ? 'border-primary-500 bg-primary-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
        }
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      `}
    >
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {format.toUpperCase()}
        </div>
        <div className="text-xs text-gray-500">{converterName}</div>
        {isSelected && (
          <div className="absolute top-2 right-2">
            <svg
              className="w-5 h-5 text-primary-600"
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

