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
      end_time_ms: 1766639145000,
      duration_ms: 124000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. May I confirm if I'm speaking with Rajesh? This call may be recorded for service and compliance purposes.",
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
        text: "Thank you for confirming, Rajesh. I am calling to inform you that there is an outstanding amount of ₹8,500 on your personal loan account. The payment was due on 10th December. There are no additional penalties beyond what is mentioned in your loan agreement.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "dues_information"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "Okay, thanks for informing me.",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "borrower_acknowledgement"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "You're welcome. Would you like to make the repayment today, or would you prefer to schedule it for another date?",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "repayment_attempt"
      },
      {
        turn_number: 6,
        kind: "user_speak",
        text: "Yes, I can make the payment today.",
        turn_id: "turn_006",
        turn_role: "user",
        node_id: "can_pay_today"
      },
      {
        turn_number: 7,
        kind: "agent_speak",
        text: "Thank you. Would you like to pay now through a UPI link, or should I schedule a call back when you are ready?",
        turn_id: "turn_007",
        turn_role: "agent",
        node_id: "payment_method_offer"
      },
      {
        turn_number: 8,
        kind: "user_speak",
        text: "You can send me a UPI link. I will pay now.",
        turn_id: "turn_008",
        turn_role: "user",
        node_id: "payment_method_selected"
      },
      {
        turn_number: 9,
        kind: "agent_speak",
        text: "Sure. I am sending a secure UPI payment link to your registered mobile number. Please let me know once the payment is completed.",
        turn_id: "turn_009",
        turn_role: "agent",
        node_id: "payment_link_sent"
      },
      {
        turn_number: 10,
        kind: "user_speak",
        text: "Yes, I have completed the payment.",
        turn_id: "turn_010",
        turn_role: "user",
        node_id: "payment_done"
      },
      {
        turn_number: 11,
        kind: "agent_speak",
        text: "Thank you. I am checking the system for confirmation. Yes, I can see the payment of ₹8,500 has been received successfully.",
        turn_id: "turn_011",
        turn_role: "agent",
        node_id: "payment_verified"
      },
      {
        turn_number: 12,
        kind: "user_speak",
        text: "Great, thanks.",
        turn_id: "turn_012",
        turn_role: "user",
        node_id: "call_wrap_user"
      },
      {
        turn_number: 13,
        kind: "agent_speak",
        text: "Thank you for your time. I appreciate your patience. I will update the system with our discussion. Have a good day.",
        turn_id: "turn_013",
        turn_role: "agent",
        node_id: "closing"
      }
    ],
    metadata: {
      total_turns: 13,
      agent_turns: 7,
      user_turns: 6,
      duration_ms: 124000
    },
    error_message: null
  },

  {
    transcript_result_id: "tr_hp_repayment_date_002",
    test_id: "happy_path_repayment_date",
    session_id: "sess_hp_rd_001",
    status: "completed",
    timing: {
      start_time_ms: 1766639200000,
      end_time_ms: 1766639305000,
      duration_ms: 105000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. May I confirm if I'm speaking with Neha Sharma? This call may be recorded for service and compliance purposes.",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, Neha here. Sorry, I was on another call.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "Thank you for confirming. There is an outstanding amount of ₹12,000 due on your personal loan. The payment due date was 5th January.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "dues_info"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "Yes I remember. I cannot pay today.",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "needs_time"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "No problem. What is a realistic date you can commit to? I will note it and send a reminder.",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "repayment_date_request"
      },
      {
        turn_number: 6,
        kind: "user_speak",
        text: "I can pay by the 15th of this month.",
        turn_id: "turn_006",
        turn_role: "user",
        node_id: "date_commitment"
      },
      {
        turn_number: 7,
        kind: "agent_speak",
        text: "Thank you. I have noted 15th as your repayment date. I will send you a reminder before that.",
        turn_id: "turn_007",
        turn_role: "agent",
        node_id: "date_confirmed"
      },
      {
        turn_number: 8,
        kind: "agent_speak",
        text: "Thank you for your time. I appreciate your patience. I will update the system with our discussion. Have a good day.",
        turn_id: "turn_008",
        turn_role: "agent",
        node_id: "closing"
      }
    ],
    metadata: {
      total_turns: 8,
      agent_turns: 5,
      user_turns: 3,
      duration_ms: 105000
    },
    error_message: null
  },

  {
    transcript_result_id: "tr_ec_identity_refusal_003",
    test_id: "edge_case_identity_refusal_detailed",
    session_id: "sess_ec_ir_001",
    status: "completed",
    timing: {
      start_time_ms: 1766639400000,
      end_time_ms: 1766639450000,
      duration_ms: 50000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. Kya main Amit Patel se baat kar raha hoon? Yeh call compliance ke liye record ho sakti hai.",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Aap kaun? Main confirm nahi karunga.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_refused"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "I understand. For security reasons, I cannot continue without confirmation. Thank you for your time.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "call_terminate"
      }
    ],
    metadata: {
      total_turns: 3,
      agent_turns: 2,
      user_turns: 1,
      duration_ms: 50000
    },
    error_message: null
  },

  {
    transcript_result_id: "tr_ec_unknown_info_004",
    test_id: "edge_case_unknown_information",
    session_id: "sess_ec_ui_001",
    status: "completed",
    timing: {
      start_time_ms: 1766639500000,
      end_time_ms: 1766639605000,
      duration_ms: 105000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. May I confirm if I'm speaking with Priya Reddy? This call may be recorded.",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, Priya speaking.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "There is an outstanding amount of ₹15,000 on your loan account.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "dues_info"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "Why was penalty added last month?",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "unknown_query"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "I don't have that information right now, but I can connect you with a representative who can assist you further.",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "fallback_response"
      },
      {
        turn_number: 6,
        kind: "agent_speak",
        text: "Thank you for your time. I will update the system with our discussion. Have a good day.",
        turn_id: "turn_006",
        turn_role: "agent",
        node_id: "closing"
      }
    ],
    metadata: {
      total_turns: 6,
      agent_turns: 4,
      user_turns: 2,
      duration_ms: 105000
    },
    error_message: null
  },

  {
    transcript_result_id: "tr_fp_angry_escalation_005",
    test_id: "failure_path_angry_escalation",
    session_id: "sess_fp_ae_001",
    status: "completed",
    timing: {
      start_time_ms: 1766639700000,
      end_time_ms: 1766639820000,
      duration_ms: 120000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. May I confirm if I'm speaking with Vikram Singh?",
        turn_id: "turn_001",
        turn_role: "agent"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Haan bol raha hoon. Roz call karte ho tum log!",
        turn_id: "turn_002",
        turn_role: "user"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "I understand this can be frustrating. I am here to help, not to pressure you.",
        turn_id: "turn_003",
        turn_role: "agent"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "Abhi paise nahi hai. Samjhe?",
        turn_id: "turn_004",
        turn_role: "user"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "No problem. Hum step by step kar sakte hain. Aap realistically kab payment kar sakte hain?",
        turn_id: "turn_005",
        turn_role: "agent"
      },
      {
        turn_number: 6,
        kind: "user_speak",
        text: "Next week try karunga.",
        turn_id: "turn_006",
        turn_role: "user"
      },
      {
        turn_number: 7,
        kind: "agent_speak",
        text: "Thank you. I will note next week and send a reminder.",
        turn_id: "turn_007",
        turn_role: "agent"
      }
    ],
    metadata: {
      total_turns: 7,
      agent_turns: 4,
      user_turns: 3,
      duration_ms: 120000
    },
    error_message: null
  },

  {
    transcript_result_id: "tr_fp_refusal_payment_006",
    test_id: "failure_path_refusal_payment",
    session_id: "sess_fp_rp_001",
    status: "completed",
    timing: {
      start_time_ms: 1766639900000,
      end_time_ms: 1766640020000,
      duration_ms: 120000
    },
    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. May I confirm if I'm speaking with Kavita Desai?",
        turn_id: "turn_001",
        turn_role: "agent"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes… but I lost my job. I can't pay anything right now.",
        turn_id: "turn_002",
        turn_role: "user"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "I am sorry to hear that. I am here to help, not to pressure you.",
        turn_id: "turn_003",
        turn_role: "agent"
      },
      {
        turn_number: 4,
        kind: "agent_speak",
        text: "Would you like me to note this and arrange a follow-up later?",
        turn_id: "turn_004",
        turn_role: "agent"
      },
      {
        turn_number: 5,
        kind: "user_speak",
        text: "Yes please call next month.",
        turn_id: "turn_005",
        turn_role: "user"
      },
      {
        turn_number: 6,
        kind: "agent_speak",
        text: "Thank you. I will schedule a follow up next month.",
        turn_id: "turn_006",
        turn_role: "agent"
      }
    ],
    metadata: {
      total_turns: 6,
      agent_turns: 4,
      user_turns: 2,
      duration_ms: 120000
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
        personality: "Cooperative",
        language: "English",
        dialect: "Indian English",
        backgroundNoise: "Quiet",
        pace: "Moderate",
        pitch: "Medium",
        loudness: "Normal",
        angry: false,
        interruption: false
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
        personality: "Cooperative",
        language: "English",
        dialect: "Indian English",
        backgroundNoise: "Low",
        pace: "Moderate",
        pitch: "Medium",
        loudness: "Normal",
        angry: false,
        interruption: true
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
        personality: "Cautious",
        language: "Hindi",
        dialect: "Hindi (Gujarati accent)",
        backgroundNoise: "Quiet",
        pace: "Slow",
        pitch: "Low",
        loudness: "Soft",
        angry: false,
        interruption: false
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
        personality: "Confused",
        language: "English",
        dialect: "Indian English",
        backgroundNoise: "Office",
        pace: "Moderate",
        pitch: "Medium",
        loudness: "Normal",
        angry: false,
        interruption: true
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
        personality: "Frustrated",
        language: "Hindi",
        dialect: "Hinglish",
        backgroundNoise: "Street",
        pace: "Fast",
        pitch: "High",
        loudness: "Loud",
        angry: true,
        interruption: true
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
        personality: "Distressed",
        language: "English",
        dialect: "Indian English",
        backgroundNoise: "Quiet",
        pace: "Slow",
        pitch: "Medium",
        loudness: "Soft",
        angry: true,
        interruption: true
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
