import { ResponsiveBar } from "@nivo/bar";
import { TrendingUp } from "lucide-react";
import { darkTheme } from "../../const";

const formatUSD = (v) => `$${(v ?? 0).toFixed(4)}`;

const CostBreakdown = ({ breakdown }) => {
  if (!breakdown) return null;

  const data = [
    {
      metric: "Speech-to-Text",
      cost: breakdown.stt_cost_usd ?? 0,
    },
    {
      metric: "Text-to-Speech",
      cost: breakdown.tts_cost_usd ?? 0,
    },
    {
      metric: "Total Conversation",
      cost: breakdown.total_cost_usd ?? 0,
    },
  ];

  // Dynamic axis scaling
  const maxCost = Math.max(...data.map((d) => d.cost), 0.01);

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
          margin={{ top: 10, right: 20, bottom: 40, left: 160 }}
          padding={0.4}
          colors={["#2dd4bf"]}
          borderRadius={6}
          enableLabel={false}
          maxValue={maxCost}

          axisBottom={{
            format: (v) => formatUSD(v),
            tickPadding: 8,
          }}

          axisLeft={{
            tickPadding: 10,
          }}

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
