import DetailedMetric from "../../../../components/DetailedMetric";
import { ShieldCheck } from "lucide-react";

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  const map = {
    task_completion_rate: "Task Completion Rate",
    sequential_task_accuracy: "Sequential Task Accuracy",
    step_validation_pass_rate: "Step Validation Pass Rate",
    flow_path_coverage: "Flow Path Coverage",
  };
  return map[name] || name;
};

/* =========================
   TRANSFORMER (SAFE)
========================= */

const transformDetailedMetrics = (response) => {
  if (!response || !Array.isArray(response.metrics)) return [];

  return response.metrics.map((m) => ({
    label: humanizeMetricName(m.name || m.metric_name),

    // metric score → percentage (safe for null / 0–1 / 0–100)
    value:
      typeof m.score === "number"
        ? Math.round(m.score <= 1 ? m.score * 100 : m.score)
        : "N/A",

    // task_completion metrics do not guarantee thresholds
    threshold: null,

    // execution time not available in this contract
    time: "—",

    // passed | failed | skipped
    status: m.status,
  }));
};

/* =========================
   COMPONENT
========================= */

const DetailedValidationSection = ({ response }) => {
  if (!response || !Array.isArray(response.metrics)) return null;

  const detailedMetrics = transformDetailedMetrics(response);

  if (!detailedMetrics.length) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-teal-400" size={20} />
        <h3 className="text-lg font-semibold text-white">
          Detailed Validation
        </h3>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {detailedMetrics.map((metric, idx) => (
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

export default DetailedValidationSection;
