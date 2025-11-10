import { useState, useEffect } from 'react'

const TestExecutionLoading = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState(1)

  useEffect(() => {
    // Simulate test execution progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => {
            if (onComplete) onComplete()
          }, 500)
          return 100
        }
        return prev + 2
      })
    }, 100) // 5 seconds total = 100ms * 50 steps

    // Update current test number
    const testInterval = setInterval(() => {
      setCurrentTest((prev) => {
        if (prev < 10) {
          return prev + 1
        }
        return prev
      })
    }, 500) // Change test every 0.5 seconds

    return () => {
      clearInterval(progressInterval)
      clearInterval(testInterval)
    }
  }, [onComplete])

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
      <div className="bg-dark-panel rounded-2xl p-12 border border-gray-800/50 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-400/20 mb-6">
            <svg className="w-10 h-10 text-teal-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Running Test Cases
          </h2>
          <p className="text-gray-400 text-lg">
            Executing {currentTest} of 10 test cases...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-dark-input rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-green-400 transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full bg-teal-400 animate-glow" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>0%</span>
            <span className="text-teal-400 font-semibold">{Math.round(progress)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Test Cases Grid */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((testNum) => (
            <div
              key={testNum}
              className={`h-16 rounded-lg border-2 flex items-center justify-center transition-all ${
                testNum < currentTest
                  ? 'bg-teal-400/20 border-teal-400'
                  : testNum === currentTest
                  ? 'bg-teal-400/10 border-teal-400 animate-pulse'
                  : 'bg-dark-input border-gray-700'
              }`}
            >
              {testNum < currentTest ? (
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : testNum === currentTest ? (
                <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-gray-500 text-sm font-semibold">{testNum}</span>
              )}
            </div>
          ))}
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium">
            {progress < 100 ? 'Analyzing call performance and generating reports...' : 'Tests completed!'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestExecutionLoading

