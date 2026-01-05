import { DUMMY_CATEGORY_SCORES } from '../../const'
import InsightTabs from '../../InsightTab'
import { ArrowLeft } from 'lucide-react'

const LatencyOverview = ({ response, data, onBack }) => {
  console.log('=== LatencyOverview Render ===');
  console.log('LatencyOverview received response:', response);
  console.log('LatencyOverview received data:', data);

  // Handle both single evaluation (response) and aggregated data (data)
  let processedResponse = response;

  if (!response && data) {
    // Called from Dashboard with aggregated data
    console.log('Using data - category_scores:', data.category_scores);
    const latencyCategory = data.category_scores?.find(c => c.category === 'latency');
    console.log('Found latency category:', latencyCategory);

    if (latencyCategory) {
      processedResponse = {
        metrics: latencyCategory.metrics || [],
        score: latencyCategory.average_score || 0,
        passed: latencyCategory.metrics?.every(m => m.status === 'passed') || false
      };
    } else {
      // Fallback: aggregate from all evaluations
      const allMetrics = [];
      data.evaluations?.forEach(evaluation => {
        const latCat = evaluation.category_scores?.find(c => c.category === 'latency');
        if (latCat?.metrics) {
          allMetrics.push(...latCat.metrics);
        }
      });
      processedResponse = {
        metrics: allMetrics,
        score: 0,
        passed: false
      };
      console.log('Aggregated latency metrics from evaluations:', allMetrics);
    }
  }

  console.log('Processed response:', processedResponse);

  const COLORS = { accent: '#b61249', bg: '#000000', teal: '#2dd4bf', text: '#9da3af', white: '#ffffff' }
  const metrics = Array.isArray(processedResponse?.metrics) ? processedResponse.metrics : []

  console.log('Final metrics array:', metrics);
  console.log('Metrics length:', metrics.length);

  if (!metrics || metrics.length === 0) {
    console.warn('No latency metrics available - showing empty state');
    return (
      <div className="space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>
        )}
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
          </svg>
          <p className="text-gray-400 text-sm">No latency metrics available</p>
          <p className="text-gray-600 text-xs mt-1">
            {response ? 'Response has no metrics' : data ? 'Data has no latency category' : 'No data provided'}
          </p>
        </div>
      </div>
    );
  }

  console.log('Rendering LatencyOverview with', metrics.length, 'metrics');

  const byName = (n) => metrics.find(m => (m.metric_name === n || m.name === n))
  const rl = byName('response_latency')
  const ttft = byName('time_to_first_token')
  const ttct = byName('time_to_complete_transcript')
  const total = byName('total_duration')
  const repetition = byName('repetition_count')
  
  const passedCount = metrics.filter(m => m.status === "passed" || m.passed === true).length
  const totalCount = metrics.length || 1
  const passPct = Math.round((passedCount / totalCount) * 100)
  const isPassed = response?.passed ?? (passedCount === totalCount)
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
        <circle cx={cx} cy={cy} r={r} stroke="#0a0f19" strokeWidth="8" fill="none" />
        <circle
          cx={cx} cy={cy} r={r}
          stroke={isPassed ? COLORS.teal : COLORS.accent}
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
  
  const card = (m, title, unit = 'ms', isCount = false) => {
    if (!m) return null
    const passed = m.status === "passed" || m.passed === true
    const threshold = typeof m.threshold === 'number' ? m.threshold : null
    const valRaw = m.value ?? m.details?.average_ms ?? (m.details?.repetition_count !== undefined ? m.details.repetition_count : 0)
    const val = isCount ? valRaw : Math.round(valRaw)
    const pct = threshold ? Math.max(0, Math.min(100, Math.round((val / threshold) * 100))) : (m.score !== undefined ? Math.round(m.score * 100) : 100)
    const exec = typeof m.execution_time_ms === 'number' ? Number(m.execution_time_ms.toFixed(2)) : 0
    const metricName = m.metric_name || m.name
    const valueLabel = isCount ? `${val}` : (metricName === 'total_duration' ? `${(valRaw / 1000).toFixed(1)}s` : `${val}${unit}`)
    
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
          {m.details?.agent_turns_analyzed !== undefined && (
            <div>
              Turns Analyzed
              <div className="font-semibold" style={{ color: COLORS.white }}>{fmtNum(m.details.agent_turns_analyzed)}</div>
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
    const list = [rl, ttft, ttct].filter(Boolean).map(m => {
      const metricName = m.metric_name || m.name
      const value = m.value ?? m.details?.average_ms ?? 0
      const passed = m.status === "passed" || m.passed === true
      return {
        ...m,
        passed,
        sec: (value || 0) / 1000,
        thrSec: m.threshold ? m.threshold / 1000 : null,
        label: labelMap[metricName] || (metricName || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        metric_name: metricName
      }
    })
    const maxSec = Math.max(2, ...list.map(m => m.sec), ...list.map(m => m.thrSec || 0))
    const toPct = (sec) => Math.max(0, Math.min(100, Math.round((sec / maxSec) * 100)))
    const twoSecPct = toPct(2)
    return (
      <div className="rounded-xl border p-4 relative" style={{ backgroundColor: '#0b1220', borderColor: '#1f2937' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke={COLORS.teal} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h3m3 0h3m3 0h3" />
            </svg>
            <div className="text-sm font-semibold" style={{ color: COLORS.white }}>Latency Breakdown</div>
          </div>
          <div className="text-xs" style={{ color: COLORS.text }}>Human perception threshold: 2s</div>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="absolute left-0 right-0" style={{ top: `${(i / 4) * 100}%`, borderTop: '1px dashed #374151' }} />
          ))}
          <div className="absolute left-0 right-0" style={{ top: `${100 - twoSecPct}%`, borderTop: '2px dashed #fbbf24' }} />
          {[0, 0.5, 1, 1.5, 2].map((v) => (
            <div key={v} className="absolute left-2" style={{ top: `calc(${100 - toPct(v)}% - 8px)` }}>
              <span className="text-[11px]" style={{ color: COLORS.text }}>{v === 0 ? '0ms' : `${v.toFixed(2)}s`}</span>
            </div>
          ))}
          <div className="absolute right-3" style={{ top: `calc(${100 - twoSecPct}% - 10px)` }}>
            <span className="text-[11px] font-semibold" style={{ color: '#fbbf24' }}>2s Human Perception</span>
          </div>
        </div>
        <div className="relative h-64 flex items-end justify-between gap-12 px-10">
          {list.map((m) => {
            const pct = toPct(m.sec)
            return (
              <div key={m.metric_name} className="relative flex flex-col items-center">
                <div className="w-28 rounded" style={{ backgroundColor: m.passed ? COLORS.teal : COLORS.accent, height: `${pct}%` }} />
                <div
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-40 text-xs text-center font-medium"
                  style={{ color: COLORS.text, transform: 'rotate(-25deg)' }}
                >
                  {m.label}
                </div>
              </div>
            )
          })}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {(() => {
              const xs = [18, 50, 82]
              const ys = list.map((m, i) => 100 - toPct(m.sec))
              const d = `M ${xs[0]} ${ys[0]} C ${(xs[0] + xs[1]) / 2} ${ys[0]} ${(xs[0] + xs[1]) / 2} ${ys[1]} ${xs[1]} ${ys[1]} C ${(xs[1] + xs[2]) / 2} ${ys[1]} ${(xs[1] + xs[2]) / 2} ${ys[2]} ${xs[2]} ${ys[2]}`
              return (
                <>
                  <path d={d} stroke="#9da3af" strokeDasharray="4 4" fill="none" />
                  {ys.map((y, i) => (
                    <circle key={i} cx={xs[i]} cy={y} r="2" fill="#ffffff" />
                  ))}
                </>
              )
            })()}
          </svg>
        </div>
        <div className="mt-4 flex items-center justify-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.teal }} />
            <span style={{ color: COLORS.text }}>Within threshold</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.accent }} />
            <span style={{ color: COLORS.text }}>Exceeds threshold</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 border-t-2 border-dashed" style={{ borderColor: '#fbbf24' }} />
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
      { k: 'Count', v: `${d.count}` },
      { k: 'Std Dev', v: `${Math.round(d.std_dev)}ms` },
    ]
    return (
      <div className="rounded-xl border p-6" style={{ backgroundColor: '#0b1220', borderColor: '#1f2937' }}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4" fill="none" stroke={COLORS.teal} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l4-4 4 4 4-4 4 4" />
          </svg>
          <div className="text-sm font-semibold" style={{ color: COLORS.white }}>Latency Distribution</div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {tiles.map(t => (
            <div key={t.k} className="bg-gray-900 rounded-xl p-4 border" style={{ borderColor: '#1f2937' }}>
              <div className="text-xs" style={{ color: COLORS.text }}>{t.k}</div>
              <div className="mt-2 text-2xl font-bold" style={{ color: COLORS.teal }}>{t.v}</div>
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
      
      {/* Header Card */}
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
              style={{ color: isPassed ? COLORS.teal : COLORS.accent, borderColor: isPassed ? COLORS.teal : COLORS.accent, backgroundColor: isPassed ? 'rgba(45,212,191,0.08)' : 'rgba(182,18,73,0.08)' }}
            >
              {isPassed ? 'Passed' : 'Failed'}
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
      
      {/* Latency Breakdown Chart */}
      {metricBars()}
      
      {/* Distribution Tiles */}
      {distributionTiles()}
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        {card(rl, 'Response Latency')}
        {card(ttft, 'Time To First Token')}
        {card(ttct, 'Time To Complete Transcript')}
        {card(total, 'Total Duration', 'ms')}
        {card(repetition, 'Repetition Count', '', true)}
      </div>

      {/* Turn-by-Turn Analysis for Repetition Count */}
      {repetition?.details?.agent_sentences && repetition.details.agent_sentences.length > 0 && (
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Turn-by-Turn Analysis</h2>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center gap-6 mb-8 p-4 bg-dark-input/30 rounded-xl border border-gray-800/50">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Agent Turns</span>
              <span className="text-xl font-semibold text-white">{repetition.details.agent_turns_analyzed || 0}</span>
            </div>
            <div className="w-[1px] h-10 bg-gray-800/80" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Repetitions Found</span>
              <span className="text-xl font-semibold text-teal-400">{repetition.details.repetition_count || 0}</span>
            </div>
            <div className="w-[1px] h-10 bg-gray-800/80" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status</span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-semibold ${repetition.status === 'passed' ? 'text-green-400' : 'text-red-400'}`}>
                  {repetition.details.repetition_count === 0 ? 'Clean' : 'Repetitive'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${repetition.status === 'passed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {repetition.status === 'passed' ? 'Pass' : 'Fail'}
                </span>
              </div>
            </div>
          </div>

          {/* Agent Turns */}
          <div className="space-y-4">
            {repetition.details.agent_sentences.map((sentence, idx) => {
              const turnNumber = idx + 1;
              const isPassed = repetition.status === 'passed';

              return (
                <div key={idx} className={`border rounded-xl p-6 ${isPassed ? 'bg-dark-input border-gray-800/50' : 'bg-red-950/20 border-red-900/50'}`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/20">
                        <div className="text-xl">🤖</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 rounded bg-teal-500/20 text-teal-300">
                            AGENT
                          </span>
                          <span className="text-gray-500 text-sm">
                            Turn #{turnNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isPassed ? '✓ No Repetition' : '✗ Repetitive'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Agent Response:</div>
                      <p className="text-gray-200 leading-relaxed font-medium">
                        {sentence.text || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Repetitions List (if any) */}
          {repetition.details.repetitions && repetition.details.repetitions.length > 0 && (
            <div className="mt-6 p-4 bg-red-950/20 border border-red-900/50 rounded-xl">
              <div className="text-sm font-semibold text-red-400 mb-3">Detected Repetitions:</div>
              <div className="space-y-2">
                {repetition.details.repetitions.map((rep, idx) => (
                  <div key={idx} className="text-sm text-gray-300 pl-4 border-l-2 border-red-500/50">
                    {rep}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          {repetition.details.reasoning && (
            <div className="mt-6 p-4 bg-dark-input/30 border border-gray-800/50 rounded-xl">
              <div className="text-xs text-gray-400 mb-2">Analysis Reasoning:</div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {repetition.details.reasoning}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LatencyOverview;