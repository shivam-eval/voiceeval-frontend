import { GitBranch } from "lucide-react";

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  // Use the name directly if it's already humanized (contains spaces and starts with uppercase)
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
  
  // No hardcoded map - just transform the snake_case name to Title Case
  return String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const normalizeScore = (score) => {
  if (typeof score !== "number") return 0;
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
};

/* =========================
   TRANSFORMER
========================= */

const transformMetrics = (response) => {
  if (!response || !Array.isArray(response.metrics)) {
    return [];
  }

  const transformed = response.metrics
    .map((m) => {
      const name = m.name || m.metric_name;
      const normalized = normalizeScore(m.score);
      return {
        label: humanizeMetricName(name),
        value: normalized,
        name: name, // Keep original name for debugging
      };
    });

  return transformed;
};

/* =========================
   COLORS
========================= */

const colors = [
  "#4EEAD7",
  "#2DD4BF",
  "#22C1B2",
  "#1FB5A8",
];

/* =========================
   DONUT CHART
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
   PROGRESS BAR
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
   COMPONENT
========================= */

const TaskCompletionDistribution = ({ response }) => {
  console.log('=== TaskCompletionDistribution ===');
  console.log('Received response:', response);
  console.log('response.metrics:', response?.metrics);

  const metrics = transformMetrics(response);

  console.log('Transformed metrics:', metrics);
  console.log('Metrics length:', metrics.length);

  if (!metrics.length) return null;

  return (
    <div className="bg-[#071a23] border border-teal-500/20 rounded-xl p-8 w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-teal-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Task Completion</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Donut + Legend */}
        <div className="flex flex-col items-center">
          <DonutChart metrics={metrics} />

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 text-sm">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-gray-400"
              >
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: colors[i % colors.length],
                  }}
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
