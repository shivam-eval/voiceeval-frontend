import { CheckCircle, AlertTriangle } from "lucide-react";

const MetricCard = ({
  icon: Icon,
  title = "Accuracy",
  description = "Measures response accuracy and semantic correctness",
  value = 50,
  passed = 2,
  failed = 2,
  status = "critical",
}) => {
  const isHealthy = value > 60;
  const colorClass = isHealthy ? "text-teal-500" : "text-red-500";
  const bgColorClass = isHealthy ? "bg-teal-500/20" : "bg-red-500/20";
  const iconColorClass = isHealthy ? "text-teal-400" : "text-red-400";

  return (
    <div
      className={`border rounded-xl p-6 bg-[#0b0f1a] border-gray-800`}
    >
      {/* ================= Header ================= */}
      <div className="flex items-start justify-between">
        {/* Left: Icon + Text */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${bgColorClass}`}>
            <Icon size={24} className={iconColorClass} />
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-white">
              {title}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {description}
            </p>
          </div>
        </div>

        {/* Right: Score + Stats */}
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={
                  2 * Math.PI * 40 * (1 - value / 100)
                }
                className={colorClass}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${colorClass}`}>
                {value}%
              </span>
            </div>
          </div>

          {/* Passed / Failed */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={16} />
              <span>{passed}</span>
              <span className="text-gray-500">Passed</span>
            </div>

            <div className="flex items-center gap-2 text-red-400">
              <span className="text-lg">×</span>
              <span>{failed}</span>
              <span className="text-gray-500">Failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Critical Banner ================= */}
      {failed > 0 && (
        <div className="mt-6 bg-red-950/40 border border-red-500/50 rounded-xl px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="text-red-500 mt-0.5"
              size={20}
            />
            <div>
              <div className="text-red-400 font-medium">
                {failed} critical metrics below threshold
              </div>
              <div className="text-gray-400 text-sm mt-1">
                Review failed metrics to identify issues and improve
                agent performance
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
