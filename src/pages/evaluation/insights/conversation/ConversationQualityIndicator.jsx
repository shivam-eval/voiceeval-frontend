import { CheckCircle } from "lucide-react";

const INDICATORS = [
  {
    label: "Grammar Quality",
    value: 100,
    threshold: 80,
  },
  {
    label: "Context Maintenance",
    value: 100,
    threshold: 85,
  },
  {
    label: "Information Extraction Accuracy",
    value: 100,
    threshold: 90,
  },
  {
    label: "Clarification Request Rate",
    value: 0,
    threshold: 0,
  },
];

const IndicatorRow = ({ label, value, threshold }) => {
  const isPassed = value >= threshold;

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <CheckCircle className="text-teal-400" size={16} />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-teal-400 font-semibold">
          {value}%
        </span>
      </div>

      {/* Bar */}
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-400 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>

      {/* Threshold */}
      {threshold > 0 && (
        <div className="text-xs text-gray-400">
          Threshold: {threshold}%
        </div>
      )}
    </div>
  );
};

const ConversationQualityIndicators = () => {
  return (
    <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INDICATORS.map((item, idx) => (
          <IndicatorRow key={idx} {...item} />
        ))}
      </div>
    </div>
  );
};

export default ConversationQualityIndicators;
