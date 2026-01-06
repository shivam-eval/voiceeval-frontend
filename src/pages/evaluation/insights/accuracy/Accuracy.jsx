import { useState } from "react";
import { Target, TrendingUp, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

import AccuracyBar from "./AccuracyBar";
import DetailedMetric from "../../../../components/DetailedMetric";
import CriticalAlert from "../../../../components/CriticAlert";
import TurnByTurnAnalysis from "../../../../../src/components/TurnCard"

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;

  const map = {
    semantic_accuracy: "Semantic Accuracy",
    response_consistency: "Response Consistency",
    hallucination_check: "Hallucination Check",
  };

  return map[name] || String(name)
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const normalizeScore = (v) =>
  typeof v === "number"
    ? (v > 1 ? Math.round(v) : Math.round(v * 100))
    : 0;

/* =========================
   COMPONENT
========================= */

export default function AccuracyView({ response, data, onBack }) {
  console.log('=== AccuracyView Render ===');

  // Handle both single evaluation (response) and aggregated data (data)
  let metrics = [];
  let score = 0;

  if (response) {
    metrics = response?.metrics || [];
    score = response?.score || 0;
  } else if (data) {
    const accuracyCategory = data.category_scores?.find(c => c.category === 'accuracy');
    if (accuracyCategory) {
      metrics = accuracyCategory.metrics || [];
      score = accuracyCategory.average_score || 0;
    } else {
      const allMetrics = [];
      let totalScore = 0;
      let scoreCount = 0;

      data.evaluations?.forEach(evaluation => {
        const accCategory = evaluation.category_scores?.find(c => c.category === 'accuracy');
        if (accCategory?.metrics) {
          allMetrics.push(...accCategory.metrics);
          if (typeof accCategory.score === 'number') {
            totalScore += accCategory.score;
            scoreCount++;
          }
        }
      });
      metrics = allMetrics;
      score = scoreCount > 0 ? totalScore / scoreCount : 0;
    }
  }

  if (!metrics || metrics.length === 0) {
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
        </div>
      </div>
    );
  }

  const passedCount = metrics.filter((m) => m.status === "passed").length;
  const totalCount = metrics.length;
  const failedCount = totalCount - passedCount;
  const normalizedScore = normalizeScore(score);

  return (
    <div className="flex flex-col gap-6">
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

      {/* ================= HEADER CARD ================= */}
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 flex items-center justify-between shadow-lg">
        {/* Left */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Target size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Accuracy Analytics</h2>
            <p className="text-gray-400 text-sm mt-1">Evaluates response precision and semantic alignment</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-4xl font-bold text-teal-400">{normalizedScore}%</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Overall Score</span>
          </div>

          <div className="h-10 w-px bg-gray-800" />

          {/* Passed / Failed */}
          <div className="flex gap-6 text-sm">
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{passedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Passed</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{failedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Turn-by-Turn Analysis for Semantic Accuracy */}
      {metrics.some(m => (m.name || m.metric_name) === 'semantic_accuracy' && m.details?.step_results) && (
        <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Turn-by-Turn Analysis</h2>
          </div>

          <div className="space-y-6">
            {metrics
              .filter(m => (m.name || m.metric_name) === 'semantic_accuracy')
              .map((metric, metricIdx) => (
                <div key={metricIdx}>
                  {/* Summary Stats */}
                  <div className="flex items-center gap-8 mb-6 p-5 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Evaluated Steps</span>
                      <span className="text-2xl font-bold text-white">{metric.details?.evaluated_steps || 0}</span>
                    </div>
                    <div className="w-[1px] h-10 bg-gray-800/50" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Passed Steps</span>
                      <span className="text-2xl font-bold text-teal-400">{metric.details?.passed_steps || 0}</span>
                    </div>
                    <div className="w-[1px] h-10 bg-gray-800/50" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Accuracy Rate</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${metric.status === 'passed' ? 'text-teal-400' : 'text-red-400'}`}>
                          {metric.details?.evaluated_steps
                            ? Math.round((metric.details.passed_steps / metric.details.evaluated_steps) * 100)
                            : 0}%
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${metric.status === 'passed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {metric.status === 'passed' ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {metric.details?.step_results?.map((step, stepIdx) => {
                      const isAgent = step.step_type === 'speak' || step.step_type === 'initial_inbound' || !!step.expected_response || !!step.expected_greeting;
                      const isPassed = step.passed;
                      const expectedText = step.expected_utterance || step.expected_response || step.expected_greeting;

                      return (
                        <div key={stepIdx} className={`rounded-xl p-6 border ${isPassed ? 'bg-white/[0.01] border-white/[0.03]' : 'bg-red-950/10 border-red-900/20'}`}>
                          {/* Header */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAgent ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'}`}>
                                {isAgent ? "🤖" : "👤"}
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isAgent ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {isAgent ? 'AGENT' : 'USER'}
                                  </span>
                                  <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                                    Turn #{step.test_step_index + 1}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                              {isPassed ? '✓ Passed' : '✗ Failed'}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{isAgent ? 'Agent Response' : 'User Input'}</div>
                                <p className="text-gray-200 text-sm leading-relaxed font-medium">
                                  {step.actual_text || step.actual_response || '—'}
                                </p>
                              </div>
                              {expectedText && (
                                <div>
                                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Expected Response</div>
                                  <p className="text-gray-400 text-sm leading-relaxed italic">
                                    {expectedText}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="space-y-4 border-l border-gray-800/50 pl-8">
                              {step.expected_keywords && step.expected_keywords.length > 0 && (
                                <div>
                                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Key Targets</div>
                                  <div className="flex flex-wrap gap-2">
                                    {step.expected_keywords.map((keyword, kidx) => (
                                      <span key={kidx} className="px-2 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {step.reasoning && (
                                <div>
                                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Analysis</div>
                                  <p className="text-gray-400 text-sm leading-relaxed italic">
                                    {step.reasoning}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Response Consistency Section */}
      {metrics.some(m => (m.name || m.metric_name) === 'response_consistency') && (
        <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Response Consistency</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {metrics
              .filter(m => (m.name || m.metric_name) === 'response_consistency')
              .map((metric, idx) => {
                const isPassed = metric.status === "passed";
                const score = typeof metric.score === 'number' ? Math.round(metric.score * 100) : 0;
                const issue = metric.details?.issue_detected || 'none';

                return (
                  <div key={idx} className={`rounded-xl p-6 border ${isPassed ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-red-950/10 border-red-900/20'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Consistency Score</span>
                        <span className={`text-2xl font-bold ${isPassed ? 'text-teal-400' : 'text-red-400'}`}>
                          {score}%
                        </span>
                      </div>
                      <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {isPassed ? '✓ PASSED' : '✗ FAILED'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-800/50">
                      <div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Issue Detected</div>
                        <div className={`text-sm font-medium ${issue === 'none' ? 'text-gray-500' : 'text-red-400'}`}>
                          {issue === 'none' ? 'No issues identified' : issue}
                        </div>
                      </div>
                      {metric.details?.reasoning && (
                        <div className="border-l border-gray-800/50 pl-8">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Analysis</div>
                          <p className="text-gray-400 text-sm leading-relaxed italic">
                            {metric.details.reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Other Accuracy Metrics Grid */}
      {metrics.filter(m => !['semantic_accuracy', 'response_consistency'].includes(m.name || m.metric_name)).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics
            .filter(m => !['semantic_accuracy', 'response_consistency'].includes(m.name || m.metric_name))
            .map((metric, idx) => {
              const isPassed = metric.status === "passed";
              const label = humanizeMetricName(metric.name || metric.metric_name);
              const score = typeof metric.score === 'number' ? Math.round(metric.score * 100) : 0;
              const details = Object.entries(metric.details || {})
                .filter(([key]) => !['passed', 'execution_time_ms', 'error_message', 'reasoning'].includes(key));

              return (
                <div key={idx} className={`rounded-xl p-6 border ${isPassed ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-red-950/10 border-red-900/20'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{label}</span>
                      <span className={`text-2xl font-bold ${isPassed ? 'text-teal-400' : 'text-red-400'}`}>
                        {score}%
                      </span>
                    </div>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {isPassed ? '✓ PASSED' : '✗ FAILED'}
                    </div>
                  </div>

                  {details.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 pt-6 border-t border-gray-800/50">
                      {details.map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{key.replace(/_/g, " ")}</span>
                          <span className="text-sm text-gray-300">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {metric.details?.reasoning && (
                    <div className="mt-6 pt-6 border-t border-gray-800/50">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Analysis</div>
                      <p className="text-gray-400 text-sm leading-relaxed italic">{metric.details.reasoning}</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}