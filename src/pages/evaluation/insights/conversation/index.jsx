import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import {
  MessageSquare,
  SpellCheck,
  Brain,
  BookOpen,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import ConversationDetailedMetrics from "./ConversationDetailedMetrics";

/* =========================
   METADATA
========================= */

const metricMeta = {
  grammar_quality: {
    title: "Grammar Quality",
    icon: SpellCheck,
    subtitle: "Grammatical correctness",
  },
  context_maintenance: {
    title: "Context Maintenance",
    icon: Brain,
    subtitle: "Memory and coherence",
  },
  information_extraction_accuracy: {
    title: "Info Extraction",
    icon: BookOpen,
    subtitle: "Data capture accuracy",
  },
  clarification_request_rate: {
    title: "Clarification Rate",
    icon: HelpCircle,
    subtitle: "Clarifications during conversation",
  },
};

/* =========================
   HELPERS
========================= */

const normalizeScore = (score) => {
  if (typeof score !== "number") return 0;
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
};

const transformStatCards = (response) => {
  if (!response || !Array.isArray(response.metrics)) return [];

  return response.metrics.map((m) => ({
    ...metricMeta[m.name],
    value: normalizeScore(m.score),
    highlight: m.status === "failed",
  }));
};

/* =========================
   COMPONENT
========================= */

const ConversationOverview = ({ response, onBack }) => {
  if (!response || !Array.isArray(response.metrics)) return null;

  /* -------------------------
     DERIVED VALUES
  ------------------------- */

  const score =
    typeof response.score === "number"
      ? Math.round(response.score * 100)
      : 0;

  const passedCount = response.metrics.filter(
    (m) => m.status === "passed"
  ).length;

  const failedCount = response.metrics.filter(
    (m) => m.status === "failed"
  ).length;

  const statCards = transformStatCards(response);

  /* =========================
     RENDER
  ========================= */

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
        icon={MessageSquare}
        title="Conversation Quality"
        description="Assesses grammar, context retention, and coherence"
        score={score}
        passedCount={passedCount}
        failedCount={failedCount}
        theme="teal"
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((metric, idx) => (
          <StatCard
            key={idx}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            highlight={metric.highlight}
          />
        ))}
      </div>

      {/* Detailed Metrics */}
      <ConversationDetailedMetrics response={response} />
    </div>
  );
};

export default ConversationOverview;
