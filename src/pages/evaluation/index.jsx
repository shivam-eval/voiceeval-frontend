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
  DEBT_COLLECTION_SIMULATION,
  DEBT_COLLECTION_EVALUATION,
  DEBT_COLLECTION_TRANSCRIPTS,
} from "./const";
import TestReportView from "./viewreport/ViewReport";
import SummaryMetric from "./SummaryMetrics";
import InsightTabs from "./InsightTab";
import EvaluationTable from "./EvaluationTable";
import CallResultsTable from "./CallResultsTable";
import SimulationOverview from "./SimulationOverview";
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


const EvaluationDashboard = ({ evaluationData, simulationData, onBack }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORY.OVERVIEW);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  const isRealData = hasEvaluationData(evaluationData);
  const displayData = isRealData
    ? transformEvaluationData(evaluationData)
    : EVALUATION_DATA;

  // Use debt collection simulation data if not provided
  const mockSimulationData = simulationData || DEBT_COLLECTION_SIMULATION;

  // Get transcript data from DEBT_COLLECTION_TRANSCRIPTS
  const getTranscriptData = (transcriptId) => {
    return DEBT_COLLECTION_TRANSCRIPTS[transcriptId] || null;
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    const transcriptData = getTranscriptData(report.transcript_result_id);
    setSelectedTranscript(transcriptData);
  };

  // -----------------------------
  // OVERVIEW (FULL NORMAL UI)
  // -----------------------------
  const renderOverview = () => (
    <div className="flex flex-col gap-6">
      {/* Simulation Overview */}
      <SimulationOverview simulationData={mockSimulationData} />

      {/* Call Results Table */}
      <CallResultsTable 
        transcriptResults={mockSimulationData.transcript_results}
        onViewReport={handleViewReport}
      />

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
    </div>
  );

  const renderActiveSection = () => {
  // Report view has highest priority
  if (selectedReport) {
    return (
      <TestReportView
        report={selectedReport}
        transcriptData={selectedTranscript}
        onBack={() => {
          setSelectedReport(null);
          setSelectedTranscript(null);
        }}
      />
    );
  }

  const handleBackToOverview = () => {
    setActiveCategory(CATEGORY.OVERVIEW);
  };

  switch (activeCategory) {
    case CATEGORY.ACCURACY:
      return <AccuracyView data={displayData} onBack={handleBackToOverview} />;

    case CATEGORY.LATENCY:
      return <LatencyOverview data={displayData} onBack={handleBackToOverview} />;

    case CATEGORY.COST:
      return <CostOverview data={displayData} onBack={handleBackToOverview} />;

    case CATEGORY.AUDIO:
      return <AudioOverview data={displayData} onBack={handleBackToOverview} />;

    case CATEGORY.ENDPOINTING:
      return <EndpointingOverview data={displayData} onBack={handleBackToOverview} />;

    case CATEGORY.PERSONA:
      return <PersonaOverview data={displayData} onBack={handleBackToOverview} />;

    case CATEGORY.TASK_COMPLETION:
      return <TaskCompletionOverview data={displayData} onBack={handleBackToOverview} />;
    
    case CATEGORY.CONVERSATION:
      return <ConversationOverview data={displayData} onBack={handleBackToOverview} />

    default:
      return renderOverview();
  }
};

  // -----------------------------
  // JSX
  // -----------------------------
  return (
    <div className="w-full max-w-screen-2xl mx-auto h-full flex flex-col">
      {/* Header - Hide when showing report view */}
      {!selectedReport && (
        <div className="flex-shrink-0 px-8 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {activeCategory === CATEGORY.ACCURACY
                  ? "ACCURACY OVERVIEW"
                  : isRealData
                    ? "EVALUATION RESULTS"
                    : "SIMULATION DASHBOARD"}
              </h1>

              <p className="text-gray-400">
                {isRealData
                  ? `Overall Score: ${Math.round(
                      evaluationData.overall_score * 100
                    )}% | ${
                      evaluationData.passed ? "PASSED" : "NEEDS IMPROVEMENT"
                    }`
                  : `Test Suite: Debt Collection Compliance | Date: ${new Date().toLocaleDateString()}`}
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
      )}

      {/* Content — SINGLE RENDER POINT */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default EvaluationDashboard;
