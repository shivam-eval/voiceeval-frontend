import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { flowGeneration, flowGenerationMermaid } from '../api'

const loadingSteps = [
  { id: 1, text: 'Extracting System Prompts', completed: false },
  { id: 2, text: 'Generating Canonical Flow', completed: false },
  { id: 3, text: 'Creating Flow Diagram', completed: false },
]

const ConnectionLoading = ({ extractedConfig, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [waitingForConfig, setWaitingForConfig] = useState(!extractedConfig)

  useEffect(() => {
    let mounted = true
    let progressInterval = null

    console.log('ConnectionLoading mounted with config:', extractedConfig)

    if (!extractedConfig) {
      console.log('⏳ Waiting for extractedConfig...')
      setWaitingForConfig(true)
      setProgress(0)
      setCurrentStep(0)
      return
    } else {
      setWaitingForConfig(false)
    }

    const runSetup = async () => {
      try {
        console.log('🚀 Starting setup process...')
        
        // Step 1 - Extracting System Prompts (visual step)
        if (!mounted) return
        console.log('📝 Step 1: Extracting System Prompts')
        setCurrentStep(0)
        setProgress(10)
        setError(null)
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Step 2 - Flow generation
        if (!mounted) return
        console.log('🔄 Step 2: Generating Canonical Flow')
        setCurrentStep(1)
        setProgress(30)

        const flowPayload = {
          extracted_config: {
            system_prompt: extractedConfig?.system_prompt,
            config: extractedConfig?.config,
            tools: extractedConfig?.tools
          },
          model: 'llama-3.1-8b-instant',
          provider:"groq"
        }

        console.log('📤 Sending flow generation request:', flowPayload)
        
        const flowRes = await flowGeneration(flowPayload)
        console.log('📥 Flow generation response:', flowRes)
        
        if (!mounted) return
        
        const flowData = flowRes?.data || flowRes
        console.log('✅ Flow data received:', flowData)
        
        setProgress(60)
        setCurrentStep(2)

        // Step 3 - Mermaid diagram generation
        if (!mounted) return
        console.log('🔄 Step 3: Creating Flow Diagram')
        
        const mermaidPayload = {
          flow_tree: flowData,
          provider:"groq"
           }


        console.log('📤 Sending mermaid generation request:', mermaidPayload)
        
        const mermaidRes = await flowGenerationMermaid(mermaidPayload)
        console.log('📥 Mermaid generation response:', mermaidRes)
        
        if (!mounted) return
        
        const mermaid = mermaidRes?.data?.mermaid || mermaidRes?.mermaid
        console.log('✅ Mermaid diagram received:', mermaid)
        
        setProgress(95)

        // Small delay to show completion
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (!mounted) return
        
        setProgress(100)
        setCurrentStep(loadingSteps.length - 1)
        console.log('🎉 Setup complete!')

        // Pass results to parent with a small delay so user sees 100%
        setTimeout(() => {
          if (mounted && onComplete) {
            console.log('✅ Calling onComplete with data')
            onComplete({ 
              flowData, 
              mermaid,
              systemPrompt: extractedConfig?.system_prompt
            })
          }
        }, 800)

      } catch (err) {
        console.error('❌ Setup failed:', err)
        console.error('Error details:', {
          message: err.message,
          response: err?.response?.data,
          stack: err.stack
        })
        
        if (!mounted) return
        
        const errorMessage = err?.response?.data?.detail || err?.message || String(err)
        setError(errorMessage)
        toast.error(`Setup failed: ${errorMessage}`)
        
        // Still call onComplete even on error so user isn't stuck
        setTimeout(() => {
          if (mounted && onComplete) {
            console.log('⚠️ Calling onComplete despite error')
            onComplete({ 
              flowData: null, 
              mermaid: null,
              error: errorMessage 
            })
          }
        }, 2000)
      }
    }

    // Visual progress animation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return prev
        const increment = Math.random() * 1.5
        return Math.min(prev + increment, 99)
      })
    }, 500)

    runSetup()

    return () => {
      console.log('ConnectionLoading unmounting')
      mounted = false
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [extractedConfig, onComplete])

  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Voice<span className="text-teal-400">Eval</span>
            </h1>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-2 leading-tight">
            Evaluate Your Voice AI Agents
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
            Run automated call simulations, analyze performance metrics, and optimize your Voice AI agents with real-time insights.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 shadow-xl">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-white mb-2">
              Setting up your workspace
            </h3>
            <p className="text-gray-400 text-base">
              {waitingForConfig ? 'Waiting for agent configuration...' : 'Processing your Voice Agent configuration'}
            </p>
          </div>

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
                      ? 'bg-gray-800 border-teal-400/50 shadow-lg shadow-teal-400/20'
                      : isCompleted
                      ? 'bg-gray-800/50 border-gray-700 opacity-70'
                      : 'bg-gray-800/30 border-gray-800 opacity-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-full bg-teal-400 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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

                  <div className="flex-1">
                    <p className={`text-base font-medium transition-colors duration-300 ${
                      isActive ? 'text-white' : isCompleted ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {step.text}
                    </p>
                  </div>

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

          <div className="mb-4">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-green-400 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm font-medium">
              {error ? (
                <span className="text-red-400">Error: {error}</span>
              ) : progress < 100 ? (
                `Processing... ${Math.round(progress)}%`
              ) : (
                <span className="text-teal-400">Complete!</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Real-time Testing</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Auto-scoring</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionLoading;