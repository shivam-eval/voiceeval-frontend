import { ArrowLeft, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

/* ========================= HELPERS ========================= */
const normalizeScore = (raw) => {
  if (raw === undefined || raw === null) return 0;
  const n = Number(raw);
  if (Number.isNaN(n)) return 0;
  return n <= 1 ? Math.round(n * 100) : Math.round(n);
};

const formatKey = (key) => {
  return String(key).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

/* ========================= DATA EXTRACTOR ========================= */
const isHallucinationMetric = (metric) => {
  if (!metric) return false;
  const name = metric.name || metric.metric_name;
  return metric.category === "hallucination" || name === "hallucination";
};

const extractHallucinationData = (response, data) => {
  let metrics = [];
  let score = 0;
  let categoryScore = null;
  let passed = null;
  let weight = null;

  if (response) {
    if (Array.isArray(response.metric_results)) {
      metrics = response.metric_results.filter(isHallucinationMetric);
    }
    if (metrics.length === 0 && Array.isArray(response.metrics)) {
      const filtered = response.metrics.filter(isHallucinationMetric);
      metrics = filtered.length > 0 || response.category !== "hallucination" ? filtered : response.metrics;
    }
    if (Array.isArray(response.category_scores)) {
      categoryScore = response.category_scores.find((c) => c.category === "hallucination") || null;
    }
    if (response.category === "hallucination" && response.average_score !== undefined && !categoryScore) {
      categoryScore = {
        category: "hallucination",
        score: response.average_score,
        weight: response.weight,
        passed: response.passed
      };
    }
    if (response.score !== undefined && response.score !== null) {
      score = response.score;
    }
  }

  if ((!metrics || metrics.length === 0) && data) {
    const simEval = data.simulation_evaluation;
    if (simEval) {
      if (Array.isArray(simEval.average_metric_results)) {
        metrics = simEval.average_metric_results
          .filter(isHallucinationMetric)
          .map((m) => ({
            ...m,
            score: m.average_score ?? m.score,
            status: m.average_score >= 0.5 ? "passed" : "failed"
          }));
      }
      if (simEval.average_scores?.by_category?.hallucination !== undefined) {
        score = simEval.average_scores.by_category.hallucination;
      } else if (Array.isArray(simEval.average_category_scores)) {
        const cat = simEval.average_category_scores.find((c) => c.category === "hallucination");
        if (cat) {
          categoryScore = cat;
          score = cat.average_score ?? cat.score ?? score;
        }
      }
    }
    if ((!metrics || metrics.length === 0) && Array.isArray(data.evaluations) && data.evaluations.length > 0) {
      metrics = data.evaluations[0].metric_results?.filter(isHallucinationMetric) || [];
    }
    if ((!metrics || metrics.length === 0) && Array.isArray(data.category_scores)) {
      const cat = data.category_scores.find((c) => c.category === "hallucination");
      if (cat) {
        metrics = cat.metrics || [];
        if (score === 0) score = cat.average_score || cat.score || 0;
      }
    }
  }

  if (categoryScore) {
    score = categoryScore.score ?? categoryScore.average_score ?? score;
    passed = categoryScore.passed ?? passed;
    weight = categoryScore.weight ?? weight;
  }

  if (passed === null) {
    passed = metrics.length > 0
      ? metrics.every((m) => m.status === "passed" || m.passed === true || m.details?.passed === true)
      : null;
  }

  return { metrics, score, categoryScore, passed, weight };
};

/* ========================= HALLUCINATION CARD ========================= */
const HallucinationCard = ({ hallucination, index }) => {
  const text = typeof hallucination === "object"
    ? hallucination.text || hallucination.description || JSON.stringify(hallucination)
    : String(hallucination);

  return (
    <div className="rounded-lg p-4 bg-red-950/20 border border-red-900/40">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span className="text-sm text-red-300 font-medium">Issue #{index + 1}</span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
};

/* ========================= METRIC CARD ========================= */
const MetricCard = ({ metric }) => {
  const isPassed = metric.status === "passed" || metric.passed === true;
  const metricScore = normalizeScore(metric.score);
  const hasHallucination = metric.details?.has_hallucination === true;
  const hallucinations = metric.details?.hallucinations || [];
  const languageViolation = metric.details?.language_violation;
  const reasoning = metric.details?.reasoning || "";

  const details = Object.entries(metric.details || {}).filter(
    ([key]) =>
      ![
        "passed",
        "threshold",
        "execution_time_ms",
        "llm_usage",
        "value",
        "error_message",
        "has_hallucination",
        "hallucinations",
        "language_violation",
        "reasoning"
      ].includes(key)
  );

  return (
    <div
      className={`rounded-xl p-6 border transition-all ${
        isPassed
          ? "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.08]"
          : "bg-red-950/10 border-red-900/20 hover:border-red-900/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Hallucination Detection
          </span>
          <span className={`text-3xl font-bold ${isPassed ? "text-teal-400" : "text-red-400"}`}>
            {metricScore}%
          </span>
        </div>
        <div
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            isPassed
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {isPassed ? "PASSED" : "FAILED"}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-4 pb-4 border-b border-gray-800/50">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
              Hallucination Detected
            </span>
            <div className={`text-lg font-bold ${hasHallucination ? "text-red-400" : "text-green-400"}`}>
              {hasHallucination ? "Yes" : "No"}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
              Issues Found
            </span>
            <div className="text-lg font-bold text-gray-100">{hallucinations.length}</div>
          </div>
          {languageViolation !== undefined && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                Language Violation
              </span>
              <div className={`text-lg font-bold ${languageViolation ? "text-red-400" : "text-green-400"}`}>
                {languageViolation ? "Yes" : "No"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reasoning */}
      {reasoning && (
        <div className="mb-4 pb-4 border-b border-gray-800/50">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Analysis</div>
          <p className="text-sm text-gray-300 leading-relaxed">{reasoning}</p>
        </div>
      )}

      {/* Hallucinations List */}
      {hallucinations.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Hallucinations Detected ({hallucinations.length})
          </div>
          <div className="space-y-3">
            {hallucinations.map((h, i) => (
              <HallucinationCard key={i} hallucination={h} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Additional Details */}
      {details.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pt-4 border-t border-gray-800/50">
          {details.map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                {formatKey(key)}
              </span>
              <div className="text-sm text-gray-300">
                {value === null || value === undefined
                  ? <span className="text-gray-600 italic">None</span>
                  : typeof value === "boolean"
                    ? value ? "Yes" : "No"
                    : String(value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ========================= COMPONENT ========================= */
const HallucinationOverview = ({ response, data, onBack }) => {
  const { metrics, score, passed, weight } = extractHallucinationData(response, data);
  const normalizedScore = normalizeScore(score);
  const scoreColor =
    normalizedScore >= 90 ? "text-green-400" : normalizedScore >= 70 ? "text-yellow-400" : "text-red-400";

  if (!metrics || metrics.length === 0) {
    return (
      <div className="space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#0b1220] hover:bg-[#0b1220]/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>
        )}
        <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-12 text-center">
          <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hallucination metrics available</p>
        </div>
      </div>
    );
  }

  const hasAnyHallucination = metrics.some(
    (m) => m.details?.has_hallucination === true || m.status === "failed"
  );

  return (
    <div className="flex flex-col gap-6">
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#0b1220] hover:bg-[#0b1220]/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
      )}

      {/* Header Card */}
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              hasAnyHallucination
                ? "bg-red-500/10 border border-red-500/20"
                : "bg-green-500/10 border border-green-500/20"
            }`}>
              {hasAnyHallucination
                ? <AlertTriangle className="w-7 h-7 text-red-400" />
                : <CheckCircle className="w-7 h-7 text-green-400" />
              }
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Hallucination Detection</h2>
              <p className="text-gray-400 text-sm max-w-lg">
                Detects unsupported claims, contradictions with the system prompt, and fabricated information
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 flex-wrap">
            {/* Overall Score */}
            <div className="flex flex-col items-end gap-1">
              <span className={`text-5xl font-bold ${scoreColor}`}>{normalizedScore}%</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Overall Score
              </span>
            </div>

            {/* Category Status */}
            {passed !== null && (
              <>
                <div className="h-12 w-px bg-gray-800 hidden lg:block" />
                <div
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
                    passed
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {passed ? "NO HALLUCINATIONS" : "HALLUCINATIONS DETECTED"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Weight Indicator */}
        {weight !== null && weight !== undefined && (
          <div className="mt-6 pt-6 border-t border-gray-800/50 flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Category Weight:</span>
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
                  style={{ width: `${weight * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-300">{(weight * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6">
        {metrics.map((metric, idx) => (
          <MetricCard key={idx} metric={metric} />
        ))}
      </div>
    </div>
  );
};

export default HallucinationOverview;
