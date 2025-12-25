const DEFAULT_BARS = [
  { key: "sar", label: "Semantic Accuracy Rate", diff: +0.11, pass: true },
  { key: "kma", label: "Keyword Match Accuracy", diff: +0.017, pass: true },
  { key: "ss", label: "Semantic Similarity", diff: -0.75, pass: false },
  { key: "ica", label: "Intent Classification Accuracy", diff: -0.85, pass: false },
]

const ThresholdDistanceBars = ({ bars }) => {
  const rows = Array.isArray(bars) && bars.length
    ? bars.map((r) => {
        const label = r.label || r.metric_name?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()) || r.key
        const diff = typeof r.diff === 'number' ? r.diff : Number(((r.value ?? 0) - (r.threshold ?? 0)).toFixed(3))
        const pass = typeof r.pass === 'boolean' ? r.pass : diff >= 0
        return { key: r.key || r.metric_name, label, diff, pass }
      })
    : DEFAULT_BARS
  return (
    <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
      <div className="space-y-3">
        {rows.map((r) => {
          const pct = Math.max(0, Math.min(100, Math.round(Math.abs(r.diff) * 100)))
          return (
            <div key={r.key} className="flex items-center gap-3">
              <div className="w-64 text-sm text-gray-300">{r.label}</div>
              <div className="flex-1">
                <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-gray-700" />
                  {r.pass ? (
                    <div className={`h-full bar-positive origin-left left-1/2 w-pct-${pct}`} />
                  ) : (
                    <div className={`h-full bar-negative origin-right right-1/2 w-pct-${pct}`} />
                  )}
                </div>
              </div>
              <div className={`w-24 text-sm font-semibold ${r.pass ? "text-green-400" : "text-red-400"}`}>
                {r.diff >= 0 ? `+${r.diff}` : `${r.diff}`}
              </div>
              <div className={`text-xs ${pct <= 2 ? "text-yellow-300" : "text-gray-400"}`}>
                {pct <= 2 ? "Near-zero" : ""}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>Fail</span>
        <span>0</span>
        <span>Pass</span>
      </div>
    </div>
  )
}

export default ThresholdDistanceBars
