import { ResponsiveBar } from "@nivo/bar";
import { darkTheme } from "../../const";
const accuracyData = [
  { metric: "Semantic Accuracy", value: 82 },
  { metric: "Keyword Match", value: 91 },
  { metric: "Semantic Similarity", value: 68 },
  { metric: "Intent Classification", value: 74 },
];
const WrappedTick = ({ x, y, value }) => {
  const lines = value.split(" "); // split by space

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
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

const AccuracyBar = () => (
  <div style={{ height: 300 }}>
      <h3
      style={{
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 400,
        marginBottom: "8px",
      }}
    >
      Task Execution Metrics
    </h3>
    <ResponsiveBar
      data={accuracyData}
      keys={["value"]}
      indexBy="metric"
      margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
        borderRadius={6} 
      colors={["#5EEAD4"]}
      axisBottom={{ tickRotation: -25 }}
      axisLeft={{ tickSize: 0 }}
      enableLabel={false}
      theme={darkTheme}
      innerPadding={4}
      padding={0.2}
    />
  </div>
);

export default AccuracyBar;