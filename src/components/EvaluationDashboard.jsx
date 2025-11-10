import { useState } from 'react'
import EvaluationTimeline from './EvaluationTimeline'

// Evaluation data based on the provided metrics
const EVALUATION_DATA = {
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
const TEST_CASE_1_DETAILS = {
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

const EvaluationDashboard = ({ onBack }) => {
  const [expandedTestCase, setExpandedTestCase] = useState(null)

  const toggleTestCase = (testCaseId) => {
    setExpandedTestCase(expandedTestCase === testCaseId ? null : testCaseId)
  }
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "warning":
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case "error":
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return {
          bg: "bg-red-400/10",
          border: "border-red-400/50",
          text: "text-red-400",
          label: "text-red-300"
        }
      case 2:
        return {
          bg: "bg-yellow-400/10",
          border: "border-yellow-400/50",
          text: "text-yellow-400",
          label: "text-yellow-300"
        }
      case 3:
        return {
          bg: "bg-blue-400/10",
          border: "border-blue-400/50",
          text: "text-blue-400",
          label: "text-blue-300"
        }
      default:
        return {
          bg: "bg-gray-400/10",
          border: "border-gray-400/50",
          text: "text-gray-400",
          label: "text-gray-300"
        }
    }
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              VAPI CALL TESTING DASHBOARD
            </h1>
            <p className="text-gray-400">
              Test Suite: Car Dealership Outbound | Date: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-dark-input rounded-lg border border-gray-700">
              <svg className="w-4 h-4 text-teal-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-gray-300 text-sm">Last Run</span>
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
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="space-y-6">

        {/* Summary Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <div className="text-gray-400 text-sm mb-2">SUCCESS RATE</div>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-teal-400"></div>
              <span className="text-3xl font-bold text-white">{EVALUATION_DATA.summary.successRate}%</span>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>+10%</span>
            </div>
          </div>

          <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <div className="text-gray-400 text-sm mb-2">CONVERSION RATE</div>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-teal-400"></div>
              <span className="text-3xl font-bold text-white">{EVALUATION_DATA.summary.conversionRate}%</span>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>+10%</span>
            </div>
          </div>

          <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <div className="text-gray-400 text-sm mb-2">AVG CALL DURATION</div>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-teal-400"></div>
              <span className="text-3xl font-bold text-white">{EVALUATION_DATA.summary.avgCallDuration}</span>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>On Tgt</span>
            </div>
          </div>

          <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <div className="text-gray-400 text-sm mb-2">COMPLIANCE SCORE</div>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-teal-400"></div>
              <span className="text-3xl font-bold text-white">{EVALUATION_DATA.summary.complianceScore}%</span>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Pass</span>
            </div>
          </div>
        </div>

        {/* Test Case Results */}
        <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">TEST CASE RESULTS</h2>
            <span className="text-gray-400 text-sm">[10 Tests]</span>
          </div>
          <div className="space-y-2">
            {EVALUATION_DATA.testCases.map((testCase) => {
              const isExpanded = expandedTestCase === testCase.id
              const hasDetails = testCase.id === 1
              const details = hasDetails ? TEST_CASE_1_DETAILS : null
              
              return (
                <div key={testCase.id}>
                  <div
                    onClick={() => toggleTestCase(testCase.id)}
                    className="flex items-center gap-4 p-4 bg-dark-input rounded-lg border border-gray-700 transition-colors cursor-pointer hover:border-gray-600"
                  >
                    <div className="flex-shrink-0">
                      {getStatusIcon(testCase.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">TC{testCase.id}: {testCase.title}</span>
                        <svg 
                          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right w-16">
                        <div className="text-white font-semibold">{testCase.score}%</div>
                        <div className="h-1.5 w-16 bg-dark-panel rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              testCase.score >= 90 ? 'bg-green-400' :
                              testCase.score >= 80 ? 'bg-yellow-400' :
                              testCase.score >= 70 ? 'bg-orange-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${testCase.score}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right w-20">
                        <div className="text-gray-300">[{testCase.duration}]</div>
                      </div>
                      <div className="text-right w-40">
                        <div className="text-gray-300">{testCase.outcome}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <>
                      {details ? (
                        <div className="mt-2 animate-slide-up">
                          <EvaluationTimeline testCaseData={details} />
                    </div>
                      ) : (
                        <div className="mt-2 p-6 bg-dark-input rounded-lg border border-gray-700 animate-slide-up">
                          <div className="text-center py-8">
                            <p className="text-gray-400 text-sm">
                              Detailed results for this test case are not yet available.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Scores and Sentiment Trend */}
        <div className="grid grid-cols-2 gap-6">
          {/* Category Scores */}
          <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold text-white mb-4">CATEGORY SCORES</h2>
            <div className="space-y-4">
              {EVALUATION_DATA.categoryScores.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{category.name}</span>
                    <span className="text-white font-semibold">{category.score}%</span>
                  </div>
                  <div className="h-2 bg-dark-input rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-green-400 transition-all duration-500"
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Trend */}
          <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">SENTIMENT TREND</h2>
            </div>
            
            {/* Chart Container */}
            <div className="relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 pr-2">
                <span>10</span>
                <span>8</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
                <span>0</span>
              </div>

              {/* Chart Area */}
              <div className="ml-8 relative h-64">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="border-t border-gray-700/50" style={{ height: `${100 / 5}%` }} />
                  ))}
                </div>

                {/* Bars and Line Chart */}
                <div className="relative h-full flex items-end justify-between gap-1">
                  {/* SVG for line chart */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ paddingBottom: '8px' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area under line */}
                    <path
                      d={`M 0 ${100 - (EVALUATION_DATA.sentimentData[0] / 10) * 100} ${EVALUATION_DATA.sentimentData.slice(1).map((value, index) => {
                        const x = ((index + 1) / (EVALUATION_DATA.sentimentData.length - 1)) * 100
                        const y = 100 - (value / 10) * 100
                        return `L ${x} ${y}`
                      }).join(' ')} L 100 100 L 0 100 Z`}
                      fill="url(#lineGradient)"
                    />
                    {/* Trend line */}
                    <polyline
                      points={EVALUATION_DATA.sentimentData.map((value, index) => {
                        const x = (index / (EVALUATION_DATA.sentimentData.length - 1)) * 100
                        const y = 100 - (value / 10) * 100
                        return `${x},${y}`
                      }).join(' ')}
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="0.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Data points */}
                    {EVALUATION_DATA.sentimentData.map((value, index) => {
                      const x = (index / (EVALUATION_DATA.sentimentData.length - 1)) * 100
                      const y = 100 - (value / 10) * 100
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r="1.5"
                          fill="#2dd4bf"
                          stroke="#0f766e"
                          strokeWidth="0.3"
                        />
                      )
                    })}
                  </svg>

                  {/* Bars with hover effects */}
                  {EVALUATION_DATA.sentimentData.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                      <div className="relative w-full flex flex-col items-center justify-end">
                        {/* Bar */}
                        <div
                          className="w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer relative"
                          style={{ 
                            height: `${(value / 10) * 100}%`,
                            minHeight: '2px',
                            background: value >= 8 
                              ? 'linear-gradient(to top, #34d399, #2dd4bf)' 
                              : value >= 6 
                              ? 'linear-gradient(to top, #fbbf24, #f59e0b)'
                              : 'linear-gradient(to top, #f87171, #ef4444)'
                          }}
                        >
                          {/* Bar value on hover */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                            {value}/10
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      </div>
                      {/* X-axis label */}
                      <span className="text-xs text-gray-500 mt-2 font-medium">{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* X-axis label */}
            <div className="mt-6 text-center text-sm text-gray-400">
              Test Case Number
            </div>
          </div>
        </div>

        {/* Priority Improvements */}
        <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">PRIORITY IMPROVEMENTS</h2>
            <span className="text-gray-400 text-sm">[9 Total]</span>
          </div>
          <div className="space-y-6">
            {EVALUATION_DATA.improvements.map((priorityGroup) => {
              const colors = getPriorityColor(priorityGroup.priority)
              return (
                <div key={priorityGroup.priority} className="space-y-3">
                  <div className={`flex items-center gap-2 mb-3 ${colors.text}`}>
                    <span className="font-bold text-lg">Priority {priorityGroup.priority}</span>
                    <span className={`text-sm ${colors.label}`}>({priorityGroup.priorityLabel})</span>
                  </div>
                  <div className="space-y-2 ml-4">
                    {priorityGroup.items.map((item, index) => {
                      const hoverBorder = priorityGroup.priority === 1 
                        ? 'hover:border-red-400/70' 
                        : priorityGroup.priority === 2 
                        ? 'hover:border-yellow-400/70' 
                        : 'hover:border-blue-400/70'
                      return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${colors.bg} ${colors.border} ${hoverBorder} transition-colors`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center mt-0.5`}>
                            <span className={`text-xs font-semibold ${colors.text}`}>
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold mb-1 ${colors.text}`}>
                              {item.title}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default EvaluationDashboard

