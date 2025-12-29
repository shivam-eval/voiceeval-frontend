import { useState, useEffect, useRef } from "react"
import SystemPromptViewer from "./SystemPromptViewer"
import CanonicalFlowDiagram from "./CanonicalFlowDiagram"
import TestCasesGenerationLoading from "../../components//TestCasesGenerationLoading"
import TestCasesScreen from "../../pages/testCases/TestCasesScreen"
import TestExecutionLoading from "../../components/TestExecutionLoading"
import EvaluationDashboard from "../../pages/evaluation/index"
import QueueStatsWidget from "./QueueStatsWidget"
// import { runSimulation,evaluateTranscript } from "../../api"
import transcript from '../../data/transcript_steps.json'
import RegionDropDown from "./RegionDropDown"


const WorkspaceDashboard = ({
  onEvaluationDashboardChange,
  systemConfig: {
    agentId,
    config,
    systemPrompt,
    tools,
    flowData: preloadedFlowData,
    mermaid: preloadedMermaid
  }
}) => {

  // Refs for scrolling
  const systemPromptRef = useRef(null)
  const canonicalFlowRef = useRef(null)

  // UI states
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const [showCanonicalFlow, setShowCanonicalFlow] = useState(false)
  const [showTestCasesGeneration, setShowTestCasesGeneration] = useState(false)
  const [showTestCasesScreen, setShowTestCasesScreen] = useState(false)
  const [showTestLoading, setShowTestLoading] = useState(false)
  const [showEvaluationDashboard, setShowEvaluationDashboard] = useState(false)
  const [testSuitePath, setTestSuitePath] = useState(null)
  const [simulationId, setSimulationId] = useState(null)
  const [evaluationResults, setEvaluationResults] = useState(null)

  const [selectedRegion, setSelectedRegion] = useState("")


  // Data states
  const [flowData, setFlowData] = useState(preloadedFlowData || null)
  const [testSuite, setTestSuite] = useState(null)
  const [flowError, setFlowError] = useState(null)
  const [mermaidDiagram, setMermaidDiagram] = useState(preloadedMermaid || null)

  // Use preloaded data only
  useEffect(() => {
    if (preloadedFlowData) setFlowData(preloadedFlowData)
    if (preloadedMermaid) setMermaidDiagram(preloadedMermaid)
  }, [preloadedFlowData, preloadedMermaid])

  // Handle system prompt toggle with scroll
  const handleToggleSystemPrompt = () => {
    setShowSystemPrompt(prev => {
      const newState = !prev
      if (newState) {
        setTimeout(() => {
          systemPromptRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }, 350)
      }
      return newState
    })
  }

  // Handle canonical flow toggle with scroll
  const handleToggleCanonicalFlow = () => {
    setShowCanonicalFlow(prev => {
      const newState = !prev
      if (newState) {
        setTimeout(() => {
          canonicalFlowRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }, 350)
      }
      return newState
    })
  }

  // Generate Test Suite
  const handleGenerateTestCases = () => {
    // if (!flowData) {
    //   alert("Flow data not available.")
    //   return
    // }
    setShowTestCasesGeneration(true)
  }

  const handleTestGenerationComplete = () => {
  const dummyTestSuite = {
    file_name: "demo_test_suite.json",
    tests: [
      {
        id: 1,
        name: "Greeting Test",
        status: "pending",
        persona: {
          name: "Rajesh Kumar",
          age: 35,
          city: "Mumbai",
          occupation: "Software Engineer",
          education: "Bachelor's in Computer Science",
          annualIncome: "₹12,00,000",
          creditScore: 780,
          employmentStatus: "Full-time",
          angry: true,
          interruption: true,
          language: "Hindi-English mix"
        }
      },
      {
        id: 2,
        name: "Product Inquiry",
        status: "pending",
        persona: {
          name: "Priya Sharma",
          age: 28,
          city: "Delhi",
          occupation: "Teacher",
          education: "Master's in Education",
          annualIncome: "₹8,00,000",
          creditScore: 720,
          employmentStatus: "Full-time",
          angry: true,
          interruption: true,
          language: "English"
        }
      },
      {
        id: 3,
        name: "Complaint Handling",
        status: "pending",
        persona: {
          name: "Amit Singh",
          age: 42,
          city: "Bangalore",
          occupation: "Business Owner",
          education: "Bachelor's in Commerce",
          annualIncome: "₹15,00,000",
          creditScore: 650,
          employmentStatus: "Self-employed",
          angry: true,
          interruption: false,
          language: "Hindi"
        }
      },
      {
        id: 4,
        name: "Payment Query",
        status: "pending",
        persona: {
          name: "Sunita Patel",
          age: 31,
          city: "Ahmedabad",
          occupation: "Accountant",
          education: "Chartered Accountant",
          annualIncome: "₹10,00,000",
          creditScore: 800,
          employmentStatus: "Full-time",
          angry: true,
          interruption: true,
          language: "Gujarati-English mix"
        }
      }
    ]
  }

  setTestSuite(dummyTestSuite)
  setTestSuitePath(dummyTestSuite.file_name)
  setShowTestCasesGeneration(false)
  setShowTestCasesScreen(true)
}


  const handleTestGenerationError = (error) => {
    alert("Failed to generate test cases: " + error)
    setShowTestCasesGeneration(false)
  }

//  const handleRunTests = async (testSuitePath) => {
//   try {
//     // 1️⃣ Hit API to start simulation first
//     const response = await runSimulation({
//       phone_number:"+917982693803",
//       test_suite_path: testSuitePath
// }
//     )
     
//     // 2️⃣ Store simulation ID for polling
//     const simId = response.data.session_ids[0]
//     console.log(response.data)
//     if (!simId) {
//       throw new Error("No simulation ID returned from API")
//     }
//     setSimulationId(simId)
    
//     // 3️⃣ Show loading screen after we have the ID
//     setShowTestCasesScreen(false)
//     setShowTestLoading(true)
    
//     // Note: TestExecutionLoading will handle polling and completion

//   } catch (err) {
//     console.error("Simulation failed:", err)
//     alert(err?.response?.data?.detail || "Failed to start simulation")

//     // rollback UI if needed
//     setShowTestLoading(false)
//     setShowTestCasesScreen(true)
//   }
// }

const handleRunTests = () => {
  setShowTestCasesScreen(false)
  setShowTestLoading(true)

  // fake execution time
  setTimeout(() => {
    handleTestComplete()
  }, 2500)
}


const handleTestComplete = () => {
  const dummyEvaluationResults = {
    summary: {
      successRate: 82,
      avgLatencyMs: 1200,
      totalTests: 12
    },
    steps: transcript.steps
  }

  setEvaluationResults(dummyEvaluationResults)
  setShowTestLoading(false)
  setShowEvaluationDashboard(true)
  onEvaluationDashboardChange?.(true)
}




  const handleTestError = (error) => {
    console.error("Test execution error:", error)
    alert(error?.message || "Test execution failed")
    
    // Return to test cases screen
    setShowTestLoading(false)
    setShowTestCasesScreen(true)
  }

  const handleBackToTestCases = () => {
    setShowEvaluationDashboard(false)
    setShowTestCasesScreen(true)
    onEvaluationDashboardChange?.(false)
  }

  const handleBackToWorkspace = () => {
    setShowTestCasesScreen(false)
  }

  // Screens
  if (showTestCasesGeneration) {
    return (
      <TestCasesGenerationLoading
        flowData={flowData}
        region = {selectedRegion}
        onComplete={handleTestGenerationComplete}
        onError={handleTestGenerationError}
      />
    )
  }

  if (showTestCasesScreen) {
    return (
      <TestCasesScreen
        testSuite={testSuite}
        testSuitePath={testSuitePath}
        onRunTests={handleRunTests}
        onBack={handleBackToWorkspace}
      />
    )
  }

  if (showTestLoading) {
    return (
      <TestExecutionLoading 
        simulationId={simulationId}
        onComplete={handleTestComplete}
        onError={handleTestError}
      />
    )
  }

  if (showEvaluationDashboard) {
    return (
      <EvaluationDashboard 
        evaluationData={evaluationResults}
        onBack={handleBackToTestCases} 
      />
    )
  }

  // Main UI
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Voice<span className="text-teal-400">Eval</span>
            </h1>
          </div>
        </div>

        <div>
          <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
            Evaluate Your Voice AI Agents
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
            Run automated call simulations, analyze performance metrics, and optimize your Voice AI agents with real-time insights.
          </p>
        </div>

        {/* Workspace Panel */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800/50 shadow-xl">

          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-white mb-2">
              Workspace Setup Complete
            </h3>
            <p className="text-gray-400 text-base">
              Your Voice Agent is ready for evaluation
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">

            {/* System Prompt Box */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">
                Original System Prompt
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                View the system prompt used by your Voice Agent
              </p>
              <button
                onClick={handleToggleSystemPrompt}
                className="px-4 py-2 bg-teal-400/10 border border-teal-400/50
                           text-teal-400 rounded-lg text-sm font-medium
                           hover:bg-teal-400/20 transition-all"
              >
                {showSystemPrompt ? "Collapse" : "View System Prompt"}
              </button>
            </div>

            {/* System Prompt BELOW its box */}
            <div
              ref={systemPromptRef}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showSystemPrompt ? "max-h-[2000px] opacity-100 mb-6" : "max-h-0 opacity-0"
              }`}
            >
              <SystemPromptViewer prompt={systemPrompt} />
            </div>

            {/* Canonical Flow Box */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">
                Canonical Flow Diagram
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Visual representation of your conversation flow
              </p>
              <button
                onClick={handleToggleCanonicalFlow}
                disabled={false}
                className="px-4 py-2 bg-teal-400/10 border border-teal-400/50
                           text-teal-400 rounded-lg text-sm font-medium
                           hover:bg-teal-400/20 transition-all
                           disabled:opacity-50"
              >
                {showCanonicalFlow ? "Collapse" : "View Flow Diagram"}
              </button>
            </div>

            {/* Canonical Flow BELOW its box */}
            <div
              ref={canonicalFlowRef}
              className={`overflow-y-auto transition-all duration-300 ease-in-out ${
                showCanonicalFlow
                  ? "max-h-[1200px] opacity-100 mb-6"
                  : "max-h-0 opacity-0"
              }`}
            >
             {showCanonicalFlow && <CanonicalFlowDiagram />}
            </div>

            {/* Region Selection */}
            <RegionDropDown
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
            />

            {/* Queue Stats */}
            {/* <QueueStatsWidget /> */}
          </div>

          {/* Generate Test Cases */}
          <div className="pt-4 border-t border-gray-800">
            <button
              onClick={handleGenerateTestCases}
              disabled={false}
              className="w-full px-6 py-4 bg-teal-400 hover:bg-teal-500
                         text-white rounded-xl font-semibold transition-colors
                         disabled:opacity-50"
            >
              {flowData ? "Generate Test Cases" : "Generate Test Cases"}
            </button>
            {flowError && (
              <p className="text-red-400 text-sm mt-2 text-center">
                {flowError}
              </p>
            )}
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

export default WorkspaceDashboard