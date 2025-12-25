import { MessageSquare } from "lucide-react";
import DetailedMetric from "../../../../components/DetailedMetric";

const DUMMY_CONVERSATION_METRICS = [
  {
    label: "Grammar Quality",
    value: 100,
    threshold: 80,
    time: "7546.15ms",
    unit: "%",
  },
  {
    label: "Context Maintenance",
    value: 100,
    threshold: 85,
    time: "3906.08ms",
    unit: "%",
  },
  {
    label: "Information Extraction Accuracy",
    value: 100,
    threshold: 90,
    time: "0.02ms",
    unit: "%",
  },
  {
    label: "Clarification Request Rate",
    value: 0,
    threshold: 0,
    time: "0.04ms",
    unit: "%",
  },
];

const ConversationDetailedMetrics = () => {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DUMMY_CONVERSATION_METRICS.map((metric, idx) => (
          <DetailedMetric
            key={idx}
            label={metric.label}
            value={metric.value}
            threshold={metric.threshold}
            time={metric.time}
            unit={metric.unit}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationDetailedMetrics;
