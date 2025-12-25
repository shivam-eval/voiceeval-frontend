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

  // Mock simulation data if not provided
  const mockSimulationData = simulationData || {
    simulation_id: "sim_fc93ec45280d442fa6ac53c3c7ee760e",
    schema_version: "1.0",
    flow_tree_name: "real_estate_qualification_call",
    execution_summary: {
      total_test_cases: 2,
      completed_test_cases: 2,
      failed_test_cases: 0
    },
    transcript_results: [
      {
        test_id: "edge_case_inbound_never_enquired",
        session_id: "sess_ba4bc35a",
        status: "completed",
        transcript_result_id: "tr_a5e9d79623484405b197d6c51a298509"
      },
      {
        test_id: "edge_case_unexpected_lead_response",
        session_id: "sess_a2795cce",
        status: "completed",
        transcript_result_id: "tr_d9a6bf7fd32a42b0bd72821003e205fe"
      }
    ],
    timing: {
      start_time_ms: 1766639020707,
      end_time_ms: 1766639286826,
      duration_ms: 266119
    },
    created_at: "2025-12-25T05:08:06.878497"
  };

  // Mock transcript data
  const mockTranscriptData = {
    transcript_result_id: "tr_dd4da4ac006946c0a318a03d8241669e",
    test_id: "edge_case_inbound_never_enquired",
    session_id: "sess_50395981",
    status: "completed",
    timing: {
      start_time_ms: 1766640849574,
      end_time_ms: 1766640898131,
      duration_ms: 48556
    },
    steps: [
      {
        turn_number: 1,
        kind: "user_speak",
        text: "Thank you.",
        turn_id: "turn_001",
        turn_role: "user",
        speech_start_ms: 1766640857124.948,
        speech_end_ms: 1766640866407.331,
        duration_ms: 9282.383
      },
      {
        turn_number: 2,
        kind: "agent_speak",
        text: "Hey Priya, I actually don't remember enquiring about any property.",
        turn_id: "turn_002",
        turn_role: "agent",
        speech_start_ms: 1766640866407.9038,
        speech_end_ms: 1766640870030.2788,
        duration_ms: 3622.375,
        tts_start_ms: 1766640866407.9038,
        tts_end_ms: 1766640868445.292
      },
      {
        turn_number: 3,
        kind: "user_speak",
        text: "But I didn't.",
        turn_id: "turn_003",
        turn_role: "user",
        speech_start_ms: 1766640873611.092,
        speech_end_ms: 1766640881904.551,
        duration_ms: 8293.459
      },
      {
        turn_number: 4,
        kind: "agent_speak",
        text: "No, I'm sure I didn't make any enquiry. Maybe someone else used my details.",
        turn_id: "turn_004",
        turn_role: "agent",
        speech_start_ms: 1766640881904.969,
        speech_end_ms: 1766640886084.594,
        duration_ms: 4179.625,
        tts_start_ms: 1766640881904.969,
        tts_end_ms: 1766640883531.543
      },
      {
        turn_number: 5,
        kind: "user_speak",
        text: "No, I'm sorry, I didn't",
        turn_id: "turn_005",
        turn_role: "user",
        speech_start_ms: 1766640891610.375,
        speech_end_ms: 1766640897802.027,
        duration_ms: 6191.652
      }
    ],
    metadata: {
      total_turns: 5,
      agent_turns: 2,
      user_turns: 3,
      avg_response_latency_ms: null,
      avg_confidence: null,
      duration_ms: 48556
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setSelectedTranscript(mockTranscriptData);
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
              {selectedReport 
                ? "Test Report" 
                : activeCategory === CATEGORY.ACCURACY
                  ? "ACCURACY OVERVIEW"
                  : isRealData
                    ? "EVALUATION RESULTS"
                    : "SIMULATION DASHBOARD"}
            </h1>

            <p className="text-gray-400">
              {selectedReport 
                ? `Detailed analysis for ${selectedReport.test_id}`
                : isRealData
                  ? `Overall Score: ${Math.round(
                      evaluationData.overall_score * 100
                    )}% | ${
                      evaluationData.passed ? "PASSED" : "NEEDS IMPROVEMENT"
                    }`
                  : `Test Suite: Real Estate Qualification | Date: ${new Date().toLocaleDateString()}`}
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
