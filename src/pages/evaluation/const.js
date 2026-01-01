export const EVALUATION_DATA = {
  summary: {
    successRate: 78,
    conversionRate: 100,
    avgCallDuration: "1:06",
    complianceScore: 100,
    sentimentImprovement: 0.0
  },
  testCases: [
    { id: 1, title: "Happy Path - Full Payment", score: 85, duration: "1:04", outcome: "Payment Made", status: "success" },
    { id: 2, title: "Happy Path - Schedule Payment", score: 90, duration: "1:10", outcome: "Payment Scheduled", status: "success" },
    { id: 3, title: "Edge Case - Identity Refusal", score: 75, duration: "0:45", outcome: "Call Ended", status: "success" },
    { id: 4, title: "Edge Case - Unknown Info", score: 80, duration: "1:10", outcome: "Fallback Handled", status: "success" },
    { id: 5, title: "Failure Path - Angry Escalation", score: 70, duration: "1:20", outcome: "De-escalated", status: "success" },
    { id: 6, title: "Failure Path - Payment Refusal", score: 72, duration: "1:10", outcome: "Refusal Noted", status: "success" }
  ],
  categoryScores: [
    { name: "Accuracy", score: 74 },
    { name: "Task Completion", score: 100 },
    { name: "Latency", score: 92 },
    { name: "Audio Quality", score: 88 },
    { name: "Conversation Quality", score: 83 },
    { name: "Endpointing", score: 61 },
    { name: "Cost", score: 97 },
    { name: "Persona", score: 100 }
  ],
  improvements: [
    {
      priority: 1,
      priorityLabel: "High Impact",
      items: [
        { title: "Semantic Similarity", description: "Improve semantic matching in agent responses" },
        { title: "Intent Classification", description: "Fine-tune intent classifier for refusal and emotional utterances" }
      ]
    },
    {
      priority: 2,
      priorityLabel: "Medium Impact",
      items: [
        { title: "Pause Detection", description: "Tune silence timeout thresholds for emotional conversations" }
      ]
    },
    {
      priority: 3,
      priorityLabel: "Low Impact",
      items: [
        { title: "Response Phrasing", description: "Relax similarity threshold or switch to intent-first evaluation" }
      ]
    }
  ],
  sentimentData: [7, 8, 6, 7, 5, 6]
}

// Debt Collection Use Case - Real Data from path_1.json to path_6.json
export const DEBT_COLLECTION_SIMULATION = {
  simulation_id: "sim_deb_6paths_001",
  schema_version: "1.0",
  agent_id: "deb_agent_india_v1",
  flow_tree_name: "debt_collection_compliance_call",
  execution_summary: {
    total_test_cases: 6,
    completed_test_cases: 6,
    failed_test_cases: 0
  },
  transcript_results: [
    {
      test_id: "happy_path_full_payment",
      session_id: "sess_hp_001",
      status: "completed",
      transcript_result_id: "tr_hp_full_payment_001",
      duration_ms: 64000,
      total_turns: 5
    },
    {
      test_id: "happy_path_repayment_date",
      session_id: "sess_hp_002",
      status: "completed",
      transcript_result_id: "tr_hp_schedule_002",
      duration_ms: 70000,
      total_turns: 5
    },
    {
      test_id: "edge_case_identity_refusal_detailed",
      session_id: "sess_edge_003",
      status: "completed",
      transcript_result_id: "tr_edge_identity_003",
      duration_ms: 45000,
      total_turns: 5
    },
    {
      test_id: "edge_case_unknown_information",
      session_id: "sess_edge_004",
      status: "completed",
      transcript_result_id: "tr_edge_unknown_004",
      duration_ms: 70000,
      total_turns: 5
    },
    {
      test_id: "failure_path_angry_escalation",
      session_id: "sess_fail_005",
      status: "completed",
      transcript_result_id: "tr_fail_angry_005",
      duration_ms: 80000,
      total_turns: 5
    },
    {
      test_id: "failure_path_refusal_payment",
      session_id: "sess_fail_006",
      status: "completed",
      transcript_result_id: "tr_fail_refusal_006",
      duration_ms: 70000,
      total_turns: 5
    }
  ],
  timing: {
    start_time_ms: 1766639021000,
    end_time_ms: 1766639589000,
    duration_ms: 568000
  },
  created_at: "2025-12-25T12:05:00.000Z"
}

