import { ArrowLeft, TriangleAlert, AlertCircle } from "lucide-react";

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  if (typeof name === "string" && name.includes(" ") && name[0] === name[0].toUpperCase()) return name;
  return String(name).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const normalizeScore = (raw) => {
  if (typeof raw !== "number") return 0;
  return raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
};

const formatKey = (key) => {
  return String(key).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const renderValue = (value) => {
  if (value === null || value === undefined) {
    return <span className="text-gray-600 italic">None</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-500">None</span>;
    return (
      <div className="space-y-1.5">
        {value.map((item, i) => (
          <div key={i} className="text-gray-300 flex items-start gap-2">
            <div className="w-1 h-1 bg-teal-500/40 rounded-full mt-2 flex-shrink-0" />
            <span>{typeof item === "object" ? JSON.stringify(item) : String(item)}</span>
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="text-gray-300">
            <span className="text-gray-500">{formatKey(k)}:</span> {String(v)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

/* =========================
   DATA EXTRACTOR
========================= */

const extractHallucinationData = (response) => {
  if (!response) {
    return { metrics: [], score: 0, categoryScore: null, passed: null, weight: null };
  }

  let metrics = [];

  // Extract from metric_results array filtering by category
  if (Array.isArray(response.metric_results)) {
    metrics = response.metric_results.filter((m) => m.category === "hallucination");
  }

  // Fallback: check if response.metrics exists
  if (metrics.length === 0 && Array.isArray(response.metrics)) {
    metrics = response.metrics.filter((m) => m.category === "hallucination"); // In case it's a mix
    if (metrics.length === 0) {
      metrics = response.metrics; // Assume all metrics passed in response.metrics are relevant if filtered by ViewReport
    }
  }

  // Extract category score
  // Check if response IS the category object (from ViewReport) or has category_scores (raw)
  let categoryScore = null;
  if (Array.isArray(response.category_scores)) {
    categoryScore = response.category_scores.find((c) => c.category === "hallucination");
  } else if (response.score !== undefined) {
    // response is likely the category object itself
    categoryScore = response;
  }

  // Calculate overall score
  let score = 0;
  if (categoryScore && categoryScore.score !== undefined) {
    score = normalizeScore(categoryScore.score);
  } else if (metrics.length > 0) {
    const avgScore = metrics.reduce((sum, m) => sum + (m.score || 0), 0) / metrics.length;
    score = normalizeScore(avgScore);
  }

  return {
    metrics,
    score,
    categoryScore,
    passed: categoryScore?.passed ?? null,
    weight: categoryScore?.weight ?? null
  };
};

/* =========================
   HALLUCINATION CARD
========================= */

const HallucinationCard = ({ hallucination, index }) => (
  <div className="rounded-lg p-4 bg-red-950/20 border border-red-900/40">
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <AlertCircle className="w-4 h-4 text-red-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-red-400">Issue #{index + 1}</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          {typeof hallucination === "object"
            ? hallucination.text || hallucination.description || JSON.stringify(hallucination)
            : String(hallucination)}
        </p>
      </div>
    </div>
  </div>
);

/* =========================
   METRIC CARD
========================= */

const MetricCard = ({ metric, index }) => {
  const isPassed = metric.status === "passed" || metric.passed === true;
  const mName = metric.name || metric.metric_name;
  const label = humanizeMetricName(mName);
  const metricScore = normalizeScore(metric.score);

  const hallucinations = metric.details?.hallucinations || [];
  const hasHallucination = metric.details?.has_hallucination;
  const reasoning = metric.details?.reasoning || "";

  // Filter out internal details
  const details = Object.entries(metric.details || {}).filter(
    ([key]) =>
      ![
        "passed",
        "threshold",
        "execution_time_ms",
        "llm_usage",
        "value",
        "error_message",
        "hallucinations",
        "has_hallucination",
        "reasoning",
      ].includes(key)
  );

  return (
    <div
      className={`rounded-xl p-6 border transition-all ${isPassed
          ? "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.08]"
          : "bg-red-950/10 border-red-900/20 hover:border-red-900/30"
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            {label}
          </span>
          <span className={`text-3xl font-bold ${isPassed ? "text-teal-400" : "text-red-400"}`}>
            {metricScore}%
          </span>
        </div>
        <div
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
        >
          {isPassed ? "PASSED" : "FAILED"}
        </div>
      </div>

      {/* Reasoning */}
      {reasoning && (
        <div className="mb-4 pb-4 border-b border-gray-800/50">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Analysis</div>
          <p className="text-sm text-gray-300 leading-relaxed">{reasoning}</p>
        </div>
      )}

      {/* Hallucination Detection Status */}
      {hasHallucination !== undefined && (
        <div className="mb-4 pb-4 border-b border-gray-800/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Hallucination Detected:
            </span>
            <span className={`text-sm font-semibold ${hasHallucination ? "text-red-400" : "text-green-400"}`}>
              {hasHallucination ? "Yes" : "No"}
            </span>
          </div>
        </div>
      )}

      {/* Hallucinations List */}
      {hallucinations.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Detected Hallucinations ({hallucinations.length})
          </div>
          <div className="space-y-3">
            {hallucinations.map((hallucination, i) => (
              <HallucinationCard key={i} hallucination={hallucination} index={i} />
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
              <div className="text-sm text-gray-300">{renderValue(value)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================
   COMPONENT
========================= */

const HallucinationOverview = ({ response, onBack }) => {
  console.log('=== HallucinationOverview Debug ===');
  console.log('Response:', response);

  const { metrics, score, categoryScore, passed, weight } = extractHallucinationData(response);
  const scoreColor =
    score >= 90 ? "text-green-400" : score >= 70 ? "text-yellow-400" : "text-red-400";

  console.log('Extracted metrics:', metrics);
  console.log('Score:', score);
  console.log('Category score:', categoryScore);

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
          <TriangleAlert className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hallucination metrics available</p>
        </div>
      </div>
    );
  }

  const passedCount = metrics.filter((m) => m.status === "passed" || m.passed === true).length;
  const failedCount = metrics.length - passedCount;

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
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20">
              <TriangleAlert className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Hallucination Detection</h2>
              <p className="text-gray-400 text-sm max-w-lg">
                Identifies fabricated information, unsupported claims, and contextual inaccuracies in agent responses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 flex-wrap">
            {/* Overall Score */}
            <div className="flex flex-col items-end gap-1">
              <span className={`text-5xl font-bold ${scoreColor}`}>{score}%</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Overall Score
              </span>
            </div>

            <div className="h-12 w-px bg-gray-800 hidden lg:block" />

            {/* Pass/Fail Stats */}
            <div className="flex gap-8 text-sm">
              <div className="flex flex-col items-end gap-1">
                <div className="text-2xl font-bold text-green-400">{passedCount}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Passed
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-2xl font-bold text-red-400">{failedCount}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Failed
                </div>
              </div>
            </div>

            {/* Category Status */}
            {passed !== null && (
              <>
                <div className="h-12 w-px bg-gray-800 hidden lg:block" />
                <div
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${passed
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                >
                  {passed ? "CATEGORY PASSED" : "CATEGORY FAILED"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Weight Indicator */}
        {weight !== null && (
          <div className="mt-6 pt-6 border-t border-gray-800/50 flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Category Weight:</span>
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all"
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
          <MetricCard key={idx} metric={metric} index={idx} />
        ))}
      </div>
    </div>
  );
};

export default HallucinationOverview;
