import { MessageCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
  const map = {
    interruption_count: "Interruption Count",
    pause_detection: "Pause Detection",
    turn_boundary_accuracy: "Turn Boundary Accuracy",
  };
  return map[name] || String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

/* =========================
   COMPONENT
========================= */
const EndpointingOverview = ({ response, data, onBack }) => {
  console.log('=== EndpointingOverview Render ===');
  console.log('EndpointingOverview received response:', response);
  console.log('EndpointingOverview received data:', data);

  // Handle both single evaluation (response) and aggregated data (data)
  let processedResponse = response;

  if (!response && data) {
    // Called from Dashboard with aggregated data
    console.log('Using data - category_scores:', data.category_scores);
    const endpointingCategory = data.category_scores?.find(c => c.category === 'endpointing');
    console.log('Found endpointing category:', endpointingCategory);

    if (endpointingCategory) {
      processedResponse = {
        metrics: endpointingCategory.metrics || [],
        score: endpointingCategory.average_score || 0,
        passed: endpointingCategory.metrics?.every(m => m.status === 'passed') || false
      };
    } else {
      // Fallback: aggregate from all evaluations
      const allMetrics = [];
      data.evaluations?.forEach(evaluation => {
        const endCat = evaluation.category_scores?.find(c => c.category === 'endpointing');
        if (endCat?.metrics) {
          allMetrics.push(...endCat.metrics);
        }
      });
      processedResponse = {
        metrics: allMetrics,
        score: 0,
        passed: false
      };
      console.log('Aggregated endpointing metrics from evaluations:', allMetrics);
    }
  }

  console.log('Processed response:', processedResponse);

  const metrics = Array.isArray(processedResponse?.metrics) ? processedResponse.metrics : [];
  const score = typeof processedResponse?.score === 'number'
    ? (processedResponse.score > 1 ? Math.round(processedResponse.score) : Math.round(processedResponse.score * 100))
    : 0;

  console.log('Final metrics array:', metrics);
  console.log('Metrics length:', metrics.length);

  if (!metrics || metrics.length === 0) {
    console.warn('No endpointing metrics available - showing empty state');
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
          <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No endpointing metrics available</p>
        </div>
      </div>
    );
  }

  console.log('Rendering EndpointingOverview with', metrics.length, 'metrics');

  const passedCount = metrics.filter(m => m.status === "passed" || m.passed === true).length;
  const failedCount = metrics.length - passedCount;

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
      <div className="bg-[#0b1f26] border border-teal-500/40 rounded-xl p-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-xl bg-teal-500/20 text-teal-400">
            <MessageCircle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Endpointing
            </h2>
            <p className="text-gray-400 mt-1">
              Measures turn-taking and pause detection accuracy
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          {/* Ring */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-teal-900"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={
                  2 * Math.PI * 40 * (1 - score / 100)
                }
                className="text-teal-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-teal-300">
                {score}%
              </span>
            </div>
          </div>

          {/* Passed / Failed */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2 text-teal-400">
              <CheckCircle size={16} />
              <span className="font-medium">{passedCount}</span>
              <span className="text-gray-400">Passed</span>
            </div>
            <div className="flex items-center gap-2 text-red-500">
              <XCircle size={16} />
              <span className="font-medium">{failedCount}</span>
              <span className="text-gray-400">Failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ENDPOINTING ANALYTICS ================= */}
      <div className="pt-6">
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Endpointing Analytics</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {metrics.map((metric, idx) => {
              const isPassed = metric.status === "passed";
              const mName = metric.name || metric.metric_name;
              const label = humanizeMetricName(mName);
              const score = typeof metric.score === 'number' ? Math.round(metric.score * 100) : 0;

              // Filter and humanize details
              const details = Object.entries(metric.details || {})
                .filter(([key]) => !['passed', 'threshold', 'execution_time_ms', 'llm_usage', 'value', 'error_message', 'reasoning'].includes(key));

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
                        <div key={key} className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                          <div className="text-sm">
                            {value === null ? (
                              <span className="text-gray-600 italic">Not available</span>
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
                                    key.includes('ms') || key.includes('pause') ? `${value.toFixed(2)} ms` :
                                      key.includes('count') ? value :
                                        key.includes('accuracy') ? `${(value * 100).toFixed(1)}%` :
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
      </div>
    </div>
  );
};

export default EndpointingOverview;
