import { useState, useEffect } from 'react'
import { getSimulationStatus, getSimulationTranscript, evaluateSimulation } from '../api'

const TestExecutionLoading = ({ simulationId, onComplete, onError }) => {
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState(0)
  const [totalTests, setTotalTests] = useState(0)
  const [status, setStatus] = useState('queued')
  const [queuePosition, setQueuePosition] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (!simulationId) {
      console.error('No simulationId provided to TestExecutionLoading')
      return
    }

    let pollInterval

    const pollStatus = async () => {
      try {
        const response = await getSimulationStatus(simulationId)
        const statusData = response.data
        
        setStatus(statusData.status)
        setTotalTests(statusData.total_tests || 0)
        setQueuePosition(statusData.queue_position)
        
        // Calculate progress based on completed tests
        if (statusData.total_tests > 0) {
          const passedTests = statusData.passed_tests || 0
          const failedTests = statusData.failed_tests || 0
          const completedTests = passedTests + failedTests
          setCurrentTest(completedTests)
          setProgress(Math.round((completedTests / statusData.total_tests) * 100))
        }

        // Handle completion
        if (statusData.status === 'completed') {
          clearInterval(pollInterval)
          setProgress(100)
          
          // Fetch transcript and evaluate
          try {
            const transcriptResponse = await getSimulationTranscript(simulationId)
            const evaluationResponse = await evaluateSimulation({
              simulation_id: simulationId,
              transcript_steps: transcriptResponse.data
            })
            
            setTimeout(() => {
              if (onComplete) {
                onComplete({
                  simulationId,
                  evaluationData: evaluationResponse.data,
                  transcriptData: transcriptResponse.data,
                  statusData
                })
              }
            }, 500)
          } catch (evalError) {
            console.error('Evaluation failed:', evalError)
            setErrorMessage('Simulation completed but evaluation failed')
            if (onError) {
              onError(evalError)
            }
          }
        } 
        // Handle failure
        else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
          clearInterval(pollInterval)
          const error = statusData.error_message || `Simulation ${statusData.status}`
          setErrorMessage(error)
          if (onError) {
            onError(new Error(error))
          }
        }
      } catch (error) {
        console.error('Failed to fetch simulation status:', error)
        clearInterval(pollInterval)
        const errorMsg = error.response?.data?.detail || error.message || 'Failed to fetch status'
        setErrorMessage(errorMsg)
        if (onError) {
          onError(error)
        }
      }
    }

    // Start polling
    pollStatus() // Initial call
    pollInterval = setInterval(pollStatus, 2000) // Poll every 2 seconds

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [simulationId, onComplete, onError])

  // Show error state
  if (errorMessage) {
    return (
      <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
        <div className="bg-dark-panel rounded-2xl p-12 border border-red-500/50 shadow-xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-400/20 mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Simulation Failed
            </h2>
            <p className="text-red-400 text-lg mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-400/10 border border-red-400/50 text-red-400 rounded-lg font-medium hover:bg-red-400/20 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

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
            {status === 'queued' ? 'Queued for Execution' : 'Running Test Cases'}
          </h2>
          <p className="text-gray-400 text-lg">
            {status === 'queued' && queuePosition !== null
              ? `Queue position: ${queuePosition}`
              : totalTests > 0
              ? `Executing ${currentTest} of ${totalTests} test cases...`
              : 'Initializing simulation...'}
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

        {/* Test Cases Grid - Only show when we have total tests */}
        {totalTests > 0 && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {Array.from({ length: Math.min(totalTests, 10) }, (_, i) => i + 1).map((testNum) => (
              <div
                key={testNum}
                className={`h-16 rounded-lg border-2 flex items-center justify-center transition-all ${
                  testNum <= currentTest
                    ? 'bg-teal-400/20 border-teal-400'
                    : testNum === currentTest + 1
                    ? 'bg-teal-400/10 border-teal-400 animate-pulse'
                    : 'bg-dark-input border-gray-700'
                }`}
              >
                {testNum <= currentTest ? (
                  <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : testNum === currentTest + 1 ? (
                  <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-gray-500 text-sm font-semibold">{testNum}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Status Text */}
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium">
            {status === 'queued'
              ? 'Waiting in queue...'
              : progress < 100
              ? 'Analyzing call performance and generating reports...'
              : 'Tests completed! Generating evaluation...'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestExecutionLoading
