import { DollarSign } from "lucide-react";
import DetailedMetric from "../../../../components/DetailedMetric";

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  // Use the name directly if it's already humanized (contains spaces and starts with uppercase)
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
  
  // No hardcoded map - just transform the snake_case name to Title Case
  return String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const formatUSD = (v) => `$${(v ?? 0).toFixed(4)}`;

const extractPrimaryCost = (metric) => {
  if (!metric?.details) return null;

  if (metric.name === "stt_cost") return metric.details.stt_cost_usd;
  if (metric.name === "tts_cost") return metric.details.tts_cost_usd;
  if (metric.name === "total_conversation_cost")
    return metric.details.total_cost_usd;

  return null;
};

const CostDetailedMetrics = ({ metrics = [] }) => {
  if (!metrics.length) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DollarSign className="text-teal-400" size={20} />
        <h3 className="text-lg font-semibold text-white">
          Detailed Cost Metrics
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.map((metric, idx) => {
          const primaryValue = extractPrimaryCost(metric);
          const details = metric.details ?? {};

          return (
            <DetailedMetric
              key={idx}
              label={humanizeMetricName(metric.name)}
              status={metric.status}
              value={primaryValue !== null ? formatUSD(primaryValue) : "—"}
              unit=""                 // 🔑 prevents "%"
              threshold={null}        // 🔑 removes threshold
              showProgress={false}    // 🔑 removes bar (if supported)
            >
              {/* Extra breakdown */}
              {Object.entries(details)
                .filter(([k]) => k.endsWith("_usd") && k !== "total_cost_usd")
                .length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-gray-400">
                  {Object.entries(details)
                    .filter(([k]) => k.endsWith("_usd"))
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between col-span-2"
                      >
                        <span className="capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-white">
                          {formatUSD(value)}
                        </span>
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
