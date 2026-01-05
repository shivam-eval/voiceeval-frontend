import { Target, ArrowLeft, Volume2, Mic, Music, Activity, Headphones } from "lucide-react";
import MetricCard from "../accuracy/MetricCard";
import DetailedMetric from "../../../../components/DetailedMetric";
import CriticalAlert from "../../../../components/CriticAlert";

/* =========================
   MOCK API RESPONSE
========================= */
const response = {
  category: "audio_quality",
  overall_score: 0.9,
  passed: true,
  metrics: [
    {
      name: "audio_technical_quality",
      score: 1,
      status: "passed",
      threshold: 0.8,
      execution_time_ms: 120,
    },
    {
      name: "average_pitch",
      score: 1,
      status: "passed",
      threshold: 0.7,
      execution_time_ms: 45,
    },
    {
      name: "voice_quality_index",
      score: 1,
      status: "passed",
      threshold: 0.75,
      execution_time_ms: 80,
    },
    {
      name: "tts_naturalness",
      score: 1,
      status: "passed",
      threshold: 0.8,
      execution_time_ms: 150,
    },
  ],
};

const humanizeMetricName = (name) => {
  const map = {
    audio_technical_quality: "Audio Technical Quality",
    average_pitch: "Average Pitch",
    voice_quality_index: "Voice Quality Index",
    tts_naturalness: "TTS Naturalness",
  };
  return map[name] || name;
};

const transformAudioMetrics = (response) =>
  response.metrics.map((m) => ({
    label: humanizeMetricName(m.name),
    value: m.execution_time_ms ? m.execution_time_ms : (m.score ? Math.round(m.score * 100) : (m.status === 'passed' ? 100 : 0)),
    unit: m.execution_time_ms ? "ms" : "%",
    threshold: m.execution_time_ms ? m.threshold * 1000 : (m.threshold ? Math.round(m.threshold * 100) : 80),
    time: m.execution_time_ms ? `${m.execution_time_ms.toFixed(2)}ms` : '0ms',
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
      {status === 'passed' ? 'CLEAR' : 'DISTORTED'}
    </div>
  </div>
);

/* =========================
   Component
========================= */
const AudioOverview = ({ onBack }) => {
  const detailedMetrics = transformAudioMetrics(response);
  const score = Math.round(response.overall_score * 100);
  const passedCount = response.metrics.filter((m) => m.status === "passed").length;
  const failedCount = response.metrics.length - passedCount;
  const isCritical = !response.passed;

  const getMetricData = (name) => {
    const m = response.metrics.find(m => m.name === name);
    if (!m) return { value: 0, unit: "%", status: "passed" };
    return {
      value: m.execution_time_ms ? m.execution_time_ms : Math.round(m.score * 100),
      unit: m.execution_time_ms ? "ms" : "%",
      status: m.status
    };
  };

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
        icon={Volume2}
        title="Audio Quality"
        description="Analyzes technical audio properties and synthesis naturalness"
        value={score}
        passed={passedCount}
        failed={failedCount}
        status={isCritical ? "critical" : "success"}
      />

      {/* Critical Alert */}
      {isCritical && (
        <CriticalAlert
          title="Critical: Audio Degradation"
          description="Technical quality or TTS naturalness has fallen below acceptable thresholds."
        />
      )}

      {/* ================= QUICK STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Technical Quality" 
          {...getMetricData('audio_technical_quality')}
          icon={Mic}
        />
        <StatCard 
          label="Pitch Stability" 
          {...getMetricData('average_pitch')}
          icon={Music}
        />
        <StatCard 
          label="Voice Quality" 
          {...getMetricData('voice_quality_index')}
          icon={Activity}
        />
        <StatCard 
          label="Naturalness" 
          {...getMetricData('tts_naturalness')}
          icon={Headphones}
        />
      </div>

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

export default AudioOverview;
