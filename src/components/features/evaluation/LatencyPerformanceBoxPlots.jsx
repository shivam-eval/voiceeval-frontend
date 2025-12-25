const LatencyPerformanceBoxPlots = ({ data }) => {
  const COLORS = { accent: '#b61249', bg: '#000000', teal: '#2dd4bf', text: '#9da3af', white: '#ffffff' }
  const metrics = Array.isArray(data?.metrics) ? data.metrics : []
  const byName = (n) => metrics.find(m => m.metric_name === n)
  const rl = byName('response_latency')
  const ttft = byName('time_to_first_token')
  const ttct = byName('time_to_complete_transcript')
  const total = byName('total_duration')
  const passedCount = metrics.filter(m => !!m.passed).length
  const totalCount = metrics.length || 1
  const passPct = Math.round((passedCount / totalCount) * 100)
  const fmtNum = (n) => n?.toLocaleString?.('en-US') ?? String(n ?? '')
  const fmtMs = (n) => `${fmtNum(Math.round(n))}ms`
  const donut = () => {
    const r = 34
    const cx = 40
    const cy = 40
    const circ = 2 * Math.PI * r
    const offset = circ * (1 - passPct / 100)
    return (
      <svg width="100" height="100" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} stroke={COLORS.bg} strokeWidth="8" fill="none"/>
        <circle
          cx={cx} cy={cy} r={r}
          stroke={COLORS.teal}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="46" textAnchor="middle" fontSize="16" fill={COLORS.white} fontWeight="700">{passPct}%</text>
      </svg>
    )
  }
  const card = (m, title, unit = 'ms') => {
    if (!m) return null
    const passed = !!m.passed
    const threshold = typeof m.threshold === 'number' ? m.threshold : null
    const valRaw = m.value
    const val = Math.round(valRaw)
    const pct = threshold ? Math.max(0, Math.min(100, Math.round((val / threshold) * 100))) : 100
    const exec = typeof m.execution_time_ms === 'number' ? Number(m.execution_time_ms.toFixed(2)) : 0
    const valueLabel = m.metric_name === 'total_duration' ? `${(valRaw / 1000).toFixed(1)}s` : `${val}${unit}`
    return (
      <div className="p-4 rounded-xl border" style={{ backgroundColor: '#0b1220', borderColor: '#1f2937' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold" style={{ color: COLORS.white }}>{title}</div>
            <div className="flex items-center gap-2 text-xs mt-1" style={{ color: COLORS.text }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
              <span>{exec}ms execution</span>
            </div>
          </div>
          <span
            className="px-2 py-1 rounded-full text-xs font-semibold border"
            style={{
              color: passed ? COLORS.teal : COLORS.accent,
              borderColor: passed ? COLORS.teal : COLORS.accent,
              backgroundColor: passed ? 'rgba(45,212,191,0.08)' : 'rgba(182,18,73,0.08)'
            }}
          >
            {passed ? 'Passed' : 'Failed'}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold" style={{ color: COLORS.teal }}>{valueLabel}</div>
          <div className="h-2 rounded-full overflow-hidden mt-2" style={{ backgroundColor: COLORS.bg }}>
            <div className="h-full" style={{ width: `${pct}%`, backgroundColor: COLORS.teal }} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm" style={{ color: COLORS.text }}>
          {threshold !== null && (
            <div>
              Threshold
              <div className="font-semibold" style={{ color: COLORS.white }}>{threshold}{unit}</div>
            </div>
          )}
          {m.details && (
            <div>
              Average Ms
              <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(Math.round(m.details.average_ms))}</div>
            </div>
          )}
          {m.details?.max_ms !== undefined && (
            <div>
              Max Ms
              <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.max_ms)}</div>
            </div>
          )}
          {m.details?.min_ms !== undefined && (
            <div>
              Min Ms
              <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.min_ms)}</div>
            </div>
          )}
          {m.details?.median_ms !== undefined && (
            <div>
              Median Ms
              <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.median_ms)}</div>
            </div>
          )}
          {m.details?.p95_ms !== undefined && (
            <div>
              P95 Ms
              <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.p95_ms)}</div>
            </div>
          )}
          {m.details?.p99_ms !== undefined && (
            <div>
              P99 Ms
              <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.p99_ms)}</div>
            </div>
          )}
          {m.details?.count !== undefined && (
            <div>
              Count
              <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.count)}</div>
            </div>
          )}
          {m.details?.std_dev !== undefined && (
            <div>
              Std Dev
              <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(Math.round(m.details.std_dev))}</div>
            </div>
          )}
        </div>
      </div>
    )
  }
  const metricBars = () => {
    const list = [rl, ttft, ttct, total].filter(Boolean)
    const maxVal = Math.max(...list.map(m => m.value || 0), 1)
    return (
      <div className="rounded-xl border p-4 relative" style={{ backgroundColor: '#0b1220', borderColor: '#1f2937' }}>
        <div className="mb-3 text-sm font-semibold" style={{ color: COLORS.text }}>METRICS VISUALIZATION</div>
        <div className="absolute inset-0 pointer-events-none">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className="absolute left-0 right-0" style={{ top: `${(i/4)*100}%`, borderTop: '1px dashed #374151' }} />
          ))}
        </div>
        <div className="h-48 flex items-end justify-between gap-6 px-4">
          {list.map((m) => {
            const pct = Math.round(((m.value || 0) / maxVal) * 100)
            const label = (m.metric_name || '').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
            return (
              <div key={m.metric_name} className="flex flex-col items-center">
                <div className="w-16 rounded" style={{ backgroundColor: COLORS.teal, height: `${pct}%` }} />
                <div className="mt-2 w-24 text-xs text-center" style={{ color: COLORS.text }}>{label}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-6" style={{ backgroundColor: '#0b1220', borderColor: '#1f2937' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0a0f19', border: '1px solid #1f2937' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={COLORS.teal}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: COLORS.white }}>Latency</div>
              <div className="text-sm" style={{ color: COLORS.text }}>Measures response times and processing speed</div>
            </div>
            <span
              className="px-2 py-1 rounded-full text-xs font-semibold border self-start ml-2"
              style={{ color: COLORS.teal, borderColor: COLORS.teal, backgroundColor: 'rgba(45,212,191,0.08)' }}
            >
              Passed
            </span>
          </div>
          <div className="flex items-center gap-4">
            {donut()}
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: COLORS.white }}>{passedCount}/{totalCount}</div>
              <div className="text-sm" style={{ color: COLORS.text }}>Metrics Passed</div>
            </div>
          </div>
        </div>
      </div>
      {metricBars()}
      <div className="grid grid-cols-2 gap-4">
        {card(rl, 'Response Latency')}
        {card(ttft, 'Time To First Token')}
        {card(ttct, 'Time To Complete Transcript')}
        {card(total, 'Total Duration', 'ms')}
      </div>
    </div>
  )
}

export default LatencyPerformanceBoxPlots
