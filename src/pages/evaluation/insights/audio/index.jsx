import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import { Volume2, Mic, Sliders, Sparkles, ArrowLeft } from "lucide-react";

import AudioDetailedMetrics from "./AudioDetailed";
import AudioQualityRadar from "./AirQualityRadar";
import VoiceQualityConsistency from "./VoiceQuality";

/* =========================
   Helpers
========================= */

const humanizeMetricName = (name) => {
  const map = {
    word_error_rate: "Word Error Rate",
    audio_technical_quality: "Audio Technical Quality",
    tts_naturalness: "TTS Naturalness",
  };
  return map[name] || name;
};

const transformStatCards = (response) => {
  if (!response?.metrics) return [];

  return response.metrics.map((m) => ({
    title: humanizeMetricName(m.metric_name),
    value: Math.round(m.value * 100),
    passed: m.passed,
  }));
};

/* =========================
   Component
========================= */
const AudioOverview = ({ response={response},onBack }) => {
   console.log(response);
  const score = Math.round(response.score * 100);

  const passedCount = response.metrics.filter((m) => m.passed).length;
  const failedCount = response.metrics.length - passedCount;

  const statCards = transformStatCards(response);

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

      {/* ================= Header ================= */}
      <InsightHeaderCard
        icon={Volume2}
        title="Audio Quality"
        description="Evaluates audio clarity, WER, and TTS naturalness"
        score={score}
        passedCount={passedCount}
        failedCount={failedCount}
        theme="teal"
      />

      {/* ================= Stat Cards ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((metric, idx) => (
          <StatCard
            key={idx}
            icon={
              metric.title === "Word Error Rate"
                ? Mic
                : metric.title === "Audio Technical Quality"
                ? Sliders
                : Sparkles
            }
            title={metric.title}
            value={metric.value}
            subtitle={
              metric.passed ? "Within threshold" : "Below threshold"
            }
            highlight={!metric.passed}
          />
        ))}
      </div>

      {/* ================= Radar ================= */}
      <AudioQualityRadar response={response} />

      <AudioDetailedMetrics response={response} />

    </div>
  );
};

export default AudioOverview;
