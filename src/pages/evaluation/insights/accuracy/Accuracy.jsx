import { Row, Col, Card } from "antd";

import AccuracyBar from "./AccuracyBar";
import CostDonut from "./CostDonut";
import LatencyBar from "./LatencyBar";
// import LatencyHierarchy from "./";
import TaskCompletionBar from "./TaskCompletionBar";
import VoiceAccuracySteps from "./VoiceAccuracySteps";

const cardStyle = {
  background: "#0b1220",

  height: "100%",
  borderColor:"#0b1220"
};

const AccuracyOverview = () => {
  return (
    <Row gutter={[16, 16]}>
      {/* Accuracy Metrics */}
      <Col span={8}>
        <Card style={cardStyle}>
          <AccuracyBar />
        </Card>
      </Col>

      {/* Cost Breakdown */}
      <Col span={8}>
        <Card style={cardStyle}>
          <CostDonut />
        </Card>
      </Col>

      {/* Latency Metrics */}
      <Col span={8}>
        <Card style={cardStyle}>
          <LatencyBar />
        </Card>
      </Col>

      {/* Task Completion */}
      <Col span={12}>
        <Card style={cardStyle}>
          <TaskCompletionBar />
        </Card>
      </Col>

      {/* Accuracy over Conversation Steps */}
      <Col span={12}>
        <Card style={cardStyle} >
          <VoiceAccuracySteps />
        </Card>
      </Col>
    </Row>
  );
};

export default AccuracyOverview;
