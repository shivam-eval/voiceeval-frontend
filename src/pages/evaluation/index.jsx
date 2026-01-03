import { useEffect, useState } from "react";
import {
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
import AudioOverview from "./insights/audio";
import EndpointingOverview from "./insights/endpointing";
import PersonaOverview from "./insights/persona";
import TaskCompletionOverview from "./insights/task_completion";
import ConversationOverview from "./insights/conversation";
import { useWorkflow } from "../../context/WorkFlowContext";
import { getSessionTranscript } from "../../api/services/simulation.service";

const CATEGORY = {
  OVERVIEW: "",
  ACCURACY: "accuracy",
  TASK_COMPLETION: "task_completion",
  LATENCY: "latency",
  AUDIO: "audio_quality",
  ENDPOINTING: "endpointing",
  PERSONA: "persona",
  CONVERSATION: "conversation_quality"
};

const CATEGORY_TITLES = {
  [CATEGORY.OVERVIEW]: null,
  [CATEGORY.ACCURACY]: "ACCURACY OVERVIEW",
  [CATEGORY.LATENCY]: "LATENCY OVERVIEW",
  [CATEGORY.AUDIO]: "AUDIO QUALITY OVERVIEW",
  [CATEGORY.ENDPOINTING]: "ENDPOINTING OVERVIEW",
  [CATEGORY.PERSONA]: "PERSONA ALIGNMENT OVERVIEW",
  [CATEGORY.TASK_COMPLETION]: "TASK COMPLETION OVERVIEW",
  [CATEGORY.CONVERSATION]: "CONVERSATION OVERVIEW"
};

const EvaluationDashboard = ({ evaluationData: propEvaluationData, simulationData: propSimulationData, onBack }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORY.OVERVIEW);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const { workflow } = useWorkflow();

  // Determine which data source to use: props (real), workflow (real), or resData (mock)
  const simulationResult = workflow?.simulationResult;
  const fullResponse = simulationResult?.fullResponse;
  
  const evaluationData = propEvaluationData || fullResponse?.simulation_evaluation;
  const simulationData = propSimulationData;
  const evaluations = propEvaluationData?.evaluations || fullResponse?.evaluations || [];
  
  const isUsingRealData = !!(evaluationData || simulationData || fullResponse);

  // Simulation Data Logic
  const currentSimulationData = simulationData || (fullResponse ? {
    simulation_id: fullResponse.simulation_id || simulationResult?.simulationId,
    execution_summary: {
      total_test_cases: evaluations.length,
      completed_test_cases: evaluations.filter(e => e.passed).length,
      failed_test_cases: evaluations.filter(e => !e.passed).length,
    },
    timing: {
      duration_ms: evaluations.reduce((sum, e) => sum + (e.execution_time_ms || 0), 0),
    },
    transcript_results: evaluations.map(evaluation => ({
      transcript_result_id: evaluation.evaluation_id,
      session_id: evaluation.session_id,
      path_id: evaluation.path_id,
      test_id: evaluation.test_case_name || evaluation.path_id || 'Test Case',
      status: evaluation.passed ? "completed" : "failed",
      overall_score: Math.round((evaluation.overall_score || 0) * 100)
    })),
    flow_tree_name: evaluations[0]?.path_id || "Real Estate Qualification",
  } : {
    simulation_id: "",
    execution_summary: { total_test_cases: 0, completed_test_cases: 0, failed_test_cases: 0 },
    timing: { duration_ms: 0 },
    transcript_results: [],
    flow_tree_name: "Real Estate Qualification",
  });

  // Evaluation Metrics Logic
  const evalSource = evaluationData || fullResponse?.simulation_evaluation;
  
  const summaryMetrics = [
    {
      id: "overall_score",
      mainText: `${Math.round((evalSource?.average_overall_score || 0) * 100)}%`,
      successRate: evalSource?.average_overall_score || 0,
      sideText: "Overall Score"
    },
    {
      id: "accuracy",
      mainText: `${Math.round((evalSource?.average_category_scores?.find(c => c.category === "accuracy")?.average_score || 0) * 100)}%`,
      successRate: evalSource?.average_category_scores?.find(c => c.category === "accuracy")?.average_score || 0,
      sideText: "Accuracy"
    },
    {
      id: "task_completion",
      mainText: `${Math.round((evalSource?.average_category_scores?.find(c => c.category === "task_completion")?.average_score || 0) * 100)}%`,
      successRate: evalSource?.average_category_scores?.find(c => c.category === "task_completion")?.average_score || 0,
      sideText: "Task Completion"
    },
    {
      id: "latency",
      mainText: `${Math.round((evalSource?.average_category_scores?.find(c => c.category === "latency")?.average_score || 0) * 100)}%`,
      successRate: evalSource?.average_category_scores?.find(c => c.category === "latency")?.average_score || 0,
      sideText: "Latency"
    }
  ];

  const categoryScores = (evalSource?.average_category_scores || []).map(cat => ({
    category: cat.category,
    score: Math.round(cat.average_score * 100),
    weight: cat.average_weight
  }));

  // Improvements Logic
  const evaluationsList = evaluations;
  const improvements = [];
  
  evaluationsList.forEach((evaluation, evalIndex) => {
    if (evaluation.recommendations?.length > 0) {
      evaluation.recommendations.forEach((rec, recIndex) => {
        let priority = "medium";
        if (evaluation.overall_score < 0.6 || recIndex === 0) priority = "high";
        else if (evaluation.overall_score > 0.85 || recIndex > 1) priority = "low";
        
        improvements.push({
          priority,
          message: rec,
          metric: evaluation.test_case_name || evaluation.path_id || `Test Case #${evalIndex + 1}`,
          testCaseId: evaluation.evaluation_id,
          score: Math.round((evaluation.overall_score || 0) * 100)
        });
      });
    }
  });
  
  if (improvements.length === 0) {
    improvements.push(
      { priority: "high", message: "Semantic accuracy is below threshold. Review expected responses.", metric: "Accuracy" },
      { priority: "medium", message: "Pause detection flagged unusually long silences.", metric: "Endpointing" }
    );
  }

  const getTranscriptData = async (transcriptId) => {
    // 1. Check in real evaluation data if present
    const evaluation = evaluationsList.find(
      e => e.evaluation_id === transcriptId || e.session_id === transcriptId
    );

    if (evaluation?.transcript_steps) {
      return {
        ...evaluation.transcript_steps,
        metadata: {
          ...(evaluation.transcript_steps.metadata || {}),
          ...(evaluation.metadata || {}),
          audio_files: evaluation.audio_files || evaluation.metadata?.audio_files || []
        }
      };
    }

    // 2. Fallback to API call if sessionId is available
    if (evaluation?.session_id) {
      try {
        const res = await getSessionTranscript(evaluation.session_id);
        const t = res.data.transcript_steps || {};
        return {
          steps: (t.steps || []).map(step => ({
            ...step,
            turn_role: step.turn_role === "simulator" ? "user" : step.turn_role
          })),
          metadata: {
            ...(t.metadata || {}),
            duration_ms: t.timing?.duration_ms,
            audio_files: evaluation.audio_files || evaluation.metadata?.audio_files || []
          }
        };
      } catch (err) {
        console.error("Failed to fetch transcript:", err);
      }
    }

    return null;
  };

  const handleViewReport = async (report) => {
    const transcriptId = report.transcript_result_id || report.session_id;
    const fullEvaluation = evaluationsList.find(
      e => e.evaluation_id === transcriptId || e.session_id === transcriptId
    );
    
    setSelectedReport(report);
    setSelectedEvaluation(fullEvaluation);
    
    const transcriptData = await getTranscriptData(transcriptId);
    setSelectedTranscript(transcriptData);
  };

  const renderOverview = () => (
    <div className="flex flex-col gap-6">
      <SimulationOverview simulationData={currentSimulationData} />

      <CallResultsTable 
        transcriptResults={currentSimulationData.transcript_results}
        onViewReport={handleViewReport}
        evaluationData={evaluationsList}
        simulationId={currentSimulationData.simulation_id}
      />

      <div className="grid grid-cols-4 gap-4">
        {summaryMetrics.map((metric) => (
          <SummaryMetric
            key={metric.id}
            mainText={metric.mainText}
            successRate={metric.successRate}
            sideText={metric.sideText}
          />
        ))}
      </div>

      <InsightTabs
        activeCategory={activeCategory}
        onChange={setActiveCategory}
        categoryScores={categoryScores}
      />

      <ImprovementsPanel 
        improvements={improvements}
        totalTestCases={evaluationsList.length}
      />
    </div>
  );

  const renderActiveSection = () => {
    if (selectedReport) {
      return (
        <TestReportView
          report={selectedReport}
          evaluation={selectedEvaluation}
          transcriptData={selectedTranscript}
          simulationData={currentSimulationData}
          onBack={() => {
            setSelectedReport(null);
            setSelectedTranscript(null);
            setSelectedEvaluation(null);
          }}
        />
      );
    }

    const handleBackToOverview = () => {
      setActiveCategory(CATEGORY.OVERVIEW);
    };

    // Create aggregated data for category views
    const aggregatedData = {
      evaluations: evaluationsList,
      simulation_evaluation: evalSource,
      category_scores: evalSource?.average_category_scores,
      fullResponse: fullResponse
    };

    switch (activeCategory) {
      case CATEGORY.ACCURACY:
        return <AccuracyView data={aggregatedData} onBack={handleBackToOverview} />;
      case CATEGORY.LATENCY:
        return <LatencyOverview data={aggregatedData} onBack={handleBackToOverview} />;
      case CATEGORY.AUDIO:
        return <AudioOverview data={aggregatedData} onBack={handleBackToOverview} />;
      case CATEGORY.ENDPOINTING:
        return <EndpointingOverview data={aggregatedData} onBack={handleBackToOverview} />;
      case CATEGORY.PERSONA:
        return <PersonaOverview data={aggregatedData} onBack={handleBackToOverview} />;
      case CATEGORY.TASK_COMPLETION:
        return <TaskCompletionOverview data={aggregatedData} onBack={handleBackToOverview} />;
      case CATEGORY.CONVERSATION:
        return <ConversationOverview data={aggregatedData} onBack={handleBackToOverview} />;
      default:
        return renderOverview();
    }
  };

  const displayEvaluation = evalSource || {};
  const isPassed = evaluationsList.some(e => e.passed);

  return (
    <div className="w-full max-w-screen-2xl mx-auto h-full flex flex-col">
      {!selectedReport && (
        <div className="flex-shrink-0 px-8 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {CATEGORY_TITLES[activeCategory] || "EVALUATION RESULTS"}
              </h1>

              <p className="text-gray-400">
                Overall Score: {Math.round((displayEvaluation.average_overall_score || 0) * 100)}% |
                Sessions: {displayEvaluation.total_sessions_evaluated || evaluationsList.length} |
                {isPassed ? "PASSED" : "NEEDS IMPROVEMENT"}
              </p>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium"
              >
                Back to Results
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default EvaluationDashboard;
