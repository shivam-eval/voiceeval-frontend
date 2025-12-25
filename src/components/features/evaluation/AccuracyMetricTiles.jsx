const DEFAULT_TILES = [
  { key: "semantic_accuracy_rate", label: "Semantic Accuracy Rate", value: 0.91, threshold: 0.8, timeMs: 142 },
  { key: "keyword_match_accuracy", label: "Keyword Match Accuracy", value: 0.92, threshold: 0.9, timeMs: 57 },
  { key: "semantic_similarity", label: "Semantic Similarity", value: 0.0, threshold: 0.75, timeMs: 0.02 },
  { key: "intent_classification_accuracy", label: "Intent Classification Accuracy", value: 0.0, threshold: 0.85, timeMs: 0.015 },
]

const AccuracyMetricTiles = ({ tiles }) => {
  const rows = Array.isArray(tiles) && tiles.length
    ? tiles.map((t) => ({
        key: t.metric_name || t.key,
        label: t.label || t.metric_name?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()) || t.label,
        value: typeof t.value === 'number' ? t.value : t.value,
        threshold: typeof t.threshold === 'number' ? t.threshold : t.threshold,
        timeMs: typeof t.execution_time_ms === 'number' ? Number(t.execution_time_ms.toFixed(2)) : t.timeMs
      }))
    : DEFAULT_TILES
  return (
    <div className="grid grid-cols-4 gap-4">
      {rows.map((t) => {
        const pass = t.value >= t.threshold
        return (
          <div key={t.key} className="relative bg-dark-input border border-gray-700 rounded-xl p-4">
            {!pass && <div className="fail-overlay absolute inset-0 rounded-xl pointer-events-none" />}
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-medium">{t.label}</div>
              <span className={`metric-badge ${pass ? "metric-badge-pass" : "metric-badge-fail"}`}>
                {pass ? "PASSED" : "FAILED"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-dark-panel rounded-lg border border-gray-700 p-3">
                <div className="text-gray-400 text-xs">Value</div>
                <div className="text-white font-semibold">{t.value}</div>
              </div>
              <div className="bg-dark-panel rounded-lg border border-gray-700 p-3">
                <div className="text-gray-400 text-xs">Threshold</div>
                <div className="text-white font-semibold">{t.threshold}</div>
              </div>
              <div className="bg-dark-panel rounded-lg border border-gray-700 p-3">
                <div className="text-gray-400 text-xs">Exec Time</div>
                <div className="text-white font-semibold">{t.timeMs} ms</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AccuracyMetricTiles