// Debt Collection Evaluation Results
export const DEBT_COLLECTION_EVALUATION = {
  simulation_id: "sim_deb_6paths_001",
  schema_version: "1.0",
  agent_id: "deb_agent_india_v1",
  flow_tree_name: "debt_collection_compliance_call",
  overall_score: 0.78,
  overall_passed: true,
  category_scores: [
    { category: "accuracy", score: 0.74, passed: false, weight: 1.0, metrics_count: 4, passed_metrics: 2, failed_metrics: 2 },
    { category: "task_completion", score: 1.0, passed: true, weight: 1.0, metrics_count: 4, passed_metrics: 4, failed_metrics: 0 },
    { category: "latency", score: 0.92, passed: true, weight: 1.0, metrics_count: 4, passed_metrics: 4, failed_metrics: 0 },
    { category: "audio_quality", score: 0.88, passed: true, weight: 1.0, metrics_count: 3, passed_metrics: 3, failed_metrics: 0 },
    { category: "conversation_quality", score: 0.83, passed: true, weight: 1.0, metrics_count: 4, passed_metrics: 4, failed_metrics: 0 },
    { category: "endpointing", score: 0.61, passed: false, weight: 1.0, metrics_count: 3, passed_metrics: 2, failed_metrics: 1 },
    { category: "cost", score: 0.97, passed: true, weight: 1.0, metrics_count: 4, passed_metrics: 4, failed_metrics: 0 },
    { category: "persona", score: 1.0, passed: true, weight: 1.0, metrics_count: 4, passed_metrics: 4, failed_metrics: 0 }
  ],
  metrics_summary: {
    total_run: 30,
    passed: 27,
    failed: 3,
    skipped: 0
  },
  issues: [
    {
      severity: "critical",
      category: "accuracy",
      metric_name: "semantic_similarity",
      description: "Agent responses are semantically correct but vary in phrasing from expected templates.",
      recommendation: "Relax similarity threshold or switch to intent-first evaluation."
    },
    {
      severity: "critical",
      category: "accuracy",
      metric_name: "intent_classification_accuracy",
      description: "Intent misclassification observed in angry and refusal paths.",
      recommendation: "Fine-tune intent classifier on refusal and emotional utterances."
    },
    {
      severity: "minor",
      category: "endpointing",
      metric_name: "pause_detection",
      description: "Long pauses detected in anger de-escalation flows.",
      recommendation: "Tune silence timeout thresholds for emotional conversations."
    }
  ],
  recommendations: [
    "Accuracy scoring should prioritize intent compliance over strict semantic similarity.",
    "Endpointing thresholds should differ for emotional vs transactional paths."
  ],
  total_execution_time_ms: 182400,
  created_at: "2025-12-25T12:05:00.000Z"
}

