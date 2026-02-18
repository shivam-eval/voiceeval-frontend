/* ===========================
   Helpers (define FIRST)
=========================== */

const humanizeCategory = (cat = '') =>
  cat
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

const formatMs = (ms) => {
  if (!ms || ms <= 0) return '0:00'
  const sec = Math.round(ms / 1000)
  const min = Math.floor(sec / 60)
  return `${min}:${String(sec % 60).padStart(2, '0')}`
}

/* ===========================
   Guards
=========================== */

export const hasEvaluationData = (data) => {
  if (!data || typeof data !== 'object') return false

  return (
    typeof data.overall_score === 'number' ||
    typeof data.overallScore === 'number' ||
    (data.summary && typeof data.summary.conversionRate === 'number')
  )
}

/* ===========================
   Transformer
=========================== */

export const transformEvaluationData = (api) => {
  if (!api || typeof api !== 'object') return null

  /* ---------- Overall score ---------- */
  const rawOverall =
    typeof api.overall_score === 'number'
      ? api.overall_score
      : typeof api.overallScore === 'number'
      ? api.overallScore / 100
      : 0

  const overallScorePct = Math.min(
    100,
    Math.max(0, Math.round(rawOverall * 100))
  )

  /* ---------- Category scores (bars) ---------- */
  const categoryScores = Array.isArray(api.category_scores)
    ? api.category_scores
        .filter(cs => !['latency', 'endpointing'].includes(cs.category))
        .map(cs => ({
          name: humanizeCategory(cs.category),
          score: Math.round((cs.score ?? 0) * 100)
        }))
    : []

  /* ---------- Success rate ---------- */
  const metricResults = Array.isArray(api.metric_results)
    ? api.metric_results
    : []

  const passedCount = metricResults.filter(m => m.status === 'passed').length
  const successRate = metricResults.length
    ? Math.round((passedCount / metricResults.length) * 100)
    : 0

  /* ---------- Latency pill ---------- */
  const latencyMetric = metricResults.find(
    m => m.name === 'response_latency'
  )

  const avgMs = latencyMetric?.details?.average_ms ?? 0
  const avgCallDuration = formatMs(avgMs)

  categoryScores.push({
    name: 'Latency',
    type: 'pill',
    value: formatMs(avgMs),
    level:
      avgMs <= 2000 ? 'good' :
      avgMs <= 4000 ? 'ok' :
      'bad'
  })

  /* ---------- Endpointing pill ---------- */
  const endpointingMetric = metricResults.find(
    m => m.name === 'pause_detection'
  )

  const longPauses =
    endpointingMetric?.details?.long_pauses ??
    endpointingMetric?.details?.longPauses ??
    0

  categoryScores.push({
    name: 'Endpointing',
    type: 'pill',
    value: `${longPauses} long pauses`,
    level:
      longPauses === 0 ? 'good' :
      longPauses <= 3 ? 'ok' :
      'bad'
  })

  /* ---------- Compliance ---------- */
  const complianceCats = categoryScores.filter(c =>
    ['Accuracy', 'Task Completion'].includes(c.name)
  )

  const complianceScore = complianceCats.length
    ? Math.round(
        complianceCats.reduce((sum, c) => sum + c.score, 0) /
        complianceCats.length
      )
    : 0

  /* ---------- Return normalized payload ---------- */
  return {
    summary: {
      successRate,
      conversionRate: overallScorePct,
      avgCallDuration,
      complianceScore,
    },

    testCases: [
      {
        id: 1,
        title: api.test_id ?? 'Evaluation',
        score: overallScorePct,
        duration: avgCallDuration,
        outcome: api.passed ? 'Success' : 'Needs Improvement',
        status: api.passed ? 'success' : 'warning'
      }
    ],

    categoryScores,

    improvements: Array.isArray(api.recommendations)
      ? [
          {
            priority: 1,
            priorityLabel: 'High Impact',
            items: api.recommendations.map(r => ({
              title: r.split('.')[0],
              description: r
            }))
          }
        ]
      : [],
  }
}
