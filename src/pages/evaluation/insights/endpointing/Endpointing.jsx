import { ArrowLeft } from "lucide-react";

/* =========================
   HELPERS
========================= */

const COLORS = {
  accent: "#b61249",
  bg: "#000000",
  teal: "#2dd4bf",
  text: "#9da3af",
  white: "#ffffff",
  warn: "#f59e0b",
};

const normalizeScore = (score) => {
  if (typeof score !== "number") return 0;
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
};

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  // Use the name directly if it's already humanized (contains spaces and starts with uppercase)
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
  
  // No hardcoded map - just transform the snake_case name to Title Case
  return String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

/* =========================
   COMPONENT
========================= */

const EndpointingOverview = ({ response, onBack }) => {
  if (!response || !Array.isArray(response.metrics)) return null;

  const metrics = response.metrics;

  const byName = (n) => metrics.find((m) => m.name === n);

  const interruption = byName("interruption_count");
  const pause = byName("pause_detection");
  const turnBoundary = byName("turn_boundary_accuracy");

  /* -------------------------
     Derived values
  ------------------------- */

  const score = normalizeScore(response.score);

  const passedCount = metrics.filter(
    (m) => m.status === "passed"
  ).length;

  const totalCount = metrics.length || 1;
  const categoryPassed = passedCount === totalCount;

  /* =========================
     DONUT
  ========================= */

  const Donut = () => {
    const r = 34;
    const cx = 40;
    const cy = 40;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - score / 100);

    return (
      <svg width="100" height="100" viewBox="0 0 80 80">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="#0a0f19"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={categoryPassed ? COLORS.teal : COLORS.accent}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text
          x="40"
          y="46"
          textAnchor="middle"
          fontSize="16"
          fill={COLORS.white}
          fontWeight="700"
        >
          {score}%
        </text>
      </svg>
    );
  };

  /* =========================
     METRIC CARD
  ========================= */

  const MetricCard = ({ metric }) => {
    if (!metric) return null;

    const passed = metric.status === "passed";
    const value = normalizeScore(metric.score);

    return (
      <div
        className="p-4 rounded-xl border"
        style={{
          backgroundColor: passed ? "#0b1220" : "#12090d",
          borderColor: passed ? "#1f2937" : COLORS.accent,
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold" style={{ color: COLORS.white }}>
              {humanizeMetricName(metric.name)}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: COLORS.text }}
            >
              Status: {metric.status}
            </div>
          </div>
          <span
            className="px-2 py-1 rounded-full text-xs font-semibold border"
            style={{
              color: passed ? COLORS.teal : COLORS.accent,
              borderColor: passed ? COLORS.teal : COLORS.accent,
            }}
          >
            {passed ? "Passed" : "Failed"}
          </span>
        </div>

        <div
          className="mt-4 text-2xl font-bold"
          style={{
            color: passed ? COLORS.teal : COLORS.warn,
          }}
        >
          {value}%
        </div>

        <div
          className="h-2 rounded-full overflow-hidden mt-2"
          style={{ backgroundColor: COLORS.bg }}
        >
          <div
            className="h-full"
            style={{
              width: `${value}%`,
              backgroundColor: passed
                ? COLORS.teal
                : COLORS.accent,
            }}
          />
        </div>
      </div>
    );
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
      )}

      {/* Header */}
      <div
        className="rounded-xl border p-6"
        style={{ backgroundColor: "#0b1220", borderColor: "#1f2937" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div
              className="text-xl font-bold"
              style={{ color: COLORS.white }}
            >
              Endpointing
            </div>
            <div className="text-sm" style={{ color: COLORS.text }}>
              Measures turn-taking and pause detection accuracy
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Donut />
            <div className="text-right">
              <div
                className="text-2xl font-bold"
                style={{ color: COLORS.white }}
              >
                {passedCount}/{totalCount}
              </div>
              <div
                className="text-sm"
                style={{ color: COLORS.text }}
              >
                Metrics Passed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard metric={interruption} />
        <MetricCard metric={pause} />
        <MetricCard metric={turnBoundary} />
      </div>
    </div>
  );
};

export default EndpointingOverview;
