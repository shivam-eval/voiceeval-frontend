import { CheckCircle, XCircle } from "lucide-react";

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  const map = {
    grammar_quality: "Grammar Quality",
    context_maintenance: "Context Maintenance",
    clarification_request_rate: "Clarification Request Rate",
    information_extraction_accuracy: "Information Extraction Accuracy",
  };
  return map[name] || name;
};

const normalizeScore = (score) => {
  if (typeof score !== "number") return null;
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
};

/* =========================
   ROW
========================= */

const IndicatorRow = ({ label, value, status }) => {
  const isFailed = status === "failed";
  const displayValue = value !== null ? `${value}%` : "N/A";

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          {isFailed ? (
            <XCircle className="text-red-500" size={16} />
          ) : (
            <CheckCircle className="text-teal-400" size={16} />
          )}
          <span className="font-medium">{label}</span>
        </div>
        <span
          className={`font-semibold ${
            isFailed ? "text-red-400" : "text-teal-400"
          }`}
        >
          {displayValue}
        </span>
      </div>

      {/* Bar */}
      {value !== null && (
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              isFailed ? "bg-red-500" : "bg-teal-400"
            }`}
            style={{ width: `${value}%` }}
          />
        </div>
      )}
    </div>
  );
};

/* =========================
   COMPONENT
========================= */

const ConversationQualityIndicators = ({ response }) => {
  if (!response || !Array.isArray(response.metrics)) return null;

  const indicators = response.metrics.map((m) => ({
    label: humanizeMetricName(m.name),
    value: normalizeScore(m.score),
    status: m.status,
  }));

  if (!indicators.length) return null;

  return (
    <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {indicators.map((item, idx) => (
          <IndicatorRow key={idx} {...item} />
        ))}
      </div>
    </div>
  );
};

export default ConversationQualityIndicators;
