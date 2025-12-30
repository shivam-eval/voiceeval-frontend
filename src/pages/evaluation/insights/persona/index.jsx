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

const normalizeScore = (v) =>
  typeof v === "number" ? Math.round(v * 100) : 0;

/* =========================
   Component
========================= */

const PersonaOverview = ({ response, onBack }) => {
  if (!response || !Array.isArray(response.metrics)) return null;
console.log("persona", response)
  const metrics = response.metrics;

  const passedCount = metrics.filter((m) => m.status === "passed").length;
  const failedCount = metrics.length - passedCount;

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
        description="Evaluates persona consistency and communication tone"
        score={normalizeScore(response.score)}
        passedCount={passedCount}
        failedCount={failedCount}
        theme="teal"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => {
          const config = PERSONA_CARD_CONFIG[metric.name];
          if (!config) return null;

          return (
            <StatCard
              key={idx}
              icon={config.icon}
              title={config.title}
              value={normalizeScore(metric.value)}
              subtitle={config.subtitle}
            />
          );
        })}
      </div>

      {/* Persona Stability Panel */}
      {failedCount === 0 && (
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
              appropriateness throughout the conversation. Brand safety is
              assured.
            </p>
          </div>
        </div>
      )}

      {/* Radar & Details */}
      <PersonaAlignmentRadar metrics={response.metrics} />
      <PersonaDetailedMetrics metrics={response.metrics} />
    </div>
  );
};

export default PersonaOverview;
