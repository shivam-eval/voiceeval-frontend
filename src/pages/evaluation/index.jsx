import { useState, useEffect } from "react";
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
import LatencyOverview from "./insights/latency";
import CostOverview from "./insights/cost";
import AudioOverview from "./insights/audio";
import EndpointingOverview from "./insights/endpointing";
import PersonaOverview from "./insights/persona";
import TaskCompletionOverview from "./insights/task_completion";
import ConversationOverview from "./insights/conversation";


const CATEGORY = {
  OVERVIEW: "",
  ACCURACY: "accuracy",
  TASK_COMPLETION: "task_completion",
  LATENCY: "latency",
  COST: "cost",
  AUDIO: "audio",
  ENDPOINTING: "endpointing",
  PERSONA: "persona",
  CONVERSATION:"conversation"
};
const CATEGORY_TITLES = {
  [CATEGORY.OVERVIEW]: null, // handled separately
  [CATEGORY.ACCURACY]: "ACCURACY OVERVIEW",
  [CATEGORY.LATENCY]: "LATENCY OVERVIEW",
  [CATEGORY.COST]: "COST OVERVIEW",
  [CATEGORY.AUDIO]: "AUDIO QUALITY OVERVIEW",
  [CATEGORY.ENDPOINTING]: "ENDPOINTING OVERVIEW",
  [CATEGORY.PERSONA]: "PERSONA ALIGNMENT OVERVIEW",
  [CATEGORY.TASK_COMPLETION]: "TASK COMPLETION OVERVIEW",
  [CATEGORY.CONVERSATION]:"CONVERSATION OVERVIEW"
};


const EvaluationDashboard = ({ evaluationData, onBack }) => {
  const [activeCategory, setActiveCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("preview") || CATEGORY.OVERVIEW;
  });
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveCategory(params.get("preview") || CATEGORY.OVERVIEW);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    const url = new URL(window.location.href);
    if (category === CATEGORY.OVERVIEW) {
      url.searchParams.delete("preview");
    } else {
      url.searchParams.set("preview", category);
    }
    window.history.pushState({}, "", url);
  };

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
        onChange={handleCategoryChange}
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
  // Report view has highest priority
  if (selectedReport) {
    return (
      <TestReportView
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  switch (activeCategory) {
    case CATEGORY.ACCURACY:
      return <AccuracyView data={displayData} />;

    case CATEGORY.LATENCY:
      return <LatencyOverview data={displayData} />;

    case CATEGORY.COST:
      return <CostOverview data={displayData} />;

    case CATEGORY.AUDIO:
      return <AudioOverview data={displayData} />;

    case CATEGORY.ENDPOINTING:
      return <EndpointingOverview data={displayData} />;

    case CATEGORY.PERSONA:
      return <PersonaOverview data={displayData} />;

    case CATEGORY.TASK_COMPLETION:
      // Optional: create later
      return <TaskCompletionOverview data={displayData}/>;
    
    case CATEGORY.CONVERSATION:
      return <ConversationOverview data={displayData}/>

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
              {CATEGORY_TITLES[activeCategory] ??
                (isRealData ? "EVALUATION RESULTS" : "VAPI CALL TESTING DASHBOARD")}
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

          <div className="flex items-center gap-2">
            {activeCategory !== CATEGORY.OVERVIEW && (
              <button
                onClick={() => handleCategoryChange(CATEGORY.OVERVIEW)}
                className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium"
              >
                Back to Overview
              </button>
            )}
            {onBack && activeCategory === CATEGORY.OVERVIEW && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium"
              >
                Back
              </button>
            )}
          </div>
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
