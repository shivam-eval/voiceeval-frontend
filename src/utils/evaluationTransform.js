export const hasEvaluationData = (data) => {
  return data && typeof data === 'object' && 'overall_score' in data
}

export const transformEvaluationData = (api) => {
  // Normalize overall score (backend values are raw)
  const overallScorePct = Math.min(
    100,
    Math.max(0, Math.round(api.overall_score * 100))
  )

  // Category scores
  const categoryScores = api.category_scores.map((cs) => ({
    category: cs.category,
    name: humanizeCategory(cs.category),
    score: Math.round(cs.score * 100)
  }))

  // Success rate = % passed metrics
  const passed = api.metric_results.filter(m => m.status === 'passed').length
  const successRate = Math.round(
    (passed / api.metric_results.length) * 100
  )

  // Avg call duration from latency metric
  const latencyMetric = api.metric_results.find(
    m => m.name === 'response_latency'
  )

  const avgMs = latencyMetric?.details?.average_ms || 0
  const avgCallDuration = formatMs(avgMs)

  // Compliance = accuracy + task completion avg
  const complianceCats = categoryScores.filter(c =>
    ['Accuracy', 'Task Completion'].includes(c.name)
  )

  const complianceScore = complianceCats.length
    ? Math.round(
        complianceCats.reduce((a, b) => a + b.score, 0) /
        complianceCats.length
      )
    : 0

  return {
    summary: {
      successRate,
      conversionRate: overallScorePct,
      avgCallDuration,
      complianceScore,
      sentimentImprovement: 0
    },

    testCases: [
      {
        id: 1,
        title: api.test_id,
        score: overallScorePct,
        duration: avgCallDuration,
        outcome: api.passed ? 'Success' : 'Needs Improvement',
        status: api.passed ? 'success' : 'warning'
      }
    ],

    categoryScores,

    metricResults: api.metric_results,

    improvements: [
      {
        priority: 1,
        priorityLabel: 'High Impact',
        items: api.recommendations.map(r => ({
          title: r.split('.')[0],
          description: r
        }))
      }
    ],

    sentimentData: []
  }
}

/* ---------- helpers ---------- */

const humanizeCategory = (cat) =>
  cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const formatMs = (ms) => {
  if (!ms) return '0:00'
  const sec = Math.round(ms / 1000)
  const min = Math.floor(sec / 60)
  return `${min}:${String(sec % 60).padStart(2, '0')}`
}
