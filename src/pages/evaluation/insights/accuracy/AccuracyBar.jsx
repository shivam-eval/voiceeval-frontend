import { ResponsiveBar } from "@nivo/bar";
import { darkTheme } from "../../const";

/* =========================
   Helpers
========================= */
const humanizeMetricName = (name) => {
  const map = {
    semantic_accuracy_rate: "Semantic Accuracy",
    keyword_match_accuracy: "Keyword Match",
    semantic_similarity: "Semantic Similarity",
    intent_classification_accuracy: "Intent Classification",
  };
  return map[name] || name;
};

const transformAccuracyBarData = (response) => {
  if (!response?.metrics) return [];

  return response.metrics.map((m) => ({
    metric: humanizeMetricName(m.metric_name),
    value: Math.round(m.value * 100),
    status: m.passed ? "passed" : "failed",
  }));
};

/* =========================
   Wrapped Tick
========================= */

/* =========================
   Component
========================= */
const AccuracyBar = ({ response }) => {
  const data = transformAccuracyBarData(response);

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
        Task Execution Metrics
      </h3>

      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="metric"
        margin={{ top: 20, right: 20, bottom: 80, left: 90 }}
        borderRadius={6}
        padding={0.2}
        innerPadding={4}

        colors={({ data }) =>
          data.status === "failed" ? "#ef4444" : "#2dd4bf"
        }

        enableLabel={false}

        axisBottom={{ tickRotation: -25 }}
        // axisLeft={{ renderTick: WrappedTick }}

        theme={darkTheme}
      />
    </div>
  );
};

export default AccuracyBar;
