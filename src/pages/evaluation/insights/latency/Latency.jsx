import { Activity, TrendingUp, Clock, Info, CheckCircle2 } from 'lucide-react'
import latencyData from '../../../../data/latency.json'
import InsightTabs from '../../InsightTab'

const LatencyView = () => {
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
      audio: 'latency',
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

  const detailedCard = (m, title, unit = 'ms') => {
    if (!m) return null
    const passed = !!m.passed
    const threshold = typeof m.threshold === 'number' ? m.threshold : null
    const valRaw = m.value
    const val = Math.round(valRaw)
    const pct = threshold ? Math.max(0, Math.min(100, Math.round((val / threshold) * 100))) : 100
    const exec = typeof m.execution_time_ms === 'number' ? Number(m.execution_time_ms.toFixed(2)) : 0
    const valueLabel = m.metric_name === 'total_duration' ? `${(valRaw / 1000).toFixed(2)}s` : 
                       (val > 1000 ? `${(val/1000).toFixed(2)}s` : `${val}${unit}`)
    const thresholdLabel = threshold ? (threshold > 1000 ? `${(threshold/1000).toFixed(1)}s` : `${threshold}${unit}`) : 'N/A'

    return (
      <div className="p-6 rounded-xl border" style={{ backgroundColor: '#0b1220', borderColor: '#1f2937' }}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">{title}</span>
              <Info size={14} className="text-gray-500 cursor-help" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <Clock size={12} />
              <span>{exec}ms</span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            passed ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
          }`}>
            <CheckCircle2 size={12} />
            {passed ? 'Passed' : 'Failed'}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-4xl font-bold text-teal-400">{valueLabel}</div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Threshold</div>
              <div className="text-gray-400 font-medium">{thresholdLabel}</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-gray-900 overflow-hidden">
            <div className="h-full bg-teal-400 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-medium">
            <span>0</span>
            <span>Threshold: {thresholdLabel}</span>
          </div>
        </div>

        {m.details && (
          <div className="mt-8 pt-6 border-t border-gray-800/50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Details</span>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {[
                { label: 'Average Ms', val: m.details.average_ms ? `${fmtNum(Math.round(m.details.average_ms))}` : '-' },
                { label: 'Max Ms', val: m.details.max_ms ? `${fmtNum(m.details.max_ms)}` : '-' },
                { label: 'Min Ms', val: m.details.min_ms ? `${fmtNum(m.details.min_ms)}` : '-' },
                { label: 'Median Ms', val: m.details.median_ms ? `${fmtNum(m.details.median_ms)}` : '-' },
                { label: 'P95 Ms', val: m.details.p95_ms ? `${fmtNum(m.details.p95_ms)}` : '-' },
                { label: 'P99 Ms', val: m.details.p99_ms ? `${fmtNum(m.details.p99_ms)}` : '-' },
                { label: 'Count', val: m.details.count !== undefined ? `${fmtNum(m.details.count)}` : '-' },
                { label: 'Std Dev', val: m.details.std_dev !== undefined ? `${fmtNum(Math.round(m.details.std_dev))}` : '-' },
              ].map(d => (
                <div key={d.label} className="flex justify-between items-center border-b border-gray-800/30 pb-1">
                  <span className="text-[11px] text-gray-500 font-medium">{d.label}</span>
                  <span className="text-xs text-gray-300 font-bold">{d.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
    
    const refThresholdSec = (rl?.threshold || 2000) / 1000
    const maxValSec = Math.max(refThresholdSec * 1.25, ...list.map(m => m.sec))
    const toY = (sec) => 100 - (sec / maxValSec) * 100
    
    // Generate y-axis ticks (e.g., 5 ticks up to maxValSec)
    const ticks = []
    for (let i = 0; i <= 4; i++) {
      ticks.push((maxValSec / 4) * i)
    }
    
    return (
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-8 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-8">
          <Activity size={20} className="text-teal-400" />
          <h3 className="text-white text-lg font-semibold">Latency Breakdown</h3>
          <span className="text-gray-500 text-sm ml-2">Human perception threshold: {refThresholdSec}s</span>
        </div>
        
        <div className="relative h-80 mt-12 mb-16 mx-12">
          {/* Y-Axis Labels & Grid Lines */}
          {ticks.map(v => (
            <div key={v} className="absolute w-full border-t border-gray-800/30 flex items-center" style={{ top: `${toY(v)}%` }}>
              <span className="absolute -left-12 text-xs text-gray-500 font-medium">
                {v === 0 ? '0ms' : v < 1 ? `${Math.round(v*1000)}ms` : `${v.toFixed(1)}s`}
              </span>
            </div>
          ))}
          
          {/* Threshold Line */}
          <div className="absolute w-full border-t border-dashed border-orange-500/50 z-10" style={{ top: `${toY(refThresholdSec)}%` }}>
            <span className="absolute -right-12 text-[10px] text-orange-400 font-bold whitespace-nowrap">{refThresholdSec}s Ref</span>
          </div>

          {/* Bars & Connection Line */}
          <div className="absolute inset-0 flex justify-around items-end px-12 z-20">
            {list.map((m, i) => {
              const barHeight = (m.sec / maxValSec) * 100
              const isExceeded = m.thrSec ? m.sec > m.thrSec : m.sec > refThresholdSec
              return (
                <div key={m.metric_name} className="relative flex flex-col items-center group w-32 h-full justify-end">
                  <div 
                    className="w-20 rounded-t-md transition-all duration-300 relative z-10"
                    style={{ 
                      height: `${barHeight}%`, 
                      backgroundColor: isExceeded ? '#b61249' : '#2dd4bf' 
                    }}
                  />
                  <div 
                    className="absolute text-[11px] text-gray-500 font-bold mt-4 whitespace-nowrap"
                    style={{ 
                      bottom: '-45px',
                      transform: 'rotate(-30deg)',
                      transformOrigin: 'center'
                    }}
                  >
                    {m.label}
                  </div>
                  {/* Dot on top */}
                  <div 
                    className="absolute w-2.5 h-2.5 bg-white rounded-full border-2 border-gray-900 shadow-sm"
                    style={{ bottom: `calc(${barHeight}% - 5px)` }}
                  />
                </div>
              )
            })}
            
            {/* Connecting Curved Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <path 
                d={(() => {
                  const points = list.map((m, i) => {
                    const x = (i * 2 + 1) * (100 / (list.length * 2))
                    const y = toY(m.sec)
                    return { x, y }
                  })
                  if (points.length < 2) return ""
                  let d = `M ${points[0].x}% ${points[0].y}%`
                  for (let i = 0; i < points.length - 1; i++) {
                    const curr = points[i]
                    const next = points[i+1]
                    const midX = (curr.x + next.x) / 2
                    d += ` C ${midX}% ${curr.y}%, ${midX}% ${next.y}%, ${next.x}% ${next.y}%`
                  }
                  return d
                })()}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-8 mt-12 pt-6 border-t border-gray-800/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-teal-400" />
            <span className="text-xs text-gray-500 font-bold">Within threshold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-600" />
            <span className="text-xs text-gray-500 font-bold">Exceeds threshold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 border-t border-dashed border-orange-400" />
            <span className="text-xs text-gray-500 font-bold">{refThresholdSec}s Human Perception</span>
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
      { k: 'Count', v: `${d.count}` },
      { k: 'Std Dev', v: `${Math.round(d.std_dev)}ms` },
    ]
    return (
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-8">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp size={20} className="text-teal-400" />
          <h3 className="text-white text-lg font-semibold">Latency Distribution</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tiles.map(t => (
            <div key={t.k} className="bg-[#0a0f19] border border-gray-800/30 rounded-lg p-5">
              <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">{t.k}</div>
              <div className="text-white text-xl font-bold">{t.v}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <InsightTabs 
        active="latency" 
        onChange={handleTabChange} 
        categoryScores={[
          { category: 'latency', score: passPct }
        ]} 
      />
      
      {/* Analysis Overview Header */}
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Latency Analysis</div>
              <div className="text-gray-400 mt-1 font-medium">Measures response times and processing speed</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ml-4 mt-1 ${
              latencyData.passed ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : 'text-rose-400 border-rose-500/30 bg-rose-500/5'
            }`}>
              {latencyData.passed ? 'Passed' : 'Failed'}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{passedCount}/{totalCount}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Metrics Passed</div>
            </div>
            {donut()}
          </div>
        </div>
      </div>

      {metricBars()}
      {distributionTiles()}

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-teal-400" />
          <h3 className="text-white text-lg font-semibold">Detailed Metrics</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rl && detailedCard(rl, 'Response Latency')}
          {ttft && detailedCard(ttft, 'Time To First Token')}
          {ttct && detailedCard(ttct, 'Time To Complete Transcript')}
          {total && detailedCard(total, 'Total Duration')}
        </div>
      </div>
    </div>
  )
}

LatencyView

export default LatencyView
