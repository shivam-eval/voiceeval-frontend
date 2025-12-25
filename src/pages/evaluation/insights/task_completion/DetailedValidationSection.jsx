import DetailedMetric from "../../../../components/DetailedMetric";
import { ShieldCheck } from "lucide-react";

/* =========================
   Helpers
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

const transformDetailedMetrics = (response) => {
  if (!response?.metrics) return [];

  return response.metrics.map((m) => ({
    label: humanizeMetricName(m.metric_name),
    value: Math.round(m.value * 100),
    threshold: m.threshold
      ? Math.round(m.threshold * 100)
      : 80, // fallback for flow_path_coverage
    time: `${m.execution_time_ms.toFixed(2)}ms`,
    status: m.passed ? "passed" : "failed",
  }));
};

/* =========================
   Component
========================= */
const DetailedValidationSection = ({ response }) => {
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

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
