import { useState } from "react";
import {
  Target,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";

import AccuracyBar from "./AccuracyBar";
import VoiceAccuracySteps from "./VoiceAccuracySteps";
import MetricCard from "./MetricCard";
import DetailedMetric from "../../../../components/DetailedMetric";
import CriticalAlert from "../../../../components/CriticAlert";

/* =========================
   MOCK API RESPONSE
========================= */
const response = {
  category: "accuracy",
  overall_score: 0.74,
  passed: false,
  metrics: [
    {
      metric_name: "semantic_accuracy_rate",
      passed: true,
      value: 0.92,
      threshold: 0.8,
    },
    {
      metric_name: "keyword_match_accuracy",
      passed: true,
      value: 0.90,
      threshold: 0.85,
    },
    {
      metric_name: "semantic_similarity",
      passed: false,
      value: 0.68,
      threshold: 0.75,
    },
    {
      metric_name: "intent_classification_accuracy",
      passed: false,
      value: 0.72,
      threshold: 0.85,
    },
  ],
};

/* =========================
   TRANSFORMER
========================= */
const transformAccuracyMetrics = (response) =>
  response.metrics.map((m) => ({
    label: humanizeMetricName(m.metric_name),
    value: Math.round(m.value * 100),
    threshold: Math.round(m.threshold * 100),
    time: m.execution_time_ms ? `${m.execution_time_ms.toFixed(2)}ms` : '0ms',
    status: m.passed ? "passed" : "failed",
  }));

const humanizeMetricName = (name) => {
  const map = {
    semantic_accuracy_rate: "Semantic Accuracy Rate",
    keyword_match_accuracy: "Keyword Match Accuracy",
    semantic_similarity: "Semantic Similarity",
    intent_classification_accuracy: "Intent Classification Accuracy",
  };
  return map[name] || name;
};

export default function AgentDashboard({ onBack }) {
  const [activeTab] = useState("accuracy");

  /* =========================
     DERIVED DATA
  ========================= */
  const detailedMetrics = transformAccuracyMetrics(response);

  const passedCount = response.metrics.filter((m) => m.passed).length;
  const failedCount = response.metrics.length - passedCount;

  const score = Math.round(response.overall_score * 100);
  const isCritical = !response.passed;

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

        {/* =========================
           HEADER METRIC CARD
        ========================= */}
        <MetricCard
          icon={Target}
          title="Accuracy"
          value={score}
          passed={passedCount}
          failed={failedCount}
          status={isCritical ? "critical" : "success"}
        />

        {/* =========================
           CRITICAL ALERT (ONLY IF FAILED)
        ========================= */}
        {isCritical && (
          <CriticalAlert
            title="Critical: Zero Intent Understanding"
            description="The agent is matching keywords without semantic comprehension."
            metrics={[
              { icon: TrendingUp, label: "Semantic Similarity", value: "0%" },
              { icon: Target, label: "Intent Classification", value: "0%" },
            ]}
          />
        )}

        {/* =========================
           VISUAL SECTIONS
        ========================= */}
        <div className="mt-6 grid grid-cols-1 gap-6">
          <AccuracyBar  response={response}/>
          {/* <VoiceAccuracySteps /> */}
        </div>

        {/* =========================
           DETAILED METRICS
        ========================= */}
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
