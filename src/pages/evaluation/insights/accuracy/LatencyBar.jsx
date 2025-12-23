import { ResponsiveBar } from "@nivo/bar";
import { darkTheme } from "../../const";
const latencyData = [
  { metric: "Response Latency ", ms: 1450 },
  { metric: "T2 First Token ", ms: 420 },
  { metric: "T2 Complete Transcript ", ms: 980 },
];

const WrappedTick = ({ x, y, value }) => {
  const lines = value.split(" "); // split by space

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={-4}
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


const LatencyBar = () => (
  <div style={{ height: 260}}>
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
      data={latencyData}
      keys={["ms"]}
      indexBy="metric"
      layout="horizontal"
      margin={{ top: 20, right: 10, bottom: 40, left: 80}}
      colors={["#5EEAD4"]}
      enableLabel={false}
        borderRadius={6} 
      axisBottom={{ tickSize: 1 }}
    
        axisLeft={{
    renderTick: WrappedTick, 
     tickSize: 5,
  tickPadding: 6,
  tickRotation: 0,
  tickValues: 5,
  legend: '',
  legendOffset: 32,
  legendPosition: 'middle'
  }}
      theme={darkTheme}
      padding={0.4}
    />
  </div>
);

export default LatencyBar;