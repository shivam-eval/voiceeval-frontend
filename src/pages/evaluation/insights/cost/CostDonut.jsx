import { ResponsivePie } from "@nivo/pie";
import { darkTheme } from "../../const";
const costData = [
  { id: "LLM", value: 0.045 },
  { id: "STT", value: 0.012 },
  { id: "TTS", value: 0.038 },
];

const CostDonut = () => (
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
    <ResponsivePie
      data={costData}
      innerRadius={0.65}
      
      colors={["#5EEAD4","#2dd4bf"]}
      enableArcLabels={false}
      enableArcLinkLabels={false}
      theme={darkTheme}
    />
  </div>
);

export default CostDonut;
