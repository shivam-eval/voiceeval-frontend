import { useState } from "react";
import { Target, TrendingUp, ArrowLeft } from "lucide-react";

import AccuracyBar from "./AccuracyBar";
import MetricCard from "./MetricCard";
import DetailedMetric from "../../../../components/DetailedMetric";
import CriticalAlert from "../../../../components/CriticAlert";

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  const map = {
    semantic_accuracy: "Semantic Accuracy",
    keyword_match_accuracy: "Keyword Match Accuracy",
    semantic_similarity: "Semantic Similarity",
    intent_classification_accuracy: "Intent Classification Accuracy",
  };
  return map[name] || name;
};

/* =========================
   TRANSFORMER
========================= */

const transformAccuracyMetrics = (metrics) => {
  if (!metrics || !Array.isArray(metrics)) return [];

  return metrics.map((m) => ({
    label: humanizeMetricName(m.name),
    value: typeof m.score === "number" ? Math.round(m.score * 100) : 0, // Convert 0-1 to 0-100
    threshold: 100,
    time: "—",
    status: m.status, // passed | failed | skipped
  }));
};

/* =========================
   COMPONENT
========================= */

export default function AccuracyView({ response, onBack }) {
  // FIXED: Check for the correct property structure
  const metrics = response?.metrics || [];
  
  console.log('AccuracyView received response:', response);
  console.log('AccuracyView metrics:', metrics);

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
        <div className="text-gray-400">No accuracy metrics available</div>
      </div>
    );
  }

  const [activeTab] = useState("accuracy");

  const detailedMetrics = transformAccuracyMetrics(metrics);

  /* -------------------------
     DERIVED VALUES
  ------------------------- */

  const passedCount = metrics.filter((m) => m.status === "passed").length;
  const failedCount = metrics.filter((m) => m.status === "failed").length;

  const numericScores = metrics
    .map((m) => m.score)
    .filter((s) => typeof s === "number");

  const score =
    numericScores.length > 0
      ? Math.round(
          (numericScores.reduce((a, b) => a + b, 0) / numericScores.length) * 100
        )
      : 0;

  const isCritical = failedCount > 0;

  /* =========================
     RENDER
  ========================= */

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

      {/* Header Card */}
      <MetricCard
        icon={Target}
        title="Accuracy"
        value={score}
        passed={passedCount}
        failed={failedCount}
        status={isCritical ? "critical" : "success"}
      />

      {/* Critical Alert */}
      {isCritical && (
        <CriticalAlert
          title="Accuracy Below Threshold"
          description="One or more accuracy metrics failed. Review expected responses and intent handling."
          metrics={metrics
            .filter((m) => m.status === "failed")
            .map((m) => ({
              icon: TrendingUp,
              label: humanizeMetricName(m.name),
              value:
                typeof m.score === "number"
                  ? `${Math.round(m.score * 100)}%`
                  : "N/A",
            }))}
        />
      )}

      {/* Visualization */}
      <div className="mt-6 grid grid-cols-1 gap-6">
        <AccuracyBar response={response} />
      </div>

      {/* Detailed Metrics */}
      <div className="pt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-teal-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-teal-400 rounded-full" />
            </div>
          </div>
          <h2 className="text-xl font-semibold">Detailed Metrics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {detailedMetrics.map((metric, idx) => (
            <DetailedMetric key={idx} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
}