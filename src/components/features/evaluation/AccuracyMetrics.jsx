import { useMemo } from "react"

const tiles = [
  { key: "semantic_accuracy_rate", label: "Semantic Accuracy Rate", value: 0.91, threshold: 0.8, timeMs: 142 },
  { key: "keyword_match_accuracy", label: "Keyword Match Accuracy", value: 0.92, threshold: 0.9, timeMs: 130 },
  { key: "semantic_similarity", label: "Semantic Similarity", value: 0.0, threshold: 0.75, timeMs: 98 },
  { key: "intent_classification_accuracy", label: "Intent Classification Accuracy", value: 0.0, threshold: 0.85, timeMs: 105 },
]

const stepsSemantic = [0.95, 0.93, 0.91, 0.89, 0.87, 0.42, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
const stepsIntent = [0.92, 0.90, 0.88, 0.86, 0.84, 0.40, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

const AccuracyMetrics = () => {
  const barRows = useMemo(() => {
    return tiles.map((t) => {
      const diff = Number((t.value - t.threshold).toFixed(2))
      const pct = Math.max(0, Math.min(100, Math.round(Math.abs(diff) * 100)))
      const pass = diff >= 0
      return { ...t, diff, pct, pass }
    })
  }, [])

  const zeroSteps = useMemo(() => {
    const zs = []
    stepsSemantic.forEach((v, i) => {
      if (v <= 0.001) zs.push({ type: "semantic", step: i + 1 })
    })
    stepsIntent.forEach((v, i) => {
      if (v <= 0.001) zs.push({ type: "intent", step: i + 1 })
    })
    return zs
  }, [])

  return (
    <div className="space-y-8">
      {/* 6) Deviations from Threshold */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">ACCURACY METRIC DEVIATIONS</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { key: "sar", label: "Semantic Accuracy Rate Deviation", diff: +0.11, status: "pass" },
            { key: "kma", label: "Keyword Match Accuracy Deviation", diff: +0.017, status: "pass" },
            { key: "ss", label: "Semantic Similarity Deviation", diff: -0.75, status: "fail-cat" },
            { key: "ica", label: "Intent Classification Accuracy Deviation", diff: -0.85, status: "fail-cat" },
          ].map((d) => {
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
        <div className="mt-2 text-sm text-gray-300">
          Semantic Similarity and Intent Classification Accuracy are catastrophic failures.
        </div>
      </div>

      {/* 7) Execution Time for Accuracy Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">EXECUTION TIME FOR ACCURACY METRICS</h2>
        <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
          <div className="grid grid-cols-4 gap-6 items-end">
            {[
              { key: "sar", label: "Semantic Accuracy Rate", ms: 31000, pass: true },
              { key: "kma", label: "Keyword Match Accuracy", ms: 57, pass: true },
              { key: "ss", label: "Semantic Similarity", ms: 0.02, pass: false },
              { key: "ica", label: "Intent Classification Accuracy", ms: 0.015, pass: false },
            ].map((m) => {
              const maxMs = 31000
              const pct = Math.max(3, Math.round((m.ms / maxMs) * 100))
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
      </div>
      {/* 1) Deterministic Flow Execution */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">DETERMINISTIC FLOW EXECUTION</h2>
        <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between gap-6">
            {[
              { label: "Task Completion Rate", value: "100%" },
              { label: "Sequential Task Accuracy", value: "100%" },
              { label: "Step Validation Pass Rate", value: "100%" },
              { label: "Flow Path Coverage", value: "100%" },
            ].map((n, idx, arr) => (
              <div key={n.label} className="flex items-center gap-6">
                <div className="flow-node">
                  <div className="flow-node-header">{n.value}</div>
                  <div className="flow-node-label">{n.label}</div>
                </div>
                {idx < arr.length - 1 && (
                  <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-green-400 font-semibold">All nodes executed successfully</div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">ACCURACY METRIC BREAKDOWN</h2>
        <div className="grid grid-cols-4 gap-4">
          {tiles.map((t) => {
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
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">THRESHOLD DISTANCE (DEBUG VIEW)</h2>
        <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
          <div className="space-y-3">
            {barRows.map((r) => (
              <div key={r.key} className="flex items-center gap-3">
                <div className="w-64 text-sm text-gray-300">{r.label}</div>
                <div className="flex-1">
                  <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-gray-700" />
                    {r.pass ? (
                      <div className={`h-full bar-positive origin-left left-1/2 w-pct-${r.pct}`} />
                    ) : (
                      <div className={`h-full bar-negative origin-right right-1/2 w-pct-${r.pct}`} />
                    )}
                  </div>
                </div>
                <div className={`w-24 text-sm font-semibold ${r.pass ? "text-green-400" : "text-red-400"}`}>
                  {r.diff >= 0 ? `+${r.diff}` : `${r.diff}`}
                </div>
                <div className={`text-xs ${r.pct <= 2 ? "text-yellow-300" : "text-gray-400"}`}>
                  {r.value === 0 ? "Zero" : r.pct <= 2 ? "Near-zero" : ""}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Fail</span>
            <span>0</span>
            <span>Pass</span>
          </div>
        </div>
      </div>

      {/* 2) Coverage of Conversation Paths */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">COVERAGE OF CONVERSATION PATHS</h2>
        <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
          {[
            { label: "Happy paths", pct: 100, count: 20 },
            { label: "Edge cases", pct: 100, count: 7 },
            { label: "Failure paths", pct: 100, count: 3 },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-4 mb-3">
              <div className="w-40 text-sm text-gray-300">{b.label}</div>
              <div className="flex-1">
                <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-green-400 w-pct-100" />
                </div>
              </div>
              <div className="w-24 text-right text-sm text-white">{b.count} paths</div>
              <div className="w-16 text-sm text-green-400 font-semibold">{b.pct}%</div>
            </div>
          ))}
          <div className="mt-2 text-xs text-gray-400">All conversation path types fully covered.</div>
        </div>
      </div>

      {/* 3) Latency Performance Dashboard */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">LATENCY PERFORMANCE (BOX PLOTS)</h2>
        <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
          <div className="grid grid-cols-5 gap-4">
            {[
              { key: "avg", label: "Average Response", q1: 1.4, q2: 1.8, q3: 2.1, whiskerMin: 1.0, whiskerMax: 2.6, threshold: 2.0 },
              { key: "p95", label: "P95", q1: 2.4, q2: 2.9, q3: 3.3, whiskerMin: 2.0, whiskerMax: 3.9, threshold: 3.0 },
              { key: "p99", label: "P99", q1: 3.4, q2: 4.2, q3: 4.8, whiskerMin: 2.8, whiskerMax: 5.5, threshold: 4.0 },
              { key: "ttft", label: "TTFT", q1: 0.32, q2: 0.45, q3: 0.55, whiskerMin: 0.25, whiskerMax: 0.70, threshold: 0.50 },
              { key: "transcript", label: "Transcript Time", q1: 55, q2: 62.8, q3: 68, whiskerMin: 48, whiskerMax: 75, threshold: 65 },
            ].map((m) => {
              const max = m.key === "transcript" ? 80 : 6
              const scale = (v) => Math.round((v / max) * 100)
              const thrPos = scale(m.threshold)
              return (
                <div key={m.key} className="flex flex-col items-center">
                  <div className="relative w-full h-28 bg-gray-900 rounded-lg border border-gray-700">
                    {/* whiskers */}
                    <div className="absolute left-1/2 -translate-x-1/2 h-16 flex flex-col items-center justify-between">
                      <div className="w-10 h-px bg-gray-600" />
                      <div className="w-10 h-px bg-gray-600" />
                    </div>
                    {/* box plot */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{ bottom: `${scale(m.q1)}%`, height: `${scale(m.q3) - scale(m.q1)}%` }}
                    >
                      <div className="w-24 h-full bg-blue-500/30 border border-blue-400 rounded-md" />
                      <div
                        className="absolute left-0 right-0 bg-blue-400 h-1"
                        style={{ bottom: `${scale(m.q2) - scale(m.q1)}%` }}
                      />
                    </div>
                    {/* threshold line */}
                    <div
                      className="absolute left-0 right-0 border-t border-red-400/70"
                      style={{ bottom: `${thrPos}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm text-white">{m.label}</div>
                  <div className="text-xs text-gray-400">thr: {m.threshold}s</div>
                </div>
              )
            })}
          </div>
          <div className="mt-2 text-xs text-gray-400">Boxes show Q1–Q3 with median line; red line indicates threshold.</div>
        </div>
      </div>

      {/* 4) Overall Evaluation Results */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">OVERALL EVALUATION RESULTS</h2>
        <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="p-4 bg-dark-panel rounded-lg border border-gray-700">
              <div className="text-gray-400 text-xs mb-1">Total Tests</div>
              <div className="text-2xl font-bold text-white">30</div>
            </div>
            <div className="p-4 bg-dark-panel rounded-lg border border-gray-700">
              <div className="text-gray-400 text-xs mb-1">Passed</div>
              <div className="text-2xl font-bold text-green-400">27</div>
            </div>
            <div className="p-4 bg-dark-panel rounded-lg border border-gray-700">
              <div className="text-gray-400 text-xs mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-400">3</div>
            </div>
            <div className="p-4 bg-dark-panel rounded-lg border border-gray-700">
              <div className="text-gray-400 text-xs mb-1">Overall Status</div>
              <span className="metric-badge metric-badge-fail">NOT READY</span>
            </div>
            <div className="p-4 bg-dark-panel rounded-lg border border-gray-700">
              <div className="text-gray-400 text-xs mb-1">Total Exec Time</div>
              <div className="text-2xl font-bold text-white">~44.9s</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-yellow-300">Most tests passed, but failures block deployment readiness.</div>
        </div>
      </div>

      {/* 5) Category Scores with Risk Highlight */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">EVALUATION CATEGORY SCORES</h2>
        <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
          <div className="relative h-48">
            {/* axes */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-700/60" />
            <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-700/60" />
            {/* line plot */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {(() => {
                const cats = [
                  { name: "Accuracy", val: 0.456, failed: true },
                  { name: "Task Completion", val: 1.0, failed: false },
                  { name: "Latency", val: 16460.68, failed: false },
                  { name: "Audio Quality", val: 0.628, failed: false },
                  { name: "Conversation Quality", val: 0.75, failed: false },
                  { name: "Endpointing", val: 1046667, failed: true },
                  { name: "Cost", val: 0.051, failed: false },
                  { name: "Persona", val: 1.0, failed: false },
                ]
                const maxY = 1046667
                const pts = cats.map((c, i) => {
                  const x = (i / (cats.length - 1)) * 100
                  const y = 100 - (Math.min(c.val, maxY) / maxY) * 100
                  return `${x},${y}`
                }).join(" ")
                return (
                  <>
                    <polyline points={pts} fill="none" stroke="#60a5fa" strokeWidth="0.6" />
                    {cats.map((c, i) => {
                      const x = (i / (cats.length - 1)) * 100
                      const y = 100 - (Math.min(c.val, maxY) / maxY) * 100
                      return (
                        <circle
                          key={c.name}
                          cx={x}
                          cy={y}
                          r="1.2"
                          fill={c.failed ? "#ef4444" : "#60a5fa"}
                          stroke={c.failed ? "#7f1d1d" : "#1d4ed8"}
                          strokeWidth="0.4"
                        />
                      )
                    })}
                  </>
                )
              })()}
            </svg>
            {/* labels */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-xs text-gray-400">
              {["Accuracy","Task Completion","Latency","Audio Quality","Conversation Quality","Endpointing","Cost","Persona"].map((l) => (
                <span key={l} className="w-20 text-center">{l}</span>
              ))}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Failed categories highlighted in red; magnitude indicates risk dominance.
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">STEP-WISE ACCURACY</h2>
        <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
          <div className="relative h-64">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0,1,2,3,4].map((i) => <div key={i} className="border-t border-gray-700/50 h-20p" />)}
            </div>
            <div className="absolute inset-0 flex items-end justify-between px-6">
              {Array.from({ length: stepsSemantic.length }).map((_, i) => (
                <span key={i} className="text-xs text-gray-500">{i + 1}</span>
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                className="line-semantic"
                points={stepsSemantic.map((v, i) => {
                  const x = (i / (stepsSemantic.length - 1)) * 100
                  const y = 100 - v * 100
                  return `${x},${y}`
                }).join(" ")}
                fill="none"
              />
              <polyline
                className="line-intent"
                points={stepsIntent.map((v, i) => {
                  const x = (i / (stepsIntent.length - 1)) * 100
                  const y = 100 - v * 100
                  return `${x},${y}`
                }).join(" ")}
                fill="none"
              />
              {stepsSemantic.map((v, i) => {
                const x = (i / (stepsSemantic.length - 1)) * 100
                const y = 100 - v * 100
                return <circle key={`s-${i}`} cx={x} cy={y} r="1.2" className="dot-semantic" />
              })}
              {stepsIntent.map((v, i) => {
                const x = (i / (stepsIntent.length - 1)) * 100
                const y = 100 - v * 100
                return <circle key={`i-${i}`} cx={x} cy={y} r="1.2" className="dot-intent" />
              })}
              {zeroSteps.map((z) => {
                const idx = z.step - 1
                const arr = z.type === "semantic" ? stepsSemantic : stepsIntent
                const x = (idx / (arr.length - 1)) * 100
                const y = 100 - arr[idx] * 100
                const label = z.type === "semantic" ? "ASR mismatch" : "Intent map error"
                return (
                  <g key={`z-${z.type}-${idx}`} className="zero-group">
                    <circle cx={x} cy={y} r="2.2" className="zero-point" />
                    <rect x={Math.max(0, x - 15)} y={Math.max(0, y - 12)} width="30" height="10" rx="2" className="annotation-bg" />
                    <text x={x} y={y - 5} textAnchor="middle" className="annotation-label">{label}</text>
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Overlay shows semantic and intent accuracy; highlighted points indicate collapse to zero with likely causes.
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccuracyMetrics
