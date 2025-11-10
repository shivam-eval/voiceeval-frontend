import { useState, useEffect } from 'react'
import DashboardOverview from './DashboardOverview'

const loadingSteps = [
  { id: 1, text: 'Extracting System Prompts', completed: false },
  { id: 2, text: 'Extracting Tool Calls', completed: false },
  { id: 3, text: 'Generating a canonical flow', completed: false },
]

const ConnectionLoading = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate progress through each step
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 2000) // Change step every 2 seconds

    // Simulate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          // Call onComplete after a short delay when progress reaches 100%
          setTimeout(() => {
            if (onComplete) onComplete()
          }, 500)
          return 100
        }
        return prev + 1.5
      })
    }, 50)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
      <div className="grid grid-cols-3 gap-8">
        {/* Left Section - Main Content */}
        <div className="col-span-2 space-y-8">
          {/* Logo and Feature Tag */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Voice<span className="text-teal-400">Eval</span>
              </h1>
              <button className="px-4 py-1.5 bg-dark-input border border-teal-400/50 text-teal-400 rounded-lg text-sm font-medium flex items-center gap-2 hover:border-teal-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI-Powered Evaluation
              </button>
            </div>
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

          {/* Loading Steps Panel */}
          <div className="bg-dark-panel rounded-2xl p-8 border border-gray-800/50 shadow-xl">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white mb-2">
                Setting up your workspace
              </h3>
              <p className="text-gray-400 text-base">
                Processing your Voice Agent configuration
              </p>
            </div>

            {/* Loading Steps */}
            <div className="space-y-4 mb-8">
              {loadingSteps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                const isPending = index > currentStep

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      isActive
                        ? 'bg-dark-input border-teal-400/50 shadow-lg shadow-teal-400/20'
                        : isCompleted
                        ? 'bg-dark-input/50 border-gray-700 opacity-70'
                        : 'bg-dark-input/30 border-gray-800 opacity-50'
                    }`}
                  >
                    {/* Step Indicator */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-10 h-10 rounded-full bg-teal-400 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : isActive ? (
                        <div className="w-10 h-10 rounded-full bg-teal-400/20 border-2 border-teal-400 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-teal-400 animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-600" />
                      )}
                    </div>

                    {/* Step Text */}
                    <div className="flex-1">
                      <p
                        className={`text-base font-medium transition-colors duration-300 ${
                          isActive
                            ? 'text-white'
                            : isCompleted
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.text}
                      </p>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="flex-shrink-0">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-dark-input rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-green-400 transition-all duration-300 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="h-full w-full bg-teal-400 animate-glow" />
                </div>
              </div>
            </div>

            {/* Progress Text */}
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium">
                {progress < 100 ? `Processing... ${Math.round(progress)}%` : 'Complete!'}
              </p>
            </div>
          </div>

          {/* Footer Icons */}
          <div className="flex items-center gap-8 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-input border border-gray-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Real-time Testing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-input border border-gray-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-input border border-gray-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Auto-scoring</span>
            </div>
          </div>
        </div>

        {/* Right Section - Dashboard Overview */}
        <div className="col-span-1">
          <DashboardOverview />
        </div>
      </div>
    </div>
  )
}

export default ConnectionLoading
