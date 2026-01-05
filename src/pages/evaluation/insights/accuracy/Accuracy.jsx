import { useState } from "react";
import { Target, TrendingUp, ArrowLeft } from "lucide-react";

import AccuracyBar from "./AccuracyBar";
import MetricCard from "./MetricCard";
import DetailedMetric from "../../../../components/DetailedMetric";
import CriticalAlert from "../../../../components/CriticAlert";
import TurnByTurnAnalysis from "../../../../../src/components/TurnCard"

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  // If name is already humanized (contains spaces and starts with uppercase), return it
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;

  // Convert snake_case to Title Case dynamically
  return String(name)
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/* =========================
   TRANSFORMER
========================= */

const transformAccuracyMetrics = (metrics) => {
  if (!metrics || !Array.isArray(metrics)) return [];

  // Show all accuracy metrics including semantic_accuracy
  return metrics.map((m) => ({
    label: humanizeMetricName(m.name || m.metric_name),
    value: typeof m.score === "number" ? Math.round(m.score * 100) : 0, // Convert 0-1 to 0-100
    threshold: 100,
    time: "—",
    status: m.status, // passed | failed | skipped
  }));
};

/* =========================
   COMPONENT
========================= */

export default function AccuracyView({ response, data, onBack }) {
  console.log('=== AccuracyView Render ===');
  console.log('AccuracyView received response:', response);
  console.log('AccuracyView received data:', data);

  // Handle both single evaluation (response) and aggregated data (data)
  let metrics = [];

  if (response) {
    // Called from ViewReport with single evaluation's category data
    console.log('Using response.metrics:', response.metrics);
    metrics = response?.metrics || [];
  } else if (data) {
    // Called from Dashboard with aggregated data
    console.log('Using data - category_scores:', data.category_scores);
    console.log('Using data - evaluations:', data.evaluations);

    // Extract accuracy metrics from all evaluations
    const accuracyCategory = data.category_scores?.find(c => c.category === 'accuracy');
    console.log('Found accuracy category:', accuracyCategory);

    if (accuracyCategory) {
      metrics = accuracyCategory.metrics || [];
    } else {
      // Fallback: aggregate metrics from all evaluations
      const allMetrics = [];
      data.evaluations?.forEach(evaluation => {
        const accCategory = evaluation.category_scores?.find(c => c.category === 'accuracy');
        if (accCategory?.metrics) {
          allMetrics.push(...accCategory.metrics);
        }
      });
      metrics = allMetrics;
      console.log('Aggregated metrics from evaluations:', metrics);
    }
  }

  console.log('Final metrics array:', metrics);
  console.log('Metrics length:', metrics?.length);

  if (!metrics || metrics.length === 0) {
    console.warn('No metrics available - showing empty state');
    return (
      <div className="space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>
        )}
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-12 text-center">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No accuracy metrics available</p>
          <p className="text-gray-600 text-xs mt-1">
            {response ? 'Response has no metrics' : data ? 'Data has no accuracy category' : 'No data provided'}
          </p>
        </div>
      </div>
    );
  }

  console.log('Rendering AccuracyView with', metrics.length, 'metrics');

  const [activeTab] = useState("accuracy");

  const detailedMetrics = transformAccuracyMetrics(metrics);

  /* -------------------------
     DERIVED VALUES
  ------------------------- */

  const passedCount = metrics.filter((m) => m.status === "passed").length;
  const failedCount = metrics.filter((m) => m.status === "failed").length;

  // Use category-level score if available, otherwise calculate from metrics
  let score = 0;

  if (response?.score !== undefined) {
    // Single evaluation: use category score
    // Check if score is already in 0-100 range or 0-1 range
    score = response.score > 1 ? Math.round(response.score) : Math.round(response.score * 100);
  } else if (data?.category_scores) {
    // Aggregated data: use category score
    const accuracyCategory = data.category_scores.find(c => c.category === 'accuracy');
    if (accuracyCategory?.average_score !== undefined) {
      // Check if average_score is already in 0-100 range or 0-1 range
      score = accuracyCategory.average_score > 1
        ? Math.round(accuracyCategory.average_score)
        : Math.round(accuracyCategory.average_score * 100);
    }
  } else {
    // Fallback: calculate average from metrics
    const numericScores = metrics
      .map((m) => m.score)
      .filter((s) => typeof s === "number");

    score = numericScores.length > 0
      ? Math.round((numericScores.reduce((a, b) => a + b, 0) / numericScores.length) * 100)
      : 0;
  }

  // Determine status based on score and failed metrics
  let cardStatus = "success";
  if (score < 70 || failedCount > 1) {
    cardStatus = "critical";
  } else if (score < 85 || failedCount > 0) {
    cardStatus = "warning";
  }

  const isCritical = failedCount > 0;

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-6">
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

      {/* Header Card */}
      <MetricCard
        icon={Target}
        title="Accuracy"
        value={score}
        passed={passedCount}
        failed={failedCount}
        status={cardStatus}
      />

      {/* Critical Alert */}
      {/* {isCritical && (
        <CriticalAlert
          title="Accuracy Below Threshold"
          description="One or more accuracy metrics failed. Review expected responses and intent handling."
          metrics={metrics
            .filter((m) => m.status === "failed")
            .map((m) => ({
              icon: TrendingUp,
              label: humanizeMetricName(m.name || m.metric_name),
              value:
                typeof m.score === "number"
                  ? `${Math.round(m.score * 100)}%`
                  : "N/A",
            }))}
        />
      )} */}


      {/* Turn-by-Turn Analysis for Semantic Accuracy */}
      {metrics.some(m => m.metric_name === 'semantic_accuracy' && m.details?.step_results) && (
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-teal-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Turn-by-Turn Analysis</h2>
          </div>

          <div className="space-y-4">
            {metrics
              .filter(m => m.metric_name === 'semantic_accuracy')
              .map((metric, metricIdx) => (
                <div key={metricIdx}>
                  {/* Summary Stats */}
                  <div className="flex items-center gap-6 mb-8 p-4 bg-dark-input/30 rounded-xl border border-gray-800/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Evaluated Steps</span>
                      <span className="text-xl font-semibold text-white">{metric.details?.evaluated_steps || 0}</span>
                    </div>
                    <div className="w-[1px] h-10 bg-gray-800/80" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Passed Steps</span>
                      <span className="text-xl font-semibold text-teal-400">{metric.details?.passed_steps || 0}</span>
                    </div>
                    <div className="w-[1px] h-10 bg-gray-800/80" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Semantic Accuracy Rate</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-semibold ${metric.status === 'passed' ? 'text-green-400' : 'text-red-400'}`}>
                          {metric.details?.evaluated_steps
                            ? Math.round((metric.details.passed_steps / metric.details.evaluated_steps) * 100)
                            : 0}%
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${metric.status === 'passed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                          {metric.status === 'passed' ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {metric.details?.step_results?.map((step, stepIdx) => {
                    const isAgent = step.step_type === 'speak' || step.step_type === 'initial_inbound' || !!step.expected_response || !!step.expected_greeting;
                    const isPassed = step.passed;
                    const expectedText = step.expected_utterance || step.expected_response || step.expected_greeting;

                    return (
                      <div key={stepIdx} className="mb-4">
                        {/* Turn Card */}
                        <div className={`border rounded-xl p-6 ${isPassed
                          ? 'bg-dark-input border-gray-800/50'
                          : 'bg-red-950/20 border-red-900/50'
                          }`}>
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAgent
                                ? 'bg-purple-500/20'
                                : 'bg-blue-500/20'
                                }`}>
                                {isAgent ? (
                                  <div className="w-5 h-5 bg-teal-500/10 text-teal-400">🤖</div>
                                ) : (
                                  <div className="w-5 h-5 bg-teal-500/10 text-teal-400">👤</div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-medium px-2 py-1 rounded ${isAgent
                                    ? 'bg-teal-500/20 text-teal-300'
                                    : 'bg-blue-500/20 text-blue-300'
                                    }`}>
                                    {isAgent ? 'AGENT' : 'USER'}
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    Turn #{step.test_step_index + 1}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isPassed
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                              }`}>
                              {isPassed ? '✓ Passed' : '✗ Failed'}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="space-y-4">
                            {/* Actual Response */}
                            <div>
                              <div className="text-xs text-gray-400 mb-2">
                                {isAgent ? 'Agent Response:' : 'User Input:'}
                              </div>
                              <p className="text-gray-200 leading-relaxed font-medium">
                                {step.actual_text || step.actual_response || '—'}
                              </p>
                            </div>

                            {/* Expected Response */}
                            {expectedText && (
                              <div className="pt-4 border-t border-gray-800">
                                <div className="text-xs text-gray-400 mb-2">Expected Response:</div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                  {expectedText}
                                </p>
                              </div>
                            )}

                            {/* Expected Keywords */}
                            {step.expected_keywords && step.expected_keywords.length > 0 && (
                              <div className="pt-4 border-t border-gray-800">
                                <div className="text-xs text-gray-400 mb-2">Expected Keywords:</div>
                                <div className="flex flex-wrap gap-2">
                                  {step.expected_keywords.map((keyword, kidx) => (
                                    <span
                                      key={kidx}
                                      className="px-2 py-1 bg-teal-500/10 text-teal-400 rounded text-xs"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Reasoning */}
                            {step.reasoning && (
                              <div className="pt-4 border-t border-gray-800">
                                <div className="text-xs text-gray-400 mb-2">Analysis:</div>
                                <p className="text-gray-400 text-sm leading-relaxed italic">
                                  {step.reasoning}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Metadata Footer */}
                          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center gap-4">
                              {step.turn_id && (
                                <span>Turn ID: {step.turn_id}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Response Consistency Section */}
      <div className="pt-10">
        {metrics.some(m => (m.name || m.metric_name) === 'response_consistency') && (
          <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-teal-500/10 rounded flex items-center justify-center">
                  <Target className="w-4 h-4 text-teal-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Response Consistency</h2>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest"></span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-semibold ${metrics.filter(m => (m.name || m.metric_name) === 'response_consistency').every(m => m.status === 'passed') ? 'text-green-400' : 'text-red-400'}`}>
                      {Math.round((metrics.filter(m => (m.name || m.metric_name) === 'response_consistency').reduce((acc, m) => acc + (m.score || 0), 0) / Math.max(1, metrics.filter(m => (m.name || m.metric_name) === 'response_consistency').length)) * 100)}%
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${metrics.filter(m => (m.name || m.metric_name) === 'response_consistency').every(m => m.status === 'passed') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {metrics.filter(m => (m.name || m.metric_name) === 'response_consistency').every(m => m.status === 'passed') ? 'Pass' : 'Fail'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {metrics
                .filter(m => (m.name || m.metric_name) === 'response_consistency')
                .map((metric, idx) => {
                  const isPassed = metric.status === "passed";
                  const score = typeof metric.score === 'number' ? Math.round(metric.score * 100) : 0;
                  const issue = metric.details?.issue_detected || 'none';

                  return (
                    <div key={idx} className={`rounded-xl p-5 ${isPassed ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-red-950/20 border border-red-900/50'}`}>
                      {/* Score and Status row */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-12">
                          {/* ISSUES - Show 'None' indicator if healthy, otherwise table below handles it */}
                          {issue === 'none' && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Issues</span>
                              <span className="text-lg font-semibold text-gray-400">None</span>
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${isPassed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {isPassed ? '✓ PASSED' : '✗ FAILED'}
                        </div>
                      </div>

                      {/* Issues Table - Only show if issues exist */}
                      {issue !== 'none' && (
                        <div className="border-t border-gray-800/50 pt-4">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Issues</div>
                          <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-800/50 bg-gray-900/60">
                                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    Issue Type
                                  </th>
                                  <th className="text-right px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="px-4 py-4 text-sm text-gray-300 capitalize">
                                    {issue.replace(/_/g, ' ')}
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                      ✗ Detected
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Reasoning - only show if failed */}
                      {metric.details?.reasoning && !isPassed && (
                        <div className="mt-4 pt-4 border-t border-gray-800/50">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Analysis</div>
                          <p className="text-gray-400 text-sm leading-relaxed italic">
                            {metric.details.reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}