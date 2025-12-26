import { ResponsiveBar } from "@nivo/bar";
import { darkTheme } from "../../const";

/* =========================
   Dummy Latency Data (ms)
========================= */
const latencyData = [
  { metric: "Response Latency", ms: 1690 },
  { metric: "First Token", ms: 413 },
  { metric: "Complete Transcript", ms: 939 },
];

const HUMAN_THRESHOLD = 2000;

/* =========================
   Wrapped Axis Tick
========================= */
const WrappedTick = ({ x, y, value }) => {
  const lines = value.split(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={-6}
          y={i * 14}
          textAnchor="end"
          fill="#9CA3AF"
          fontSize={11}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

/* =========================
   Tooltip
========================= */
const CustomTooltip = ({ indexValue, value }) => (
  <div className="bg-[#0b1f26] border border-gray-700 rounded-lg p-3 text-sm">
    <div className="text-white font-medium mb-1">
      {indexValue}
    </div>
    <div className="text-gray-400">
      Value:{" "}
      <span className="text-teal-400 font-semibold">
        {(value / 1000).toFixed(2)}s
      </span>
    </div>
    <div className="text-gray-400">
      Threshold:{" "}
      <span className="text-gray-300">2.00s</span>
    </div>
  </div>
);

/* =========================
   Latency Breakdown Chart
========================= */
const LatencyBar = () => (
  <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6">
    {/* Header */}
    <div className="flex items-center gap-3 mb-4">
      <span className="text-teal-400">▮▮▮</span>
      <h3 className="text-white text-lg font-semibold">
        Latency Breakdown
      </h3>
      <span className="text-gray-400 text-sm">
        Human perception threshold: 2s
      </span>
    </div>

    {/* Chart */}
    <div style={{ height: 260 }}>
      <ResponsiveBar
        data={latencyData}
        keys={["ms"]}
        indexBy="metric"
        layout="horizontal"
        margin={{ top: 20, right: 40, bottom: 40, left: 120 }}
        padding={0.4}
        enableLabel={false}
        borderRadius={6}
        colors={({ value }) =>
          value <= HUMAN_THRESHOLD ? "#2dd4bf" : "#ef4444"
        }

        axisBottom={{
          tickValues: [0, 500, 1000, 1500, 2000],
          format: (v) => (v === 0 ? "0ms" : `${v / 1000}s`),
          tickSize: 0,
        }}

        axisLeft={{
          renderTick: WrappedTick,
        }}

        markers={[
          {
            axis: "x",
            value: HUMAN_THRESHOLD,
            lineStyle: {
              stroke: "#f59e0b",
              strokeWidth: 1,
              strokeDasharray: "6 6",
            },
            legend: "2s Hu",
            legendPosition: "top-right",
            legendOffsetY: -6,
            legendOffsetX: 6,
          },
        ]}

        tooltip={CustomTooltip}
        theme={darkTheme}
      />
    </div>

    {/* Legend */}
    <div className="flex justify-center gap-6 mt-4 text-sm">
      <div className="flex items-center gap-2 text-gray-400">
        <span className="w-3 h-3 rounded bg-teal-400" />
        Within threshold
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="w-3 h-3 rounded bg-red-500" />
        Exceeds threshold
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="w-6 h-px bg-yellow-400 border-dashed border-t" />
        2s Human Perception
      </div>
    </div>
  </div>
);

export default LatencyBar;
