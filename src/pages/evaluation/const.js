export const EVALUATION_DATA = {
  summary: {
    successRate: 70,
    conversionRate: 40,
    avgCallDuration: "2:47",
    complianceScore: 100,
    sentimentImprovement: 0.36
  },
  testCases: [
    { id: 1, title: "Happy Customer", score: 87, duration: "3:42", outcome: "Appointment", status: "success" },
    { id: 2, title: "Upgrade Seeker", score: 91, duration: "2:38", outcome: "Appointment", status: "success" },
    { id: 3, title: "Skeptical", score: 79, duration: "4:02", outcome: "Email Sent", status: "warning" },
    { id: 4, title: "Busy Customer", score: 89, duration: "0:45", outcome: "Callback", status: "success" },
    { id: 5, title: "Referrer", score: 93, duration: "3:28", outcome: "Referral", status: "success" },
    { id: 6, title: "Indecisive", score: 81, duration: "3:55", outcome: "Email Sent", status: "warning" },
    { id: 7, title: "DNC Request", score: 98, duration: "0:32", outcome: "DNC Honored", status: "success" },
    { id: 8, title: "Competitor Loyal", score: 72, duration: "4:15", outcome: "Declined", status: "error" },
    { id: 9, title: "Poor Connection", score: 69, duration: "2:20", outcome: "Callback", status: "warning" },
    { id: 10, title: "High Mileage", score: 90, duration: "3:35", outcome: "Appointment", status: "success" }
  ],
  categoryScores: [
    { name: "Script Adherence", score: 90 },
    { name: "Natural Flow", score: 77 },
    { name: "Objection Handle", score: 71 },
    { name: "Technical Perf", score: 93 },
    { name: "Compliance", score: 100 }
  ],
  improvements: [
    {
      priority: 1,
      priorityLabel: "High Impact",
      items: [
        { title: "High-Interruption Handling", description: "Improve conversational threading" },
        { title: "Price Objection Scripts", description: "Strengthen value proposition breakdown" },
        { title: "Competitor Loyalty", description: "Create more compelling differentiation points" }
      ]
    },
    {
      priority: 2,
      priorityLabel: "Medium Impact",
      items: [
        { title: "Sentiment Recovery", description: "Better empathy responses for frustrated customers" },
        { title: "Energy Matching", description: "Fine-tune energy level adaptation" }
      ]
    },
    {
      priority: 3,
      priorityLabel: "Low Impact",
      items: [
        { title: "Filler Word Variation", description: "Add more natural speech patterns" },
        { title: "Question Pacing", description: "Slight improvements in verification flow" },
        { title: "Background Noise Filtering", description: "Minor audio quality enhancements" }
      ]
    }
  ],
  sentimentData: [8, 6, 7, 8, 9, 6, 8, 5, 7, 8] // Sample sentiment scores for trend
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
    successRate: 94.2,
    sideText: "+10%",
  },
  {
    id: "conversionRate",
    mainText: "CONVERSION RATE",
    successRate: 87,
    sideText: "+8%",
  },
  {
    id: "avgCallDuration",
    mainText: "AVG CALL DURATION",
    successRate: "1.8s",
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
    scenario: "Happy Customer",
    score: 94,
    duration: "3:12",
    session_id: "sim_1734095431000",
  },
  {
    id: "TC-002",
    scenario: "Upgrade Seeker",
    score: 91,
    duration: "2:38",
    session_id: "sim_1734095431001",
  },
  {
    id: "TC-003",
    scenario: "Skeptical Customer",
    score: 79,
    duration: "4:02",
    session_id: "sim_1734095431002",
  },
  {
    id: "TC-004",
    scenario: "Busy Customer",
    score: 89,
    duration: "0:45",
    session_id: "sim_1734095431003",
  },
];

// Dummy evaluation category scores (0–100)
export const DUMMY_CATEGORY_SCORES = [
  { category: "accuracy", score: 68 },
  { category: "task_completion", score: 82 },
  { category: "latency", score: 91 },
  { category: "audio_quality", score: 76 },
  { category: "conversation_quality", score: 84 },
  { category: "endpointing", score: 63 },
  { category: "cost", score: 95 },
  { category: "persona", score: 88 },
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
