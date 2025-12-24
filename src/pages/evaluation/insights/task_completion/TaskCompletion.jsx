import { GitBranch } from "lucide-react";

/* =========================
   Helpers
========================= */
const humanizeMetricName = (name) => {
  const map = {
    task_completion_rate: "Task Completion Rate",
    sequential_task_accuracy: "Sequential Task Accuracy",
    step_validation_pass_rate: "Step Validation Pass Rate",
    flow_path_coverage: "Flow Path Coverage",
  };
  return map[name] || name;
};

const transformMetrics = (response) => {
  if (!response?.metrics) return [];

  return response.metrics.map((m) => ({
    label: humanizeMetricName(m.metric_name),
    value: Math.round(m.value * 100),
  }));
};

/* =========================
   Colors
========================= */
const colors = [
  "#4EEAD7",
  "#2DD4BF",
  "#22C1B2",
  "#1FB5A8",
];

/* =========================
   Donut Chart
========================= */
const DonutChart = ({ metrics }) => {
  const radius = 90;
  const stroke = 28;
  const circumference = 2 * Math.PI * radius;
  const segment = circumference / metrics.length;

  return (
    <svg width="240" height="240" viewBox="0 0 240 240">
      <g transform="translate(120,120) rotate(-90)">
        {metrics.map((_, i) => (
          <circle
            key={i}
            r={radius}
            cx="0"
            cy="0"
            fill="transparent"
            stroke={colors[i % colors.length]}
            strokeWidth={stroke}
            strokeDasharray={`${segment - 6} ${circumference}`}
            strokeDashoffset={-i * segment}
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
};

/* =========================
   Progress Bar
========================= */
const ProgressBar = ({ label, value }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="text-white text-sm">{label}</span>
      <span className="text-teal-300 font-semibold">{value}%</span>
    </div>
    <div className="h-3 bg-[#0b2a33] rounded-full overflow-hidden">
      <div
        className="h-full bg-teal-400 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

/* =========================
   Component
========================= */
const TaskCompletionDistribution = ({ response }) => {
  const metrics = transformMetrics(response);

  if (!metrics.length) return null;

  return (
    <div className="bg-[#071a23] border border-teal-500/20 rounded-xl p-8 w-full">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <GitBranch className="text-teal-400" size={20} />
        <h3 className="text-white text-lg font-semibold">
          Task Completion Distribution
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left: Donut + Legend */}
        <div className="flex flex-col items-center">
          <DonutChart metrics={metrics} />

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 text-sm">
            {metrics.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Bars */}
        <div className="flex flex-col gap-6">
          <span className="text-gray-400 text-sm">Path Coverage</span>
          {metrics.map((m, i) => (
            <ProgressBar
              key={i}
              label={m.label}
              value={m.value}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default TaskCompletionDistribution;
