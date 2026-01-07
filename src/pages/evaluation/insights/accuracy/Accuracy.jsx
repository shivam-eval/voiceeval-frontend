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

          const turnData =
            metric.details?.step_results ||
            metric.details?.turn_data ||
            null;

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

              {/* Turn-by-Turn */}
              {Array.isArray(turnData) && turnData.length > 0 && (
                <div className="pt-6 border-t border-gray-800/50 space-y-4">
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    Turn-by-Turn Analysis
                  </div>

                  {turnData.map((turn, tIdx) => (
                    <div
                      key={tIdx}
                      className="rounded-xl p-5 bg-dark-input border border-gray-800/50"
                    >
                      <div className="flex justify-between mb-3">
                        <span className="text-sm text-gray-300">
                          Step #{turn.test_step_number || turn.transcript_step_number || tIdx + 1}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${turn.passed
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                            }`}
                        >
                          {turn.passed ? "Passed" : "Failed"}
                        </span>
                      </div>

                      <div className="text-sm text-gray-200 leading-relaxed">
                        {turn.actual_text || turn.actual_response || "—"}
                      </div>

                      {turn.expected_response && (
                        <div className="mt-3 text-sm italic text-gray-400">
                          Expected: {turn.expected_response}
                        </div>
                      )}
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

export default AccuracyOverview;
