const DEFAULT_TIMES = [
  { key: "sar", label: "Semantic Accuracy Rate", ms: 31000, pass: true },
  { key: "kma", label: "Keyword Match Accuracy", ms: 57, pass: true },
  { key: "ss", label: "Semantic Similarity", ms: 0.02, pass: false },
  { key: "ica", label: "Intent Classification Accuracy", ms: 0.015, pass: false },
]

const AccuracyExecutionTimeBars = ({ times }) => {
  const rows = Array.isArray(times) && times.length
    ? times.map((m) => ({
        key: m.key || m.metric_name,
        label: m.label || m.metric_name?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()) || m.label,
        ms: typeof m.ms === 'number' ? m.ms : Number(m.execution_time_ms?.toFixed(3)) || 0,
        pass: typeof m.pass === 'boolean' ? m.pass : !!m.passed
      }))
    : DEFAULT_TIMES
  const maxMs = 31000
  return (
    <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
      <div className="grid grid-cols-4 gap-6 items-end">
        {rows.map((m) => {
          const pct = Math.max(3, Math.round(((m.ms || 0) / maxMs) * 100))
          return (
            <div key={m.key} className="flex flex-col items-center">
              <div className="time-bar-container">
                <div className={`time-bar ${m.pass ? "time-bar-pass" : "time-bar-fail"}`} style={{ height: `${pct}%` }} />
              </div>
              <div className="mt-2 text-sm text-white">{m.ms}ms</div>
              <div className={`text-xs ${m.pass ? "text-green-400" : "text-red-400"}`}>
                {m.pass ? "Passed (expensive)" : "Failed (cheap)"}
              </div>
              <div className="text-xs text-gray-400 mt-1">{m.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AccuracyExecutionTimeBars
