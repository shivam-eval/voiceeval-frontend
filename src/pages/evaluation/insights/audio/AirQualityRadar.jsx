import { Volume2 } from "lucide-react";
import DetailedMetric from "../../../../components/DetailedMetric";

/* =========================
   Helpers
========================= */
const humanizeMetricName = (name) => {
  const map = {
    word_error_rate: "Word Error Rate",
    audio_technical_quality: "Audio Technical Quality",
    tts_naturalness: "TTS Naturalness",
    average_pitch: "Average Pitch",
    voice_quality_index: "Voice Quality Index"
  };
  return map[name] || name;
};

const formatTime = (ms) => {
  if (ms === null || ms === undefined || isNaN(ms)) return "N/A";
  return ms < 1 ? `${ms.toFixed(2)}ms` : `${ms.toFixed(2)}ms`;
};

/* =========================
   Audio Detailed Metrics
========================= */
const AudioDetailedMetrics = ({ response }) => {
  if (!response?.metrics) return null;

  const metrics = response.metrics.map((m) => ({
    label: humanizeMetricName(m.name),
    value: m.score !== null && m.score !== undefined
      ? Math.round(m.score * 100)
      : 100, // Default to 100 for null scores (passed metrics)
    threshold: m.threshold ? m.threshold * 100 : 100,
    time: formatTime(m.details?.execution_time_ms),
    unit: "%",
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Volume2 className="text-teal-400" size={20} />
        <h3 className="text-lg font-semibold text-white">
          Detailed Metrics
        </h3>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <DetailedMetric
            key={idx}
            label={metric.label}
            value={metric.value}
            threshold={metric.threshold}
            time={metric.time}
            unit={metric.unit}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioDetailedMetrics;
