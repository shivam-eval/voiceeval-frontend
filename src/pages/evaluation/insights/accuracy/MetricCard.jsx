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
  const getStatusColor = () => {
    if (status === "critical") return "border-red-500";
    if (status === "warning") return "border-yellow-500";
    return "border-green-500";
  };

  const getIconBgColor = () => {
    if (status === "critical") return "bg-red-500/20";
    if (status === "warning") return "bg-yellow-500/20";
    return "bg-green-500/20";
  };

  const getIconColor = () => {
    if (status === "critical") return "text-red-400";
    if (status === "warning") return "text-yellow-400";
    return "text-green-400";
  };

  const getProgressColor = () => {
    if (status === "critical") return "text-red-500";
    if (status === "warning") return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div
      className={`border rounded-xl p-6 bg-[#0b0f1a] ${getStatusColor()}`}
    >
      {/* ================= Header ================= */}
      <div className="flex items-start justify-between">
        {/* Left: Icon + Text */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${getIconBgColor()}`}>
            <Icon size={24} className={getIconColor()} />
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
                className={getProgressColor()}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getProgressColor()}`}>
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
