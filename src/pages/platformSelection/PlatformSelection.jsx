import { useState } from 'react'


const platforms = [
  { id: 'vapi', name: 'Vapi', color: 'from-purple-500 to-pink-500' },
  { id: 'elevenlabs', name: 'ElevenLabs', color: 'from-orange-500 to-red-500' },
  { id: 'bolna', name: 'Bolna', color: 'from-blue-500 to-indigo-600' },
  { id: 'cartesia', name: 'Cartesia', color: 'from-teal-500 to-blue-500' },
  { id: 'custom', name: 'Custom Prompt', color: 'from-gray-500 to-gray-700' },
]

const PlatformSelection = ({ onSelectPlatform }) => {
  const [hoveredPlatform, setHoveredPlatform] = useState(null)

  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="space-y-6">
          {/* Logo and Feature Tag */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
                Voice<span className="text-teal-400">Eval</span>
              </h1>
            </div>
          </div>

          {/* Main Heading */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
              Evaluate Your Voice AI Agents
            </h2>
            <p className="text-gray-300 text-base leading-relaxed max-w-xl">
              Run automated call simulations, analyze performance metrics, and optimize your Voice AI agents.
            </p>
          </div>

          {/* Platform Selection Panel */}
          <div className="bg-dark-panel rounded-2xl p-6 border border-gray-800/50 shadow-xl">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white mb-0.5">
                Choose Platform
              </h3>
              <p className="text-gray-400 text-xs">
                Select a platform to connect
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
                  className="group relative p-3 bg-dark-input border border-gray-700 hover:border-teal-400/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-400/10"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {/* Subtle gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}
                  />

                  {/* Platform Name */}
                  <div className="relative z-10 text-white font-semibold text-sm group-hover:text-teal-400 transition-colors duration-300">
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
