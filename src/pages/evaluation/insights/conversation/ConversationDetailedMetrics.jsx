import { MessageSquare } from "lucide-react";
import DetailedMetric from "../../../../components/DetailedMetric";

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  // Use the name directly if it's already humanized (contains spaces and starts with uppercase)
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
  
  // No hardcoded map - just transform the snake_case name to Title Case
  return String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const normalizeScore = (score) => {
  if (score === null || score === undefined) return "N/A";
  if (typeof score !== "number") return "N/A";
  return score <= 1 ? `${Math.round(score * 100)}%` : `${Math.round(score)}%`;
};

/* =========================
   TRANSFORMER
========================= */

const transformMetrics = (response) => {
  if (!response || !Array.isArray(response.metrics)) return [];

  return response.metrics.map((m) => ({
    label: humanizeMetricName(m.name),
    value: normalizeScore(m.score),
    threshold: null,
    time: "—",
    unit: null,
    status: m.status,
  }));
};

/* =========================
   COMPONENT
========================= */

const ConversationDetailedMetrics = ({ response }) => {
  if (!response || !Array.isArray(response.metrics)) return null;

  const metrics = transformMetrics(response);

  if (!metrics.length) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="text-teal-400" size={20} />
        <h3 className="text-lg font-semibold text-white">
          Detailed Metrics
        </h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <DetailedMetric
            key={idx}
            label={metric.label}
            value={metric.value}
            threshold={metric.threshold}
            time={metric.time}
            unit={metric.unit}
            status={metric.status}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationDetailedMetrics;
