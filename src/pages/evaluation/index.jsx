import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
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
import { useSimulationReport } from "../../hooks/useEvaluations";
import { useSimulation } from "../../hooks/useSimulations";

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

const EvaluationDashboard = ({ onBack }) => {
  const { simulationId } = useParams();
  const [activeCategory, setActiveCategory] = useState(CATEGORY.OVERVIEW);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [batchEvaluationData, setBatchEvaluationData] = useState(null);

  // Ref to track if evaluation has been called
  const hasCalledEvaluation = useRef(false);

  const { workflow } = useWorkflow();

  // Fetch evaluation report from API
  const { data: apiReport, isLoading: isLoadingReport, error: reportError } = useSimulationReport(
    simulationId,
    'json'
  );

  // Fetch simulation details to get audio_file from metadata
  const { data: simulationDetails } = useSimulation(simulationId);

  // Try API data first, fall back to context data
  let fullResponse, simulationResult, evaluationResult;

  if (apiReport) {
    // Use API data
    fullResponse = apiReport;
    simulationResult = { simulationId };
    evaluationResult = apiReport.simulation_evaluation;
  } else {
    // Fall back to context data
    simulationResult = workflow?.simulationResult;
    fullResponse = simulationResult?.fullResponse;
    evaluationResult = simulationResult?.evaluationResult;
  }

  if (isLoadingReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mb-4"></div>
          <p className="text-gray-400">Loading evaluation report...</p>
        </div>
      </div>
    );
  }

  if (reportError) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 m-8">
        <h3 className="text-red-400 font-semibold mb-2">Error loading evaluation</h3>
        <p className="text-gray-400">{reportError.message || 'Failed to load evaluation report'}</p>
      </div>
    );
  }


  if (!simulationResult || !fullResponse) {
    return <div className="text-gray-400 px-8">No evaluation data available</div>;
  }

  // Get evaluations array from fullResponse
  const evaluations = fullResponse.evaluations || [];
  const simulationEvaluation = fullResponse.simulation_evaluation || {
    total_sessions_evaluated: 0,
    total_sessions: 0,
    evaluated_sessions: 0,
    average_overall_score: 0,
    average_scores: {
      overall: 0,
      by_category: {},
      by_metric: {}
    },
    average_category_scores: [], // Legacy format
  };

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
    simulation_id: fullResponse?.simulation_id || simulationId,
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

  // Extract category scores - support both old and new formats
  const getCategoryScore = (category) => {
    // New format: average_scores.by_category
    if (simulationEvaluation.average_scores?.by_category) {
      return simulationEvaluation.average_scores.by_category[category] || 0;
    }
    // Old format: average_category_scores array
    if (simulationEvaluation.average_category_scores) {
      const cat = simulationEvaluation.average_category_scores.find(c => c.category === category);
      return cat?.average_score || 0;
    }
    return 0;
  };

  // Get overall score - support both formats
  const overallScore = simulationEvaluation.average_scores?.overall
    || simulationEvaluation.average_overall_score
    || 0;

  // Calculate summary metrics
  const summaryMetrics = [
    {
      id: "overall_score",
      mainText: `${Math.round(overallScore * 100)}%`,
      successRate: overallScore,
      sideText: "Overall Score"
    },
    {
      id: "accuracy",
      mainText: `${Math.round(getCategoryScore("accuracy") * 100)}%`,
      successRate: getCategoryScore("accuracy"),
      sideText: "Accuracy"
    },
    {
      id: "task_completion",
      mainText: `${Math.round(getCategoryScore("task_completion") * 100)}%`,
      successRate: getCategoryScore("task_completion"),
      sideText: "Task Completion"
    },
    {
      id: "latency",
      mainText: `${Math.round(getCategoryScore("latency") * 100)}%`,
      successRate: getCategoryScore("latency"),
      sideText: "Latency"
    }
  ];

  // Prepare category scores for InsightTabs - support both formats
  let categoryScores = [];

  const avgScores = simulationEvaluation.average_scores;
  const avgCatScores = simulationEvaluation.average_category_scores;

  if (avgScores?.by_category && Object.keys(avgScores.by_category).length > 0) {
    // New format: convert object to array
    categoryScores = Object.entries(avgScores.by_category).map(([category, score]) => ({
      category: category,
      score: Math.round(score * 100),
      weight: 0 // Weight not provided in new format
    }));
  } else if (Array.isArray(avgCatScores) && avgCatScores.length > 0) {
    // Old format: use existing array
    categoryScores = avgCatScores.map(cat => ({
      category: cat.category,
      score: Math.round(cat.average_score * 100),
      weight: cat.average_weight || 0
    }));
  } else if (Array.isArray(evaluations) && evaluations.length > 0) {
    // Fallback: extract from first evaluation if available
    const firstEval = evaluations[0];
    if (Array.isArray(firstEval.category_scores)) {
      categoryScores = firstEval.category_scores.map(cat => ({
        category: cat.category,
        score: Math.round((cat.score || 0) * 100),
        weight: cat.weight || 0
      }));
    }
  }

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
    // No hardcoded fallbacks - just leave it empty if the backend doesn't provide anything
  }

  const getTranscriptData = async (sessionId) => {
    try {
      console.log('Fetching transcript for session:', sessionId);
      const json = await getSessionTranscript(sessionId);  // axios interceptor already extracts .data
      console.log('Transcript data:', json);

      // transcript_steps is directly an array in the API response
      const steps = json.transcript_steps || json.transcript || [];
      console.log('Transcript steps count:', steps.length);

      // Debug fullResponse availability
      console.log('getTranscriptData simulationDetails:', simulationDetails);
      console.log('getTranscriptData metadata:', simulationDetails?.metadata);
      console.log('getTranscriptData audio_file:', simulationDetails?.metadata?.audio_file);

      if (steps.length === 0) {
        console.warn('No transcript steps found in response');
        return null;
      }

      // Map the steps to the format expected by CallTranscriptPanel
      const mappedSteps = steps.map(step => ({
        ...step,
        turn_role: step.role === "agent" ? "agent" : "user",  // Map 'role' to 'turn_role'
        speech_start_ms: step.timing?.speech_start_ms,
        speech_end_ms: step.timing?.speech_end_ms,
        duration_ms: step.timing?.duration_ms
      }));
      // Construct full GCP storage URL for audio file
      const audioFilePath = simulationDetails?.metadata?.audio_file;
      const GCP_STORAGE_BASE_URL = 'https://storage.googleapis.com/voiceeval-public';
      const audioUrl = audioFilePath ? `${GCP_STORAGE_BASE_URL}/${audioFilePath}` : null;

      const transcriptData = {
        audio_url: audioUrl,
        steps: mappedSteps,
        metadata: {
          session_id: json.session_id,
          simulation_id: json.simulation_id,
          total_turns: steps.length,
          duration_ms: steps.length > 0 ? steps[steps.length - 1].timing?.speech_end_ms : 0
        }
      };

      console.log('Mapped transcript data:', transcriptData);
      return transcriptData;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  };


  const handleViewReport = async (report) => {
    try {
      const evaluation = evaluations.find(
        e => e.session_id === report.session_id
      );

      if (!evaluation) {
        console.error("No evaluation found for session:", report.session_id);
        toast.error("Evaluation data not found for this session");
        return;
      }

      setSelectedReport(report);
      setSelectedEvaluation(evaluation);

      const transcript = await getTranscriptData(report.session_id);
      setSelectedTranscript(transcript);

    } catch (err) {
      toast.error("Failed to load transcript: " + (err.message || "Unknown error"));
      setSelectedTranscript(null);
    }
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
        clickable={false}
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
    // Convert category scores to array format for components and populate metrics
    const categoryScoresArray = categoryScores.map(cs => {
      // Aggregate metrics for this category across all evaluations
      // to ensure we have a complete list even if some sessions skipped certain metrics
      const metricMap = new Map();

      if (Array.isArray(evaluations)) {
        evaluations.forEach(ev => {
          // Standard: pull metrics from this category
          const catData = ev.category_scores?.find(cat => cat.category === cs.category);
          if (catData?.metrics && Array.isArray(catData.metrics)) {
            catData.metrics.forEach(m => {
              const mName = m.name || m.metric_name;
              if (mName && !metricMap.has(mName)) {
                metricMap.set(mName, {
                  ...m,
                  name: mName
                });
              }
            });
          }

          // Special Case: ensure 'response_consistency' and 'semantic_accuracy' are in Accuracy
          if (cs.category === 'accuracy') {
            const allMetrics = ev.metrics || ev.metric_results || [];
            // If they are not in the top level, they might be in other categories
            const nestedMetrics = ev.category_scores?.flatMap(c => c.metrics || []) || [];
            const combined = [...allMetrics, ...nestedMetrics];

            combined.forEach(m => {
              const mName = m.name || m.metric_name;
              if ((mName === 'response_consistency' || mName === 'semantic_accuracy') && !metricMap.has(mName)) {
                metricMap.set(mName, {
                  ...m,
                  name: mName,
                  category: 'accuracy' // Force category match for consistency
                });
              }
            });
          }
        });
      }

      const metrics = Array.from(metricMap.values());

      return {
        category: cs.category,
        average_score: cs.score / 100, // Convert back to 0-1 for components
        metrics: metrics
      };
    });

    const aggregatedData = {
      evaluations: evaluations,
      simulation_evaluation: simulationEvaluation,
      category_scores: categoryScoresArray,
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
                Overall Score: {Math.round(overallScore * 100)}% |
                Sessions: {simulationEvaluation.total_sessions || simulationEvaluation.evaluated_sessions || simulationEvaluation.total_sessions_evaluated || 0} |
                {firstEvaluation?.passed ? "PASSED" : "NEEDS IMPROVEMENT"}
                {simulationEvaluation.created_at && (
                  <>
                    {" | "}
                    Created: {new Date(simulationEvaluation.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </>
                )}
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