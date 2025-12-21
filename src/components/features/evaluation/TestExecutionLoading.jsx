import { useEffect, useState } from 'react'
import { getSimulationStatus } from '../../../api'
import { TRANSCRIPT_STEPS_DUMMY as transcript } from '../../../config/dummy'

const TestExecutionLoading = ({ simulationId, onComplete, onError }) => {
  // backend state
  const [status, setStatus] = useState('queued')
  const [queuePosition, setQueuePosition] = useState(null)
  const [totalTests, setTotalTests] = useState(0)
  const [backendDone, setBackendDone] = useState(0)

  // UI animation state
  const [currentTest, setCurrentTest] = useState(0)
  const [displayProgress, setDisplayProgress] = useState(0)
  const [completed, setCompleted] = useState(false)

  /* -------------------------------
     🔁 Poll backend status
  -------------------------------- */
  useEffect(() => {
    if (!simulationId) return

    const poll = async () => {
      try {
        const { data } = await getSimulationStatus(simulationId)

        setStatus(data.status)
        setQueuePosition(data.queue_position ?? null)

        const passed = data.passed_tests || 0
        const failed = data.failed_tests || 0
        const total = data.total_tests || 0
        const done = passed + failed

        setTotalTests(total)
        setBackendDone(done)

        if (data.status === 'completed') {
          setCompleted(true)
          setBackendDone(total)
        }

        if (data.status === 'failed' || data.status === 'cancelled') {
          throw new Error(data.error_message || 'Simulation failed')
        }
      } catch (err) {
        onError?.(err)
      }
    }

    poll()
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [simulationId, onError])

  /* -------------------------------
     🎞 Sequential grid ticking
  -------------------------------- */
  useEffect(() => {
    if (currentTest < backendDone) {
      const timer = setTimeout(() => {
        setCurrentTest(prev => prev + 1)
      }, 600) // ⏱ per-test animation speed

      return () => clearTimeout(timer)
    }
  }, [currentTest, backendDone])

  /* -------------------------------
     📊 Smooth progress bar
  -------------------------------- */
  useEffect(() => {
    if (!totalTests) return

    const target = Math.round((currentTest / totalTests) * 100)

    if (displayProgress < target) {
      const timer = setTimeout(() => {
        setDisplayProgress(prev => prev + 1)
      }, 30)

      return () => clearTimeout(timer)
    }
  }, [currentTest, totalTests, displayProgress])

  /* -------------------------------
     ✅ Finish → Evaluation
  -------------------------------- */
  useEffect(() => {
    if (completed && currentTest >= totalTests && totalTests > 0) {
      const timer = setTimeout(() => {
        onComplete?.({ transcript })
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [completed, currentTest, totalTests, onComplete])

  /* -------------------------------
     🖥 UI (UNCHANGED)
  -------------------------------- */
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
      <div className="bg-dark-panel rounded-2xl p-12 border border-gray-800/50 shadow-xl">

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Running Test Cases
          </h2>
          <p className="text-gray-400">
            {status === 'queued' && queuePosition !== null
              ? `Queue position: ${queuePosition}`
              : totalTests > 0
              ? `Validating ${currentTest} of ${totalTests} test cases`
              : 'Initializing…'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-3 bg-dark-input rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-green-400 transition-all duration-300"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>0%</span>
            <span className="text-teal-400 font-semibold">
              {displayProgress}%
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Grid */}
        {totalTests > 0 && (
          <div className="grid grid-cols-5 gap-3 mb-8">
            {Array.from(
              { length: Math.min(totalTests, 10) },
              (_, i) => i + 1
            ).map(i => {
              const isDone = i <= currentTest
              const isActive = i === currentTest + 1

              return (
                <div
                  key={i}
                  className={`h-16 rounded-lg border-2 flex items-center justify-center text-lg font-semibold ${
                    isDone
                      ? 'bg-teal-400/20 border-teal-400 text-teal-300'
                      : isActive
                      ? 'bg-teal-400/10 border-teal-400 animate-pulse text-teal-400'
                      : 'bg-dark-input border-gray-700 text-gray-400'
                  }`}
                >
                  {isDone ? '✓' : i}
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center text-gray-400 text-sm">
          Analyzing call performance…
        </div>
      </div>
    </div>
  )
}

export default TestExecutionLoading
