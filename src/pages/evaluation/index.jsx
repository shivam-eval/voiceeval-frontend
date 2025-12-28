import { useState } from "react";
import resData from "../../data/res.json"
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
  AUDIO: "audio_quality",
  ENDPOINTING: "endpointing",
  PERSONA: "persona",
  CONVERSATION: "conversation_quality"
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
  [CATEGORY.CONVERSATION]: "CONVERSATION OVERVIEW"
};

const EvaluationDashboard = ({ evaluationData, simulationData, onBack }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORY.OVERVIEW);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  // Use res.json data
  const useResData = resData.simulation_evaluation;
  const firstEvaluation = resData.evaluations?.[0];
  
  // Calculate total execution time from all evaluations
  const totalExecutionTime = resData.evaluations?.reduce((sum, evaluation) => {
    return sum + (evaluation.execution_time_ms || 0);
  }, 0) || 0;
  
  const averageExecutionTime = resData.evaluations?.length > 0 
    ? totalExecutionTime / resData.evaluations.length 
    : 0;
  
  // Prepare simulation data from res.json for SimulationOverview
  const simulationDataFromRes = {
    simulation_id: resData.simulation_id,
    execution_summary: {
      total_test_cases: useResData.total_sessions_evaluated,
      completed_test_cases: firstEvaluation?.passed ? useResData.total_sessions_evaluated : 0,
      failed_test_cases: firstEvaluation?.passed ? 0 : useResData.total_sessions_evaluated
    },
    timing: {
      start_time_ms: Date.now() - totalExecutionTime,
      end_time_ms: Date.now(),
      duration_ms: totalExecutionTime,
      average_duration_ms: averageExecutionTime
    },
    transcript_results: resData.evaluations?.map(evaluation => ({
      transcript_result_id: evaluation.evaluation_id,
      session_id: evaluation.session_id,
      path_id: evaluation.path_id,
      test_id: evaluation.test_case_name || evaluation.path_id || 'Test Case',
      status: evaluation.passed ? "completed" : "failed",
      overall_score: typeof evaluation.overall_score === 'number' 
        ? Math.round(evaluation.overall_score * 100) 
        : Math.round(parseFloat(evaluation.overall_score) * 100)
    })) || [],
    flow_tree_name: firstEvaluation?.path_id || "Real Estate Qualification",
    schema_version: "1.0"
  };
  
  // Calculate summary metrics from res.json
  const summaryMetrics = [
    {
      id: "overall_score",
      mainText: `${Math.round(useResData.average_overall_score * 100)}%`,
      successRate: useResData.average_overall_score,
      sideText: "Overall Score"
    },
    {
      id: "accuracy",
      mainText: `${Math.round((useResData.average_category_scores?.find(c => c.category === "accuracy")?.average_score || 0) * 100)}%`,
      successRate: useResData.average_category_scores?.find(c => c.category === "accuracy")?.average_score || 0,
      sideText: "Accuracy"
    },
    {
      id: "task_completion",
      mainText: `${Math.round((useResData.average_category_scores?.find(c => c.category === "task_completion")?.average_score || 0) * 100)}%`,
      successRate: useResData.average_category_scores?.find(c => c.category === "task_completion")?.average_score || 0,
      sideText: "Task Completion"
    },
    {
      id: "latency",
      mainText: `${Math.round((useResData.average_category_scores?.find(c => c.category === "latency")?.average_score || 0) * 100)}%`,
      successRate: useResData.average_category_scores?.find(c => c.category === "latency")?.average_score || 0,
      sideText: "Latency"
    }
  ];

  // Prepare category scores for InsightTabs from res.json
  const categoryScores = useResData.average_category_scores.map(cat => ({
    category: cat.category,
    score: Math.round(cat.average_score * 100),
    weight: cat.average_weight
  }));

  // Generate improvements from ALL evaluations in res.json
  const improvements = [];
  
  resData.evaluations?.forEach((evaluation, evalIndex) => {
    // Access recommendations directly from evaluation object
    if (evaluation.recommendations && Array.isArray(evaluation.recommendations) && evaluation.recommendations.length > 0) {
      evaluation.recommendations.forEach((rec, recIndex) => {
        // Determine priority based on overall score and position
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
    
    // Also check for issues_found if recommendations is empty
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
  
  // If no recommendations found, add default improvements
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
    return DEBT_COLLECTION_TRANSCRIPTS[transcriptId] || null;
  };

  const handleViewReport = (report) => {
    // Find the full evaluation data for this test case
    // Handle both full and partial IDs
    const fullEvaluation = resData.evaluations?.find(
      evaluation => {
        // Try exact match first
        if (evaluation.evaluation_id === report.transcript_result_id) return true;
        // Try partial match (in case ID is truncated)
        if (evaluation.evaluation_id.startsWith(report.transcript_result_id)) return true;
        if (report.transcript_result_id.startsWith(evaluation.evaluation_id)) return true;
        return false;
      }
    );
    
    console.log('Report clicked:', report);
    console.log('Looking for evaluation_id:', report.transcript_result_id);
    console.log('Found evaluation:', fullEvaluation);
    console.log('Available evaluation IDs:', resData.evaluations?.map(e => e.evaluation_id));
    
    setSelectedReport({
      ...report,
      fullEvaluation: fullEvaluation
    });
    
    // Get transcript data if available
    const transcriptData = getTranscriptData(report.transcript_result_id);
    setSelectedTranscript(transcriptData);
  };

  const renderOverview = () => (
    <div className="flex flex-col gap-6">
      {/* Simulation Overview - Pass data from res.json */}
      <SimulationOverview simulationData={simulationDataFromRes} />

      {/* Call Results Table */}
      <CallResultsTable 
        transcriptResults={simulationDataFromRes.transcript_results}
        onViewReport={handleViewReport}
        evaluationData={resData.evaluations}
        simulationId={resData.simulation_id}
      />

      {/* Summary Metrics */}
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

      {/* Tabs - Pass categoryScores from res.json */}
      <InsightTabs
        activeCategory={activeCategory}
        onChange={setActiveCategory}
        categoryScores={categoryScores}
      />

      {/* Overview Panels */}
      <ImprovementsPanel 
        improvements={improvements}
        totalTestCases={resData.evaluations?.length || 0}
      />
    </div>
  );

  const renderActiveSection = () => {
    if (selectedReport) {
      // Use fullEvaluation from selectedReport, or try to find it again
      const evaluationToPass = selectedReport.fullEvaluation || 
        resData.evaluations?.find(evals => evals.evaluation_id === selectedReport.transcript_result_id);
      
      console.log('Passing to ViewReport:', {
        report: selectedReport,
        evaluation: evaluationToPass,
        transcript: selectedTranscript,
        simulation: simulationDataFromRes
      });
      
      return (
        <TestReportView
          report={selectedReport}
          evaluation={evaluationToPass}
          transcriptData={selectedTranscript}
          simulationData={simulationDataFromRes}
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
        return <AccuracyView data={firstEvaluation} onBack={handleBackToOverview} />;
      case CATEGORY.LATENCY:
        return <LatencyOverview data={firstEvaluation} onBack={handleBackToOverview} />;
      case CATEGORY.COST:
        return <CostOverview data={firstEvaluation} onBack={handleBackToOverview} />;
      case CATEGORY.AUDIO:
        return <AudioOverview data={firstEvaluation} onBack={handleBackToOverview} />;
      case CATEGORY.ENDPOINTING:
        return <EndpointingOverview data={firstEvaluation} onBack={handleBackToOverview} />;
      case CATEGORY.PERSONA:
        return <PersonaOverview data={firstEvaluation} onBack={handleBackToOverview} />;
      case CATEGORY.TASK_COMPLETION:
        return <TaskCompletionOverview data={firstEvaluation} onBack={handleBackToOverview} />;
      case CATEGORY.CONVERSATION:
        return <ConversationOverview data={firstEvaluation} onBack={handleBackToOverview} />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto h-full flex flex-col">
      {/* Header - Hide when showing report view */}
      {!selectedReport && (
        <div className="flex-shrink-0 px-8 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {CATEGORY_TITLES[activeCategory] || "EVALUATION RESULTS"}
              </h1>

              <p className="text-gray-400">
                Overall Score: {Math.round(useResData.average_overall_score * 100)}% | 
                Sessions: {useResData.total_sessions_evaluated} | 
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default EvaluationDashboard;