import { ResponsiveBar } from "@nivo/bar";
import { darkTheme } from "../../const";
const taskData = [
  { metric: "Task Completion", value: 96 },
  { metric: "Sequential Accuracy", value: 92 },
  { metric: "Step Validation", value: 98 },
  { metric: "Flow Coverage", value: 12 },
];

const TaskCompletionBar = () => (
  <div style={{ height: 260 }}>
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
      data={taskData}
      keys={["value"]}
      indexBy="metric"
      margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
      padding={0.4}
      colors={["#5EEAD4"]}
      enableLabel={false}
      axisBottom={{ tickRotation: -0 }}
      theme={darkTheme}
        borderRadius={6} 
    />
  </div>
);
export default TaskCompletionBar;