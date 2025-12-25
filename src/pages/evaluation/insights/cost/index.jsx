import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import CostDonut from "./CostDonut";
import CostBreakdown from "./CostBreakdown";
import CostDetailedMetrics from "./CostDetailedMetrics";

import { DollarSign, Cpu, Mic, Volume2, ArrowLeft } from "lucide-react";

/* =========================
   Mock / API Response
========================= */

const response = {
  category: "cost",
  overall_score: 0.051149999999999994,
  passed: true,
  metrics: [
    {
      metric_name: "llm_token_usage",
      value: 0.0,
      passed: true,
      details: {
        total_cost_usd: 0.0,
      },
    },
    {
      metric_name: "stt_cost",
      value: 0.0,
      passed: true,
    },
    {
      metric_name: "tts_cost",
      value: 0.10229999999999999,
      passed: true,
    },
    {
      metric_name: "total_conversation_cost",
      value: 0.10229999999999999,
      passed: true,
      details: {
        total_cost_usd: 0.10229999999999999,
        llm_cost_usd: 0.0,
        stt_cost_usd: 0.0,
        tts_cost_usd: 0.10229999999999999,
        cost_breakdown: {
          llm_percentage: 0,
          stt_percentage: 0,
          tts_percentage: 100,
        },
      },
    },
  ],
};

/* =========================
   Helpers
========================= */

const getMetric = (name) =>
  response.metrics.find((m) => m.metric_name === name);

const formatUSD = (value) => `$${value.toFixed(2)}`;

/* =========================
   Component
========================= */

const CostOverview = ({ onBack }) => {
  const totalCostMetric = getMetric("total_conversation_cost");


  const totalCost = totalCostMetric?.details?.total_cost_usd ?? 0;
  const llmCost = totalCostMetric?.details?.llm_cost_usd ?? 0;
  const sttCost = totalCostMetric?.details?.stt_cost_usd ?? 0;
  const ttsCost = totalCostMetric?.details?.tts_cost_usd ?? 0;

  const breakdown =
    totalCostMetric?.details?.cost_breakdown ?? {
      llm_percentage: 0,
      stt_percentage: 0,
      tts_percentage: 0,
    };

  return (
    <div className="flex flex-col gap-8">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
      )}

      {/* Header */}
      <InsightHeaderCard
        icon={DollarSign}
        title="Cost"
        description="Tracks LLM, STT, and TTS costs"
        score={Math.round(response.overall_score * 100)}
        passedCount={response.metrics.filter((m) => m.passed).length}
        failedCount={response.metrics.filter((m) => !m.passed).length}
        theme="teal"
      />

      {/* Stat Cards */}
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
          title="LLM Cost"
          value={formatUSD(llmCost)}
          subtitle={`${breakdown.llm_percentage}% of total`}
          muted
        />
        <StatCard
          icon={Mic}
          title="STT Cost"
          value={formatUSD(sttCost)}
          subtitle={`${breakdown.stt_percentage}% of total`}
          muted
        />
        <StatCard
          icon={Volume2}
          title="TTS Cost"
          value={formatUSD(ttsCost)}
          subtitle={`${breakdown.tts_percentage}% of total`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostDonut
          data={[
            { id: "LLM", value: llmCost },
            { id: "STT", value: sttCost },
            { id: "TTS", value: ttsCost },
          ]}
        />
        <CostBreakdown breakdown={breakdown} />
      </div>

      {/* Detailed Metrics Table */}
      <CostDetailedMetrics metrics={response.metrics} />
    </div>
  );
};

export default CostOverview;
