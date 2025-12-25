import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import {
  MessageSquare,
  SpellCheck,
  Brain,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import ConversationDetailedMetrics from "./ConversationDetailedMetrics";

/* =========================
   Dummy API Response
========================= */
const response = {
  category: "conversation_quality",
  overall_score: 0.75,
  passed: true,
  metrics: [
    {
      metric_name: "grammar_quality",
      passed: true,
      execution_time_ms: 7546.151161193848,
      value: 1.0,
      threshold: 0.8,
    },
    {
      metric_name: "context_maintenance",
      passed: true,
      execution_time_ms: 3906.0778617858887,
      value: 1.0,
      threshold: 0.85,
    },
    {
      metric_name: "information_extraction_accuracy",
      passed: true,
      execution_time_ms: 0.017404556274414062,
      value: 1.0,
      threshold: 0.9,
    },
    {
      metric_name: "clarification_request_rate",
      passed: true,
      execution_time_ms: 0.0362396240234375,
      value: 0.0,
    },
  ],
};

/* =========================
   Helpers
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
    subtitle: "No clarifications needed – efficient!",
  },
};

const transformStatCards = (response) =>
  response.metrics.map((m) => ({
    ...metricMeta[m.metric_name],
    value: Math.round(m.value * 100),
    highlight: !m.passed,
  }));

/* =========================
   Conversation Overview
========================= */
const ConversationOverview = () => {
  const score = Math.round(response.overall_score * 100);
  const passedCount = response.metrics.filter((m) => m.passed).length;
  const failedCount = response.metrics.length - passedCount;

  const statCards = transformStatCards(response);

  return (
    <div className="flex flex-col gap-8">
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
