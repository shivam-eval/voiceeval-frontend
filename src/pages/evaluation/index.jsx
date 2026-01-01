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
import CostOverview from "./insights/cost";
import AudioOverview from "./insights/audio";
import EndpointingOverview from "./insights/endpointing";
import PersonaOverview from "./insights/persona";
import TaskCompletionOverview from "./insights/task_completion";
import ConversationOverview from "./insights/conversation";
import SpeechMetrics from "./insights/speech";
import SentimentAnalysis from "./insights/sentiment";
import { useWorkflow } from "../../context/WorkFlowContext";

const CATEGORY = {
  OVERVIEW: "",
  ACCURACY: "accuracy",
  TASK_COMPLETION: "task_completion",
  LATENCY: "latency",
  COST: "cost",
  AUDIO: "audio_quality",
  ENDPOINTING: "endpointing",
  PERSONA: "persona",
  CONVERSATION: "conversation_quality",
  SPEECH: "speech",
  SENTIMENT: "sentiment"
};

const CATEGORY_TITLES = {
  [CATEGORY.OVERVIEW]: null,
  [CATEGORY.ACCURACY]: "ACCURACY OVERVIEW",
  [CATEGORY.LATENCY]: "LATENCY OVERVIEW",
  [CATEGORY.COST]: "COST OVERVIEW",
  [CATEGORY.AUDIO]: "AUDIO QUALITY OVERVIEW",
  [CATEGORY.ENDPOINTING]: "ENDPOINTING OVERVIEW",
  [CATEGORY.PERSONA]: "PERSONA ALIGNMENT OVERVIEW",
  [CATEGORY.TASK_COMPLETION]: "TASK COMPLETION OVERVIEW",
  [CATEGORY.CONVERSATION]: "CONVERSATION OVERVIEW",
  [CATEGORY.SPEECH]: "SPEECH ANALYSIS OVERVIEW",
  [CATEGORY.SENTIMENT]: "SENTIMENT ANALYSIS OVERVIEW"
};

