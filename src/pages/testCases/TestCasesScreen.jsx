import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import TestCaseCard from './TestCaseCard'
import RunTestsButton from './RunTestButton'
import { CALL_FLOW_SCRIPT, DEFAULT_TESTS_CASES } from './Script'

const DEFAULT_TEST_CASES = [].map((c) => ({ ...c, script: CALL_FLOW_SCRIPT }))

function buildScriptFromSteps(steps = [], persona = {}) {
  if (!Array.isArray(steps) || steps.length === 0) return CALL_FLOW_SCRIPT

  const lines = []
  let visibleStep = 1

  steps.forEach((step) => {
    const t = step.type || step.step_type || ''
    const isAgent = step.role === 'agent'

    const speaker = isAgent ? 'AGENT' : persona?.name || 'USER'

    const text =
      step.utterance ??
      step.text ??
      step.user_input ??
      step.expected_response ??
      ''

    if (!text || !text.toString().trim()) return

    if (
      t.toLowerCase().includes('speak') ||
      t.toLowerCase().includes('utterance')
    ) {
      lines.push(`**[Step ${visibleStep++}]**`)
      lines.push(`**${speaker}:** "${String(text).trim()}"`)
      lines.push('')
    } else if (
      t.toLowerCase().includes('wait') ||
      t.toLowerCase().includes('listen') ||
      t.toLowerCase().includes('user')
    ) {
      lines.push(`**[Step ${visibleStep++} - wait for user response]**`)
      lines.push(`**${speaker}:** "${String(text).trim()}"`)
      lines.push('')
    }
  })

  return lines.length ? lines.join('\n') : CALL_FLOW_SCRIPT
}

const TestCasesScreen = ({ 
  onRunTests, 
  onBack, 
  testSuite, 
  // testSuitePath,
  testSuiteId 
}) => {
  const [expandedScripts, setExpandedScripts] = useState({})
  const [testCases, setTestCases] = useState(DEFAULT_TEST_CASES)

  const runSimulationNow = () => {
  if (!testSuiteId) {
    toast.error("Test suite ID missing. Please regenerate test cases.")
    return
  }

  console.log('🚀 Starting simulation with:')
  console.log('  🆔 Test Suite ID:', testSuiteId)

  onRunTests({
    test_suite_id: testSuiteId
  })
}


  useEffect(() => {
    if (testSuite?.test_paths && Array.isArray(testSuite.test_paths)) {
      const transformedCases = testSuite.test_paths.map((path, index) => {
        const id = index + 1
        const title = path.name || `Test Case ${id}`
        const pathType = path.path_type
        const icon = getIconForPathType(pathType)
        const steps = path.steps || []
        const script = buildScriptFromSteps(steps, path)
        const persona = generatePersonaFromSteps(steps, path)

        return {
          id,
          title,
          icon,
          pathId: path.path_id,
          pathType,
          goal: path.goal,
          description: path.description,
          nodeSequence: path.node_sequence,
          steps,
          script,
          persona
        }
      })

      const expandedInit = {}
      transformedCases.forEach((c) => { expandedInit[c.id] = false })

      setTestCases(transformedCases)
      setExpandedScripts(expandedInit)
    } else {
      const defaultsWithScript = DEFAULT_TEST_CASES.map((c, idx) => ({ ...c, id: idx + 1 }))
      const expandedInit = {}
      defaultsWithScript.forEach((c) => { expandedInit[c.id] = false })
      setTestCases(defaultsWithScript)
      setExpandedScripts(expandedInit)
    }
  }, [testSuite])

  const getIconForPathType = (pathType) => {
    if (!pathType) return '🧪'
    const icons = {
      edge_case: '⚠️',
      happy_path: '✅',
      error: '❌',
      boundary: '🔄'
    }
    return icons[pathType] || '🧪'
  }

  const generatePersonaFromSteps = (steps = [], path = {}) => {
    const p = path?.assigned_personas?.[0]

    if (p) {
      return {
        gender: p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : 'Unknown',
        name: p.name || 'Persona',

        speakingRate:
          p.behavior_traits?.verbosity === 'verbose'
            ? 'Slow (100–110 WPM)'
            : p.behavior_traits?.verbosity === 'balanced'
            ? 'Moderate (120–130 WPM)'
            : 'Fast (150–160 WPM)',

        interruptionTendency:
          p.behavior_traits?.patience_level === 'high'
            ? 'Low (waits for pauses)'
            : p.behavior_traits?.patience_level === 'medium'
            ? 'Medium (occasional interruptions)'
            : 'High (frequent interruptions)',

        dialect: `${p.native_language?.toUpperCase() || 'Unknown'} (${p.region || 'Global'})`,

        personality: p.description || 'Polite and cooperative',

        backgroundEnvironment:
          p.occupation === 'sales_consultant'
            ? 'Office environment'
            : 'Quiet environment',

        vehicle: path?.metadata?.vehicle || 'N/A',

        currentSituation: path.goal || 'Test scenario'
      }
    }

    const firstUser = steps.find(s => s.user_input || s.utterance || s.text)

    return {
      gender: 'Dynamic',
      name: 'Test Persona',
      speakingRate: 'Varies',
      interruptionTendency: 'Scenario-based',
      dialect: 'Standard',
      personality: path.description || 'Test-driven behavior',
      backgroundEnvironment: 'Simulated',
      vehicle: path?.metadata?.vehicle || 'N/A',
      currentSituation: firstUser?.user_input || path.goal || 'Testing agent behavior'
    }
  }

  const toggleScript = (testCaseId) => {
    setExpandedScripts(prev => ({ ...prev, [testCaseId]: !prev[testCaseId] }))
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Generated Test Cases</h1>
            <p className="text-gray-400">
              Review the test cases and personas below, then run all tests to evaluate your Voice AI agent.
            </p>
            {testSuiteId && (
              <p className="text-gray-500 text-sm mt-2">
                Test Suite ID: <span className="font-mono text-teal-400">{testSuiteId}</span>
              </p>
            )}
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Back
            </button>
          )}
        </div>

        {/* Test Cases List */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {testCases.map((testCase) => (
            <TestCaseCard
              key={testCase.id}
              testCase={testCase}
              isExpanded={expandedScripts[testCase.id]}
              onToggle={() => toggleScript(testCase.id)}
            />
          ))}
        </div>

        <RunTestsButton
          onRun={runSimulationNow}
          disabled={!testCases.length}
        />
      </div>
    </div>
  )
}

export default TestCasesScreen;