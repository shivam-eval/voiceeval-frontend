import {
  User,
  MessageSquare,
  Globe,
  Heart,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import PersonaDetailedMetrics from "./PersonaDetailedMetric";
import PersonaAlignmentRadar from "./PersonaRadar";

/* =========================
   API / Evaluation Response
========================= */

const response = {
  "category": "persona",
  "overall_score": 0.89,
  "passed": true,
  "metrics": [
    {
      "metric_name": "persona_consistency",
      "category": "persona",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 0.020503997802734375,
      "value": 0.91,
      "threshold": 0.8
    },
    {
      "metric_name": "tone_appropriateness",
      "category": "persona",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 0.009775161743164062,
      "value": 0.84,
      "threshold": 0.75
    },
    {
      "metric_name": "region_appropriate_language",
      "category": "persona",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 0.008344650268554688,
      "value": 0.88
    },
    {
      "metric_name": "behavior_trait_alignment",
      "category": "persona",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 0.007867813110351562,
      "value": 0.93
    }
  ]
}

/* =========================
   Helpers
========================= */

const PERSONA_CARD_CONFIG = {
  persona_consistency: {
    icon: User,
    title: "Consistency",
    subtitle: "Persona maintained throughout",
  },
  tone_appropriateness: {
    icon: MessageSquare,
    title: "Tone",
    subtitle: "Appropriate communication style",
  },
  region_appropriate_language: {
    icon: Globe,
    title: "Regional Language",
    subtitle: "Culturally appropriate",
  },
  behavior_trait_alignment: {
    icon: Heart,
    title: "Behavior",
    subtitle: "Trait alignment",
  },
};

/* =========================
   Component
========================= */

const PersonaOverview = ({ onBack }) => {
  const passedCount = response.metrics.filter((m) => m.passed).length;
  const failedCount = response.metrics.length - passedCount;

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
        icon={User}
        title="Persona"
        description="Evaluates persona consistency and tone appropriateness"
        score={Math.round(response.overall_score * 100)}
        passedCount={passedCount}
        failedCount={failedCount}
        theme="teal"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {response.metrics.map((metric, idx) => {
          const config = PERSONA_CARD_CONFIG[metric.metric_name];
          if (!config) return null;

          return (
            <StatCard
              key={idx}
              icon={config.icon}
              title={config.title}
              value={Math.round(metric.value * 100)}
              subtitle={config.subtitle}
            />
          );
        })}
      </div>

      {/* Persona Stability Panel */}
      <div className="bg-[#0b1f26] border border-teal-500/30 rounded-xl p-6 flex items-start gap-4">
        <div className="p-3 rounded-lg bg-teal-500/20 text-teal-400">
          <ShieldCheck size={28} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-teal-300 mb-1">
            Persona Stable & Consistent
          </h3>
          <p className="text-teal-200/80">
            The agent maintained consistent personality, tone, and cultural
            appropriateness throughout the entire conversation. Brand safety
            is assured.
          </p>
        </div>
      </div>

      {/* ================= Radar ================= */}
      <PersonaAlignmentRadar response={response} />

      <PersonaDetailedMetrics response={response} />
    </div>
  );
};

export default PersonaOverview;
