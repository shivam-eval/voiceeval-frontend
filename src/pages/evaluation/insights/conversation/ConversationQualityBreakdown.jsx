import { ResponsiveBar } from "@nivo/bar";
import { MessageSquare } from "lucide-react";
import { darkTheme } from "../../const";

/* =========================
   Helpers
========================= */
const humanizeMetricName = (name) => {
  const map = {
    grammar_quality: "Grammar Quality",
    context_maintenance: "Context Maintenance",
    clarification_request_rate: "Clarification Rate",
    repetition_count: "Repetition Count",
    not_early_termination: "Call Completion",
    words_per_minute: "Words Per Minute",
    talk_ratio: "Talk Ratio",
    text_sentiment: "Sentiment",
  };
  return map[name] || name;
};

const normalizeScore = (score) => {
  if (score === null || score === undefined) return 0;
  if (typeof score !== "number") return 0;
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
};

/* =========================
   Component
========================= */
const ConversationQualityBreakdown = ({ response }) => {
  if (!response || !Array.isArray(response.metrics)) return null;

  // Transform metrics to bar chart data
  const data = response.metrics.map(m => ({
    metric: humanizeMetricName(m.name),
    value: normalizeScore(m.score),
    status: m.status
  }));

  // Color based on status
  const getColor = (bar) => {
    return bar.data.status === "failed" ? "#ef4444" : "#2dd4bf";
  };

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
      <div style={{ height: 320 }}>
        <ResponsiveBar
          data={data}
          keys={["value"]}
          indexBy="metric"
          layout="horizontal"

          margin={{ top: 10, right: 20, bottom: 40, left: 180 }}
          padding={0.35}

          maxValue={100}
          minValue={0}

          colors={getColor}
          borderRadius={8}

          enableLabel={true}
          label={d => `${d.value}%`}
          labelTextColor="#ffffff"

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
