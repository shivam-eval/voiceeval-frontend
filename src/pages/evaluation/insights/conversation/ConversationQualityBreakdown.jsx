import { ResponsiveBar } from "@nivo/bar";
import { MessageSquare } from "lucide-react";
import { darkTheme } from "../../const";

/* =========================
   Dummy Data (Exact Match)
========================= */
const data = [
  { metric: "Grammar Quality", value: 70 },
  { metric: "Context Maintenance", value: 90 },
  { metric: "Information Extraction", value: 10 },
  { metric: "Clarification Request", value: 0 },
];

const ConversationQualityBreakdown = () => {
  return (
    <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-teal-400" size={18} />
        <h3 className="text-lg font-semibold text-white">
          Conversation Quality Breakdown
        </h3>
      </div>

      {/* Chart */}
      <div style={{ height: 280 }}>
        <ResponsiveBar
          data={data}
          keys={["value"]}
          indexBy="metric"
          layout="horizontal"

          margin={{ top: 10, right: 20, bottom: 40, left: 180 }}
          padding={0.35}

          maxValue={100}
          minValue={0}

          colors={["#2dd4bf"]}
          borderRadius={8}

          enableLabel={false}

          axisTop={null}
          axisRight={null}

          axisLeft={{
            tickSize: 0,
            tickPadding: 12,
            tickRotation: 0,
            legend: "",
            legendOffset: 0,
          }}

          axisBottom={{
            tickValues: [0, 25, 50, 75, 100],
            tickSize: 0,
            tickPadding: 10,
            format: (v) => `${v}%`,
          }}

          gridXValues={[0, 25, 50, 75, 100]}
          gridYValues={[]}

          theme={{
            ...darkTheme,
            axis: {
              ticks: {
                text: {
                  fill: "#94A3B8",
                  fontSize: 12,
                },
              },
            },
            grid: {
              line: {
                stroke: "#1f2937",
                strokeDasharray: "2 4",
              },
            },
          }}

          animate={true}
          motionConfig="gentle"
        />
      </div>
    </div>
  );
};

export default ConversationQualityBreakdown;
