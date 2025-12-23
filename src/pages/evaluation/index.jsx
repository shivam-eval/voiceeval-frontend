import { useState } from "react";
import {
  transformEvaluationData,
  hasEvaluationData,
} from "../../utils/evaluationTransform";

import {
  EVALUATION_DATA,
  SUMMARY_METRICS,
  EVALUATION_TABLE_DATA,
  DUMMY_CATEGORY_SCORES,
} from "./const";
import TestReportView from "./viewreport/ViewReport";
import SummaryMetric from "./SummaryMetrics";
import InsightTabs from "./InsightTab";
import EvaluationTable from "./EvaluationTable";
import ImprovementsPanel from "./PriorityImprovements";
import AccuracyView from "./insights/accuracy/Accuracy";

const CATEGORY = {
  OVERVIEW: "",
  ACCURACY: "accuracy",
};

const EvaluationDashboard = ({ evaluationData, onBack }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORY.OVERVIEW);
const [selectedReport, setSelectedReport] = useState(null);

  const isRealData = hasEvaluationData(evaluationData);
  const displayData = isRealData
    ? transformEvaluationData(evaluationData)
    : EVALUATION_DATA;

  // -----------------------------
  // OVERVIEW (FULL NORMAL UI)
  // -----------------------------
  const renderOverview = () => (
    <div className="flex flex-col gap-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {SUMMARY_METRICS.map((metric) => (
          <SummaryMetric
            key={metric.id}
            mainText={metric.mainText}
            successRate={metric.successRate}
            sideText={metric.sideText}
          />
        ))}
      </div>

      {/* Tabs */}
      <InsightTabs
        active={activeCategory}
        onChange={setActiveCategory}
        categoryScores={
          displayData?.category_scores?.length
            ? displayData.category_scores
            : DUMMY_CATEGORY_SCORES
        }
      />

      {/* Overview Panels */}
      <ImprovementsPanel
        improvements={[
          {
            priority: "high",
            message:
              "Semantic accuracy is below threshold. Review expected responses and validation criteria.",
            metric: "Accuracy",
          },
          {
            priority: "medium",
            message:
              "Pause detection flagged unusually long silences. Consider tuning endpointing thresholds.",
            metric: "Endpointing",
          },
          {
            priority: "low",
            message:
              "Conversation tone consistency can be improved for better persona alignment.",
            metric: "Persona",
          },
        ]}
      />

      <EvaluationTable
        data={EVALUATION_TABLE_DATA}
       onViewReport={(row) => setSelectedReport(row)}
      />
    </div>
  );

  // -----------------------------
  // SWITCH RENDERER
  // -----------------------------
const renderActiveSection = () => {
  if (selectedReport) {
    return (
      <TestReportView/>
    );
  }

  switch (activeCategory) {
    case CATEGORY.ACCURACY:
      return <AccuracyView data={displayData} />;
    default:
      return renderOverview();
  }
};


  // -----------------------------
  // JSX
  // -----------------------------
  return (
    <div className="w-full max-w-screen-2xl mx-auto h-full flex flex-col">
      {/* Header stays always */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
  {activeCategory === CATEGORY.ACCURACY
    ? "ACCURACY OVERVIEW"
    : isRealData
      ? "EVALUATION RESULTS"
      : "VAPI CALL TESTING DASHBOARD"}
</h1>

            <p className="text-gray-400">
              {isRealData
                ? `Overall Score: ${Math.round(
                    evaluationData.overall_score * 100
                  )}% | ${
                    evaluationData.passed ? "PASSED" : "NEEDS IMPROVEMENT"
                  }`
                : `Test Suite: Car Dealership Outbound | Date: ${new Date().toLocaleDateString()}`}
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium"
            >
              Back
            </button>
          )}
        </div>
      </div>

      {/* Content — SINGLE RENDER POINT */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default EvaluationDashboard;
