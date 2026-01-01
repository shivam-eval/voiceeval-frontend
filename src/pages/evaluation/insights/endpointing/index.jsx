
import InsightTabs from '../../InsightTab'
import { DUMMY_CATEGORY_SCORES } from '../../const'
import { ArrowLeft } from 'lucide-react'

const EndpointingOverview = ({ response, onBack }) => {
  const COLORS = { accent: '#b61249', bg: '#000000', teal: '#2dd4bf', text: '#9da3af', white: '#ffffff', warn: '#f59e0b' }
  const metrics = Array.isArray(response?.metrics) ? response.metrics : []
  const byName = (n) => metrics.find(m => (m.metric_name === n || m.name === n))
  const ic = byName('interruption_count')
  const pd = byName('pause_detection')
  const tba = byName('turn_boundary_accuracy')
  const passedCount = metrics.filter(m => (m.status === "passed" || m.passed === true)).length
  const totalCount = metrics.length || 1
  const passPct = Math.round((passedCount / totalCount) * 100)
  const categoryPassed = response?.passed ?? (passedCount === totalCount)
  const fmtNum = (n) => n?.toLocaleString?.('en-US') ?? String(n ?? '')
  const totalPauses = pd?.details?.total_pauses ?? 0
  const longPauses = pd?.details?.long_pauses ?? 0
  const avgPauseMin = pd?.details?.average_pause_ms ? (pd.details.average_pause_ms / 60000) : 0
  const maxPauseMin = pd?.details?.max_pause_ms ? (pd.details.max_pause_ms / 60000) : 0
  const pauseValueLabel = pd?.value ? `${(pd.value / 60000).toFixed(1)}m` : '0m'
  const pauseThresholdSec = pd?.threshold ? (pd.threshold / 1000) : 0
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
    const stroke = categoryPassed ? COLORS.teal : COLORS.accent
    return (
      <svg width="100" height="100" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} stroke="#0a0f19" strokeWidth="8" fill="none"/>
        <circle
          cx={cx} cy={cy} r={r}
          stroke={stroke}
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
  const card = (m, title, valueRender, variant) => {
    if (!m) return null
    const passed = m.status === "passed" || m.passed === true
    const threshold = m.threshold
    const exec = typeof m.execution_time_ms === 'number' ? Number(m.execution_time_ms.toFixed(2)) : 0
    const metricName = m.metric_name || m.name
    const progressPct = (() => {
      if (metricName === 'pause_detection') {
        const valSec = (m.value || 0) / 1000
        const thrSec = (threshold || 0) / 1000
        return Math.max(0, Math.min(100, Math.round((valSec / (thrSec || 1)) * 100)))
      }
      if (metricName === 'turn_boundary_accuracy') {
        const valPct = (m.value || 0)
        const thrPct = (threshold || 0)
        return Math.max(0, Math.min(100, Math.round((valPct / (thrPct || 1)) * 100)))
      }
      return threshold ? Math.max(0, Math.min(100, Math.round(((m.value || 0) / threshold) * 100))) : (m.score ? Math.round(m.score * 100) : 100)
    })()
    return (
      <div className="p-4 rounded-xl border" style={{ backgroundColor: variant === 'alert' ? '#12090d' : '#0b1220', borderColor: variant === 'alert' ? COLORS.accent : '#1f2937' }}>
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
          <div className="text-2xl font-bold" style={{ color: metricName === 'pause_detection' && !passed ? COLORS.warn : COLORS.teal }}>{valueRender(m)}</div>
          <div className="h-2 rounded-full overflow-hidden mt-2" style={{ backgroundColor: COLORS.bg }}>
            <div className="h-full" style={{ width: `${progressPct}%`, backgroundColor: passed ? COLORS.teal : COLORS.accent }} />
          </div>
          {threshold !== undefined && threshold !== null && (
            <div className="mt-1 text-xs" style={{ color: COLORS.text }}>
              Threshold: {metricName === 'pause_detection' ? `${(threshold / 1000).toFixed(1)}s` : metricName === 'turn_boundary_accuracy' ? `${(threshold * 100).toFixed(1)}%` : `${threshold}`}
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm" style={{ color: COLORS.text }}>
          {(metricName === 'interruption_count' || metricName === 'interruption_count') && m.details && (
            <>
              <div>
                Interruption Count
                <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.interruption_count ?? 0)}</div>
              </div>
              <div>
                Total Turns
                <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.total_speech_turns ?? m.details.total_turns ?? 0)}</div>
              </div>
            </>
          )}
          {(metricName === 'pause_detection' || metricName === 'pause_detection') && m.details && (
            <>
              <div>
                Total Pauses
                <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.total_pauses ?? 0)}</div>
              </div>
              <div>
                Long Pauses
                <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.long_pauses ?? 0)}</div>
              </div>
              <div>
                Average Pause Ms
                <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(Math.round(m.details.average_pause_ms ?? 0))}</div>
              </div>
              <div>
                Max Pause Ms
                <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.max_pause_ms ?? 0)}</div>
              </div>
            </>
          )}
          {metricName === 'turn_boundary_accuracy' && (
            <>
              <div>
                Threshold
                <div className="font-semibold" style={{ color: COLORS.white }}>{threshold ? (threshold * 100).toFixed(1) : '0.0'}%</div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
  const criticalBanner = () => {
    if (!pd) return null
    return (
      <div className="rounded-xl border p-6" style={{ backgroundColor: '#12090d', borderColor: COLORS.accent }}>
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5" fill="none" stroke={COLORS.accent} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <div className="text-lg font-semibold" style={{ color: COLORS.white }}>Critical: Excessive Dead Air Detected</div>
        </div>
        <div className="text-sm mb-6" style={{ color: COLORS.text }}>
          Average pause duration of <span style={{ color: COLORS.warn, fontWeight: 700 }}>{avgPauseMin.toFixed(1)}m</span> significantly exceeds the <span style={{ color: COLORS.white, fontWeight: 600 }}>{(pauseThresholdSec || 0).toFixed(1)}s</span> threshold. This will make conversations feel unnatural and frustrating for users.
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl p-4 border" style={{ backgroundColor: '#1a0e13', borderColor: COLORS.accent }}>
            <div className="text-3xl font-bold" style={{ color: COLORS.white }}>{fmtNum(totalPauses)}</div>
            <div className="text-xs mt-1" style={{ color: COLORS.text }}>Total Pauses</div>
          </div>
          <div className="rounded-xl p-4 border" style={{ backgroundColor: '#1a0e13', borderColor: COLORS.accent }}>
            <div className="text-3xl font-bold" style={{ color: COLORS.white }}>{fmtNum(longPauses)}</div>
            <div className="text-xs mt-1" style={{ color: COLORS.text }}>Long Pauses</div>
          </div>
          <div className="rounded-xl p-4 border" style={{ backgroundColor: '#1a0e13', borderColor: COLORS.accent }}>
            <div className="text-3xl font-bold" style={{ color: COLORS.white }}>{avgPauseMin.toFixed(1)}m</div>
            <div className="text-xs mt-1" style={{ color: COLORS.text }}>Avg Duration</div>
          </div>
          <div className="rounded-xl p-4 border" style={{ backgroundColor: '#1a0e13', borderColor: COLORS.accent }}>
            <div className="text-3xl font-bold" style={{ color: COLORS.white }}>{maxPauseMin.toFixed(1)}m</div>
            <div className="text-xs mt-1" style={{ color: COLORS.text }}>Max Pause</div>
          </div>
        </div>
      </div>
    )
  }
  const silenceAnalysis = () => {
    const segments = Array.from({ length: 20 }, (_, i) => (i % 2 === 0 ? 'speech' : 'silence'))
    return (
      <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: '#0b1220', borderColor: '#1f2937' }}>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke={COLORS.teal} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
          </svg>
          <div className="text-sm font-semibold" style={{ color: COLORS.white }}>Silence Analysis</div>
        </div>
        <div className="text-xs" style={{ color: COLORS.text }}>Conversation Timeline</div>
        <div className="relative w-full h-10 rounded-lg overflow-hidden" style={{ backgroundColor: '#151a28' }}>
          <div className="absolute inset-0 flex">
            {segments.map((t, idx) => (
              <div
                key={idx}
                className="flex-1"
                style={{ backgroundColor: t === 'speech' ? COLORS.teal : '#7f1d1d' }}
              />
            ))}
          </div>
          <div className="absolute right-2 top-1 text-xs" style={{ color: COLORS.text }}>{fmtNum(totalPauses)} pauses detected</div>
          <div className="absolute right-2 bottom-1 text-xs" style={{ color: COLORS.accent }}>Excessive silence detected</div>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.teal }} />
            <span style={{ color: COLORS.text }}>Speech</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#7f1d1d' }} />
            <span style={{ color: COLORS.text }}>Silence</span>
          </div>
        </div>
      </div>
    )
  }
  const smallAlert = () => (
    <div className="rounded-xl border p-4" style={{ backgroundColor: '#12090d', borderColor: COLORS.accent }}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke={COLORS.accent} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
        <span className="text-sm font-semibold" style={{ color: COLORS.white }}>1 critical metric below threshold</span>
      </div>
    </div>
  )
  
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
      
      <div className="rounded-xl border p-6" style={{ backgroundColor: '#0b1220', borderColor: '#1f2937' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0a0f19', border: '1px solid #1f2937' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={COLORS.teal}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: COLORS.white }}>Endpointing</div>
              <div className="text-sm" style={{ color: COLORS.text }}>Measures turn-taking and pause detection accuracy</div>
            </div>
            <span
              className="px-2 py-1 rounded-full text-xs font-semibold border self-start ml-2"
              style={{ color: categoryPassed ? COLORS.teal : COLORS.accent, borderColor: categoryPassed ? COLORS.teal : COLORS.accent, backgroundColor: categoryPassed ? 'rgba(45,212,191,0.08)' : 'rgba(182,18,73,0.12)' }}
            >
              {categoryPassed ? 'Passed' : 'Failed'}
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
      {!categoryPassed && smallAlert()}
      {!categoryPassed && pd?.status === 'failed' && criticalBanner()}
      <div className="grid grid-cols-3 gap-4">
        {card(ic, 'Interruptions', (m) => fmtNum(m.value ?? m.details?.interruption_count ?? 0))}
        {card(pd, 'Pause Detection', () => pd?.value ? `${(pd.value / 60000).toFixed(1)}m` : '0m', pd?.status === 'failed' ? 'alert' : 'default')}
        {card(tba, 'Turn Boundary', (m) => `${((m.value || 0) * 100).toFixed(1)}%`)}
      </div>
      {silenceAnalysis()}
    </div>
  )
}

export default EndpointingOverview
