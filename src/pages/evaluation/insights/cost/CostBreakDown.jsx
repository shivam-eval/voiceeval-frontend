import { ResponsiveBar } from "@nivo/bar";
import { TrendingUp } from "lucide-react";
import { darkTheme } from "../../const";

const data = [
<<<<<<< Updated upstream
  { metric: "LLM", cost: 0.15 },
  { metric: "STT", cost: 0.25 },
  { metric: "TTS", cost: 0.1 },
  { metric: "Total Conversation", cost: 0.4 },
=======
  { metric: "LLM", cost: 0.45 },
  { metric: "STT", cost: 0.21 },
  { metric: "TTS", cost: 0.36 },
  { metric: "Total", cost: 1.02 },
>>>>>>> Stashed changes
];

const CostBreakdown = () => {
  return (
    <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-teal-400" size={18} />
        <h3 className="text-lg font-semibold text-white">
          Cost Breakdown
        </h3>
      </div>

      <div style={{ height: 260 }}>
        <ResponsiveBar
          data={data}
          keys={["cost"]}
          indexBy="metric"
          layout="horizontal"
          margin={{ top: 10, right: 20, bottom: 40, left: 120 }}
          padding={0.4}
          colors={["#2dd4bf"]}
          borderRadius={6}
          enableLabel={false}
          maxValue={1.2}

          axisBottom={{
<<<<<<< Updated upstream
            tickValues: [0, 0.03, 0.06, 0.09, 0.12],
            format: (v) => `$${v.toFixed(2)}`,
=======
            tickValues: [0, 0.3, 0.6, 0.9, 1.2],
            format: (v) => `${v.toFixed(2)}`,
>>>>>>> Stashed changes
            tickPadding: 8,
          }}

          axisLeft={{
            tickPadding: 10,
          }}

          gridXValues={[0, 0.3, 0.6, 0.9, 1.2]}

          theme={{
            ...darkTheme,
            grid: {
              line: {
                stroke: "#1f2937",
                strokeDasharray: "2 4",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default CostBreakdown;
