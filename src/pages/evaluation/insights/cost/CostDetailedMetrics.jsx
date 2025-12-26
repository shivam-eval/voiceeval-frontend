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

const formatUSD = (value) => `${Number(value).toFixed(4)}`;

const DUMMY_COST_METRICS = [
  {
    label: "LLM Token Usage",
    value: 0.045,
    threshold: 0.05,
    time: "7546.15ms",
    unit: "",
    status: "passed",
  },
  {
    label: "Speech-to-Text Cost",
    value: 0.012,
    threshold: 0.02,
    time: "2134.12ms",
    unit: "",
    status: "passed",
  },
  {
    label: "Text-to-Speech Cost",
    value: 0.038,
    threshold: 0.04,
    time: "4123.45ms",
    unit: "",
    status: "passed",
  },
  {
    label: "Total Conversation Cost",
    value: 0.095,
    threshold: 0.1,
    time: "7546.15ms",
    unit: "",
    status: "passed",
  },
];

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
        {(metrics.length > 0 ? metrics : DUMMY_COST_METRICS).map((metric, idx) => {
          return (
            <DetailedMetric
              key={idx}
              label={metric.label || humanizeMetricName(metric.metric_name)}
              value={metric.value}
              threshold={metric.threshold}
              time={metric.time || metric.execution_time_ms}
              status={metric.status || (metric.passed ? "passed" : "failed")}
              unit={metric.unit !== undefined ? metric.unit : ""}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CostDetailedMetrics;
