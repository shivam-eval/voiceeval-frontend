import { useState, useEffect } from 'react'

const DashboardLoader = () => {
  const [progress, setProgress] = useState(0)
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    // Show text after a short delay
    setTimeout(() => setShowText(true), 500)

    return () => clearInterval(progressInterval)
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      <div className="bg-dark-panel rounded-3xl p-14 shadow-2xl border border-gray-800/50 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Voice<span className="text-teal-400">Eval</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Initializing your workspace
          </p>
        </div>

        {/* Dashboard Grid Preview */}
        <div className="mb-10">
          <div className="grid grid-cols-3 gap-5 mb-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-32 bg-dark-input rounded-xl border border-gray-800 animate-dashboard-load"
                style={{
                  animationDelay: `${item * 0.1}s`,
                  opacity: progress / 100,
                }}
              >
                <div className="h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg animate-pulse-slow" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-1.5 bg-dark-input rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-green to-green-400 transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full bg-accent-green animate-glow" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-gray-400 text-base font-medium animate-pulse-slow">
            {progress < 100 ? 'Initializing dashboard...' : 'Ready'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardLoader

