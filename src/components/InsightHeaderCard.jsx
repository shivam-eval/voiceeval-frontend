import { CheckCircle, XCircle } from "lucide-react";

const InsightHeaderCard = ({
  icon: Icon,
  title,
  description,
  score,          // percentage (0–100)
  passedCount,
  failedCount,
  theme = "teal", // "teal" | "red" | "yellow"
}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  const themeMap = {
    teal: {
      bg: "bg-teal-500/20",
      ring: "text-teal-400",
      ringBg: "text-teal-900",
      text: "text-teal-300",
      border: "border-teal-500/40",
    },
    red: {
      bg: "bg-red-500/20",
      ring: "text-red-400",
      ringBg: "text-red-900",
      text: "text-red-400",
      border: "border-red-500/40",
    },
    yellow: {
      bg: "bg-yellow-500/20",
      ring: "text-yellow-400",
      ringBg: "text-yellow-900",
      text: "text-yellow-400",
      border: "border-yellow-500/40",
    },
  };

  const colors = themeMap[theme];

  return (
    <div
      className={`bg-[#0b1f26] border ${colors.border} rounded-xl p-6 flex items-center justify-between`}
    >
      {/* LEFT */}
      <div className="flex items-start gap-4">
        <div className={`p-4 rounded-xl ${colors.bg} ${colors.ring}`}>
          <Icon size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {title}
          </h2>
          <p className="text-gray-400 mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className={colors.ringBg}
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={colors.ring}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${colors.text}`}>
              {score}%
            </span>
          </div>
        </div>

        {/* Passed / Failed */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2 text-teal-400">
            <CheckCircle size={16} />
            <span className="font-medium">{passedCount}</span>
            <span className="text-gray-400">Passed</span>
          </div>
          <div className="flex items-center gap-2 text-red-500">
            <XCircle size={16} />
            <span className="font-medium">{failedCount}</span>
            <span className="text-gray-400">Failed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightHeaderCard;
