import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import CostDonut from "./CostDonut";
import CostBreakdown from "./CostBreakdown";
import {
  DollarSign,
  Cpu,
  Mic,
  Volume2,
} from "lucide-react";
import CostDetailedMetrics from "./CostDetailedMetrics";

const CostOverview = () => {
  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <InsightHeaderCard
        icon={DollarSign}
        title="Cost"
        description="Tracks LLM, STT, and TTS costs"
        score={100}
        passedCount={4}
        failedCount={0}
        theme="teal"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Cost"
          value="$0.10"
          subtitle="Per conversation"
          highlight
        />
        <StatCard
          icon={Cpu}
          title="LLM Cost"
          value="$0.00"
          subtitle="0% of total"
          muted
        />
        <StatCard
          icon={Mic}
          title="STT Cost"
          value="$0.00"
          subtitle="0% of total"
          muted
        />
        <StatCard
          icon={Volume2}
          title="TTS Cost"
          value="$0.10"
          subtitle="100% of total"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostDonut />
        <CostBreakdown />
      </div>
      <CostDetailedMetrics/>

    </div>
  );
};

export default CostOverview;
