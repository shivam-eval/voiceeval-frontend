import { DUMMY_CATEGORY_SCORES } from '../../const'
import InsightTabs from '../../InsightTab'
import { ArrowLeft } from 'lucide-react'
const latencyData={
  "category": "latency",
  "overall_score": 0.92,
  "passed": true,
  "metrics": [
    {
      "metric_name": "response_latency",
      "category": "latency",
      "status": "passed",
      "passed": true,
      "value": 1690,
      "threshold": 2000,
      "details": {
        "average_ms": 1690,
        "max_ms": 1800,
        "min_ms": 1200,
        "median_ms": 1700,
        "p95_ms": 1800,
        "p99_ms": 1800,
        "count": 11,
        "std_dev": 175.8
      }
    },
    {
      "metric_name": "time_to_first_token",
      "category": "latency",
      "status": "passed",
      "passed": true,
      "value": 500,
      "threshold": 500
    },
    {
      "metric_name": "time_to_complete_transcript",
      "category": "latency",
      "status": "passed",
      "passed": true,
      "value": 1000,
      "threshold": 1000
    },
    {
      "metric_name": "total_duration",
      "category": "latency",
      "status": "passed",
      "passed": true,
      "value": 68000
    }
  ]
}

const LatencyOverview = ({ onBack }) => {
  const COLORS = { accent: '#b61249', bg: '#000000', teal: '#2dd4bf', text: '#9da3af', white: '#ffffff' }
  const metrics = Array.isArray(latencyData?.metrics) ? latencyData.metrics : []
  const byName = (n) => metrics.find(m => m.metric_name === n)
  const rl = byName('response_latency')
  const ttft = byName('time_to_first_token')
  const ttct = byName('time_to_complete_transcript')
  const total = byName('total_duration')
  const passedCount = metrics.filter(m => !!m.passed).length
  const totalCount = metrics.length || 1
  const passPct = Math.round((passedCount / totalCount) * 100)
  const fmtNum = (n) => n?.toLocaleString?.('en-US') ?? String(n ?? '')
  const handleTabChange = (key) => {
    const map = {
      accuracy: 'accuracy',
      task_completion: 'accuracy',
      latency: 'latency',
      audio_quality: 'latency',
      conversation_quality: 'latency',
      endpointing: 'endpointing',
      cost: 'latency',
      persona: 'latency',
    }
    const target = map[key] || 'latency'
    const url = new URL(window.location.href)
    url.searchParams.set('preview', target)
    window.location.href = url.toString()
  }
  const donut = () => {
    const r = 34
    const cx = 40
    const cy = 40
    const circ = 2 * Math.PI * r
    const offset = circ * (1 - passPct / 100)
    return (
      <svg width="100" height="100" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} stroke="#0a0f19" strokeWidth="8" fill="none"/>
        <circle
          cx={cx} cy={cy} r={r}
          stroke={latencyData.passed ? COLORS.teal : COLORS.accent}
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
              <div className="font-semibold" style={{ color: COLORS.white }}>{m.metric_name === 'total_duration' ? `${(threshold / 1000).toFixed(1)}s` : `${threshold}${unit}`}</div>
            </div>
          )}
          {m.details?.average_ms !== undefined && (
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
    const labelMap = {
      response_latency: 'Response Latency',
      time_to_first_token: 'First Token',
      time_to_complete_transcript: 'Complete Transcript'
    }
    const list = [rl, ttft, ttct].filter(Boolean).map(m => ({
      ...m,
      sec: (m.value || 0) / 1000,
      thrSec: m.threshold ? m.threshold / 1000 : null,
      label: labelMap[m.metric_name] || (m.metric_name || '').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
    }))
    const maxSec = 2.2 // Fixed scale to match image
    const toPct = (sec) => Math.max(0, Math.min(100, (sec / maxSec) * 100))
    const twoSecPct = toPct(2)

    return (
      <div className="rounded-xl border p-8 relative overflow-hidden" style={{ backgroundColor: '#0b1220', borderColor: '#1f2937' }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke={COLORS.teal} viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3m3 0h3m3 0h3" />
              <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2" />
            </svg>
            <div className="text-lg font-bold" style={{ color: COLORS.white }}>Latency Breakdown</div>
            <div className="text-xs ml-2" style={{ color: COLORS.text }}>Human perception threshold: 2s</div>
          </div>
        </div>

        <div className="relative h-80 mt-12 mb-16 px-16">
          {/* Y-Axis Grid Lines & Labels */}
          <div className="absolute inset-0 pointer-events-none">
            {[0, 0.5, 1.0, 1.5, 2.0].map((v) => (
              <div key={v} className="absolute left-0 right-0" style={{ bottom: `${toPct(v)}%` }}>
                <div className="border-t border-gray-800/50 w-full" />
                <span className="absolute -left-12 -translate-y-1/2 text-[11px]" style={{ color: COLORS.text }}>
                  {v === 0 ? '0ms' : v >= 1 ? `${v.toFixed(2)}s` : `${v * 1000}ms`}
                </span>
              </div>
            ))}
            
            {/* Threshold Line */}
            <div className="absolute left-0 right-0 z-10" style={{ bottom: `${twoSecPct}%`, borderTop: '2px dashed #fbbf24' }}>
              <span className="absolute -right-12 -translate-y-1/2 text-[11px] font-semibold" style={{ color: '#fbbf24' }}>2s Hu</span>
            </div>
          </div>

          {/* Bars and Connecting Line */}
          <div className="relative h-full flex items-end justify-between px-10 z-20">
            {list.map((m, idx) => {
              const pct = toPct(m.sec)
              return (
                <div key={m.metric_name} className="relative flex flex-col items-center flex-1 h-full justify-end">
                  <div 
                    className="w-24 rounded-t-lg transition-all duration-500" 
                    style={{ 
                      backgroundColor: m.passed ? COLORS.teal : COLORS.accent, 
                      height: `${pct}%`,
                      minHeight: '4px',
                      opacity: 0.9,
                      zIndex: 30
                    }} 
                  />
                  <div
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 text-xs text-center font-medium"
                    style={{ color: COLORS.text, transform: 'rotate(-25deg)' }}
                  >
                    {m.label}
                  </div>
                </div>
              )
            })}

            {/* Connecting Line Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 40 }}>
              {(() => {
                const barOffsets = [16.6, 50, 83.3] // Precise centers for 3 items in flex-1
                const points = list.map((m, i) => ({
                  x: barOffsets[i],
                  y: 100 - toPct(m.sec)
                }))
                
                let d = `M ${points[0].x} ${points[0].y}`
                for (let i = 1; i < points.length; i++) {
                  const cp1x = (points[i-1].x + points[i].x) / 2
                  d += ` C ${cp1x} ${points[i-1].y} ${cp1x} ${points[i].y} ${points[i].x} ${points[i].y}`
                }

                return (
                  <g>
                    <path 
                      d={d} 
                      stroke="rgba(255,255,255,0.3)" 
                      strokeWidth="2" 
                      strokeDasharray="4 4" 
                      fill="none" 
                      vectorEffect="non-scaling-stroke"
                    />
                    {points.map((p, i) => (
                      <circle 
                        key={i} 
                        cx={`${p.x}%`} 
                        cy={`${p.y}%`} 
                        r="4" 
                        fill="#ffffff" 
                        stroke="#0b1220" 
                        strokeWidth="2" 
                      />
                    ))}
                  </g>
                )
              })()}
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center justify-center gap-10 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.teal }} />
            <span style={{ color: COLORS.text }}>Within threshold</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.accent }} />
            <span style={{ color: COLORS.text }}>Exceeds threshold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 border-t-2 border-dashed" style={{ borderColor: '#fbbf24' }} />
            <span style={{ color: COLORS.text }}>2s Human Perception</span>
          </div>
        </div>
      </div>
    )
  }
  const distributionTiles = () => {
    if (!rl?.details) return null
    const d = rl.details
    const toSec = (ms) => `${(ms / 1000).toFixed(2)}s`
    const tiles = [
      { k: 'Average Ms', v: toSec(d.average_ms) },
      { k: 'Max Ms', v: toSec(d.max_ms) },
      { k: 'Min Ms', v: toSec(d.min_ms) },
      { k: 'Median Ms', v: toSec(d.median_ms) },
      { k: 'P95 Ms', v: toSec(d.p95_ms) },
      { k: 'P99 Ms', v: toSec(d.p99_ms) },
    ]
    return (
      <div className="rounded-xl border p-8" style={{ backgroundColor: '#0b1220', borderColor: '#1f2937' }}>
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-5 h-5" fill="none" stroke={COLORS.teal} viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <div className="text-lg font-bold" style={{ color: COLORS.white }}>Latency Distribution</div>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {tiles.map(t => (
            <div key={t.k} className="bg-gray-800/20 rounded-xl p-5 border transition-all hover:bg-gray-800/30" style={{ borderColor: '#1f2937' }}>
              <div className="text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.text }}>{t.k}</div>
              <div className="mt-3 text-2xl font-black" style={{ color: COLORS.white }}>{t.v}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
      )}
      
      {/* <InsightTabs active="latency" onChange={handleTabChange} categoryScores={DUMMY_CATEGORY_SCORES} /> */}
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
              style={{ color: latencyData.passed ? COLORS.teal : COLORS.accent, borderColor: latencyData.passed ? COLORS.teal : COLORS.accent, backgroundColor: latencyData.passed ? 'rgba(45,212,191,0.08)' : 'rgba(182,18,73,0.08)' }}
            >
              {latencyData.passed ? 'Passed' : 'Failed'}
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
      {distributionTiles()}
      <div className="grid grid-cols-2 gap-4">
        {card(rl, 'Response Latency')}
        {card(ttft, 'Time To First Token')}
        {card(ttct, 'Time To Complete Transcript')}
        {card(total, 'Total Duration', 'ms')}
      </div>
    </div>
  )
}

export default LatencyOverview;
