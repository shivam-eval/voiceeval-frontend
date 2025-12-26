import { Clock } from "lucide-react";
import DetailedMetric from "../../../../components/DetailedMetric";

/* =========================
   Dummy Latency Metrics
========================= */
const DUMMY_LATENCY_METRICS = [
  {
    label: "Response Latency",
    value: 1690,
    threshold: 2000,
    time: "0.79ms",
    unit: "ms",
  },
  {
    label: "Time To First Token",
    value: 413,
    threshold: 500,
    time: "0.06ms",
    unit: "ms",
  },
  {
    label: "Time To Complete Transcript",
    value: 939,
    threshold: 1000,
    time: "0.05ms",
    unit: "ms",
  },
  {
    label: "Total Duration",
    value: 62.8,
    threshold: 60,
    time: "0.01ms",
    unit: "s",
  },
];


const LatencyDetailedMetrics = () => {
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Clock className="text-teal-400" size={20} />
        <h3 className="text-lg font-semibold text-white">
          Detailed Metrics
        </h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DUMMY_LATENCY_METRICS.map((metric, idx) => (
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

export default LatencyDetailedMetrics;
