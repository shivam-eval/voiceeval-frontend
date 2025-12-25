import { Activity, Clock, AlertTriangle, CheckCircle2, XCircle, Info, TrendingUp, Mic, ShieldAlert, Radio } from 'lucide-react'
import endpointingData from '../../../../data/endpointing.json'
import InsightTabs from '../../InsightTab'

const EndpointingView = () => {
  const COLORS = { accent: '#b61249', bg: '#000000', teal: '#2dd4bf', text: '#9da3af', white: '#ffffff', warn: '#f59e0b' }
  const metrics = Array.isArray(endpointingData?.metrics) ? endpointingData.metrics : []
  const byName = (n) => metrics.find(m => m.metric_name === n)
  
  const ic = byName('interruption_count')
  const pd = byName('pause_detection')
  const tba = byName('turn_boundary_accuracy')
  
  const passedCount = metrics.filter(m => !!m.passed).length
  const totalCount = metrics.length || 1
  const passPct = Math.round((passedCount / totalCount) * 100)
  
  const fmtNum = (n) => n?.toLocaleString?.('en-US') ?? String(n ?? '')
  
  const fmtMs = (ms) => {
    if (ms === 0) return '0'
    if (ms < 1000) return `${Math.round(ms)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

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
    const target = map[key] || 'endpointing'
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
          stroke={endpointingData.passed ? COLORS.teal : COLORS.accent}
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

  const detailedCard = (m, title) => {
    if (!m) return null
    const passed = !!m.passed
    const threshold = typeof m.threshold === 'number' ? m.threshold : null
    const valRaw = m.value
    const exec = typeof m.execution_time_ms === 'number' ? Number(m.execution_time_ms.toFixed(2)) : 0
    
    let valueLabel = ''
    let thresholdLabel = 'N/A'
    let pct = 0

    if (m.metric_name === 'turn_boundary_accuracy') {
      valueLabel = `${(valRaw * 100).toFixed(1)}%`
      thresholdLabel = `${(threshold * 100).toFixed(1)}%`
      pct = Math.max(0, Math.min(100, Math.round((valRaw / (threshold || 1)) * 100)))
    } else if (m.metric_name === 'pause_detection') {
      valueLabel = fmtMs(valRaw)
      thresholdLabel = fmtMs(threshold)
      pct = Math.max(0, Math.min(100, Math.round((valRaw / (threshold || 1)) * 100)))
    } else {
      valueLabel = fmtNum(valRaw)
      thresholdLabel = fmtNum(threshold)
      pct = threshold ? Math.max(0, Math.min(100, Math.round((valRaw / threshold) * 100))) : 100
    }

    return (
      <div className={`p-6 rounded-xl border ${!passed ? 'border-rose-500/30' : 'border-gray-800/50'}`} style={{ backgroundColor: '#0b1220' }}>
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
            {passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {passed ? 'Passed' : 'Failed'}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between mb-2">
            <div className={`text-4xl font-bold ${!passed ? 'text-rose-400' : 'text-teal-400'}`}>{valueLabel}</div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Threshold</div>
              <div className="text-gray-400 font-medium">{thresholdLabel}</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-gray-900 overflow-hidden">
            <div className={`h-full transition-all duration-500 ${!passed ? 'bg-rose-500' : 'bg-teal-400'}`} style={{ width: `${pct}%` }} />
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
              {Object.entries(m.details).filter(([k]) => k !== 'interruptions').map(([key, val]) => (
                <div key={key} className="flex justify-between items-center border-b border-gray-800/30 pb-1">
                  <span className="text-[11px] text-gray-500 font-medium capitalize whitespace-nowrap overflow-hidden text-ellipsis mr-2">{key.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-300 font-bold whitespace-nowrap">{typeof val === 'number' ? (key.includes('ms') ? fmtMs(val) : fmtNum(val)) : String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const criticalBanner = () => {
    if (pd?.passed !== false) return null
    const avgPause = pd.details?.average_pause_ms || 0
    const threshold = pd.threshold || 0
    
    return (
      <div className="rounded-xl border border-rose-500/50 p-6 bg-rose-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <ShieldAlert className="text-rose-500" size={24} />
          </div>
          <div className="text-lg font-bold text-rose-500">Critical: Excessive Dead Air Detected</div>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Average pause duration of <span className="text-rose-400 font-bold">{fmtMs(avgPause)}</span> significantly exceeds the <span className="text-white font-semibold">{fmtMs(threshold)}</span> threshold. This will make conversations feel unnatural and frustrating for users.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Pauses', val: fmtNum(pd.details?.total_pauses) },
            { label: 'Long Pauses', val: fmtNum(pd.details?.long_pauses) },
            { label: 'Avg Duration', val: fmtMs(pd.details?.average_pause_ms) },
            { label: 'Max Pause', val: fmtMs(pd.details?.max_pause_ms) },
          ].map(s => (
            <div key={s.label} className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{s.val}</div>
              <div className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const silenceAnalysis = () => {
    // Generate a visual timeline pattern
    const segments = [
      { type: 'speech', w: '5%' }, { type: 'silence', w: '10%' },
      { type: 'speech', w: '8%' }, { type: 'silence', w: '12%' },
      { type: 'speech', w: '6%' }, { type: 'silence', w: '15%' },
      { type: 'speech', w: '10%' }, { type: 'silence', w: '8%' },
      { type: 'speech', w: '12%' }, { type: 'silence', w: '14%' },
    ]
    
    return (
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-8">
        <div className="flex items-center gap-2 mb-8">
          <Activity size={20} className="text-teal-400" />
          <h3 className="text-white text-lg font-semibold">Silence Analysis</h3>
        </div>
        
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Conversation Timeline</span>
              <span className="text-xs text-gray-500 font-medium">{pd?.details?.total_pauses || 0} pauses detected</span>
            </div>
            <div className="h-10 w-full bg-gray-900 rounded-lg overflow-hidden flex relative">
              {segments.map((s, i) => (
                <div 
                  key={i} 
                  className={`h-full transition-all duration-300 ${s.type === 'speech' ? 'bg-teal-500/60' : 'bg-rose-900/60'}`}
                  style={{ width: s.w }}
                />
              ))}
              <div className="absolute right-2 bottom-1">
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Excessive silence detected</span>
              </div>
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-teal-500/60" />
                <span className="text-[10px] text-gray-500 font-bold uppercase">Speech</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-rose-900/60" />
                <span className="text-[10px] text-gray-500 font-bold uppercase">Silence</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800/30">
            {[
              { label: 'Total Pauses', val: fmtNum(pd?.details?.total_pauses), icon: Clock },
              { label: 'Long Pauses (> 5s)', val: fmtNum(pd?.details?.long_pauses), icon: XCircle, color: 'text-rose-500' },
              { label: 'Average Duration', val: fmtMs(pd?.details?.average_pause_ms), icon: Activity },
              { label: 'Maximum Pause', val: fmtMs(pd?.details?.max_pause_ms), icon: AlertTriangle, color: 'text-warn' },
            ].map(s => (
              <div key={s.label} className="bg-[#0a0f19] border border-gray-800/30 rounded-xl p-6 flex flex-col items-center text-center">
                <s.icon size={20} className={`${s.color || 'text-gray-500'} mb-3`} />
                <div className="text-2xl font-bold text-white">{s.val}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <InsightTabs 
        active="endpointing" 
        onChange={handleTabChange} 
        categoryScores={[{ category: 'endpointing', score: passPct }]} 
      />
      
      {/* Analysis Overview Header */}
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Radio className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Endpointing Analysis</div>
              <div className="text-gray-400 mt-1 font-medium">Measures turn-taking and pause detection accuracy</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ml-4 mt-1 ${
              endpointingData.passed ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : 'text-rose-400 border-rose-500/30 bg-rose-500/5'
            }`}>
              {endpointingData.passed ? 'Passed' : 'Failed'}
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

      {criticalBanner()}

      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <Radio className="text-teal-400" size={20} />
            </div>
            <span className="font-bold text-white">Interruptions</span>
          </div>
          <div className="text-5xl font-bold text-teal-400 mb-2">{fmtNum(ic?.value)}</div>
          <div className="text-xs text-gray-500 font-medium">No user interruptions - great!</div>
        </div>

        <div className={`bg-[#0b1220] border rounded-xl p-6 ${pd?.passed === false ? 'border-rose-500/50' : 'border-gray-800/50'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pd?.passed === false ? 'bg-rose-500/10' : 'bg-teal-500/10'}`}>
              <Mic className={pd?.passed === false ? 'text-rose-400' : 'text-teal-400'} size={20} />
            </div>
            <span className="font-bold text-white">Pause Detection</span>
          </div>
          <div className={`text-5xl font-bold mb-2 ${pd?.passed === false ? 'text-rose-400' : 'text-teal-400'}`}>{fmtMs(pd?.value)}</div>
          <div className="text-xs text-gray-500 font-medium">Average pause duration</div>
        </div>

        <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <TrendingUp className="text-teal-400" size={20} />
            </div>
            <span className="font-bold text-white">Turn Boundary</span>
          </div>
          <div className="text-5xl font-bold text-teal-400 mb-2">{Math.round((tba?.value || 0) * 100)}%</div>
          <div className="text-xs text-gray-500 font-medium">Accurate boundary detection</div>
        </div>
      </div>

      {silenceAnalysis()}

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-teal-400" />
          <h3 className="text-white text-lg font-semibold">Detailed Metrics</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ic && detailedCard(ic, 'Interruption Count')}
          {pd && detailedCard(pd, 'Pause Detection')}
          {tba && detailedCard(tba, 'Turn Boundary Accuracy')}
        </div>
      </div>
    </div>
  )
}

export default EndpointingView
