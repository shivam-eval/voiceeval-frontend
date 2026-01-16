import {
  User,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";


/* =========================
   Helpers
========================= */

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  // Use the name directly if it's already humanized (contains spaces and starts with uppercase)
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;

  // No hardcoded map - just transform the snake_case name to Title Case
  return String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const normalizeScore = (v) =>
  typeof v === "number"
    ? (v > 1 ? Math.round(v) : Math.round(v * 100))
    : 0;

/* =========================
   Extract Persona Category Data
========================= */
const extractPersonaData = (response, data) => {
  let metrics = [];
  let score = 0;

  if (response) {
    // Called from ViewReport with single evaluation's category data
    metrics = response?.metrics || [];
    score = response?.score || 0;
  } else if (data) {
    // Called from Dashboard with aggregated data
    // 1. Try to find in simulation_evaluation (new res.json format)
    const simEval = data.simulation_evaluation;
    if (simEval) {
      // Extract score from average_scores.by_category
      if (simEval.average_scores?.by_category?.persona !== undefined) {
        score = simEval.average_scores.by_category.persona;
      } else if (Array.isArray(simEval.average_category_scores)) {
        const cat = simEval.average_category_scores.find(c => c.category === 'persona');
        if (cat) score = cat.average_score || 0;
      }

      // Extract metrics from average_metric_results
      if (Array.isArray(simEval.average_metric_results)) {
        metrics = simEval.average_metric_results
          .filter(m => m.category === 'persona')
          .map(m => ({
            ...m,
            score: m.average_score,
            status: m.average_score >= 0.7 ? 'passed' : 'failed' // Heuristic status
          }));
      }
    }

    // 2. Fallback to evaluations[0].metric_results (new res.json format)
    if (metrics.length === 0 && Array.isArray(data.evaluations) && data.evaluations.length > 0) {
      metrics = data.evaluations[0].metric_results?.filter(m => m.category === 'persona') || [];
    }

    // 3. Fallback to data.category_scores if metrics still empty (legacy)
    if (metrics.length === 0 && Array.isArray(data.category_scores)) {
      const personaCategory = data.category_scores.find(c => c.category === 'persona');
      if (personaCategory) {
        metrics = personaCategory.metrics || [];
        if (score === 0) {
          score = personaCategory.average_score || 0;
        }
      }
    }
  }

  return {
    score,
    metrics
  };
};

/* =========================
   Component
========================= */

const PersonaOverview = ({ response, data, onBack }) => {
  const processedResponse = extractPersonaData(response, data);
  const metrics = processedResponse.metrics || [];
  const score = processedResponse.score;

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
          <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No persona metrics available</p>
          <p className="text-gray-600 text-xs mt-1">
            {response ? 'Response has no metrics' : data ? 'Data has no persona category' : 'No data provided'}
          </p>
        </div>
      </div>
    );
  }

  const passedCount = metrics.filter((m) => m.status === "passed").length;
  const totalCount = metrics.length;
  const failedCount = totalCount - passedCount;
  const normalizedScore = normalizeScore(score);

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
            <User size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Persona Analytics
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Evaluates persona consistency and communication tone
            </p>
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

      {/* ================= PERSONA ANALYTICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, idx) => {
          const isPassed = metric.status === "passed";
          const mName = metric.name || metric.metric_name;
          const label = humanizeMetricName(mName);
          const score = typeof metric.score === 'number' ? Math.round(metric.score * 100) : 0;

          // Filter and humanize details
          const details = Object.entries(metric.details || {})
            .filter(([key]) => !['passed', 'execution_time_ms', 'error_message', 'threshold', 'value'].includes(key));

          return (
            <div key={idx} className={`rounded-xl p-6 border ${isPassed ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-red-950/10 border-red-900/20'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{label}</span>
                  <span className={`text-2xl font-bold ${isPassed ? 'text-teal-400' : 'text-red-400'}`}>
                    {score}%
                  </span>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {isPassed ? '✓ PASSED' : '✗ FAILED'}
                </div>
              </div>

              {details.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 pt-6 border-t border-gray-800/50">
                  {details.map(([key, value]) => (
                    <div key={key} className={`flex flex-col gap-1.5 ${key === 'reasoning' ? 'md:col-span-2' : ''}`}>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <div className="text-sm">
                        {value === null ? (
                          <span className="text-gray-600 italic">None</span>
                        ) : typeof value === 'object' && !Array.isArray(value) ? (
                          <div className="space-y-1">
                            {Object.entries(value).map(([subKey, subValue]) => (
                              <div key={subKey} className="text-gray-300">
                                <span className="text-gray-500">{subKey.replace(/_/g, " ")}:</span> {String(subValue)}
                              </div>
                            ))}
                          </div>
                        ) : Array.isArray(value) ? (
                          value.length === 0 ? (
                            <span className="text-gray-500">None</span>
                          ) : (
                            <ul className="space-y-1.5">
                              {value.map((item, i) => (
                                <li key={i} className="text-gray-300 flex items-start gap-2">
                                  <div className="w-1 h-1 bg-teal-500/40 rounded-full mt-2 flex-shrink-0" />
                                  <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
                                </li>
                              ))}
                            </ul>
                          )
                        ) : (
                          <span className="text-gray-300 leading-relaxed">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                              typeof value === 'number' ? (
                                // Format numbers nicely
                                key.includes('threshold') || key.includes('value') ? `${(value * 100).toFixed(0)}%` :
                                  value.toFixed(2)
                              ) : String(value)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonaOverview;
