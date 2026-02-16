import { ArrowLeft, Mic, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

/* =========================
   HELPERS
========================= */

const normalizeScore = (raw) => {
  if (typeof raw !== "number") return 0;
  return raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
};

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  if (typeof name === "string" && name.includes(" ") && name[0] === name[0].toUpperCase()) return name;
  return String(name).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatKey = (key) => {
  return String(key).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

/* =========================
   DATA EXTRACTOR
========================= */

const extractPronunciationData = (response) => {
  if (!response) {
    return { metrics: [], score: 0, categoryScore: null, passed: null, weight: null };
  }

  let metrics = [];

  // Extract from metrics array (ViewReport passes category data with metrics array)
  if (Array.isArray(response.metrics)) {
    metrics = response.metrics.filter(
      (m) => (m.category === "pronunciation") || (m.name || m.metric_name || "").includes("pronunciation")
    );
  }

  // Fallback: check metric_results
  if (metrics.length === 0 && Array.isArray(response.metric_results)) {
    metrics = response.metric_results.filter(
      (m) => (m.category === "pronunciation") || (m.name || m.metric_name || "").includes("pronunciation")
    );
  }

  // Fallback for aggregated dashboard data format
  if (metrics.length === 0 && response.evaluations) {
    const allMetrics = [];
    const seen = new Set();
    (response.evaluations || []).forEach((ev) => {
      const catData = (ev.category_scores || []).find((c) => c.category === "pronunciation");
      if (catData?.metrics) {
        catData.metrics.forEach((m) => {
          const mName = m.name || m.metric_name;
          if (mName && !seen.has(mName)) {
            seen.add(mName);
            allMetrics.push(m);
          }
        });
      }
    });
    metrics = allMetrics;
  }

  // Extract category score
  const categoryScore = Array.isArray(response.category_scores)
    ? response.category_scores.find((c) => c.category === "pronunciation")
    : null;

  // Calculate overall score
  let score = 0;
  if (categoryScore) {
    score = normalizeScore(categoryScore.score ?? categoryScore.average_score);
  } else if (response.score !== undefined) {
    score = normalizeScore(response.score);
  } else if (metrics.length > 0) {
    const avgScore = metrics.reduce((sum, m) => sum + (m.score || 0), 0) / metrics.length;
    score = normalizeScore(avgScore);
  }

  return {
    metrics,
    score,
    categoryScore,
    passed: categoryScore?.passed ?? (response.passed !== undefined ? response.passed : null),
    weight: categoryScore?.weight ?? (response.weight !== undefined ? response.weight : null),
  };
};

/* =========================
   DONUT CHART
========================= */

const PronunciationDonut = ({ score, passed }) => {
  const radius = 90;
  const stroke = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const color = passed === false ? "#ef4444" : "#2dd4bf";
  const bgColor = passed === false ? "#7f1d1d" : "#0b2a33";

  return (
    <svg width="240" height="240" viewBox="0 0 240 240">
      <g transform="translate(120,120) rotate(-90)">
        <circle
          r={radius}
          cx="0"
          cy="0"
          fill="transparent"
          stroke={bgColor}
          strokeWidth={stroke}
        />
        <circle
          r={radius}
          cx="0"
          cy="0"
          fill="transparent"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
        />
      </g>
      <text
        x="120"
        y="110"
        textAnchor="middle"
        className="text-4xl font-bold"
        fill="white"
      >
        {score}%
      </text>
      <text
        x="120"
        y="135"
        textAnchor="middle"
        className="text-sm"
        fill="#9ca3af"
      >
        Accuracy
      </text>
    </svg>
  );
};

/* =========================
   MISPRONOUNCED ENTITY CARD
========================= */

const MispronouncedEntityCard = ({ entity, index }) => (
  <div className="rounded-lg p-4 bg-red-950/20 border border-red-900/40">
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <XCircle className="w-4 h-4 text-red-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-semibold text-white">{entity.proper_noun}</span>
          {entity.spoken_as && (
            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              Spoken as: &quot;{entity.spoken_as}&quot;
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{entity.reasoning}</p>
      </div>
    </div>
  </div>
);

/* =========================
   METRIC CARD
========================= */

const MetricCard = ({ metric }) => {
  const isPassed = metric.status === "passed" || metric.passed === true;
  const isSkipped = metric.status === "skipped";
  const isError = metric.status === "error";
  const mName = metric.name || metric.metric_name;
  const label = humanizeMetricName(mName);
  const metricScore = normalizeScore(metric.score);

  const details = metric.details || {};
  const totalEntities = details.total_entities_evaluated || 0;
  const mispronounced = details.mispronounced_count || 0;
  const mispronouncedEntities = details.mispronounced_entities || [];
  const reasoning = details.reasoning || metric.reasoning || "";
  const threshold = details.threshold || metric.threshold;

  // Handle skipped state
  if (isSkipped) {
    return (
      <div className="rounded-xl p-6 border bg-white/[0.02] border-white/[0.05]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              {label}
            </span>
          </div>
          <div className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-500/10 text-gray-400 border border-gray-500/20">
            SKIPPED
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
          <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <p className="text-sm text-gray-400 leading-relaxed">
            {reasoning || "This metric was skipped for this evaluation."}
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="rounded-xl p-6 border bg-red-950/10 border-red-900/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              {label}
            </span>
          </div>
          <div className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
            ERROR
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-950/20 rounded-lg border border-red-900/30">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 leading-relaxed">
            {reasoning || "An error occurred during evaluation."}
          </p>
        </div>
      </div>
    );
  }

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
            {label}
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

      {/* Threshold indicator */}
      {threshold !== undefined && threshold !== null && (
        <div className="mb-4 pb-4 border-b border-gray-800/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Threshold:</span>
            <span className="text-sm font-semibold text-gray-300">
              {normalizeScore(threshold)}%
            </span>
          </div>
        </div>
      )}

      {/* Reasoning */}
      {reasoning && (
        <div className="mb-4 pb-4 border-b border-gray-800/50">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Analysis</div>
          <p className="text-sm text-gray-300 leading-relaxed">{reasoning}</p>
        </div>
      )}

      {/* Entity Statistics */}
      {totalEntities > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-800/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                Entities Evaluated
              </span>
              <span className="text-lg font-bold text-white">{totalEntities}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                Mispronounced
              </span>
              <span className={`text-lg font-bold ${mispronounced > 0 ? "text-red-400" : "text-teal-400"}`}>
                {mispronounced}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mispronounced Entities List */}
      {mispronouncedEntities.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Mispronounced Entities ({mispronouncedEntities.length})
          </div>
          <div className="space-y-3">
            {mispronouncedEntities.map((entity, i) => (
              <MispronouncedEntityCard key={i} entity={entity} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* All clear message when no mispronunciations */}
      {totalEntities > 0 && mispronounced === 0 && (
        <div className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <p className="text-sm text-teal-400">
            All proper nouns were pronounced correctly.
          </p>
        </div>
      )}
    </div>
  );
};

/* =========================
   COMPONENT
========================= */

const PronunciationOverview = ({ response, data, onBack }) => {
  // Support both prop shapes: direct `response` (ViewReport) and `data` (EvaluationDashboard)
  const sourceData = response || data;

  const { metrics, score, categoryScore, passed, weight } = extractPronunciationData(sourceData);

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
          <Mic className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No pronunciation metrics available</p>
        </div>
      </div>
    );
  }

  const passedCount = metrics.filter(
    (m) => m.status === "passed" || m.passed === true
  ).length;
  const failedCount = metrics.filter(
    (m) => m.status === "failed" || m.passed === false
  ).length;

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
            <Mic size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Pronunciation Accuracy</h2>
            <p className="text-gray-400 text-sm mt-1">
              Evaluates how accurately the voice agent pronounces proper nouns, names, and domain-specific terms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-4xl font-bold text-teal-400">{score}%</span>
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

export default PronunciationOverview;
