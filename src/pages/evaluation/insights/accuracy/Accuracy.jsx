import { useState } from "react";
import {
  Target,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BarChart2,
} from "lucide-react";

import MetricCard from "./MetricCard";
import DetailedMetric from "../../../../components/DetailedMetric";
import CriticalAlert from "../../../../components/CriticAlert";

/* =========================
   MOCK API RESPONSE
========================= */
const response = {
  category: "accuracy",
  overall_score: 0.875,
  passed: false,
  metrics: [
    {
      name: "semantic_accuracy",
      score: 0.75,
      status: "failed",
      threshold: 0.8,
    },
    {
      name: "response_consistency",
      score: 1.0,
      status: "passed",
      threshold: 0.9,
    },
    {
      name: "intent_classification",
      score: 0.88,
      status: "passed",
      threshold: 0.85,
    },
  ],
};

/* =========================
   TRANSFORMER
========================= */
const humanizeMetricName = (name) => {
  const map = {
    semantic_accuracy: "Semantic Accuracy",
    response_consistency: "Response Consistency",
    intent_classification: "Intent Classification",
  };
  return map[name] || name;
};

const transformAccuracyMetrics = (response) =>
  response.metrics.map((m) => ({
    label: humanizeMetricName(m.name),
    value: m.score ? Math.round(m.score * 100) : (m.status === "passed" ? 100 : 0),
    threshold: m.threshold ? Math.round(m.threshold * 100) : 80,
    time: m.execution_time_ms ? `${m.execution_time_ms.toFixed(2)}ms` : "0ms",
    status: m.status === "passed" ? "passed" : "failed",
  }));

/* =========================
   Sub-components
========================= */

const StatCard = ({ label, value, status, icon: Icon }) => (
  <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5 flex items-center justify-between group hover:border-teal-500/30 transition-all">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${status === 'passed' ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-gray-400 text-sm">{label}</div>
        <div className="text-2xl font-bold text-white">{value}%</div>
      </div>
    </div>
    <div className={`text-xs font-semibold px-2 py-1 rounded-full border ${
      status === 'passed' ? 'border-teal-500/30 text-teal-400 bg-teal-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5'
    }`}>
      {status === 'passed' ? 'PASS' : 'FAIL'}
    </div>
  </div>
);

/* =========================
   Component
========================= */
export default function AgentDashboard({ onBack }) {
  const [activeTab] = useState("accuracy");

  /* =========================
     DERIVED DATA
  ========================= */
  const detailedMetrics = transformAccuracyMetrics(response);
  const passedCount = response.metrics.filter((m) => m.status === "passed").length;
  const failedCount = response.metrics.length - passedCount;
  const score = Math.round(response.overall_score * 100);
  const isCritical = !response.passed;

  return (
    <div className="space-y-8">
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
         VISUAL SECTIONS (REPLACED GRAPHS WITH CARDS)
      ========================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-teal-400" size={18} />
          <h3 className="text-lg font-semibold text-white">Execution Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {response.metrics.map((m, idx) => (
            <StatCard
              key={idx}
              label={humanizeMetricName(m.name)}
              value={m.score ? Math.round(m.score * 100) : (m.status === "passed" ? 100 : 0)}
              status={m.status}
              icon={m.status === 'passed' ? CheckCircle : AlertCircle}
            />
          ))}
        </div>
      </div>

      {/* =========================
         DETAILED METRICS
      ========================= */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-teal-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-teal-400 rounded-full" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Detailed Metrics</h2>
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
