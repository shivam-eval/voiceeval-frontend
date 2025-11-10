import { useState } from 'react'

const platforms = [
  { id: 'vapi', name: 'Vapi', color: 'from-blue-500 to-cyan-500' },
  { id: 'bolna', name: 'Bolna', color: 'from-purple-500 to-pink-500' },
  { id: 'retell', name: 'Retell', color: 'from-orange-500 to-red-500' },
  { id: 'livekit', name: 'LiveKit', color: 'from-green-500 to-emerald-500' },
  { id: 'rime', name: 'Rime', color: 'from-yellow-500 to-amber-500' },
]

const PlatformSelection = ({ onSelectPlatform }) => {
  const [hoveredPlatform, setHoveredPlatform] = useState(null)

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      <div className="bg-dark-panel rounded-3xl p-12 shadow-2xl border border-gray-800/50 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-transparent pointer-events-none" />

        {/* Close button */}
        <button
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-dark-input hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 group"
          onClick={() => window.location.reload()}
        >
          <svg
            className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-12 text-center relative z-10">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Voice<span className="text-teal-400">Eval</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Choose your Voice Agent platform
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 relative z-10">
          {platforms.map((platform, index) => (
            <button
              key={platform.id}
              onClick={() => onSelectPlatform(platform.id)}
              onMouseEnter={() => setHoveredPlatform(platform.id)}
              onMouseLeave={() => setHoveredPlatform(null)}
              className="group relative p-8 bg-dark-input hover:bg-gray-800/50 border border-gray-700 hover:border-gray-600 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Hover gradient effect */}
              {hoveredPlatform === platform.id && (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-10 rounded-2xl blur-xl transition-opacity duration-300`}
                />
              )}

              {/* Platform Name */}
              <div className="text-white font-semibold text-xl">
                {platform.name}
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-6 h-6 text-accent-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center relative z-10">
          <p className="text-gray-500 text-sm">
            Don't see your platform?{' '}
            <a href="#" className="text-accent-green hover:text-green-400 transition-colors">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PlatformSelection

