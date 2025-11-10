import { useState } from 'react'
import DashboardOverview from './DashboardOverview'

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
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="space-y-8">
          {/* Logo and Feature Tag */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Voice<span className="text-teal-400">Eval</span>
              </h1>
            </div>
            <button
              className="w-10 h-10 rounded-full bg-dark-input hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 group"
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
          </div>

          {/* Main Heading */}
          <div>
            <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
              Evaluate Your Voice AI Agents
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
              Run automated call simulations, analyze performance metrics, and optimize your Voice AI agents with real-time insights.
            </p>
          </div>

          {/* Platform Selection Panel */}
          <div className="bg-dark-panel rounded-2xl p-8 border border-gray-800/50 shadow-xl">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white mb-2">
                Choose your Voice Agent platform
              </h3>
              <p className="text-gray-400 text-base">
                Select the platform you want to connect
              </p>
            </div>

            {/* Platform Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {platforms.map((platform, index) => (
                <button
                  key={platform.id}
                  onClick={() => onSelectPlatform(platform.id)}
                  onMouseEnter={() => setHoveredPlatform(platform.id)}
                  onMouseLeave={() => setHoveredPlatform(null)}
                  className="group relative p-6 bg-dark-input border border-gray-700 hover:border-teal-400/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-400/10"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {/* Subtle gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}
                  />

                  {/* Platform Name */}
                  <div className="relative z-10 text-white font-semibold text-lg group-hover:text-teal-400 transition-colors duration-300">
                    {platform.name}
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-5 h-5 text-teal-400"
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
            <div className="text-center pt-4 border-t border-gray-800">
              <p className="text-gray-500 text-sm">
                Don't see your platform?{' '}
                <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">
                  Contact us
                </a>
              </p>
            </div>
          </div>
      </div>
    </div>
  )
}

export default PlatformSelection
