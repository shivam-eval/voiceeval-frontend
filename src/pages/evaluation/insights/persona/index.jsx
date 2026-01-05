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
  typeof v === "number"
    ? (v > 1 ? Math.round(v) : Math.round(v * 100))
    : 0;

/* =========================
   Component
========================= */

const PersonaOverview = ({ response, data, onBack }) => {
  console.log('=== PersonaOverview Render ===');
  console.log('PersonaOverview received response:', response);
  console.log('PersonaOverview received data:', data);

  // Handle both single evaluation (response) and aggregated data (data)
  let metrics = [];
  let score = 0;

  if (response) {
    // Called from ViewReport with single evaluation's category data
    console.log('Using response.metrics:', response.metrics);
    metrics = response?.metrics || [];
    score = response?.score || 0;
  } else if (data) {
    // Called from Dashboard with aggregated data
    console.log('Using data - category_scores:', data.category_scores);
    const personaCategory = data.category_scores?.find(c => c.category === 'persona');
    console.log('Found persona category:', personaCategory);

    if (personaCategory) {
      metrics = personaCategory.metrics || [];
      score = personaCategory.average_score || 0;
    } else {
      // Fallback: aggregate from all evaluations
      const allMetrics = [];
      let totalScore = 0;
      let scoreCount = 0;

      data.evaluations?.forEach(evaluation => {
        const personaCat = evaluation.category_scores?.find(c => c.category === 'persona');
        if (personaCat?.metrics) {
          allMetrics.push(...personaCat.metrics);
          if (typeof personaCat.score === 'number') {
            totalScore += personaCat.score;
            scoreCount++;
          }
        }
      });

      metrics = allMetrics;
      score = scoreCount > 0 ? totalScore / scoreCount : 0;
      console.log('Aggregated persona metrics from evaluations:', metrics);
    }
  }

  console.log('Final metrics array:', metrics);
  console.log('Final score:', score);

  if (!metrics || metrics.length === 0) {
    console.warn('No persona metrics available - showing empty state');
    return (
      <div className="space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>
        )}
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-12 text-center">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No persona metrics available</p>
          <p className="text-gray-600 text-xs mt-1">
            {response ? 'Response has no metrics' : data ? 'Data has no persona category' : 'No data provided'}
          </p>
        </div>
      </div>
    );
  }

  console.log('Rendering PersonaOverview with', metrics.length, 'metrics');

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
        score={normalizeScore(score)}
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
      <PersonaAlignmentRadar metrics={metrics} />
      <PersonaDetailedMetrics metrics={metrics} />
    </div>
  );
};

export default PersonaOverview;
