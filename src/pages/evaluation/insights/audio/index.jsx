import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import { Volume2, Mic, Sliders, Sparkles } from "lucide-react";

import AudioDetailedMetrics from "./AudioDetailed";
import AudioQualityRadar from "./AirQualityRadar";
import VoiceQualityConsistency from "./VoiceQuality";

/* =========================
   Helpers
========================= */

const response={
  "category": "audio_quality",
  "overall_score": 0.6277777777777778,
  "passed": true,
  "metrics": [
    {
      "metric_name": "word_error_rate",
      "category": "audio_quality",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 5.354881286621094,
      "value": 0.0,
      "threshold": 0.1
    },
    {
      "metric_name": "audio_technical_quality",
      "category": "audio_quality",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 0.011444091796875,
      "value": 1.0
    },
    {
      "metric_name": "tts_naturalness",
      "category": "audio_quality",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 7256.755113601685,
      "value": 0.8833333333333333,
      "threshold": 0.7
    }
  ]
}
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
const AudioOverview = () => {
  const score = Math.round(response.overall_score * 100);

  const passedCount = response.metrics.filter((m) => m.passed).length;
  const failedCount = response.metrics.length - passedCount;

  const statCards = transformStatCards(response);

  return (
    <div className="flex flex-col gap-8">

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

      {/* ================= Consistency Bars ================= */}
      <VoiceQualityConsistency response={response} />

      {/* ================= Detailed Metrics ================= */}
      <AudioDetailedMetrics response={response} />

    </div>
  );
};

export default AudioOverview;
