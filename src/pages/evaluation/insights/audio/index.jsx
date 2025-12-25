import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import {
  Volume2,
  Mic,
  Sliders,
  Sparkles,
} from "lucide-react";
import AudioDetailedMetrics from "./AudioDetailed";
import VoiceQualityConsistency from "./VoiceQuality";

/* =========================
   Dummy Audio Data
========================= */
const DUMMY_AUDIO_DATA = {
  header: {
    score: 100,
    passed: 3,
    failed: 0,
  },
  metrics: [
    {
      icon: Mic,
      title: "Word Error Rate",
      value: "0.0",
      subtitle: "Excellent transcription accuracy",
      highlight: true,
    },
    {
      icon: Sliders,
      title: "Technical Quality",
      value: "100",
      subtitle: "Audio clarity and fidelity",
    },
    {
      icon: Sparkles,
      title: "TTS Naturalness",
      value: "88",
      subtitle: "Voice synthesis quality",
    },
  ],
};

/* =========================
   Audio Overview
========================= */
const AudioOverview = () => {
  return (
    <div className="flex flex-col gap-8">

      {/* ================= Header ================= */}
      <InsightHeaderCard
        icon={Volume2}
        title="Audio Quality"
        description="Evaluates audio clarity, WER, and TTS naturalness"
        score={DUMMY_AUDIO_DATA.header.score}
        passedCount={DUMMY_AUDIO_DATA.header.passed}
        failedCount={DUMMY_AUDIO_DATA.header.failed}
        theme="teal"
      />

      {/* ================= Stat Cards ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DUMMY_AUDIO_DATA.metrics.map((metric, idx) => (
          <StatCard
            key={idx}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            highlight={metric.highlight}
          />
        ))}
      </div>
<VoiceQualityConsistency/>
<AudioDetailedMetrics/>
    </div>
  );
};

export default AudioOverview;
