import { Volume2 } from "lucide-react";
import DetailedMetric from "../../../../components/DetailedMetric";

/* =========================
   Dummy Audio Detailed Metrics
========================= */
const DUMMY_AUDIO_METRICS = [
  {
    label: "Word Error Rate",
    value: 0.0,          // %
    threshold: 10.0,     // %
    time: "5.35ms",
    unit: "%",
  },
  {
    label: "Audio Technical Quality",
    value: 100.0,        // %
    threshold: 100.0,    // %
    time: "0.01ms",
    unit: "%",
  },
  {
    label: "Tts Naturalness",
    value: 88.3,         // %
    threshold: 70.0,     // %
    time: "7256.76ms",
    unit: "%",
  },
];

/* =========================
   Audio Detailed Metrics
========================= */
const AudioDetailedMetrics = () => {
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
        {DUMMY_AUDIO_METRICS.map((metric, idx) => (
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
