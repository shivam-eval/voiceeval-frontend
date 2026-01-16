import { Target, ArrowLeft } from "lucide-react";

/* ========================= HELPERS ========================= */

const formatKey = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const formatValue = (key, value) => {
  if (value === null || value === undefined) return "Not available";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (key.includes("rate") || key.includes("score"))
      return `${Math.round(value * 100)}%`;
    return value.toFixed(2);
  }
  return String(value);
};

const normalizeScore = (v) =>
  typeof v === "number" ? (v > 1 ? Math.round(v) : Math.round(v * 100)) : 0;

/* ========================= DATA EXTRACTION ========================= */

const extractAccuracyData = (response, data) => {
  let metrics = [];
  let score = 0;

  if (response) {
    metrics = response.metrics || [];
    score = response.score || 0;
  } else if (data) {
    const simEval = data.simulation_evaluation;
    if (simEval) {
      if (Array.isArray(simEval.average_metric_results)) {
        metrics = simEval.average_metric_results
          .filter((m) => m.category === "accuracy")
          .map((m) => ({
            ...m,
            score: m.average_score,
            status: m.average_score >= 0.7 ? "passed" : "failed",
          }));
      }

      if (
        simEval.average_scores?.by_category?.accuracy !== undefined
      ) {
        score = simEval.average_scores.by_category.accuracy;
      } else if (Array.isArray(simEval.average_category_scores)) {
        const cat = simEval.average_category_scores.find(
          (c) => c.category === "accuracy"
        );
        if (cat) score = cat.average_score || 0;
      }
    }

    if (
      metrics.length === 0 &&
      Array.isArray(data.evaluations) &&
      data.evaluations.length > 0
    ) {
      metrics =
        data.evaluations[0].metric_results?.filter(
          (m) => m.category === "accuracy"
        ) || [];
      metrics = metrics.map((m) => ({
        ...m,
        status: m.status || (m.score >= 0.7 ? "passed" : "failed"),
      }));
    }

    if (metrics.length === 0 && Array.isArray(data.category_scores)) {
      const accCategory = data.category_scores.find(
        (c) => c.category === "accuracy"
      );
      if (accCategory) {
        metrics = accCategory.metrics || [];
        if (score === 0) score = accCategory.average_score || 0;
      }
    }
  }

  return { metrics, score };
};

/* ========================= COMPONENT ========================= */

