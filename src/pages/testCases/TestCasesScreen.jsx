import { useState, useEffect } from "react"
import TestCaseCard from "./TestCaseCard"
import RunTestsButton from "./RunTestButton"
import { CALL_FLOW_SCRIPT } from "./Script"

/* -------------------------------------------------
   DEFAULT DEMO TEST CASES
------------------------------------------------- */

export const DEFAULT_TEST_CASES = [
  {
    transcript_result_id: "tr_hp_full_payment_001",
    test_id: "happy_path_full_payment",
    session_id: "sess_hp_001",
    status: "completed",
    timing: {
      start_time_ms: 1766639021000,
      end_time_ms: 1766639085000,
      duration_ms: 64000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I’m Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. May I confirm if I’m speaking with Rajesh?",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, this is Rajesh.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "Thank you for confirming. There is an outstanding amount of ₹8,500 that was due on 10th December.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "Okay, I can make the payment today.",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "borrower_reaction"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "Thank you. Would you like to pay now through a UPI link, or should I schedule a callback?",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "can_pay_today"
      }
    ],
    metadata: {
      total_turns: 5,
      agent_turns: 3,
      user_turns: 2,
      duration_ms: 64000
    },
    error_message: null
  },

  {
    transcript_result_id: "tr_hp_schedule_002",
    test_id: "happy_path_repayment_date",
    session_id: "sess_hp_002",
    status: "completed",
    timing: {
      start_time_ms: 1766639100000,
      end_time_ms: 1766639170000,
      duration_ms: 70000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I’m Riya calling on behalf of ABC Finance. May I confirm if I’m speaking with Neha?",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, speaking.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "There is an outstanding amount of ₹12,000 due on 5th December.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "I need some time. I can pay next Friday.",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "borrower_reaction"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "No problem. I’ve noted the repayment date and will send a reminder.",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "needs_time"
      }
    ],
    metadata: {
      total_turns: 5,
      agent_turns: 3,
      user_turns: 2,
      duration_ms: 70000
    },
    error_message: null
  }
]

/* -------------------------------------------------
   TestCasesScreen Component
------------------------------------------------- */

const TestCasesScreen = ({ onRunTests, onBack, testSuitePath }) => {
  const [testCases, setTestCases] = useState([])
  const [expandedScripts, setExpandedScripts] = useState({})

  /* -------------------------------------------------
     Initialize Demo Test Cases
  ------------------------------------------------- */
  useEffect(() => {
  const normalized = DEFAULT_TEST_CASES.map((tc, index) => ({
    ...tc,

    // REQUIRED by TestCaseCard
    id: index + 1,
    title:
      tc.test_id === "happy_path_full_payment"
        ? "Happy Path – Full Payment"
        : "Happy Path – Scheduled Repayment",

    icon: "✅",

    // build readable script from steps
    script: tc.steps
      .map(
        (s) =>
          `${s.turn_role === "agent" ? "AGENT" : "USER"}: ${s.text}`
      )
      .join("\n\n"),

    // REQUIRED persona block
    persona: {
      name:
        tc.test_id === "happy_path_full_payment"
          ? "Rajesh"
          : "Neha",
      speakingRate: "Moderate (120–130 WPM)",
      interruptionTendency: "Low",
      dialect: "Indian English",
      personality: "Cooperative",
      backgroundEnvironment: "Quiet",
      vehicle: "N/A",
      currentSituation: "Outstanding loan repayment"
    }
  }))

  const expandedInit = {}
  normalized.forEach(tc => {
    expandedInit[tc.id] = false
  })

  setTestCases(normalized)
  setExpandedScripts(expandedInit)
}, [])

  /* -------------------------------------------------
     Render
  ------------------------------------------------- */
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Generated Test Cases
            </h1>
            <p className="text-gray-400">
              Review the test cases and personas below, then run tests to evaluate your Voice AI agent.
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-dark-input hover:bg-dark-input/80
                         border border-gray-700 text-gray-300
                         rounded-lg text-sm font-medium transition-colors"
            >
              Back
            </button>
          )}
        </div>

        {/* Test Cases List */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {testCases.map(testCase => (
            <TestCaseCard
              key={testCase.id}
              testCase={testCase}
              isExpanded={expandedScripts[testCase.id]}
              onToggle={() => toggleScript(testCase.id)}
            />
          ))}
        </div>

        {/* Run Tests */}
        <RunTestsButton
          onRun={runSimulationNow}
          disabled={!testCases.length}
        />

      </div>
    </div>
  )
}

export default TestCasesScreen
