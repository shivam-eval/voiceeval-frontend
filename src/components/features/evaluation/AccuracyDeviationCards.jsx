const DEFAULT_CARDS = [
  { key: "sar", label: "Semantic Accuracy Rate Deviation", diff: +0.11, status: "pass" },
  { key: "kma", label: "Keyword Match Accuracy Deviation", diff: +0.017, status: "pass" },
  { key: "ss", label: "Semantic Similarity Deviation", diff: -0.75, status: "fail-cat" },
  { key: "ica", label: "Intent Classification Accuracy Deviation", diff: -0.85, status: "fail-cat" },
]

const AccuracyDeviationCards = ({ cards }) => {
  const rows = Array.isArray(cards) && cards.length
    ? cards.map((d) => {
        const label = d.label || `${(d.metric_name || d.key || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Deviation`
        const diff = typeof d.diff === 'number' ? d.diff : Number(((d.value ?? 0) - (d.threshold ?? 0)).toFixed(3))
        const status = typeof d.status === 'string' ? d.status : diff >= 0 ? 'pass' : (Math.abs(diff) > 0.5 ? 'fail-cat' : 'fail-marg')
        return { key: d.key || d.metric_name, label, diff, status }
      })
    : DEFAULT_CARDS
  return (
    <div className="grid grid-cols-4 gap-4">
      {rows.map((d) => {
        const pass = d.status === "pass"
        const catastrophic = d.status === "fail-cat"
        const cls = pass ? "deviation-pass" : catastrophic ? "deviation-fail-cat" : "deviation-fail-marg"
        return (
          <div key={d.key} className={`deviation-card ${cls}`}>
            <div className="text-white font-medium mb-2">{d.label}</div>
            <div className="text-gray-300 text-sm mb-3">
              {pass ? "Passed threshold" : catastrophic ? "Failed threshold (catastrophic)" : "Failed threshold (marginal)"} by {d.diff > 0 ? `+${d.diff}` : d.diff}
            </div>
            <div className={`text-2xl font-bold ${pass ? "text-green-400" : catastrophic ? "text-red-400" : "text-yellow-300"}`}>
              {d.diff > 0 ? `+${d.diff}` : d.diff}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AccuracyDeviationCards