// Transcript Data for all 6 Debt Collection Paths
export const DEBT_COLLECTION_TRANSCRIPTS = {
  "tr_hp_full_payment_001": {
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
        text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. May I confirm if I'm speaking with Rajesh?",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start",
        speech_start_ms: 1766639021200,
        speech_end_ms: 1766639025200,
        duration_ms: 4000
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, this is Rajesh.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_confirmed",
        speech_start_ms: 1766639027000,
        speech_end_ms: 1766639030000,
        duration_ms: 3000
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "Thank you for confirming. There is an outstanding amount of ₹8,500 that was due on 10th December.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "identity_confirmed",
        speech_start_ms: 1766639032000,
        speech_end_ms: 1766639037000,
        duration_ms: 5000
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "Okay, I can make the payment today.",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "borrower_reaction",
        speech_start_ms: 1766639039000,
        speech_end_ms: 1766639043000,
        duration_ms: 4000
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "Thank you. Would you like to pay now through a UPI link, or should I schedule a callback?",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "can_pay_today",
        speech_start_ms: 1766639045000,
        speech_end_ms: 1766639050000,
        duration_ms: 5000
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
  "tr_hp_schedule_002": {
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
        text: "Hello, I'm Riya calling on behalf of ABC Finance. May I confirm if I'm speaking with Neha?",
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
        text: "No problem. I've noted the repayment date and will send a reminder.",
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
  "tr_edge_identity_003": {
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
        text: "Hello, I'm Riya calling regarding an outstanding payment. May I confirm who I'm speaking with?",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "I don't want to confirm my identity.",
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
        node_id: "identity_refused"
      },
      {
        turn_number: 4,
        kind: "silence",
        text: "",
        turn_id: "turn_004",
        turn_role: "system",
        node_id: null
      },
      {
        turn_number: 5,
        kind: "end",
        text: "",
        turn_id: "turn_005",
        turn_role: "system",
        node_id: "end_call"
      }
    ],
    metadata: {
      total_turns: 5,
      agent_turns: 2,
      user_turns: 1,
      duration_ms: 45000
    },
    error_message: null
  },
  "tr_edge_unknown_004": {
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
        text: "Hello, I'm Riya calling on behalf of ABC Finance.",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, I am the borrower.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 3,
        kind: "user_speak",
        text: "Why was this loan approved in the first place?",
        turn_id: "turn_003",
        turn_role: "user",
        node_id: "borrower_reaction"
      },
      {
        turn_number: 4,
        kind: "agent_speak",
        text: "I don't have that information right now, but I can connect you with a representative.",
        turn_id: "turn_004",
        turn_role: "agent",
        node_id: "fallback"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "Thank you for your time. I'll update the system accordingly.",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "end_call"
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
  "tr_fail_angry_005": {
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
        kind: "user_speak",
        text: "Why do you keep calling me?",
        turn_id: "turn_001",
        turn_role: "user",
        node_id: "borrower_reaction"
      },
      {
        turn_number: 2,
        kind: "agent_speak",
        text: "I understand this can be frustrating. I'm here to help, not pressure you.",
        turn_id: "turn_002",
        turn_role: "agent",
        node_id: "angry_user"
      },
      {
        turn_number: 3,
        kind: "user_speak",
        text: "This feels like harassment.",
        turn_id: "turn_003",
        turn_role: "user",
        node_id: "angry_user"
      },
      {
        turn_number: 4,
        kind: "agent_speak",
        text: "We can take this step by step or I can end the call if you prefer.",
        turn_id: "turn_004",
        turn_role: "agent",
        node_id: "angry_user"
      },
      {
        turn_number: 5,
        kind: "end",
        text: "",
        turn_id: "turn_005",
        turn_role: "system",
        node_id: "end_call"
      }
    ],
    metadata: {
      total_turns: 5,
      agent_turns: 2,
      user_turns: 2,
      duration_ms: 80000
    },
    error_message: null
  },
  "tr_fail_refusal_006": {
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
        text: "Hello, I'm Riya calling regarding an outstanding payment.",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, but I am not going to pay.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "borrower_reaction"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "I understand your decision. I will note this outcome in our system.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "refuse_payment"
      },
      {
        turn_number: 4,
        kind: "agent_speak",
        text: "Thank you for your time.",
        turn_id: "turn_004",
        turn_role: "agent",
        node_id: "end_call"
      },
      {
        turn_number: 5,
        kind: "end",
        text: "",
        turn_id: "turn_005",
        turn_role: "system",
        node_id: "end_call"
      }
    ],
    metadata: {
      total_turns: 5,
      agent_turns: 3,
      user_turns: 1,
      duration_ms: 70000
    },
    error_message: null
  }
}