const AccuracyOverview = ({ response, data, onBack }) => {
  const { metrics, score } = extractAccuracyData(response, data);
  if (!metrics.length) return null;

  const normalizedScore = normalizeScore(score);
  const passedCount = metrics.filter((m) => m.status === "passed").length;
  const failedCount = metrics.length - passedCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
      )}

      {/* ================= HEADER CARD ================= */}
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 flex justify-between shadow-lg">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Target size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Accuracy</h2>
            <p className="text-gray-400 text-sm mt-1">
              Evaluates semantic correctness and response alignment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-4xl font-bold text-teal-400">
              {normalizedScore}%
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Overall Score
            </span>
          </div>

          <div className="h-10 w-px bg-gray-800" />

          <div className="flex gap-6">
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{passedCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Passed
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{failedCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Failed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= METRIC CARDS ================= */}
      <div className="grid grid-cols-1 gap-6">
        {metrics.map((metric, idx) => {
          const isPassed = metric.status === "passed";
          const label = formatKey(metric.name || metric.metric_name);
          const metricScore = normalizeScore(metric.score);
          const details = Object.entries(metric.details || {}).filter(
            ([key]) =>
              ![
                "passed",
                "execution_time_ms",
                "error_message",
                "reasoning",
                "step_results",
                "llm_usage",
                "value",
                "threshold"
              ].includes(key)
          );

          // Extract turn-by-turn data from multiple possible locations
          const turnData =
            metric.details?.step_results ||
            metric.details?.turn_data ||
            metric.details?.turns ||
            metric.details?.turn_by_turn_results ||
            metric.step_results ||
            metric.turn_data ||
            null;

          // Debug logging to help identify data structure
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Accuracy] Metric: ${label}`, {
              hasTurnData: !!turnData,
              turnDataLength: turnData?.length,
              metricDetails: metric.details,
              fullMetric: metric
            });
          }

          return (
            <div
              key={idx}
              className={`rounded-xl p-6 border ${isPassed
                ? "bg-white/[0.02] border-white/[0.05]"
                : "bg-red-950/10 border-red-900/20"
                }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400">
                    {label}
                  </span>
                  <div
                    className={`text-2xl font-bold ${isPassed ? "text-teal-400" : "text-red-400"
                      }`}
                  >
                    {metricScore}%
                  </div>
                </div>
                <div
                  className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${isPassed
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                >
                  {isPassed ? "✓ PASSED" : "✗ FAILED"}
                </div>
              </div>

              {/* Summary Details */}
              {details.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-800/50">
                  {details.map(([key, value]) => (
                    <div key={key}>
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                        {formatKey(key)}
                      </div>
                      <div className="text-sm text-gray-300">
                        {formatValue(key, value)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Response Consistency Special Display (when no turn data) */}
              {!turnData && metric.details?.issue_detected !== undefined && (
                <div className="pt-6 border-t border-gray-800/50">
                  <div className="bg-white/[0.02] rounded-lg p-6 border border-gray-800/30">
                    {/* Issue Status */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                          Consistency Check
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${metric.details.issue_detected === 'none'
                          ? 'bg-green-500/5 border border-green-500/20'
                          : 'bg-red-500/5 border border-red-500/20'
                          }`}>
                          <span className={`text-xs font-medium ${metric.details.issue_detected === 'none' ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {metric.details.issue_detected === 'none' ? '✓ No Issues Detected' : `✗ ${formatKey(metric.details.issue_detected)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Analysis */}
                    {metric.details.reasoning && (
                      <div className="pt-4 border-t border-gray-800/20">
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">
                          Analysis
                        </div>
                        <div className="text-sm text-gray-300 leading-relaxed">
                          {metric.details.reasoning}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Turn-by-Turn */}
              {Array.isArray(turnData) && turnData.length > 0 && (
                <div className="pt-6 border-t border-gray-800/50 space-y-4">
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">
                    Turn-by-Turn Analysis
                  </div>

                  {/* Summary Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Evaluated Steps (for semantic accuracy) */}
                    {metric.details?.evaluated_steps !== undefined && (
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                          Evaluated Steps
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {metric.details.evaluated_steps}
                        </div>
                      </div>
                    )}

                    {/* Passed Steps (for semantic accuracy) */}
                    {metric.details?.passed_steps !== undefined && (
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                          Passed Steps
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          {metric.details.passed_steps}
                        </div>
                      </div>
                    )}

                    {/* Repetition Count (for repetition detection) */}
                    {metric.details?.repetition_count !== undefined && (
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                          Repetition Count
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {metric.details.repetition_count}
                        </div>
                      </div>
                    )}

                    {/* Agent Turns Analyzed (always show if we have turn data) */}
                    {!metric.details?.evaluated_steps && !metric.details?.repetition_count && (
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                          Agent Turns Analyzed
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {turnData.length}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Repetitions List */}
                  {metric.details?.repetitions && Array.isArray(metric.details.repetitions) && metric.details.repetitions.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                        Repetitions
                      </div>
                      <div className="text-sm text-gray-400">
                        {metric.details.repetitions.join(', ') || 'None'}
                      </div>
                    </div>
                  )}

                  {/* Reasoning */}
                  {metric.details?.reasoning && (
                    <div className="mb-6">
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                        Reasoning
                      </div>
                      <div className="text-sm text-gray-300 leading-relaxed">
                        {metric.details.reasoning}
                      </div>
                    </div>
                  )}

                  {/* Agent Sentences Header */}
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">
                    Agent Sentences
                  </div>

                  {/* Turn Cards */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {turnData.map((turn, tIdx) => {
                      const turnNumber = turn.test_step_number || turn.transcript_step_number || turn.step_number || tIdx + 1;
                      const turnText = turn.actual_text || turn.actual_response || turn.response || turn.text;
                      const turnPassed = turn.passed !== undefined ? turn.passed : true;
                      const hasExpected = turn.expected_greeting || turn.expected_utterance || turn.expected_keywords;

                      return (
                        <div
                          key={tIdx}
                          className="rounded-lg p-5 bg-white/[0.02] border border-gray-800/30 hover:border-gray-700/40 transition-all"
                        >
                          {/* Turn Header with Pass/Fail */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-medium text-gray-400">
                              Turn #{turnNumber}
                            </div>
                            {turn.passed !== undefined && (
                              <span
                                className={`text-[10px] px-2.5 py-1 rounded-md font-medium uppercase tracking-wide ${turnPassed
                                    ? "bg-green-500/5 text-green-400 border border-green-500/20"
                                    : "bg-red-500/5 text-red-400 border border-red-500/20"
                                  }`}
                              >
                                {turnPassed ? "✓ Passed" : "✗ Failed"}
                              </span>
                            )}
                          </div>

                          {/* Actual Text */}
                          <div className="text-sm text-gray-200 leading-relaxed mb-4">
                            {turnText || '—'}
                          </div>

                          {/* Expected Content */}
                          {hasExpected && (
                            <div className="pt-4 border-t border-gray-800/20 space-y-3">
                              {turn.expected_greeting && (
                                <div>
                                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5">
                                    Expected Greeting
                                  </div>
                                  <div className="text-xs text-gray-400 leading-relaxed">
                                    {turn.expected_greeting}
                                  </div>
                                </div>
                              )}

                              {turn.expected_utterance && (
                                <div>
                                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5">
                                    Expected Utterance
                                  </div>
                                  <div className="text-xs text-gray-400 leading-relaxed">
                                    {turn.expected_utterance}
                                  </div>
                                </div>
                              )}

                              {turn.expected_keywords && Array.isArray(turn.expected_keywords) && turn.expected_keywords.length > 0 && (
                                <div>
                                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                                    Expected Keywords
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {turn.expected_keywords.map((keyword, kIdx) => (
                                      <span
                                        key={kIdx}
                                        className="text-[10px] px-2 py-1 bg-blue-500/5 text-blue-300 rounded border border-blue-500/15 font-medium"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reasoning */}
                          {turn.reasoning && (
                            <div className="pt-4 mt-4 border-t border-gray-800/20">
                              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                                Analysis
                              </div>
                              <div className="text-xs text-gray-400 leading-relaxed">
                                {turn.reasoning}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccuracyOverview;
