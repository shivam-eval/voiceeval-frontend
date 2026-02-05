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
    { category: "accuracy", score: 74 },
    { category: "task_completion", score: 94 },
    { category: "latency", score: 92 },
    { category: "audio", score: 88 },
    { category: "conversation", score: 83 },
    { category: "endpointing", score: 61 },
    { category: "cost", score: 97 },
    { category: "persona", score: 91 }
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
      duration_ms: 124000,
      total_turns: 13
    },
    {
      test_id: "happy_path_repayment_date",
      session_id: "sess_hp_rd_001",
      status: "completed",
      transcript_result_id: "tr_hp_repayment_date_002",
      duration_ms: 105000,
      total_turns: 8
    },
    {
      test_id: "edge_case_identity_refusal_detailed",
      session_id: "sess_ec_ir_001",
      status: "completed",
      transcript_result_id: "tr_ec_identity_refusal_003",
      duration_ms: 50000,
      total_turns: 3
    },
    {
      test_id: "edge_case_unknown_information",
      session_id: "sess_ec_ui_001",
      status: "completed",
      transcript_result_id: "tr_ec_unknown_info_004",
      duration_ms: 105000,
      total_turns: 6
    },
    {
      test_id: "failure_path_angry_escalation",
      session_id: "sess_fp_ae_001",
      status: "completed",
      transcript_result_id: "tr_fp_angry_escalation_005",
      duration_ms: 120000,
      total_turns: 7
    },
    {
      test_id: "failure_path_refusal_payment",
      session_id: "sess_fp_rp_001",
      status: "completed",
      transcript_result_id: "tr_fp_refusal_payment_006",
      duration_ms: 120000,
      total_turns: 6
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
    { category: "task_completion", score: 0.94, passed: true, weight: 1.0, metrics_count: 4, passed_metrics: 4, failed_metrics: 0 },
    { category: "latency", score: 0.92, passed: true, weight: 1.0, metrics_count: 4, passed_metrics: 4, failed_metrics: 0 },
    { category: "audio", score: 0.88, passed: true, weight: 1.0, metrics_count: 3, passed_metrics: 3, failed_metrics: 0 },
    { category: "conversation", score: 0.83, passed: true, weight: 1.0, metrics_count: 4, passed_metrics: 4, failed_metrics: 0 },
    { category: "endpointing", score: 0.61, passed: false, weight: 1.0, metrics_count: 3, passed_metrics: 2, failed_metrics: 1 },
    { category: "cost", score: 0.97, passed: true, weight: 1.0, metrics_count: 4, passed_metrics: 4, failed_metrics: 0 },
    { category: "persona", score: 0.91, passed: true, weight: 1.0, metrics_count: 4, passed_metrics: 4, failed_metrics: 0 }
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

// Transcript Data for all 6 Debt Collection Paths (synced with TestCasesScreen)
export const DEBT_COLLECTION_TRANSCRIPTS = {
  "tr_hp_full_payment_001": {
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
      { turn_number: 1, kind: "agent_speak", text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. May I confirm if I'm speaking with Rajesh? This call may be recorded for service and compliance purposes.", turn_id: "turn_001", turn_role: "agent", node_id: "start" },
      { turn_number: 2, kind: "user_speak", text: "Yes, this is Rajesh.", turn_id: "turn_002", turn_role: "user", node_id: "identity_confirmed" },
      { turn_number: 3, kind: "agent_speak", text: "Thank you for confirming, Rajesh. I am calling to inform you that there is an outstanding amount of ₹8,500 on your personal loan account. The payment was due on 10th December. There are no additional penalties beyond what is mentioned in your loan agreement.", turn_id: "turn_003", turn_role: "agent", node_id: "dues_information" },
      { turn_number: 4, kind: "user_speak", text: "Okay, thanks for informing me.", turn_id: "turn_004", turn_role: "user", node_id: "borrower_acknowledgement" },
      { turn_number: 5, kind: "agent_speak", text: "You're welcome. Would you like to make the repayment today, or would you prefer to schedule it for another date?", turn_id: "turn_005", turn_role: "agent", node_id: "repayment_attempt" },
      { turn_number: 6, kind: "user_speak", text: "Yes, I can make the payment today.", turn_id: "turn_006", turn_role: "user", node_id: "can_pay_today" },
      { turn_number: 7, kind: "agent_speak", text: "Thank you. Would you like to pay now through a UPI link, or should I schedule a call back when you are ready?", turn_id: "turn_007", turn_role: "agent", node_id: "payment_method_offer" },
      { turn_number: 8, kind: "user_speak", text: "You can send me a UPI link. I will pay now.", turn_id: "turn_008", turn_role: "user", node_id: "payment_method_selected" },
      { turn_number: 9, kind: "agent_speak", text: "Sure. I am sending a secure UPI payment link to your registered mobile number. Please let me know once the payment is completed.", turn_id: "turn_009", turn_role: "agent", node_id: "payment_link_sent" },
      { turn_number: 10, kind: "user_speak", text: "Yes, I have completed the payment.", turn_id: "turn_010", turn_role: "user", node_id: "payment_done" },
      { turn_number: 11, kind: "agent_speak", text: "Thank you. I am checking the system for confirmation. Yes, I can see the payment of ₹8,500 has been received successfully.", turn_id: "turn_011", turn_role: "agent", node_id: "payment_verified" },
      { turn_number: 12, kind: "user_speak", text: "Great, thanks.", turn_id: "turn_012", turn_role: "user", node_id: "call_wrap_user" },
      { turn_number: 13, kind: "agent_speak", text: "Thank you for your time. I appreciate your patience. I will update the system with our discussion. Have a good day.", turn_id: "turn_013", turn_role: "agent", node_id: "closing" }
    ],
    metadata: { total_turns: 13, agent_turns: 7, user_turns: 6, duration_ms: 124000 },
    error_message: null
  },
  "tr_hp_repayment_date_002": {
    transcript_result_id: "tr_hp_repayment_date_002",
    test_id: "happy_path_repayment_date",
    session_id: "sess_hp_rd_001",
    status: "completed",
    timing: { start_time_ms: 1766639200000, end_time_ms: 1766639305000, duration_ms: 105000 },
    steps: [
      { turn_number: 1, kind: "agent_speak", text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. May I confirm if I'm speaking with Neha Sharma? This call may be recorded for service and compliance purposes.", turn_id: "turn_001", turn_role: "agent", node_id: "start" },
      { turn_number: 2, kind: "user_speak", text: "Yes, Neha here. Sorry, I was on another call.", turn_id: "turn_002", turn_role: "user", node_id: "identity_confirmed" },
      { turn_number: 3, kind: "agent_speak", text: "Thank you for confirming. There is an outstanding amount of ₹12,000 due on your personal loan. The payment due date was 5th January.", turn_id: "turn_003", turn_role: "agent", node_id: "dues_info" },
      { turn_number: 4, kind: "user_speak", text: "Yes I remember. I cannot pay today.", turn_id: "turn_004", turn_role: "user", node_id: "needs_time" },
      { turn_number: 5, kind: "agent_speak", text: "No problem. What is a realistic date you can commit to? I will note it and send a reminder.", turn_id: "turn_005", turn_role: "agent", node_id: "repayment_date_request" },
      { turn_number: 6, kind: "user_speak", text: "I can pay by the 15th of this month.", turn_id: "turn_006", turn_role: "user", node_id: "date_commitment" },
      { turn_number: 7, kind: "agent_speak", text: "Thank you. I have noted 15th as your repayment date. I will send you a reminder before that.", turn_id: "turn_007", turn_role: "agent", node_id: "date_confirmed" },
      { turn_number: 8, kind: "agent_speak", text: "Thank you for your time. I appreciate your patience. I will update the system with our discussion. Have a good day.", turn_id: "turn_008", turn_role: "agent", node_id: "closing" }
    ],
    metadata: { total_turns: 8, agent_turns: 5, user_turns: 3, duration_ms: 105000 },
    error_message: null
  },
  "tr_ec_identity_refusal_003": {
    transcript_result_id: "tr_ec_identity_refusal_003",
    test_id: "edge_case_identity_refusal_detailed",
    session_id: "sess_ec_ir_001",
    status: "completed",
    timing: { start_time_ms: 1766639400000, end_time_ms: 1766639450000, duration_ms: 50000 },
    steps: [
      { turn_number: 1, kind: "agent_speak", text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. Kya main Amit Patel se baat kar raha hoon? Yeh call compliance ke liye record ho sakti hai.", turn_id: "turn_001", turn_role: "agent", node_id: "start" },
      { turn_number: 2, kind: "user_speak", text: "Aap kaun? Main confirm nahi karunga.", turn_id: "turn_002", turn_role: "user", node_id: "identity_refused" },
      { turn_number: 3, kind: "agent_speak", text: "I understand. For security reasons, I cannot continue without confirmation. Thank you for your time.", turn_id: "turn_003", turn_role: "agent", node_id: "call_terminate" }
    ],
    metadata: { total_turns: 3, agent_turns: 2, user_turns: 1, duration_ms: 50000 },
    error_message: null
  },
  "tr_ec_unknown_info_004": {
    transcript_result_id: "tr_ec_unknown_info_004",
    test_id: "edge_case_unknown_information",
    session_id: "sess_ec_ui_001",
    status: "completed",
    timing: { start_time_ms: 1766639500000, end_time_ms: 1766639605000, duration_ms: 105000 },
    steps: [
      { turn_number: 1, kind: "agent_speak", text: "Hello, I'm Riya calling on behalf of ABC Finance. May I confirm if I'm speaking with Priya Reddy? This call may be recorded.", turn_id: "turn_001", turn_role: "agent", node_id: "start" },
      { turn_number: 2, kind: "user_speak", text: "Yes, Priya speaking.", turn_id: "turn_002", turn_role: "user", node_id: "identity_confirmed" },
      { turn_number: 3, kind: "agent_speak", text: "There is an outstanding amount of ₹15,000 on your loan account.", turn_id: "turn_003", turn_role: "agent", node_id: "dues_info" },
      { turn_number: 4, kind: "user_speak", text: "Why was penalty added last month?", turn_id: "turn_004", turn_role: "user", node_id: "unknown_query" },
      { turn_number: 5, kind: "agent_speak", text: "I don't have that information right now, but I can connect you with a representative who can assist you further.", turn_id: "turn_005", turn_role: "agent", node_id: "fallback_response" },
      { turn_number: 6, kind: "agent_speak", text: "Thank you for your time. I will update the system with our discussion. Have a good day.", turn_id: "turn_006", turn_role: "agent", node_id: "closing" }
    ],
    metadata: { total_turns: 6, agent_turns: 4, user_turns: 2, duration_ms: 105000 },
    error_message: null
  },
  "tr_fp_angry_escalation_005": {
    transcript_result_id: "tr_fp_angry_escalation_005",
    test_id: "failure_path_angry_escalation",
    session_id: "sess_fp_ae_001",
    status: "completed",
    timing: { start_time_ms: 1766639700000, end_time_ms: 1766639820000, duration_ms: 120000 },
    steps: [
      { turn_number: 1, kind: "agent_speak", text: "Hello, I'm Riya calling on behalf of ABC Finance. May I confirm if I'm speaking with Vikram Singh?", turn_id: "turn_001", turn_role: "agent" },
      { turn_number: 2, kind: "user_speak", text: "Haan bol raha hoon. Roz call karte ho tum log!", turn_id: "turn_002", turn_role: "user" },
      { turn_number: 3, kind: "agent_speak", text: "I understand this can be frustrating. I am here to help, not to pressure you.", turn_id: "turn_003", turn_role: "agent" },
      { turn_number: 4, kind: "user_speak", text: "Abhi paise nahi hai. Samjhe?", turn_id: "turn_004", turn_role: "user" },
      { turn_number: 5, kind: "agent_speak", text: "No problem. Hum step by step kar sakte hain. Aap realistically kab payment kar sakte hain?", turn_id: "turn_005", turn_role: "agent" },
      { turn_number: 6, kind: "user_speak", text: "Next week try karunga.", turn_id: "turn_006", turn_role: "user" },
      { turn_number: 7, kind: "agent_speak", text: "Thank you. I will note next week and send a reminder.", turn_id: "turn_007", turn_role: "agent" }
    ],
    metadata: { total_turns: 7, agent_turns: 4, user_turns: 3, duration_ms: 120000 },
    error_message: null
  },
  "tr_fp_refusal_payment_006": {
    transcript_result_id: "tr_fp_refusal_payment_006",
    test_id: "failure_path_refusal_payment",
    session_id: "sess_fp_rp_001",
    status: "completed",
    timing: { start_time_ms: 1766639900000, end_time_ms: 1766640020000, duration_ms: 120000 },
    steps: [
      { turn_number: 1, kind: "agent_speak", text: "Hello, I'm Riya calling on behalf of ABC Finance. May I confirm if I'm speaking with Kavita Desai?", turn_id: "turn_001", turn_role: "agent" },
      { turn_number: 2, kind: "user_speak", text: "Yes… but I lost my job. I can't pay anything right now.", turn_id: "turn_002", turn_role: "user" },
      { turn_number: 3, kind: "agent_speak", text: "I am sorry to hear that. I am here to help, not to pressure you.", turn_id: "turn_003", turn_role: "agent" },
      { turn_number: 4, kind: "agent_speak", text: "Would you like me to note this and arrange a follow-up later?", turn_id: "turn_004", turn_role: "agent" },
      { turn_number: 5, kind: "user_speak", text: "Yes please call next month.", turn_id: "turn_005", turn_role: "user" },
      { turn_number: 6, kind: "agent_speak", text: "Thank you. I will schedule a follow up next month.", turn_id: "turn_006", turn_role: "agent" }
    ],
    metadata: { total_turns: 6, agent_turns: 4, user_turns: 2, duration_ms: 120000 },
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
  { category: "audio", score: 88 },
  { category: "conversation", score: 83 },
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
  color:"white",
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
