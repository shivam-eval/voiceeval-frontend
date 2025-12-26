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
  },

  {
    transcript_result_id: "tr_edge_identity_003",
    test_id: "edge_case_identity_refusal_detailed",
    session_id: "sess_edge_003",
    status: "completed",
    timing: {
      start_time_ms: 1766639200000,
      end_time_ms: 1766639245000,
      duration_ms: 45000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. May I confirm if I'm speaking with Amit?",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "I don't want to share my details over the phone.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_refusal"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "I understand your concern. For verification, I can send you an SMS with a secure link. Would that work?",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "identity_refusal"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "No, I'm not comfortable with this call.",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "persistent_refusal"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "I completely understand. I'll note this and you can reach out to us when you're ready. Have a good day.",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "call_end"
      }
    ],
    metadata: {
      total_turns: 5,
      agent_turns: 3,
      user_turns: 2,
      duration_ms: 45000
    },
    error_message: null
  },

  {
    transcript_result_id: "tr_edge_unknown_004",
    test_id: "edge_case_unknown_information",
    session_id: "sess_edge_004",
    status: "completed",
    timing: {
      start_time_ms: 1766639300000,
      end_time_ms: 1766639370000,
      duration_ms: 70000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. May I confirm if I'm speaking with Priya?",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, this is Priya.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "There is an outstanding amount of ₹15,000 due on 1st December.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "I don't know anything about this loan. Can you tell me more details?",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "unknown_information"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "Of course. This is a personal loan taken on 15th June 2024. I'll send you the complete details via email. Is priya@email.com correct?",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "provide_details"
      }
    ],
    metadata: {
      total_turns: 5,
      agent_turns: 3,
      user_turns: 2,
      duration_ms: 70000
    },
    error_message: null
  },

  {
    transcript_result_id: "tr_fail_angry_005",
    test_id: "failure_path_angry_escalation",
    session_id: "sess_fail_005",
    status: "completed",
    timing: {
      start_time_ms: 1766639400000,
      end_time_ms: 1766639480000,
      duration_ms: 80000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. May I confirm if I'm speaking with Vikram?",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, but I'm tired of these calls! I told you I'll pay when I can!",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "angry_response"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "I sincerely apologize for any inconvenience. I understand this is frustrating. Let me see how I can help.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "de_escalate"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "Fine. I can pay half now and the rest next month.",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "calmed_down"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "Thank you for working with me. I'll arrange a partial payment plan. You'll receive the details shortly.",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "resolution"
      }
    ],
    metadata: {
      total_turns: 5,
      agent_turns: 3,
      user_turns: 2,
      duration_ms: 80000
    },
    error_message: null
  },

  {
    transcript_result_id: "tr_fail_refusal_006",
    test_id: "failure_path_refusal_payment",
    session_id: "sess_fail_006",
    status: "completed",
    timing: {
      start_time_ms: 1766639500000,
      end_time_ms: 1766639570000,
      duration_ms: 70000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. May I confirm if I'm speaking with Kavita?",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, but I can't pay right now. I lost my job.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "financial_hardship"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "I'm sorry to hear that. We have hardship programs available. Would you like to discuss options?",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "offer_assistance"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "Not right now. I need to figure things out first.",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "decline_assistance"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "I understand. I've noted your situation. Please reach out when you're ready, and we'll work together on a solution.",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "empathetic_close"
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

const TestCasesScreen = ({ onRunTests, onBack, testSuitePath, showRunButton = true }) => {
  const [testCases, setTestCases] = useState([])
  const [expandedScripts, setExpandedScripts] = useState({})

  /* -------------------------------------------------
     Initialize Demo Test Cases
  ------------------------------------------------- */
  useEffect(() => {
  const normalized = DEFAULT_TEST_CASES.map((tc, index) => {
    // Define persona data based on test_id
    const personaMap = {
      "happy_path_full_payment": {
        name: "Rajesh Kumar",
        age: "35",
        city: "Mumbai, Maharashtra",
        occupation: "Senior Software Engineer",
        education: "B.Tech in Computer Science",
        annualIncome: "₹18,00,000",
        creditScore: 780,
        employmentStatus: "Full-time Employed",
        loanAmount: "₹8,500",
        loanPurpose: "Personal Loan",
        lastLoanTaken: "6 months ago",
        personality: "Cooperative"
      },
      "happy_path_repayment_date": {
        name: "Neha Sharma",
        age: "28",
        city: "Bangalore, Karnataka",
        occupation: "Marketing Manager",
        education: "MBA in Marketing",
        annualIncome: "₹12,50,000",
        creditScore: 720,
        employmentStatus: "Full-time Employed",
        loanAmount: "₹12,000",
        loanPurpose: "Personal Loan",
        lastLoanTaken: "8 months ago",
        personality: "Cooperative"
      },
      "edge_case_identity_refusal_detailed": {
        name: "Amit Patel",
        age: "42",
        city: "Ahmedabad, Gujarat",
        occupation: "Business Owner",
        education: "B.Com",
        annualIncome: "₹25,00,000",
        creditScore: 650,
        employmentStatus: "Self-employed",
        loanAmount: "₹10,000",
        loanPurpose: "Business Loan",
        lastLoanTaken: "1 year ago",
        personality: "Cautious"
      },
      "edge_case_unknown_information": {
        name: "Priya Reddy",
        age: "31",
        city: "Hyderabad, Telangana",
        occupation: "HR Manager",
        education: "MBA in HR",
        annualIncome: "₹15,00,000",
        creditScore: 740,
        employmentStatus: "Full-time Employed",
        loanAmount: "₹15,000",
        loanPurpose: "Personal Loan",
        lastLoanTaken: "6 months ago",
        personality: "Confused"
      },
      "failure_path_angry_escalation": {
        name: "Vikram Singh",
        age: "38",
        city: "Delhi, NCR",
        occupation: "Sales Executive",
        education: "B.A.",
        annualIncome: "₹10,00,000",
        creditScore: 680,
        employmentStatus: "Full-time Employed",
        loanAmount: "₹20,000",
        loanPurpose: "Personal Loan",
        lastLoanTaken: "3 months ago",
        personality: "Frustrated"
      },
      "failure_path_refusal_payment": {
        name: "Kavita Desai",
        age: "29",
        city: "Pune, Maharashtra",
        occupation: "Graphic Designer",
        education: "B.Des",
        annualIncome: "₹8,00,000",
        creditScore: 620,
        employmentStatus: "Recently Unemployed",
        loanAmount: "₹7,000",
        loanPurpose: "Personal Loan",
        lastLoanTaken: "4 months ago",
        personality: "Distressed"
      }
    };

    // Define titles based on test_id
    const titleMap = {
      "happy_path_full_payment": "Happy Path – Full Payment",
      "happy_path_repayment_date": "Happy Path – Schedule Payment",
      "edge_case_identity_refusal_detailed": "Edge Case – Identity Refusal",
      "edge_case_unknown_information": "Edge Case – Unknown Info",
      "failure_path_angry_escalation": "Failure Path – Angry Escalation",
      "failure_path_refusal_payment": "Failure Path – Payment Refusal"
    };

    // Define icons based on test type
    const getIcon = (testId) => {
      if (testId.includes("happy_path")) return "✅";
      if (testId.includes("edge_case")) return "⚠️";
      if (testId.includes("failure_path")) return "❌";
      return "📋";
    };

    const personaData = personaMap[tc.test_id] || personaMap["happy_path_full_payment"];

    return {
      ...tc,
      id: index + 1,
      title: titleMap[tc.test_id] || tc.test_id,
      icon: getIcon(tc.test_id),
      script: tc.steps
        .map((s) => `${s.turn_role === "agent" ? "AGENT" : "USER"}: ${s.text}`)
        .join("\n\n"),
      persona: {
        ...personaData,
        speakingRate: "Moderate (120–130 WPM)",
        interruptionTendency: "Low",
        dialect: "Indian English",
        backgroundEnvironment: "Quiet",
        currentSituation: "Outstanding loan repayment"
      }
    };
  })

  const expandedInit = {}
  normalized.forEach(tc => {
    expandedInit[tc.id] = false
  })

  setTestCases(normalized)
  setExpandedScripts(expandedInit)
}, [])

  /* -------------------------------------------------
     Toggle Script Expansion
  ------------------------------------------------- */
  const toggleScript = (id) => {
    setExpandedScripts(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  /* -------------------------------------------------
     Run Simulation Handler
  ------------------------------------------------- */
  const runSimulationNow = () => {
    if (onRunTests) {
      onRunTests(testCases)
    }
  }

  /* -------------------------------------------------
     Render
  ------------------------------------------------- */
  return (
    <div className="w-full">
      <div className="space-y-6 p-8">

        {/* Header - Simplified */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Test Cases
            </h2>
            <p className="text-gray-400 text-sm">
              Review generated scenarios for your agent.
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
        {showRunButton && (
          <RunTestsButton
            onRun={() => onRunTests(testSuitePath)}
            disabled={testCases.length === 0}
          />
        )}

      </div>
    </div>
  )
}

export default TestCasesScreen