// Detailed results for test case 1
export const TEST_CASE_1_DETAILS = {
  name: "Sarah Martinez",
  scenario: "Happy Customer Service Package",
  overallResult: "PASS",
  overallScore: 87,
  outcome: "Appointment booked successfully",
  duration: "3:42 min",
  durationRange: "2–4 min",
  conversion: true,
  verdict: "Ready for Production (with monitoring)",
  categories: [
    { name: "Overall Performance", score: 87, target: 85, status: "PASS" },
    { name: "Call Structure & Flow", score: 89, target: 85, status: "PASS" },
    { name: "Conversational Quality", score: 76, target: 80, status: "NEEDS_POLISH" },
    { name: "Technical Performance", score: 96, target: 90, status: "PASS" },
    { name: "Compliance", score: 100, target: 100, status: "PASS" },
    { name: "Sentiment Change", score: 0.13, target: 0, status: "POSITIVE", isSentiment: true }
  ],
  strengths: [
    "Smooth call flow and appointment booking",
    "Perfect compliance (100%) and technical stability (96%)",
    "Positive sentiment improvement (+0.13)",
    "Clear offer presentation and professional tone"
  ],
  weaknesses: [
    "Missed empathy cues after positive feedback",
    "Slight interruption during mileage question",
    "Offer presented in one long block (information overload)",
    "Overuse of customer name (4×) and scripted phrases"
  ],
  majorIssues: [
    "Empathy Gap: Missed opportunity to engage after 9/10 rating.",
    "Rushed Verification: Interrupted customer mid-response.",
    "Offer Delivery: Too dense; needs pauses and micro-confirmations."
  ],
  minorIssues: [
    "Name overuse",
    "Scripted phrasing",
    "Missed micro-confirmation",
    "Slight overtime (3:42)"
  ],
  improvementPriorities: {
    high: [
      "Add empathy response variations",
      "Improve pause detection (+0.5s)",
      "Break offers into shorter parts"
    ],
    medium: [
      "Reduce scripted phrases",
      "Optimize timing (trim 10–15s)",
      "Limit name usage (2–3 times)"
    ],
    low: [
      "Add micro-confirmations",
      "Smoother transition phrasing"
    ]
  },
  detailedScores: {
    scriptAdherence: 89,
    naturalConversation: 75,
    empathyConnection: 70,
    technicalPerformance: 96,
    compliance: 100,
    timingEfficiency: 82,
    sentimentManagement: 83
  },
  finalVerdict: {
    status: "PASS",
    criticalFailures: 0,
    majorIssues: 3,
    minorIssues: 4,
    summary: "The agent achieved the main goal (appointment booking) with strong compliance and technical performance. Needs minor improvements in empathy, pacing, and conversational naturalness to exceed 90%."
  }
}

export const SUMMARY_METRICS = [
  {
    id: "successRate",
    mainText: "SUCCESS RATE",
    successRate: 78,
    sideText: "Overall Score",
  },
  {
    id: "conversionRate",
    mainText: "TASK COMPLETION",
    successRate: 100,
    sideText: "Pass",
  },
  {
    id: "avgCallDuration",
    mainText: "AVG CALL DURATION",
    successRate: "1:06",
    sideText: "On Target",
  },
  {
    id: "complianceScore",
    mainText: "COMPLIANCE SCORE",
    successRate: 100,
    sideText: "Pass",
  },
];

