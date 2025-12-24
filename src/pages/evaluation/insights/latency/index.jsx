import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import {
  Clock,
  Zap,
  Timer,
  Activity,
} from "lucide-react";
import LatencyDetailedMetrics from "./LatencyDetailedMetric";
import LatencyBar from "./LatencyBar";
import LatencyDistribution from "./LatencyDist";

/* =========================
   Dummy Latency Data
========================= */
const DUMMY_LATENCY_DATA = {
  header: {
    score: 100,
    passed: 4,
    failed: 0,
  },
  metrics: [
    {
      icon: Clock,
      title: "Avg Latency",
      value: "1.69s",
      subtitle: "Within human perception",
      highlight: true,
    },
    {
      icon: Zap,
      title: "First Token",
      value: "413ms",
      subtitle: "Threshold: 500ms",
    },
    {
      icon: Timer,
      title: "Transcript Time",
      value: "939ms",
      subtitle: "Threshold: 1.00s",
    },
    {
      icon: Activity,
      title: "Total Duration",
      value: "62.80s",
      subtitle: "Complete conversation",
      muted: true,
    },
  ],
};

/* =========================
   Latency Overview
========================= */
const LatencyOverview = () => {
  return (
    <div className="flex flex-col gap-8">

      {/* ================= Header ================= */}
      <InsightHeaderCard
        icon={Clock}
        title="Latency"
        description="Measures response times and processing speed"
        score={DUMMY_LATENCY_DATA.header.score}
        passedCount={DUMMY_LATENCY_DATA.header.passed}
        failedCount={DUMMY_LATENCY_DATA.header.failed}
        theme="teal"
      />

      {/* ================= Stat Cards ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DUMMY_LATENCY_DATA.metrics.map((metric, idx) => (
          <StatCard
            key={idx}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            highlight={metric.highlight}
            muted={metric.muted}
          />
        ))}
      </div>
<LatencyBar/>
<LatencyDistribution/>
     <LatencyDetailedMetrics/>
    </div>
  );
};

export default LatencyOverview;
