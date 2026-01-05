
import { Target, ArrowLeft, MicOff, Clock, AlertCircle } from "lucide-react";
import MetricCard from "../accuracy/MetricCard";
import DetailedMetric from "../../../../components/DetailedMetric";
import CriticalAlert from "../../../../components/CriticAlert";

/* =========================
   MOCK API RESPONSE
========================= */
const response = {
  category: "endpointing",
  overall_score: 0.539,
  passed: false,
  metrics: [
    {
      name: "interruption_count",
      score: 1,
      status: "passed",
      threshold: 0.8,
      execution_time_ms: 0.015,
      details: {
        interruption_count: 0,
        total_turns: 12,
      },
    },
    {
      name: "pause_detection",
      score: 0.618,
      status: "failed",
      threshold: 0.7,
      execution_time_ms: 0.022,
      details: {
        total_pauses: 15,
        long_pauses: 6,
        average_pause_ms: 1800,
        max_pause_ms: 5200,
      },
    },
    {
      name: "stop_time_after_user_interruption",
      score: 1,
      status: "passed",
      threshold: 0.9,
      execution_time_ms: 0.012,
    },
  ],
};

const humanizeMetricName = (name) => {
  const map = {
    interruption_count: "Interruption Count",
    pause_detection: "Pause Detection",
    stop_time_after_user_interruption: "Stop Time After Interruption",
  };
  return map[name] || name;
};

const transformEndpointingMetrics = (response) =>
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

const SilenceAnalysis = ({ totalPauses }) => {
  const segments = Array.from({ length: 30 }, (_, i) =>
    i % 5 === 0 || i % 7 === 0 ? "silence" : "speech"
  );
  return (
    <div className="rounded-xl border border-gray-800 p-6 bg-[#0b0f1a] space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="text-teal-400" size={18} />
          <h3 className="text-lg font-semibold text-white">Silence Analysis</h3>
        </div>
        <span className="text-xs text-gray-400">{totalPauses} pauses detected</span>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Conversation Timeline
        </div>
        <div className="relative w-full h-12 rounded-lg overflow-hidden bg-gray-900/50 flex">
          {segments.map((t, idx) => (
            <div
              key={idx}
              className={`flex-1 transition-all duration-300 ${
                t === "speech"
                  ? "bg-teal-500/40 hover:bg-teal-500/60"
                  : "bg-red-500/40 hover:bg-red-500/60"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-teal-500/40" />
          <span className="text-xs text-gray-400">Speech</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/40" />
          <span className="text-xs text-gray-400">Silence</span>
        </div>
      </div>
    </div>
  );
};

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
      {status === 'passed' ? 'STABLE' : 'DELAYED'}
    </div>
  </div>
);

/* =========================
   Component
========================= */
const EndpointingOverview = ({ onBack }) => {
  const detailedMetrics = transformEndpointingMetrics(response);
  const score = Math.round(response.overall_score * 100);
  const passedCount = response.metrics.filter((m) => m.status === "passed").length;
  const failedCount = response.metrics.length - passedCount;
  const isCritical = !response.passed;

  const pdMetric = response.metrics.find((m) => m.name === "pause_detection");

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

      {/* ================= HEADER CARD ================= */}
      <MetricCard
        icon={MicOff}
        title="Endpointing"
        description="Measures turn-taking and silence detection accuracy"
        value={score}
        passed={passedCount}
        failed={failedCount}
        status={isCritical ? "critical" : "success"}
      />

      {/* ================= CRITICAL ALERT ================= */}
      {isCritical && (
        <CriticalAlert
          title="Critical: Excessive Silence Detected"
          description="Average pause duration significantly exceeds the threshold, leading to unnatural conversation flow."
          metrics={[
            {
              icon: AlertCircle,
              label: "Long Pauses",
              value: pdMetric?.details?.long_pauses || 0,
            },
            {
              icon: Clock,
              label: "Avg Pause",
              value: `${pdMetric?.details?.average_pause_ms || 0}ms`,
            },
          ]}
        />
      )}

      {/* ================= QUICK STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Pauses"
          value={pdMetric?.details?.total_pauses || 0}
          icon={MicOff}
          status={pdMetric?.status}
        />
        <StatCard
          label="Long Pauses"
          value={pdMetric?.details?.long_pauses || 0}
          icon={AlertCircle}
          status={pdMetric?.status}
        />
        <StatCard
          label="Avg Duration"
          value={pdMetric?.details?.average_pause_ms || 0}
          unit="ms"
          icon={Clock}
          status={pdMetric?.status}
        />
        <StatCard
          label="Max Pause"
          value={pdMetric?.details?.max_pause_ms || 0}
          unit="ms"
          icon={Target}
          status={pdMetric?.status}
        />
      </div>

      {/* ================= SILENCE ANALYSIS ================= */}
      <SilenceAnalysis totalPauses={pdMetric?.details?.total_pauses || 0} />

      {/* ================= DETAILED METRICS ================= */}
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
};

export default EndpointingOverview;
