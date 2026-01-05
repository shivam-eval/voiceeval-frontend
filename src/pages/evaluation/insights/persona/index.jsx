import {
  User,
  MessageSquare,
  Globe,
  Heart,
  ShieldCheck,
  ArrowLeft,
  Smile,
  Shield,
  Zap,
} from "lucide-react";

import MetricCard from "../accuracy/MetricCard";
import DetailedMetric from "../../../../components/DetailedMetric";
import CriticalAlert from "../../../../components/CriticAlert";

/* =========================
   API / Evaluation Response
========================= */

const response = {
  category: "persona",
  overall_score: 0.89,
  passed: true,
  metrics: [
    {
      name: "persona_consistency",
      score: 0.91,
      status: "passed",
      threshold: 0.8,
      execution_time_ms: 0.02,
    },
    {
      name: "tone_appropriateness",
      score: 0.84,
      status: "passed",
      threshold: 0.75,
      execution_time_ms: 0.01,
    },
    {
      name: "region_appropriate_language",
      score: 0.88,
      status: "passed",
      threshold: 0.8,
      execution_time_ms: 0.01,
    },
    {
      name: "behavior_trait_alignment",
      score: 0.93,
      status: "passed",
      threshold: 0.8,
      execution_time_ms: 0.01,
    },
  ],
};

/* =========================
   Helpers
========================= */

const humanizeMetricName = (name) => {
  const map = {
    persona_consistency: "Persona Consistency",
    tone_appropriateness: "Tone Appropriateness",
    region_appropriate_language: "Regional Language",
    behavior_trait_alignment: "Behavior Trait Alignment",
  };
  return map[name] || name;
};

const transformPersonaMetrics = (response) =>
  response.metrics.map((m) => ({
    label: humanizeMetricName(m.name),
    value: m.execution_time_ms ? m.execution_time_ms : (m.score ? Math.round(m.score * 100) : (m.status === "passed" ? 100 : 0)),
    unit: m.execution_time_ms ? "ms" : "%",
    threshold: m.execution_time_ms ? m.threshold * 1000 : (m.threshold ? Math.round(m.threshold * 100) : 80),
    time: m.execution_time_ms ? `${m.execution_time_ms.toFixed(2)}ms` : "0ms",
    status: m.status === "passed" ? "passed" : "failed",
  }));

/* =========================
   Sub-components
========================= */
const StatCard = ({ label, value, unit = "", icon: Icon, status = "passed" }) => (
  <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5 flex items-center justify-between group hover:border-teal-500/30 transition-all">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${status === 'passed' ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-gray-400 text-sm">{label}</div>
        <div className="text-2xl font-bold text-white">
          {value}
          <span className="text-sm ml-1 text-gray-500 font-normal">{unit}</span>
        </div>
      </div>
    </div>
    <div className={`text-xs font-semibold px-2 py-1 rounded-full border ${
      status === 'passed' ? 'border-teal-500/30 text-teal-400 bg-teal-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5'
    }`}>
      {status === 'passed' ? 'STABLE' : 'DEVIATED'}
    </div>
  </div>
);

/* =========================
   Component
========================= */

const PersonaOverview = ({ data, onBack }) => {
  // Use data from prop if available, otherwise fallback to mock response
  const metricsSource = data?.metricResults 
    ? data.metricResults.filter(m => m.category === 'persona')
    : response.metrics;

  const score = data?.categoryScores 
    ? data.categoryScores.find(c => c.category === 'persona')?.score || 0
    : Math.round(response.overall_score * 100);

  const passedCount = metricsSource.filter((m) => m.status === "passed").length;
  const failedCount = metricsSource.length - passedCount;
  const isCritical = score < 80;

  const detailedMetrics = metricsSource.map((m) => ({
    label: humanizeMetricName(m.name),
    value: m.execution_time_ms ? m.execution_time_ms : (m.score ? Math.round(m.score * 100) : (m.status === "passed" ? 100 : 0)),
    unit: m.execution_time_ms ? "ms" : "%",
    threshold: m.threshold ? (m.execution_time_ms ? m.threshold * 1000 : Math.round(m.threshold * 100)) : 80,
    time: m.execution_time_ms ? `${m.execution_time_ms.toFixed(2)}ms` : "0ms",
    status: m.status === "passed" ? "passed" : "failed",
  }));

  const getMetricData = (name) => {
    const m = metricsSource.find(m => m.name === name);
    if (!m) return { value: 0, unit: "%", status: "passed" };
    return {
      value: m.execution_time_ms ? m.execution_time_ms : Math.round((m.score || 0) * 100),
      unit: m.execution_time_ms ? "ms" : "%",
      status: m.status
    };
  };

  const failedMetricsForAlert = detailedMetrics
    .filter(m => m.status === 'failed')
    .map(m => ({
      icon: User,
      label: m.label,
      value: `${m.value}${m.unit}`
    }));

  return (
    <div className="flex flex-col gap-8">
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

      {/* Header */}
      <MetricCard
        icon={User}
        title="Persona"
        description="Evaluates persona consistency and tone appropriateness"
        value={score}
        passed={passedCount}
        failed={failedCount}
        status={isCritical ? "critical" : "success"}
      />

      {/* Critical Alert (ONLY IF FAILED) */}
      {isCritical && (
        <CriticalAlert
          title="Critical: Persona Deviation Detected"
          description="The agent failed to maintain the assigned persona or used inappropriate tone in some responses."
          metrics={failedMetricsForAlert}
        />
      )}

      {/* ================= QUICK STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Consistency" 
          {...getMetricData('persona_consistency')}
          icon={User}
        />
        <StatCard 
          label="Tone" 
          {...getMetricData('tone_appropriateness')}
          icon={Smile}
        />
        <StatCard 
          label="Alignment" 
          {...getMetricData('behavior_trait_alignment')}
          icon={Zap}
        />
        <StatCard 
          label="Compliance" 
          {...getMetricData('region_appropriate_language')}
          icon={Shield}
        />
      </div>

      {/* Persona Stability Panel */}
      <div className="bg-[#0b1f26] border border-teal-500/30 rounded-xl p-6 flex items-start gap-4">
        <div className="p-3 rounded-lg bg-teal-500/20 text-teal-400">
          <ShieldCheck size={28} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-teal-300 mb-1">
            Persona Stable & Consistent
          </h3>
          <p className="text-teal-200/80">
            The agent maintained consistent personality, tone, and cultural
            appropriateness throughout the entire conversation. Brand safety
            is assured.
          </p>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-teal-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-teal-400 rounded-full" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white">Detailed Metrics</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {detailedMetrics.map((metric, idx) => (
            <DetailedMetric
              key={idx}
              label={metric.label}
              value={metric.value}
              threshold={metric.threshold}
              time={metric.time}
              status={metric.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonaOverview;
