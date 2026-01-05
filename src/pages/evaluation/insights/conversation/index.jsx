import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import {
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import ConversationDetailedMetrics from "./ConversationDetailedMetrics";
import ConversationQualityBreakdown from "./ConversationQualityBreakdown";

/* =========================
   COMPONENT
========================= */

const ConversationOverview = ({ response, data, onBack }) => {
  // Handle both single evaluation (response) and aggregated data (data)
  let metrics = [];
  let score = 0;

  if (response) {
    // Called from ViewReport with single evaluation's category data
    metrics = response?.metrics || [];
    score = typeof response.score === "number"
      ? (response.score > 1 ? Math.round(response.score) : Math.round(response.score * 100))
      : 0;
  } else if (data) {
    // Called from Dashboard with aggregated data
    const convCategory = data.category_scores?.find(c => c.category === 'conversation_quality');
    if (convCategory) {
      metrics = convCategory.metrics || [];
      score = typeof convCategory.average_score === "number"
        ? (convCategory.average_score > 1
          ? Math.round(convCategory.average_score)
          : Math.round(convCategory.average_score * 100))
        : 0;
    } else {
      // Fallback: aggregate from all evaluations
      const allMetrics = [];
      let totalScore = 0;
      let scoreCount = 0;

      data.evaluations?.forEach(evaluation => {
        const convCat = evaluation.category_scores?.find(c => c.category === 'conversation_quality');
        if (convCat?.metrics) {
          allMetrics.push(...convCat.metrics);
          if (typeof convCat.score === 'number') {
            totalScore += convCat.score;
            scoreCount++;
          }
        }
      });

      metrics = allMetrics;
      score = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 100) : 0;
    }
  }

  if (!metrics || metrics.length === 0) return null;

  /* -------------------------
     DERIVED VALUES
  ------------------------- */

  const passedCount = metrics.filter(
    (m) => m.status === "passed"
  ).length;

  const failedCount = metrics.filter(
    (m) => m.status === "failed"
  ).length;

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

      {/* Bar Graph */}
      <ConversationQualityBreakdown response={{ metrics }} />

      {/* Detailed Metrics */}
      <ConversationDetailedMetrics response={{ metrics }} />
    </div>
  );
};

export default ConversationOverview;
