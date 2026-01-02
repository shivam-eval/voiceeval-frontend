import { useState, useEffect } from 'react'
import { testGeneration } from '../api'

const TestCasesGenerationLoading = ({ flowData, onComplete, onError, region }) => {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing...')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const generateTestCases = async () => {
      try {
        // Stage 1: Preparing request (0-20%)
        setStatus('Preparing test generation request...')
        setProgress(10)
        await new Promise(resolve => setTimeout(resolve, 300))

        if (!flowData) {
          throw new Error('Flow data not available')
        }

        if (!isMounted) return
        setProgress(20)

        // Stage 2: Sending API request (20-40%)
        setStatus('Sending request to API...')
        const payload = {
          flow_tree: flowData,
          region: region,
          call_type: "inbound",
          max_paths: 1,
          include_edge_cases: true
        }

        console.log('📤 Sending test generation request:', payload)

        if (!isMounted) return
        setProgress(30)
        await new Promise(resolve => setTimeout(resolve, 200))

        if (!isMounted) return
        setProgress(40)

        // Stage 3: Analyzing flow tree (40-60%)
        setStatus('Analyzing conversation flow tree...')

        // Make the actual API call
        const res = await testGeneration(payload)

        if (!isMounted) return

        console.log('📥 Test generation response:', res)
        console.log('📥 Response data structure:', JSON.stringify(res.data, null, 2))

        setProgress(60)

        // Stage 4: Processing response (60-80%)
        setStatus('Generating test scenarios...')
        await new Promise(resolve => setTimeout(resolve, 300))

        if (!isMounted) return
        setProgress(70)
        await new Promise(resolve => setTimeout(resolve, 300))

        if (!isMounted) return
        setProgress(80)

        // Stage 5: Creating test cases (80-95%)
        setStatus('Creating comprehensive test cases...')
        await new Promise(resolve => setTimeout(resolve, 400))

        if (!isMounted) return
        setProgress(90)

        // Stage 6: Finalizing (95-100%)
        setStatus('Finalizing test suite...')
        await new Promise(resolve => setTimeout(resolve, 300))

        if (!isMounted) return
        setProgress(95)

        await new Promise(resolve => setTimeout(resolve, 200))

        if (!isMounted) return
        setProgress(100)
        setStatus('Test cases generated successfully!')

        console.log('✅ Test cases generated successfully')
        console.log('✅ File saved:', res.data.test_suite_id)
        console.log('✅ Test suite structure:', res.data.test_suite ? 'Present' : 'Missing')

        // Verify we have the necessary data
        if (!res.data.file_name) {
          console.warn('⚠️ Warning: No file_name in response')
        }
        if (!res.data.test_suite) {
          console.warn('⚠️ Warning: No test_suite in response')
        }

        // Complete after showing success
        setTimeout(() => {
          if (isMounted && onComplete) {
            onComplete({
              testSuite: res.data,
              testSuiteId: res.data.test_suite_id
            })


          }
        }, 500)

      } catch (err) {
        if (!isMounted) return

        console.error('❌ Test generation failed:', err)
        console.error('Error details:', {
          message: err.message,
          response: err?.response?.data,
          stack: err.stack
        })

        const errorMessage = err?.response?.data?.detail || err.message || 'Failed to generate test cases'
        setError(errorMessage)
        setStatus('Error occurred')
        setProgress(0)

        // Notify parent component of error
        if (onError) {
          onError(errorMessage)
        }
      }
    }

    generateTestCases()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [flowData, onComplete, onError, region])

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
      <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-400/20 mb-6">
            {error ? (
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : progress === 100 ? (
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-teal-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {error ? 'Generation Failed' : progress === 100 ? 'Complete!' : 'Generating Test Cases'}
          </h2>
          <p className={`text-lg ${error ? 'text-red-400' : 'text-gray-400'}`}>
            {error || 'Analyzing your system prompt and creating comprehensive test scenarios...'}
          </p>
        </div>

        {/* Progress Bar */}
        {!error && (
          <div className="mb-6">
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ease-out ${progress === 100
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                    : 'bg-gradient-to-r from-teal-400 to-cyan-400'
                  }`}
                style={{ width: `${progress}%` }}
              >
                <div className="h-full w-full animate-pulse opacity-50" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>0%</span>
              <span className={`font-semibold ${progress === 100 ? 'text-green-400' : 'text-teal-400'}`}>
                {Math.round(progress)}%
              </span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Status Text */}
        <div className="text-center">
          <p className={`text-sm font-medium ${error ? 'text-red-400' : progress === 100 ? 'text-green-400' : 'text-gray-400'
            }`}>
            {status}
          </p>

          {/* Stage indicators */}
          {!error && progress < 100 && (
            <div className="mt-6 flex justify-center gap-2">
              {[
                { min: 0, max: 20, label: 'Prepare' },
                { min: 20, max: 40, label: 'Send' },
                { min: 40, max: 60, label: 'Analyze' },
                { min: 60, max: 80, label: 'Generate' },
                { min: 80, max: 100, label: 'Finalize' }
              ].map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full transition-colors ${progress >= stage.max ? 'bg-teal-400' :
                      progress >= stage.min ? 'bg-teal-400 animate-pulse' :
                        'bg-gray-700'
                    }`} />
                  <span className="text-xs text-gray-500 mt-1">{stage.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestCasesGenerationLoading