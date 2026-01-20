import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Zap,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import CallTranscriptPanel from "./CallTranscription";
import FailurePropagationGraph from './FailurePropagationGraph';
import TurnByTurnAnalysis from './TurnByTurnAnalysis';
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveLine } from '@nivo/line';
import InsightTabs from '../InsightTab';
import AccuracyView from '../insights/accuracy/Accuracy';
import LatencyOverview from '../insights/latency';
import AudioOverview from '../insights/audio';
import EndpointingOverview from '../insights/endpointing';
import PersonaOverview from '../insights/persona';
import TaskCompletionOverview from '../insights/task_completion';
import ConversationOverview from '../insights/conversation';
import CallKPISection from '../CallKPISection';

const TestReportView = ({ report, evaluation, transcriptData: initialTranscriptData, simulationData, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('');
  const transcriptData = initialTranscriptData;


  console.log('TestReportView received evaluation:', evaluation);

  // Extract sessionId from report
  const sessionId = report?.session_id;

  // Process evaluation data from the actual evaluation object
  const evaluationData = useMemo(() => {
    if (!evaluation) return null;

    // Handle nested evaluation structure if present
    const data = evaluation.evaluation || evaluation;

    const score = data.overall_score || data.score || 0;
    const normalizedScore = score <= 1 ? Math.round(score * 100) : Math.round(score);

    // Extract metric results for detailed view - ensure we get them from category_scores if flat array is missing
    let allMetrics = data.metrics || data.metric_results || [];

    if (allMetrics.length === 0 && Array.isArray(data.category_scores)) {
      allMetrics = data.category_scores.flatMap(cat => cat.metrics || []);
    }

    return {
      overall_score: normalizedScore,
      passed: data.passed,
      issues: data.issues || [],
      issues_found: data.issues_found || (data.issues?.length || 0),
      execution_time_ms: data.execution_time_ms,
      recommendations: data.recommendations || [],

      // Extract category scores
      category_scores: data.category_scores || [],

      // Final metrics array
      metrics: allMetrics,

      // Process failure propagation if available
      failure_propagation: data.failure_propagation || {
        critical_failure_turns: [],
        total_tainted_steps: 0,
        propagation_depth: 0,
        cascading_failures: {},
        step_health: {}
      }
    };
  }, [evaluation]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'transcript', label: 'Transcript', icon: MessageSquare },
    { id: 'propagation', label: 'Failure Analysis', icon: TrendingUp }
  ];

  // Prepare radar chart data from actual category scores
  const radarData = useMemo(() => {
    if (!Array.isArray(evaluationData?.category_scores)) return [];

    return evaluationData.category_scores.map(cat => {
      if (!cat) return null;
      const score = cat.score || 0;
      const normalizedScore = score <= 1 ? Math.round(score * 100) : Math.round(score);

      return {
        category: (cat.category || 'Unknown').replace(/_/g, ' and ').replace(/\b\w/g, l => l.toUpperCase()),
        score: normalizedScore
      };
    }).filter(Boolean);
  }, [evaluationData?.category_scores]);

  // Extract latency data from metrics
  const latencyMetrics = useMemo(() => {
    if (!Array.isArray(evaluationData?.metrics)) return [];

    return evaluationData.metrics.filter(m =>
      m && (
        m.category === 'latency' ||
        (m.name && m.name.includes('latency')) ||
        (m.name && m.name.includes('duration'))
      )
    );
  }, [evaluationData?.metrics]);

  // Mock latency timeline data (would need turn-by-turn data in production)
  const latencyData = useMemo(() => {
    if (latencyMetrics.length > 0) {
      return [
        {
          id: 'Response Time',
          data: latencyMetrics.slice(0, 5).map((metric, idx) => ({
            x: `Turn ${idx + 1}`,
            y: metric.details?.duration_ms ? metric.details.duration_ms / 1000 : 1.5
          }))
        }
      ];
    }

    return [
      {
        id: 'Response Time',
        data: [
          { x: 'Turn 1', y: 1.2 },
          { x: 'Turn 2', y: 1.5 },
          { x: 'Turn 3', y: 1.8 },
          { x: 'Turn 4', y: 1.3 },
          { x: 'Turn 5', y: 1.6 }
        ]
      }
    ];
  }, [latencyMetrics]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-500/10 border-green-500/20';
    if (score >= 75) return 'bg-yellow-500/10 border-yellow-500/20';
    if (score >= 60) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // When a category is selected, switch to overview tab to show the category view
    if (category) {
      setActiveTab('overview');
    }
  };

  const handleBackToOverview = () => {
    setActiveCategory('');
  };

  // Create a map of categories to their metrics
  const categoryMap = useMemo(() => {
    const map = {};

    // 1. Initialize map with all available category scores
    if (Array.isArray(evaluationData?.category_scores)) {
      evaluationData.category_scores.forEach(cat => {
        if (!cat || !cat.category) return;
        const score = cat.score || 0;
        const normalizedScore = score <= 1 ? Math.round(score * 100) : Math.round(score);

        map[cat.category] = {
          category: cat.category,
          score: normalizedScore,
          weight: cat.weight || 0,
          metrics: Array.isArray(cat.metrics) ? cat.metrics : [],
        };
      });
    }

    // 2. Add any additional metrics that might not be in category_scores (fallback/legacy)
    const metrics = evaluationData?.metrics;
    if (Array.isArray(metrics)) {
      metrics.forEach((metric) => {
        if (!metric) return;
        const mName = metric.name || metric.metric_name;
        let category = metric.category;

        // Special override: force these to accuracy
        if (mName === 'response_consistency' || mName === 'semantic_accuracy') {
          category = 'accuracy';
        }

        if (!category) return;

        // Ensure category exists
        if (!map[category]) {
          map[category] = {
            category: category,
            score: 0,
            weight: 0,
            metrics: [],
          };
        }

        // Check for duplicates
        if (!map[category].metrics.some(m => (m.name || m.metric_name) === mName)) {
          map[category].metrics.push(metric);
        }
      });
    }

    return map;
  }, [evaluationData]);

  // Render category-specific view
  const renderCategoryView = () => {
    console.log('Rendering category:', activeCategory);
    console.log('Category data:', categoryMap[activeCategory]);

    switch (activeCategory) {
      case 'accuracy':
        return <AccuracyView response={categoryMap.accuracy} onBack={handleBackToOverview} />;

      case 'latency':
        return <LatencyOverview response={categoryMap.latency} onBack={handleBackToOverview} />;

      case 'audio_quality':
        return <AudioOverview response={categoryMap.audio_quality} onBack={handleBackToOverview} />;

      case 'endpointing':
        return <EndpointingOverview response={categoryMap.endpointing} onBack={handleBackToOverview} />;

      case 'persona':
        return <PersonaOverview response={categoryMap.persona} onBack={handleBackToOverview} />;

      case 'task_completion':
        return <TaskCompletionOverview response={categoryMap.task_completion} onBack={handleBackToOverview} />;

      case 'conversation_quality':
        return <ConversationOverview response={categoryMap.conversation_quality} data={evaluationData} transcriptData={transcriptData} onBack={handleBackToOverview} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 px-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Test Report: {report?.test_id || evaluation?.test_case_name || 'Unknown Test'}
          </h2>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className={`bg-dark-panel border rounded-xl p-5 ${getScoreBg(evaluationData?.overall_score || 0)}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-semibold uppercase">Overall Score</p>
            {evaluationData?.passed ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(evaluationData?.overall_score || 0)}`}>
            {evaluationData?.overall_score || 0}%
          </p>
        </div>

        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-gray-400 font-semibold uppercase">Execution Time</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {evaluationData?.execution_time_ms
              ? `${(evaluationData.execution_time_ms / 1000).toFixed(1)}s`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <p className="text-xs text-gray-400 font-semibold uppercase">Issues Found</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {evaluationData?.issues_found || 0}
          </p>
        </div>

        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400 font-semibold uppercase">Total Metrics</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {evaluationData?.metrics?.length || 0}
          </p>
        </div>

        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <p className="text-xs text-gray-400 font-semibold uppercase">Result</p>
          </div>
          <p className={`text-lg font-bold ${evaluationData?.passed ? 'text-green-400' : 'text-red-400'}`}>
            {evaluationData?.passed ? 'PASSED' : 'FAILED'}
          </p>
        </div>
      </div>

      {/* Insight Tabs with Category Navigation */}
      {evaluationData?.category_scores && evaluationData.category_scores.length > 0 && (
        <InsightTabs
          activeCategory={activeCategory}
          onChange={handleCategoryChange}
          categoryScores={evaluationData.category_scores.map(cat => {
            const score = cat.score || 0;
            // Normalize score: if it's 0-1, convert to 0-100. If already > 1, assume 0-100.
            const normalizedScore = score <= 1 ? Math.round(score * 100) : Math.round(score);

            return {
              category: cat.category,
              score: normalizedScore,
              weight: cat.weight || 0
            };
          })}
          clickable={true}
        />
      )}

      {/* Render Category View if active */}
      {activeCategory && renderCategoryView()}

      {/* Issues & Recommendations Panel */}
      {!activeCategory && ((evaluationData?.issues && evaluationData.issues.length > 0) || (evaluationData?.recommendations && evaluationData.recommendations.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Issues Panel */}
          {evaluationData?.issues && evaluationData.issues.length > 0 && (
            <div className="bg-dark-panel border border-red-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Key Issues Found
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {evaluationData.issues.map((issue, idx) => {
                  const formatText = (text) => text?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  const issueText = typeof issue === 'string' ? issue : (issue.description || issue.message || JSON.stringify(issue));

                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-400 text-xs font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {typeof issue === 'object' && (issue.category || issue.metric_name) && (
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-300/70">
                            {issue.category && <span>{formatText(issue.category)}</span>}
                            {issue.category && issue.metric_name && <span>•</span>}
                            {issue.metric_name && <span>{formatText(issue.metric_name)}</span>}
                          </div>
                        )}
                        <p className="text-sm text-gray-300">
                          {issueText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Recommendations Panel */}
          {evaluationData?.recommendations && evaluationData.recommendations.length > 0 && (
            <div className="bg-dark-panel border border-yellow-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                Recommendations
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {evaluationData.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-yellow-400 text-xs font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-gray-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Section - Show call-level KPIs if available */}
      {!activeCategory && evaluation?.kpi_results && evaluation.kpi_results.length > 0 && (
        <CallKPISection kpiResults={evaluation.kpi_results} evaluation={evaluation} />
      )}

      {/* Tabs - Only show when no category is active */}
      {!activeCategory && (
        <div className="flex items-center gap-2 border-b border-gray-800/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${activeTab === tab.id
                  ? 'text-teal-400'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content - Only show when no category is active */}
      {!activeCategory && (
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Category Scores Radar */}
              {radarData.length > 0 && (
                <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">
                    Category Performance
                  </h3>
                  <div style={{ height: '400px' }}>
                    <ResponsiveRadar
                      data={radarData}
                      keys={['score']}
                      indexBy="category"
                      maxValue={100}
                      margin={{ top: 80, right: 80, bottom: 40, left: 80 }}
                      curve="linearClosed"
                      borderWidth={2}
                      borderColor={{ from: 'color' }}
                      gridLevels={5}
                      gridShape="circular"
                      gridLabelOffset={36}
                      enableDots={true}
                      dotSize={8}
                      dotColor={{ theme: 'background' }}
                      dotBorderWidth={2}
                      dotBorderColor={{ from: 'color' }}
                      enableDotLabel={true}
                      dotLabel="value"
                      dotLabelYOffset={-12}
                      colors={{ scheme: 'nivo' }}
                      fillOpacity={0.25}
                      blendMode="multiply"
                      animate={true}
                      theme={{
                        text: { fill: '#9ca3af', fontSize: 11 },
                        grid: { line: { stroke: '#374151', strokeWidth: 1 } },
                        tooltip: {
                          container: {
                            background: '#1f2937',
                            color: '#fff',
                            fontSize: 12,
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                            padding: '8px 12px'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Stats Grid */}
              {evaluationData?.category_scores.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {evaluationData.category_scores.map(cat => {
                    const score = cat.score || 0;
                    const normalizedScore = score <= 1 ? Math.round(score * 100) : Math.round(score);

                    return (
                      <div
                        key={cat.category}
                        className="bg-dark-panel border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">
                              {cat.category.replace(/_/g, ' and ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className={`text-2xl font-bold ${getScoreColor(normalizedScore)}`}>
                              {normalizedScore}%
                            </p>
                          </div>
                          <div className="w-16 h-16">
                            <svg viewBox="0 0 36 36" className="transform -rotate-90">
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke={normalizedScore >= 90 ? '#22c55e' : normalizedScore >= 75 ? '#eab308' : '#ef4444'}
                                strokeWidth="3"
                                strokeDasharray={`${normalizedScore * 1.005}, 100.5`}
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'transcript' && (
            <>
              {transcriptData ? (
                <CallTranscriptPanel
                  transcriptData={transcriptData}
                  callRecordingUrl={transcriptData?.audio_url || report?.call_recording}
                />
              ) : (
                <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No transcript data available</p>
                </div>
              )}
            </>
          )}




          {activeTab === 'propagation' && (
            <>
              {/* Check if failure propagation data is available */}
              {evaluationData?.failure_propagation &&
                (evaluationData.failure_propagation.critical_failure_turns?.length > 0 ||
                  evaluationData.failure_propagation.total_tainted_steps > 0 ||
                  Object.keys(evaluationData.failure_propagation.step_health || {}).length > 0 ||
                  Object.keys(evaluationData.failure_propagation.cascading_failures || {}).length > 0) ? (
                <>
                  <FailurePropagationGraph
                    stepHealth={evaluationData.failure_propagation.step_health || {}}
                    cascadingFailures={evaluationData.failure_propagation.cascading_failures || {}}
                  />

                  {/* Propagation Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-dark-panel border border-red-500/20 rounded-xl p-5">
                      <p className="text-sm text-gray-400 mb-2">Critical Failures</p>
                      <p className="text-3xl font-bold text-red-400">
                        {evaluationData.failure_propagation.critical_failure_turns?.length || 0}
                      </p>
                    </div>

                    <div className="bg-dark-panel border border-yellow-500/20 rounded-xl p-5">
                      <p className="text-sm text-gray-400 mb-2">Tainted Steps</p>
                      <p className="text-3xl font-bold text-yellow-400">
                        {evaluationData.failure_propagation.total_tainted_steps || 0}
                      </p>
                    </div>

                    <div className="bg-dark-panel border border-orange-500/20 rounded-xl p-5">
                      <p className="text-sm text-gray-400 mb-2">Max Propagation Depth</p>
                      <p className="text-3xl font-bold text-orange-400">
                        {evaluationData.failure_propagation.propagation_depth || 0}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* Fallback screen when no failure propagation data */
                <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        No Failure Propagation Data
                      </h3>
                      <p className="text-sm text-gray-400 max-w-md">
                        Failure propagation analysis is not available for this evaluation.
                        This may indicate that no failures were detected or the analysis was not performed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TestReportView;