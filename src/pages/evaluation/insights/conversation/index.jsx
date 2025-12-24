import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import {
  MessageSquare,
  SpellCheck,
  Brain,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import ConversationQualityIndicators from "./ConversationQualityIndicator";
import ConversationDetailedMetrics from "./ConversationDetailedMetrics";
import ConversationQualityBreakdown from "./ConversationQualityBreakdown";

/* =========================
   Dummy Conversation Data
========================= */
const DUMMY_CONVERSATION_DATA = {
  header: {
    score: 60,
    passed: 4,
    failed: 0,
  },
  metrics: [
    {
      icon: SpellCheck,
      title: "Grammar Quality",
      value: "100",
      subtitle: "Grammatical correctness",
    },
    {
      icon: Brain,
      title: "Context Maintenance",
      value: "100",
      subtitle: "Memory and coherence",
    },
    {
      icon: BookOpen,
      title: "Info Extraction",
      value: "100",
      subtitle: "Data capture accuracy",
      highlight: true,
    },
    {
      icon: HelpCircle,
      title: "Clarification Rate",
      value: "0",
      subtitle: "No clarifications needed – efficient!",
    },
  ],
};

/* =========================
   Conversation Overview
========================= */
const ConversationOverview = () => {
  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <InsightHeaderCard
        icon={MessageSquare}
        title="Conversation Quality"
        description="Assesses grammar, context retention, and coherence"
        score={DUMMY_CONVERSATION_DATA.header.score}
        passedCount={DUMMY_CONVERSATION_DATA.header.passed}
        failedCount={DUMMY_CONVERSATION_DATA.header.failed}
        theme="teal"
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DUMMY_CONVERSATION_DATA.metrics.map((metric, idx) => (
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
      {/* <ConversationQualityBreakdown/> */}
      <ConversationQualityIndicators/>
      <ConversationDetailedMetrics/>

    </div>
  );
};

export default ConversationOverview;
