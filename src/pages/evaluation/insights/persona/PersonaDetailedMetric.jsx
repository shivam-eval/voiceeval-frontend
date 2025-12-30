import { User } from "lucide-react";
import DetailedMetric from "../../../../components/DetailedMetric";

/* =========================
   Helpers
========================= */

const humanizeMetricName = (name) => {
  const map = {
    persona_consistency: "Persona Consistency",
    tone_appropriateness: "Tone Appropriateness",
    region_appropriate_language: "Region Appropriate Language",
    behavior_trait_alignment: "Behavior Trait Alignment",
  };
  return map[name] || name.replace(/_/g, " ");
};

const toPercent = (v) =>
  typeof v === "number" ? Math.round(v * 100) : 0;

/* =========================
   Component
========================= */

const PersonaDetailedMetrics = ({ metrics = [] }) => {
  if (!metrics.length) return null;

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
        {metrics.map((metric, idx) => (
          <DetailedMetric
            key={idx}
            label={humanizeMetricName(metric.name)}
            value={toPercent(metric.value)}
            threshold={
              typeof metric.threshold === "number"
                ? toPercent(metric.threshold)
                : undefined
            }
            time={
              typeof metric.execution_time_ms === "number"
                ? `${metric.execution_time_ms.toFixed(2)} ms`
                : undefined
            }
            status={metric.status}
          />
        ))}
      </div>
    </div>
  );
};

export default PersonaDetailedMetrics;
