import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import CostDonut from "./CostDonut";
import CostBreakdown from "./CostBreakdown";
import CostDetailedMetrics from "./CostDetailedMetrics";
import { DollarSign, Cpu, Mic, Volume2, ArrowLeft } from "lucide-react";

const formatUSD = (v) => `$${(v ?? 0).toFixed(4)}`;

const CostOverview = ({ response, onBack }) => {
  console.log('CostOverview received response:', response);

  // FIXED: Access metrics correctly
  const metrics = response?.metrics || [];
  
  if (metrics.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-dark-input border border-gray-700 rounded-lg text-sm text-gray-300 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>
        )}
        <div className="text-gray-400">No cost metrics available</div>
      </div>
    );
  }

  const totalMetric = metrics.find(
    (m) => m.name === "total_conversation_cost"
  );

  console.log('Found totalMetric:', totalMetric);

  // FIXED: Extract cost details properly
  const totalCost = totalMetric?.details?.total_cost_usd ?? 0;
  const sttCost   = totalMetric?.details?.stt_cost_usd ?? 0;
  const ttsCost   = totalMetric?.details?.tts_cost_usd ?? 0;

  // FIXED: Get score from response (already converted to percentage in ViewReport)
  const score = response?.score ?? 0;

  // FIXED: Calculate passed/failed from metrics array
  const passedCount = metrics.filter(m => m.status === "passed").length;
  const failedCount = metrics.filter(m => m.status === "failed").length;

  console.log('Cost breakdown:', { totalCost, sttCost, ttsCost, score, passedCount, failedCount });

  return (
    <div className="flex flex-col gap-8">
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-dark-input border border-gray-700 rounded-lg text-sm text-gray-300 flex items-center gap-2 hover:bg-dark-input/80 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
      )}

      <InsightHeaderCard
        icon={DollarSign}
        title="Cost"
        description="LLM, STT, and TTS cost breakdown"
        score={score}
        passedCount={passedCount}
        failedCount={failedCount}
        theme="teal"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Cost"
          value={formatUSD(totalCost)}
          subtitle="Per conversation"
          highlight
        />
        <StatCard
          icon={Cpu}
          title="STT Cost"
          value={formatUSD(sttCost)}
          subtitle="Speech-to-Text"
          muted
        />
        <StatCard
          icon={Mic}
          title="TTS Cost"
          value={formatUSD(ttsCost)}
          subtitle="Text-to-Speech"
        />
        <StatCard
          icon={Volume2}
          title="Providers"
          value="Deepgram / OpenAI"
          subtitle="STT / TTS"
          muted
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostDonut
          data={[
            { id: "STT", value: sttCost },
            { id: "TTS", value: ttsCost },
          ]}
        />
        <CostBreakdown
          breakdown={{
            stt_cost_usd: sttCost,
            tts_cost_usd: ttsCost,
            total_cost_usd: totalCost,
          }}
        />
      </div>

      <CostDetailedMetrics metrics={metrics} />
    </div>
  );
};

export default CostOverview;