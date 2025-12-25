import { User } from "lucide-react";
import DetailedMetric from "../../../../components/DetailedMetric"

/* =========================
   Dummy Persona Metrics
========================= */
const PERSONA_METRICS = [
  {
    label: "Persona Consistency",
    value: 100,
    threshold: 80,
    time: "0.02ms",
    status: "passed",
  },
  {
    label: "Tone Appropriateness",
    value: 100,
    threshold: 75,
    time: "0.01ms",
    status: "passed",
  },
  {
    label: "Region Appropriate Language",
    value: 100,
    threshold: 80,
    time: "0.01ms",
    status: "passed",
  },
  {
    label: "Behavior Trait Alignment",
    value: 100,
    threshold: 80,
    time: "0.01ms",
    status: "passed",
  },
];

const PersonaDetailedMetrics = () => {
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <User className="text-teal-400" size={20} />
        <h3 className="text-lg font-semibold text-white">
          Detailed Metrics
        </h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PERSONA_METRICS.map((metric, idx) => (
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
  );
};

export default PersonaDetailedMetrics;
