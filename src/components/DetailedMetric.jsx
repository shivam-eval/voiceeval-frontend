import { HelpCircle, CheckCircle, XCircle, Clock } from "lucide-react";

const DetailedMetric = ({
  label,
  value,
  threshold,
  time,
  unit = "%",
  status,
}) => {
  // Logic: if value is provided as a number, use comparison. 
  // For accuracy, higher is better. For cost/latency, lower is better.
  // We'll rely on the 'status' prop if provided, otherwise fallback to comparison.
  const isPassed = status ? status === "passed" : value >= threshold;

  // Progress bar logic: percentage of value relative to threshold or 100
  const percent = Math.min((value / (threshold || 100)) * 100, 100);

  return (
    <div
      className={`border rounded-lg p-6 ${
        isPassed
          ? "bg-gray-800/50 border-gray-700"
          : "bg-red-950/30 border-red-500/50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-white font-medium">{label}</h4>
          <HelpCircle size={14} className="text-gray-500" />
        </div>

        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            isPassed
              ? "bg-teal-900/30 text-teal-400"
              : "bg-red-900/30 text-red-400"
          }`}
        >
          {isPassed ? (
            <CheckCircle size={14} />
          ) : (
            <XCircle size={14} />
          )}
          {isPassed ? "Passed" : "Failed"}
        </div>
      </div>

      {/* Execution Time */}
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
        <Clock size={14} />
        {time}
      </div>

      {/* Value / Threshold */}
      <div className="flex justify-between mb-3">
        <div>
          <div className="text-gray-400 text-xs">Value</div>
          <div
            className={`text-3xl font-bold ${
              isPassed ? "text-teal-400" : "text-red-400"
            }`}
          >
            {value}
            {unit}
          </div>
        </div>

        <div className="text-right">
          <div className="text-gray-400 text-xs">Threshold</div>
          <div className="text-xl text-gray-400">
            {threshold}
            {unit}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            isPassed ? "bg-teal-400" : "bg-red-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Threshold Label */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>0</span>
        <span>Threshold: {threshold}{unit}</span>
      </div>
    </div>
  );
};

export default DetailedMetric;
