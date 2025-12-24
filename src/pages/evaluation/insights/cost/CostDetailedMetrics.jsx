import { DollarSign } from "lucide-react";
import DetailedMetric from "../../../../components/DetailedMetric";
/* =========================
   Dummy Cost Metrics
========================= */
const DUMMY_COST_METRICS = [
  {
    label: "LLM Token Usage",
    value: 0,
    threshold: 1,
    time: "0.02ms",
    status: "passed",
    displayValue: "$0.00",
    details: [
      { label: "Total Cost USD", value: "$0.00" },
      { label: "Total Input Tokens", value: "0" },
      { label: "Total Output Tokens", value: "0" },
      { label: "Total Tokens", value: "0" },
    ],
  },
  {
    label: "STT Cost",
    value: 0,
    threshold: 1,
    time: "0.02ms",
    status: "passed",
    displayValue: "$0.00",
  },
  {
    label: "TTS Cost",
    value: 100,
    threshold: 1,
    time: "0.02ms",
    status: "passed",
    displayValue: "$0.10",
  },
  {
    label: "Total Conversation Cost",
    value: 100,
    threshold: 1,
    time: "0.03ms",
    status: "passed",
    displayValue: "$0.10",
    details: [
      { label: "Total Cost USD", value: "$0.10" },
      { label: "LLM Cost USD", value: "$0.00" },
      { label: "STT Cost USD", value: "$0.00" },
      { label: "TTS Cost USD", value: "$0.10" },
    ],
  },
];

const CostDetailedMetrics = () => {
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <DollarSign className="text-teal-400" size={20} />
        <h3 className="text-lg font-semibold text-white">
          Detailed Cost Metrics
        </h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DUMMY_COST_METRICS.map((metric, idx) => (
          <DetailedMetric
            key={idx}
            label={metric.label}
            value={metric.value}
            threshold={metric.threshold}
            time={metric.time}
            status={metric.status}
          >
            {/* Value override */}
            <div className="text-teal-400 text-3xl font-bold">
              {metric.displayValue}
            </div>

            {/* Details (optional) */}
            {metric.details && (
              <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-gray-400">
                {metric.details.map((item, i) => (
                  <div key={i} className="flex justify-between col-span-2 lg:col-span-1">
                    <span>{item.label}</span>
                    <span className="text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </DetailedMetric>
        ))}
      </div>
    </div>
  );
};

export default CostDetailedMetrics;
