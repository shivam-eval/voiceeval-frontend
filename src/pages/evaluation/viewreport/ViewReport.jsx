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
import CostOverview from '../insights/cost';
import AudioOverview from '../insights/audio';
import EndpointingOverview from '../insights/endpointing';
import PersonaOverview from '../insights/persona';
import TaskCompletionOverview from '../insights/task_completion';
import ConversationOverview from '../insights/conversation';

const TestReportView = ({ report, evaluation, transcriptData, simulationData, onBack }) => {

  const [activeTab, setActiveTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('');

  console.log('TestReportView received evaluation:', evaluation);

  // Process evaluation data from the actual evaluation object
  const evaluationData = useMemo(() => {
    if (!evaluation) return null;
    
    // Handle nested evaluation structure if present
    const data = evaluation.evaluation || evaluation;
    
    const score = data.overall_score || data.score || 0;
    const normalizedScore = score <= 1 ? Math.round(score * 100) : Math.round(score);

    return {
      overall_score: normalizedScore,
      passed: data.passed,
      issues_found: data.issues_found,
      issues: data.issues || [],
      execution_time_ms: data.execution_time_ms,
      recommendations: data.recommendations || [],
      
      // Extract category scores from metric_results
      category_scores: data.category_scores || [],
      
      // Extract metric results for detailed view
      metrics: data.metrics || data.metric_results || [],
      
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
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
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
        category: (cat.category || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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
    const metrics = evaluationData?.metrics;
    if (!Array.isArray(metrics)) return {};

    const map = {};
    metrics.forEach((metric) => {
      if (!metric) return;
      const category = metric.category;
      if (!category) return;

      if (!map[category]) {
        const categoryScore = Array.isArray(evaluationData.category_scores) 
          ? evaluationData.category_scores.find((c) => c && c.category === category)
          : null;
        const score = categoryScore ? categoryScore.score : 0;
        const normalizedScore = score <= 1 ? Math.round(score * 100) : Math.round(score);

        map[category] = {
          category,
          score: normalizedScore,
          weight: categoryScore ? categoryScore.weight : 0,
          metrics: [],
        };
      }
      map[category].metrics.push(metric);
    });
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

      case 'endpointing':
        return <EndpointingOverview response={categoryMap.endpointing} onBack={handleBackToOverview} />;

      case 'cost':
        return <CostOverview response={categoryMap.cost} onBack={handleBackToOverview} />;

      case 'persona':
        return <PersonaOverview response={categoryMap.persona} onBack={handleBackToOverview} />;

      case 'audio_quality':
        return <AudioOverview data={categoryMap.audio_quality} onBack={handleBackToOverview} />;

      case 'task_completion':
        return <TaskCompletionOverview response={categoryMap.task_completion} onBack={handleBackToOverview} />;

      case 'conversation_quality':
        return <ConversationOverview response={categoryMap.conversation_quality} onBack={handleBackToOverview} />;

      default:
        return null;
    }
  };


  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Test Report: {report?.test_id || evaluation?.test_case_name || 'Unknown Test'}
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              Test ID: <span className="font-mono text-gray-300">{report?.test_id || 'N/A'}</span>
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">
              Session: <span className="font-mono text-gray-300">{report?.session_id || 'N/A'}</span>
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">
              Evaluation ID: <span className="font-mono text-gray-300">{String(evaluation?.evaluation_id || 'N/A').substring(0, 12)}...</span>
            </span>
          </div>
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
            <p className="text-xs text-gray-400 font-semibold uppercase">Status</p>
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
              <div className="space-y-3">
                {evaluationData.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-400 text-xs font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      {typeof issue === 'string' ? issue : (issue.description || issue.message || JSON.stringify(issue))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Panel */}
          {evaluationData?.recommendations && evaluationData.recommendations.length > 0 && (
            <div className="bg-dark-panel border border-yellow-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                Recommendations
              </h3>
              <div className="space-y-3">
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

      {/* Tabs - Only show when no category is active */}
      {!activeCategory && (
        <div className="flex items-center gap-2 border-b border-gray-800/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
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
                      margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
                      curve="linearClosed"
                      borderWidth={2}
                      borderColor={{ from: 'color' }}
                      gridLevels={5}
                      gridShape="circular"
                      gridLabelOffset={16}
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
                              {cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
              <CallTranscriptPanel transcriptData={transcriptData} />
              <TurnByTurnAnalysis 
                steps={transcriptData?.steps || []} 
                stepHealth={evaluationData?.failure_propagation?.step_health || {}}
              />
            </>
          )}

          {activeTab === 'metrics' && (
            <>
              {/* All Metrics Table */}
              <div className="bg-dark-panel border border-gray-800/50 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800/50">
                  <h3 className="text-lg font-semibold text-white">Detailed Metrics</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/50 bg-dark-panel/30">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Metric</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Category</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Score</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluationData?.metrics.map((metric, idx) => (
                        <tr key={idx} className="border-b border-gray-800/30 hover:bg-[#1e2433]">
                          <td className="px-6 py-4 text-sm text-white font-medium">
                            {metric.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {metric.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {metric.score !== null && metric.score !== undefined ? (
                              <span className={`font-bold ${getScoreColor(Math.round(metric.score * 100))}`}>
                                {Math.round(metric.score * 100)}%
                              </span>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {metric.status === 'passed' ? (
                              <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                            ) : metric.status === 'failed' ? (
                              <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                            ) : (
                              <span className="text-gray-500 text-xs">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {metric.details ? (
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(metric.details, null, 2).substring(0, 100)}...
                              </pre>
                            ) : (
                              'No details'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Latency Timeline */}
              <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Response Latency Timeline
                </h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveLine
                    data={latencyData}
                    margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 0, max: 'auto' }}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Turn',
                      legendOffset: 36,
                      legendPosition: 'middle'
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Latency (s)',
                      legendOffset: -50,
                      legendPosition: 'middle'
                    }}
                    colors={{ scheme: 'nivo' }}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                    enableArea={true}
                    areaOpacity={0.1}
                    theme={{
                      text: { fill: '#9ca3af', fontSize: 11 },
                      grid: { line: { stroke: '#374151', strokeWidth: 1 } },
                      axis: {
                        legend: { text: { fill: '#9ca3af', fontSize: 12 } }
                      },
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
            </>
          )}

          {activeTab === 'propagation' && (
            <>
              <FailurePropagationGraph
                stepHealth={evaluationData?.failure_propagation?.step_health || {}}
                cascadingFailures={evaluationData?.failure_propagation?.cascading_failures || {}}
              />

              {/* Propagation Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-dark-panel border border-red-500/20 rounded-xl p-5">
                  <p className="text-sm text-gray-400 mb-2">Critical Failures</p>
                  <p className="text-3xl font-bold text-red-400">
                    {evaluationData?.failure_propagation?.critical_failure_turns?.length || 0}
                  </p>
                </div>

                <div className="bg-dark-panel border border-yellow-500/20 rounded-xl p-5">
                  <p className="text-sm text-gray-400 mb-2">Tainted Steps</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {evaluationData?.failure_propagation?.total_tainted_steps || 0}
                  </p>
                </div>

                <div className="bg-dark-panel border border-orange-500/20 rounded-xl p-5">
                  <p className="text-sm text-gray-400 mb-2">Max Propagation Depth</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {evaluationData?.failure_propagation?.propagation_depth || 0}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TestReportView;