const EvaluationDashboard = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORY.OVERVIEW);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const { workflow } = useWorkflow();
  console.log('Full workflow:', workflow);

  // Access the nested structure properly
  const simulationResult = workflow?.simulationResult;
  const fullResponse = simulationResult?.fullResponse;
  const evaluationResult = simulationResult?.evaluationResult;

  console.log('simulationResult:', simulationResult);
  console.log('fullResponse:', fullResponse);
  console.log('evaluationResult:', evaluationResult);

  if (!simulationResult || !fullResponse) {
    return <div className="text-gray-400 px-8">Loading evaluation…</div>;
  }

  // Get evaluations array from fullResponse
  const evaluations = fullResponse.evaluations || [];
  const simulationEvaluation = fullResponse.simulation_evaluation || {
    total_sessions_evaluated: 0,
    average_overall_score: 0,
    average_category_scores: [],
  };

  console.log('Evaluations:', evaluations);
  console.log('Simulation Evaluation:', simulationEvaluation);

  const firstEvaluation = evaluations[0];

  // Calculate total execution time from all evaluations
  const totalExecutionTime = evaluations.reduce((sum, evaluation) => {
    return sum + (evaluation.execution_time_ms || 0);
  }, 0) || 0;

  const averageExecutionTime = evaluations.length > 0
    ? totalExecutionTime / evaluations.length
    : 0;

  // Prepare simulation data
  const passedCount = evaluations.filter(e => e.passed).length;
  const failedCount = evaluations.length - passedCount;

  const simulationDataFromRes = {
    simulation_id: fullResponse.simulation_id || simulationResult.simulationId,
    execution_summary: {
      total_test_cases: evaluations.length,
      completed_test_cases: passedCount,
      failed_test_cases: failedCount,
    },
    timing: {
      start_time_ms: Date.now() - totalExecutionTime,
      end_time_ms: Date.now(),
      duration_ms: totalExecutionTime,
      average_duration_ms: averageExecutionTime
    },
    transcript_results: evaluations.map(evaluation => ({
      transcript_result_id: evaluation.evaluation_id,
      session_id: evaluation.session_id,
      path_id: evaluation.path_id,
      test_id: evaluation.test_case_name || evaluation.path_id || 'Test Case',
      status: evaluation.passed ? "completed" : "failed",
      overall_score: typeof evaluation.overall_score === 'number'
        ? Math.round(evaluation.overall_score * 100)
        : Math.round(parseFloat(evaluation.overall_score) * 100)
    })),
    flow_tree_name: firstEvaluation?.path_id || "Real Estate Qualification",
    schema_version: "1.0"
  };

  // Calculate summary metrics
  const summaryMetrics = [
    {
      id: "overall_score",
      mainText: `${Math.round(simulationEvaluation.average_overall_score * 100)}%`,
      successRate: simulationEvaluation.average_overall_score,
      sideText: "Overall Score"
    },
    {
      id: "accuracy",
      mainText: `${Math.round((simulationEvaluation.average_category_scores?.find(c => c.category === "accuracy")?.average_score || 0) * 100)}%`,
      successRate: simulationEvaluation.average_category_scores?.find(c => c.category === "accuracy")?.average_score || 0,
      sideText: "Accuracy"
    },
    {
      id: "task_completion",
      mainText: `${Math.round((simulationEvaluation.average_category_scores?.find(c => c.category === "task_completion")?.average_score || 0) * 100)}%`,
      successRate: simulationEvaluation.average_category_scores?.find(c => c.category === "task_completion")?.average_score || 0,
      sideText: "Task Completion"
    },
    {
      id: "latency",
      mainText: `${Math.round((simulationEvaluation.average_category_scores?.find(c => c.category === "latency")?.average_score || 0) * 100)}%`,
      successRate: simulationEvaluation.average_category_scores?.find(c => c.category === "latency")?.average_score || 0,
      sideText: "Latency"
    }
  ];

  // Prepare category scores for InsightTabs
  const categoryScores = (simulationEvaluation.average_category_scores || []).map(cat => ({
    category: cat.category,
    score: Math.round(cat.average_score * 100),
    weight: cat.average_weight
  }));

  // Generate improvements from ALL evaluations
  const improvements = [];

  evaluations.forEach((evaluation, evalIndex) => {
    if (evaluation.recommendations && Array.isArray(evaluation.recommendations) && evaluation.recommendations.length > 0) {
      evaluation.recommendations.forEach((rec, recIndex) => {
        let priority = "medium";
        if (evaluation.overall_score < 0.6 || recIndex === 0) {
          priority = "high";
        } else if (evaluation.overall_score > 0.85 || recIndex > 1) {
          priority = "low";
        }

        improvements.push({
          priority: priority,
          message: rec,
          metric: evaluation.test_case_name || evaluation.path_id || `Test Case #${evalIndex + 1}`,
          testCaseId: evaluation.evaluation_id,
          score: Math.round(evaluation.overall_score * 100)
        });
      });
    }

    if ((!evaluation.recommendations || evaluation.recommendations.length === 0) && evaluation.issues_found > 0) {
      improvements.push({
        priority: evaluation.overall_score < 0.6 ? "high" : "medium",
        message: `${evaluation.issues_found} issues found in this test case. Review detailed metrics for specifics.`,
        metric: evaluation.test_case_name || evaluation.path_id || `Test Case #${evalIndex + 1}`,
        testCaseId: evaluation.evaluation_id,
        score: Math.round(evaluation.overall_score * 100)
      });
    }
  });

  if (improvements.length === 0) {
    improvements.push(
      {
        priority: "high",
        message: "Semantic accuracy is below threshold. Review expected responses and validation criteria.",
        metric: "Accuracy",
      },
      {
        priority: "medium",
        message: "Pause detection flagged unusually long silences. Consider tuning endpointing thresholds.",
        metric: "Endpointing",
      },
      {
        priority: "low",
        message: "Conversation tone consistency can be improved for better persona alignment.",
        metric: "Persona",
      }
    );
  }

  const getTranscriptData = (transcriptId) => {
    // 1. Check if the evaluationData prop (real simulation response) has the transcript
    if (evaluationData?.transcript_steps) {
      return {
        ...evaluationData.transcript_steps,
        metadata: {
          ...(evaluationData.transcript_steps.metadata || {}),
          ...(evaluationData.metadata || {}) // Merge root metadata (contains audio_files)
        }
      };
    }

    // 2. Check in resData evaluations for the specific transcriptId
    const fullEvaluation = resData.evaluations?.find(
      e => e.evaluation_id === transcriptId || e.session_id === transcriptId
    );

    if (fullEvaluation?.transcript_steps) {
      return {
        ...fullEvaluation.transcript_steps,
        metadata: {
          ...(fullEvaluation.transcript_steps.metadata || {}),
          ...(fullEvaluation.metadata || {}),
          audio_files: fullEvaluation.audio_files || fullEvaluation.metadata?.audio_files || []
        }
      };
    }

    // 3. Fallback to mock transcripts
    return DEBT_COLLECTION_TRANSCRIPTS[transcriptId] || null;
  };

  const handleViewReport = (report) => {
    const evaluation = evaluations.find(
      (e) => e.session_id === report.session_id
    );

    if (!evaluation) {
      console.error("No evaluation found for session:", report.session_id);
      return;
    }

    setSelectedReport(report);
    setSelectedEvaluation(evaluation);

    const transcriptData = getTranscriptData(report.transcript_result_id);
    setSelectedTranscript(transcriptData);
  };

  const renderOverview = () => (
    <div className="flex flex-col gap-6">
      <SimulationOverview simulationData={simulationDataFromRes} />

      <CallResultsTable
        transcriptResults={simulationDataFromRes.transcript_results}
        onViewReport={handleViewReport}
        evaluationData={evaluations}
        simulationId={simulationDataFromRes.simulation_id}
      />

      <InsightTabs
        activeCategory={activeCategory}
        onChange={setActiveCategory}
        categoryScores={categoryScores}
        enabled={false}
      />

      <ImprovementsPanel
        improvements={improvements}
        totalTestCases={evaluations.length}
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
          simulationData={simulationDataFromRes}
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
      evaluations: evaluations,
      simulation_evaluation: simulationEvaluation,
      category_scores: simulationEvaluation.average_category_scores,
      fullResponse: fullResponse
    };

    console.log('Passing aggregated data to category view:', aggregatedData);

    switch (activeCategory) {
      case CATEGORY.ACCURACY:
        return <AccuracyView data={aggregatedData} onBack={handleBackToOverview} />;
      case CATEGORY.LATENCY:
        return <LatencyOverview data={aggregatedData} onBack={handleBackToOverview} />;
      case CATEGORY.COST:
        return <CostOverview data={aggregatedData} onBack={handleBackToOverview} />;
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
      case CATEGORY.SPEECH:
        return <SpeechMetrics evaluationData={aggregatedData} onBack={handleBackToOverview} />;
      case CATEGORY.SENTIMENT:
        return <SentimentAnalysis evaluationData={aggregatedData} onBack={handleBackToOverview} />;
      default:
        return renderOverview();
    }
  };

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
                Overall Score: {Math.round(simulationEvaluation.average_overall_score * 100)}% |
                Sessions: {simulationEvaluation.total_sessions_evaluated} |
                {firstEvaluation?.passed ? "PASSED" : "NEEDS IMPROVEMENT"}
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