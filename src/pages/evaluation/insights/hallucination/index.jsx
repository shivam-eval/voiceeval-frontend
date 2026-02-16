import { ArrowLeft, AlertTriangle, ShieldAlert } from "lucide-react";

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
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-400">
            Hallucination Detection
          </span>
          <div className={`text-2xl font-bold ${isPassed ? "text-teal-400" : "text-red-400"}`}>
            {metricScore}%
          </div>
        </div>
        <div
          className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${
            isPassed
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {isPassed ? "\u2713 PASSED" : "\u2717 FAILED"}
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
          <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hallucination metrics available</p>
        </div>
      </div>
    );
  }

  const passedCount = metrics.filter(
    (m) => m.status === "passed" || m.passed === true
  ).length;
  const failedCount = metrics.length - passedCount;

  return (
    <div className="flex flex-col gap-6">
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
      )}

      {/* Header Card */}
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Hallucination Detection</h2>
            <p className="text-gray-400 text-sm mt-1">
              Detects unsupported claims, contradictions with the system prompt, and fabricated information
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-4xl font-bold text-teal-400">{normalizedScore}%</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Overall Score
            </span>
          </div>

          <div className="h-10 w-px bg-gray-800" />

          <div className="flex gap-6 text-sm">
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{passedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Passed
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{failedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Failed
              </div>
            </div>
          </div>
        </div>
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
