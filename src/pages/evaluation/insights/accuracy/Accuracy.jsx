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
  // Convert snake_case to Title Case dynamically
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/* =========================
   TRANSFORMER
========================= */

const transformAccuracyMetrics = (metrics) => {
  if (!metrics || !Array.isArray(metrics)) return [];

  // Show all accuracy metrics including semantic_accuracy
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

export default function AccuracyView({ response, data, onBack }) {
  console.log('=== AccuracyView Render ===');
  console.log('AccuracyView received response:', response);
  console.log('AccuracyView received data:', data);

  // Handle both single evaluation (response) and aggregated data (data)
  let metrics = [];

  if (response) {
    // Called from ViewReport with single evaluation's category data
    console.log('Using response.metrics:', response.metrics);
    metrics = response?.metrics || [];
  } else if (data) {
    // Called from Dashboard with aggregated data
    console.log('Using data - category_scores:', data.category_scores);
    console.log('Using data - evaluations:', data.evaluations);

    // Extract accuracy metrics from all evaluations
    const accuracyCategory = data.category_scores?.find(c => c.category === 'accuracy');
    console.log('Found accuracy category:', accuracyCategory);

    if (accuracyCategory) {
      metrics = accuracyCategory.metrics || [];
    } else {
      // Fallback: aggregate metrics from all evaluations
      const allMetrics = [];
      data.evaluations?.forEach(evaluation => {
        const accCategory = evaluation.category_scores?.find(c => c.category === 'accuracy');
        if (accCategory?.metrics) {
          allMetrics.push(...accCategory.metrics);
        }
      });
      metrics = allMetrics;
      console.log('Aggregated metrics from evaluations:', metrics);
    }
  }

  console.log('Final metrics array:', metrics);
  console.log('Metrics length:', metrics?.length);

  if (!metrics || metrics.length === 0) {
    console.warn('No metrics available - showing empty state');
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
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No accuracy metrics available</p>
          <p className="text-gray-600 text-xs mt-1">
            {response ? 'Response has no metrics' : data ? 'Data has no accuracy category' : 'No data provided'}
          </p>
        </div>
      </div>
    );
  }

  console.log('Rendering AccuracyView with', metrics.length, 'metrics');

  const [activeTab] = useState("accuracy");

  const detailedMetrics = transformAccuracyMetrics(metrics);

  /* -------------------------
     DERIVED VALUES
  ------------------------- */

  const passedCount = metrics.filter((m) => m.status === "passed").length;
  const failedCount = metrics.filter((m) => m.status === "failed").length;

  // Use category-level score if available, otherwise calculate from metrics
  let score = 0;

  if (response?.score !== undefined) {
    // Single evaluation: use category score
    // Check if score is already in 0-100 range or 0-1 range
    score = response.score > 1 ? Math.round(response.score) : Math.round(response.score * 100);
  } else if (data?.category_scores) {
    // Aggregated data: use category score
    const accuracyCategory = data.category_scores.find(c => c.category === 'accuracy');
    if (accuracyCategory?.average_score !== undefined) {
      // Check if average_score is already in 0-100 range or 0-1 range
      score = accuracyCategory.average_score > 1
        ? Math.round(accuracyCategory.average_score)
        : Math.round(accuracyCategory.average_score * 100);
    }
  } else {
    // Fallback: calculate average from metrics
    const numericScores = metrics
      .map((m) => m.score)
      .filter((s) => typeof s === "number");

    score = numericScores.length > 0
      ? Math.round((numericScores.reduce((a, b) => a + b, 0) / numericScores.length) * 100)
      : 0;
  }

  // Determine status based on score and failed metrics
  let cardStatus = "success";
  if (score < 70 || failedCount > 1) {
    cardStatus = "critical";
  } else if (score < 85 || failedCount > 0) {
    cardStatus = "warning";
  }

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
        status={cardStatus}
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
        <AccuracyBar response={{ metrics }} />
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