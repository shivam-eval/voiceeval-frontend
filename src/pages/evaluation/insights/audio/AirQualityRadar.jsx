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
  };
  return map[name] || name;
};

const formatTime = (ms) =>
  ms < 1 ? `${ms.toFixed(2)}ms` : `${ms.toFixed(2)}ms`;

/* =========================
   Audio Detailed Metrics
========================= */
const AudioDetailedMetrics = ({ response }) => {
  if (!response?.metrics) return null;

  const metrics = response.metrics.map((m) => ({
    label: humanizeMetricName(m.metric_name),
    value: Math.round(m.value * 100),
    threshold: m.threshold ? m.threshold * 100 : 100,
    time: formatTime(m.execution_time_ms),
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