// insightTabs.js
export const INSIGHT_TABS = [
  {
    id: "accuracy",
    label: "Accuracy",
    description: "Semantic & intent correctness",
    color: "from-red-400 to-orange-400",
  },
  {
    id: "task_completion",
    label: "Task Completion",
    description: "Goal & flow adherence",
    color: "from-yellow-400 to-amber-400",
  },
  {
    id: "latency",
    label: "Latency",
    description: "Response & processing times",
    color: "from-blue-400 to-cyan-400",
  },
  {
    id: "audio_quality",
    label: "Audio Quality",
    description: "STT, TTS & audio clarity",
    color: "from-purple-400 to-indigo-400",
  },
  {
    id: "conversation_quality",
    label: "Conversation Quality",
    description: "Context, grammar & coherence",
    color: "from-green-400 to-emerald-400",
  },
  {
    id: "endpointing",
    label: "Endpointing",
    description: "Pauses & interruptions",
    color: "from-pink-400 to-rose-400",
  },
  {
    id: "cost",
    label: "Cost",
    description: "Token & infra usage",
    color: "from-gray-400 to-slate-400",
  },
  {
    id: "persona",
    label: "Persona",
    description: "Tone & persona adherence",
    color: "from-teal-400 to-green-400",
  },
  {
    id: "speech",
    label: "Speech Analysis",
    description: "WPM & talk ratio",
    color: "from-violet-400 to-purple-400",
  },
  {
    id: "sentiment",
    label: "Sentiment",
    description: "Tone & customer satisfaction",
    color: "from-rose-400 to-pink-400",
  },
];
export const DUMMY_EVALUATION_DATA = {
  simulation_id: "sim_dummy_001",
  test_id: "edge_case_unexpected_responses",
  overall_score: 0.72,
  passed: false,

  category_scores: [
    { category: "accuracy", score: 0.45, weight: 1.0 },
    { category: "task_completion", score: 0.75, weight: 1.0 },
    { category: "latency", score: 0.88, weight: 1.0 },
    { category: "audio_quality", score: 0.63, weight: 1.0 },
    { category: "conversation_quality", score: 0.74, weight: 1.0 },
    { category: "endpointing", score: 0.42, weight: 1.0 },
    { category: "cost", score: 0.95, weight: 1.0 },
    { category: "persona", score: 1.0, weight: 1.0 },
  ],

  metric_results: [
    // ACCURACY
    {
      name: "semantic_accuracy_rate",
      category: "accuracy",
      status: "passed",
      score: null,
      details: {},
    },
    {
      name: "semantic_similarity",
      category: "accuracy",
      status: "failed",
      score: null,
      details: {},
    },
    {
      name: "intent_classification_accuracy",
      category: "accuracy",
      status: "failed",
      score: null,
      details: {},
    },

    // TASK COMPLETION
    {
      name: "task_completion_rate",
      category: "task_completion",
      status: "passed",
      score: null,
      details: {},
    },
    {
      name: "sequential_task_accuracy",
      category: "task_completion",
      status: "failed",
      score: null,
      details: {},
    },

    // LATENCY
    {
      name: "response_latency",
      category: "latency",
      status: "passed",
      score: null,
      details: {
        average_ms: 1690,
        p95_ms: 1800,
        max_ms: 1900,
      },
    },

    // AUDIO
    {
      name: "word_error_rate",
      category: "audio_quality",
      status: "passed",
      score: null,
      details: {},
    },

    // CONVERSATION
    {
      name: "context_maintenance",
      category: "conversation_quality",
      status: "passed",
      score: null,
      details: {},
    },

    // ENDPOINTING
    {
      name: "pause_detection",
      category: "endpointing",
      status: "failed",
      score: null,
      details: {
        long_pauses: 6,
        max_pause_ms: 5200,
      },
    },

    // COST
    {
      name: "total_conversation_cost",
      category: "cost",
      status: "passed",
      score: null,
      details: {
        total_cost_usd: 0.10,
      },
    },

    // PERSONA
    {
      name: "persona_consistency",
      category: "persona",
      status: "passed",
      score: null,
      details: {},
    },
  ],

  issues_found: 3,

  recommendations: [
    "Accuracy metrics are below threshold.",
    "Long pauses detected in multiple turns.",
  ],

  execution_time_ms: 37825,
};
export const CATEGORY_LABELS = {
  accuracy: "Accuracy",
  task_completion: "Task Completion",
  latency: "Latency",
  audio_quality: "Audio",
  conversation_quality: "Conversation",
  endpointing: "Endpointing",
  cost: "Cost",
  persona: "Persona",
};

export const EVALUATION_TABLE_DATA = [
  {
    id: "TC-001",
    scenario: "Happy Path - Full Payment",
    score: 85,
    duration: "1:04",
    session_id: "sess_hp_001",
  },
  {
    id: "TC-002",
    scenario: "Happy Path - Schedule Payment",
    score: 90,
    duration: "1:10",
    session_id: "sess_hp_002",
  },
  {
    id: "TC-003",
    scenario: "Edge Case - Identity Refusal",
    score: 75,
    duration: "0:45",
    session_id: "sess_edge_003",
  },
  {
    id: "TC-004",
    scenario: "Edge Case - Unknown Info",
    score: 80,
    duration: "1:10",
    session_id: "sess_edge_004",
  },
  {
    id: "TC-005",
    scenario: "Failure Path - Angry Escalation",
    score: 70,
    duration: "1:20",
    session_id: "sess_fail_005",
  },
  {
    id: "TC-006",
    scenario: "Failure Path - Payment Refusal",
    score: 72,
    duration: "1:10",
    session_id: "sess_fail_006",
  },
];

// Dummy evaluation category scores (0–100)
export const DUMMY_CATEGORY_SCORES = [
  { category: "accuracy", score: 74 },
  { category: "task_completion", score: 100 },
  { category: "latency", score: 92 },
  { category: "audio_quality", score: 88 },
  { category: "conversation_quality", score: 83 },
  { category: "endpointing", score: 61 },
  { category: "cost", score: 97 },
  { category: "persona", score: 100 },
];

// Optional helper
export const getCategoryStatus = (score) => {
  if (score >= 85) return "good";
  if (score >= 70) return "warning";
  return "bad";
};

export const darkTheme = {
  textColor: "#cbd5f5",
  color: "white",
  axis: {
    ticks: {
      text: {
        fill: "#94a3b8",
      },
    },
  },
  grid: {
    line: {
      stroke: "#1e293b",
    },
  },
};
