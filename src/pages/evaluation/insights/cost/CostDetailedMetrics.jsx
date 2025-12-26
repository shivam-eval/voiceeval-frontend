import { DollarSign } from "lucide-react";
import DetailedMetric from "../../../../components/DetailedMetric";

/* =========================
   Helpers
========================= */

const humanizeMetricName = (name) => {
  const map = {
    llm_token_usage: "LLM Token Usage",
    stt_cost: "Speech-to-Text Cost",
    tts_cost: "Text-to-Speech Cost",
    total_conversation_cost: "Total Conversation Cost",
  };
  return map[name] || name;
};

<<<<<<< Updated upstream
const formatUSD = (value) => `$${Number(value).toFixed(4)}`;
=======
const formatValue = (value) => `${Number(value).toFixed(2)}`;
>>>>>>> Stashed changes

/* =========================
   Component
========================= */

const CostDetailedMetrics = ({ metrics = [] }) => {
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
        {metrics.map((metric, idx) => {
          const details = metric.details
            ? Object.entries(metric.details).map(([key, value]) => ({
                label: key.replace(/_/g, " "),
                value:
                  typeof value === "number" ? formatUSD(value) : value,
              }))
            : null;

          return (
            <DetailedMetric
              key={idx}
              label={humanizeMetricName(metric.metric_name)}
              value={metric.value}
              threshold={metric.threshold}
              time={metric.execution_time_ms}
              status={metric.passed ? "passed" : "failed"}
            >
              {/* Primary Value */}
              <div className="text-teal-400 text-3xl font-bold">
                {formatUSD(metric.value)}
              </div>

              {/* Optional Details */}
              {details && (
                <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-gray-400">
                  {details.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between col-span-2 lg:col-span-1"
                    >
                      <span className="capitalize">{item.label}</span>
                      <span className="text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </DetailedMetric>
          );
        })}
      </div>
    </div>
  );
};

export default CostDetailedMetrics;
