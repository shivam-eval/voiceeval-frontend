import {HelpCircle,CheckCircle,XCircle,Clock} from "lucide-react";

const DetailedMetric = ({ label, value, threshold, time, unit = "ms" }) => {
  const percent = Math.min((value / threshold) * 100, 100);
  const isPassed = value <= threshold;

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
        <h4 className="text-white font-medium">{label}</h4>

        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isPassed
              ? "bg-teal-900/30 text-teal-400"
              : "bg-red-900/30 text-red-400"
          }`}
        >
          {isPassed ? "Passed" : "Failed"}
        </div>
      </div>

      {/* Time */}
      <div className="text-gray-500 text-sm mb-4">{time}</div>

      {/* Value */}
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

      {/* Progress */}
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            isPassed ? "bg-teal-400" : "bg-red-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};


export default DetailedMetric;