import { ResponsiveBar } from "@nivo/bar";
import { darkTheme } from "../../const";

/* =========================
   Helpers
========================= */
const humanizeMetricName = (name) => {
  // Convert snake_case to Title Case dynamically
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/* =========================
   Transformer
========================= */
const transformAccuracyBarData = (response) => {
  if (!response || !Array.isArray(response.metrics)) return [];

  // Show all accuracy metrics including semantic_accuracy
  return response.metrics.map((m) => ({
    metric: humanizeMetricName(m.name),
    value: typeof m.score === "number" ? m.score * 100 : 0, // Convert 0-1 to 0-100 for display
    status: m.status, // passed | failed | skipped
  }));
};

/* =========================
   Component
========================= */
const AccuracyBar = ({ response }) => {
  const data = transformAccuracyBarData(response);

  if (data.length === 0) return null;

  return (
    <div style={{ height: 300 }}>
      <h3
        style={{
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 400,
          marginBottom: "8px",
        }}
      >
        Accuracy Metrics
      </h3>

      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="metric"
        margin={{ top: 20, right: 20, bottom: 80, left: 90 }}
        padding={0.3}
        borderRadius={6}

        colors={({ data }) => {
          if (data.status === "failed") return "#ef4444";
          if (data.status === "skipped") return "#6b7280";
          return "#2dd4bf";
        }}

        enableLabel={false}
        axisBottom={{ tickRotation: -25 }}
        axisLeft={{
          tickValues: [0, 25, 50, 75, 100],
        }}

        theme={darkTheme}
      />
    </div>
  );
};

export default AccuracyBar;
