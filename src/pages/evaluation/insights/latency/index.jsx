import { ArrowLeft, Clock } from 'lucide-react'

const LatencyOverview = ({ response, data, onBack }) => {
  // Handle both single evaluation (response) and aggregated data (data)
  let metrics = [];
  let score = 0;

  if (response) {
    metrics = response?.metrics || [];
    score = response?.score || 0;
  } else if (data) {
    // Called from Dashboard with aggregated data
    // 1. Try to find in simulation_evaluation (new res.json format)
    const simEval = data.simulation_evaluation;
    if (simEval) {
      // Extract score from average_scores.by_category
      if (simEval.average_scores?.by_category?.latency !== undefined) {
        score = simEval.average_scores.by_category.latency;
      } else if (Array.isArray(simEval.average_category_scores)) {
        const cat = simEval.average_category_scores.find(c => c.category === 'latency');
        if (cat) {
          score = cat.average_score || 0;
        }
      }

      // Extract metrics from average_metric_results
      if (Array.isArray(simEval.average_metric_results)) {
        metrics = simEval.average_metric_results
          .filter(m => m.category === 'latency')
          .map(m => ({
            ...m,
            score: m.average_score,
            status: m.average_score >= 0.7 ? 'passed' : 'failed' // Heuristic status
          }));
      }
    }

    // 2. Fallback to evaluations[0].metric_results (new res.json format)
    if (metrics.length === 0 && Array.isArray(data.evaluations) && data.evaluations.length > 0) {
      metrics = data.evaluations[0].metric_results?.filter(m => m.category === 'latency') || [];
    }

    // 3. Fallback to data.category_scores if metrics still empty (legacy)
    if (metrics.length === 0 && Array.isArray(data.category_scores)) {
      const latencyCategory = data.category_scores.find(c => c.category === 'latency');
      if (latencyCategory) {
        metrics = latencyCategory.metrics || [];
        if (score === 0) {
          score = latencyCategory.average_score || 0;
        }
      }
    }
  }

  if (!metrics || metrics.length === 0) {
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
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No latency metrics available</p>
        </div>
      </div>
    );
  }

  const passedCount = metrics.filter(m => m.status === "passed" || m.passed === true).length;
  const totalCount = metrics.length;
  const failedCount = totalCount - passedCount;
  const normalizedScore = typeof score === 'number' ? (score > 1 ? Math.round(score) : Math.round(score * 100)) : 0;

  const humanizeMetricName = (name) => {
    if (!name) return "Unknown Metric";
    // Use the name directly if it's already humanized (contains spaces and starts with uppercase)
    if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
    
    // No hardcoded map - just transform the snake_case name to Title Case
    return String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-6">
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

      {/* ================= HEADER CARD ================= */}
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 flex items-center justify-between shadow-lg">
        {/* Left */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Clock size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Latency Analytics</h2>
            <p className="text-gray-400 text-sm mt-1">Detailed performance metrics for response times and processing</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-4xl font-bold text-teal-400">{normalizedScore}%</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Overall Score</span>
          </div>

          <div className="h-10 w-px bg-gray-800" />

          {/* Passed / Failed */}
          <div className="flex gap-6 text-sm">
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{passedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Passed</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{failedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LATENCY ANALYTICS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, idx) => {
          const isPassed = metric.status === "passed" || metric.passed === true;
          const mName = metric.metric_name || metric.name;
          const label = humanizeMetricName(mName);
          const valRaw = metric.value ?? metric.details?.average_ms ?? (metric.details?.repetition_count !== undefined ? metric.details.repetition_count : 0);
          const isCount = mName === 'repetition_count';
          const unit = isCount ? '' : (mName === 'total_duration' ? 's' : 'ms');
          const valueDisplay = isCount ? valRaw : (mName === 'total_duration' ? `${(valRaw / 1000).toFixed(2)}${unit}` : `${Math.round(valRaw)}${unit}`);
          
          const details = Object.entries(metric.details || {})
            .filter(([key]) => !['passed', 'execution_time_ms', 'error_message', 'reasoning', 'agent_sentences', 'repetitions'].includes(key));

          return (
            <div key={idx} className={`rounded-xl p-6 border ${isPassed ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-red-950/10 border-red-900/20'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{label}</span>
                  <span className={`text-2xl font-bold ${isPassed ? 'text-teal-400' : 'text-red-400'}`}>
                    {valueDisplay}
                  </span>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {isPassed ? '✓ PASSED' : '✗ FAILED'}
                </div>
              </div>

              {details.length > 0 && (
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-6 border-t border-gray-800/50">
                  {details.map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-sm text-gray-300">
                        {typeof value === 'number' ? (key.includes('ms') ? `${Math.round(value)}ms` : value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {metric.details?.reasoning && (
                <div className="mt-6 pt-6 border-t border-gray-800/50">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Analysis</div>
                  <p className="text-gray-400 text-sm leading-relaxed italic">{metric.details.reasoning}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Turn-by-Turn Analysis for Repetition Count (Special Case) */}
      {metrics.find(m => (m.metric_name || m.name) === 'repetition_count')?.details?.agent_sentences?.length > 0 && (
        <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Turn-by-Turn Analysis (Repetitions)</h2>
          </div>

          <div className="space-y-4">
            {metrics.find(m => (m.metric_name || m.name) === 'repetition_count').details.agent_sentences.map((sentence, idx) => {
              const isRepetitive = metrics.find(m => (m.metric_name || m.name) === 'repetition_count').details.repetitions?.some(r => sentence.text?.includes(r));
              return (
                <div key={idx} className={`rounded-xl p-6 border ${!isRepetitive ? 'bg-white/[0.01] border-white/[0.03]' : 'bg-red-950/10 border-red-900/20'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        🤖
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-purple-500/10 text-purple-400">
                            AGENT
                          </span>
                          <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                            Turn #{idx + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${!isRepetitive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {!isRepetitive ? '✓ Clean' : '✗ Repetitive'}
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed font-medium">
                    {sentence.text || '—'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LatencyOverview;