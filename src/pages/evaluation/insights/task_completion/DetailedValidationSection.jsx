import DetailedMetric from "../../../../components/DetailedMetric";
import { ShieldCheck } from "lucide-react";

const DUMMY_DETAILED_METRICS = [
  {
    label: "Task Completion Rate",
    value: 10,
    threshold: 90,
    time: "2353.21ms",
    status: "failed",
  },
  {
    label: "Sequential Task Accuracy",
    value: 100,
    threshold: 85,
    time: "0.04ms",
    status: "passed",
  },
  {
    label: "Step Validation Pass Rate",
    value: 100,
    threshold: 80,
    time: "0.01ms",
    status: "passed",
  },
  {
    label: "Flow Path Coverage",
    value: 100,
    threshold: 80,
    time: "0.01ms",
    status: "passed",
  },
];

const DetailedValidationSection = () => {
  return (
    <div className="flex flex-col gap-6">

      {/* ================= Header ================= */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-teal-400" size={20} />
        <h3 className="text-lg font-semibold text-white">
          Detailed Validation
        </h3>
      </div>

      {/* ================= Grid ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DUMMY_DETAILED_METRICS.map((metric, idx) => (
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
