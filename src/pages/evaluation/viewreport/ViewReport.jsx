import React, { useState, useEffect, useMemo, useContext } from 'react';
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
  MessageSquare,
  GitBranch,
  AlertTriangle,
  Mic,
  Brain,
  Volume2,
  Database
} from 'lucide-react';
import { TopBarContext } from '../../main';
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
import GibberishDetection from '../insights/gibberish/GibberishDetection';
import HallucinationOverview from '../insights/hallucination';
import PronunciationOverview from '../insights/pronunciation';
import CallKPISection from '../CallKPISection';
import TraceViewer from './TraceViewer';
import { useCallTrace, useCallIssues } from '../../../hooks/useCalls';

// ---------------------------------------------------------------------------
// Component config: maps component name → icon + colour
// ---------------------------------------------------------------------------
const COMPONENT_CONFIG = {
  STT: { label: 'STT (Speech-to-Text)', icon: Mic, colorClass: 'yellow' },
  TTS: { label: 'TTS (Text-to-Speech)', icon: Volume2, colorClass: 'orange' },
  LLM: { label: 'LLM (Language Model)', icon: Brain, colorClass: 'purple' },
  'Tool Call': { label: 'Tool Call', icon: Database, colorClass: 'blue' },
  General: { label: 'General', icon: AlertTriangle, colorClass: 'red' },
};

/**
 * IssuesTab — renders trace-based issues and metric issues from the API.
 * Keeps the same visual style as the old hardcoded version.
 */
const IssuesTab = ({ callId, issuesData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-12 text-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading issues…</p>
      </div>
    );
  }

  if (!callId) {
    return (
      <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Issues analysis is available only for uploaded call recordings with a linked trace.</p>
      </div>
    );
  }

  const traceIssues = issuesData?.issues || [];
  const metricIssues = issuesData?.metric_issues || [];
  const hasTrace = issuesData?.has_trace ?? false;

  // Group trace issues by component
  const grouped = {};
  traceIssues.forEach((issue) => {
    const key = issue.component || 'General';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(issue);
  });

  const hasAnyIssues = traceIssues.length > 0 || metricIssues.length > 0;

  if (!hasTrace) {
    return (
      <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-12 text-center">
        <GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No Langfuse trace found for this call recording. Issues analysis requires a linked trace.</p>
      </div>
    );
  }

  if (!hasAnyIssues) {
    return (
      <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-12 text-center">
        <CheckCircle className="w-12 h-12 text-teal-500/60 mx-auto mb-3" />
        <p className="text-gray-300 text-sm font-medium">No issues detected</p>
        <p className="text-gray-500 text-xs mt-1">All STT, TTS, and LLM components are within normal thresholds.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trace-based component issues */}
      {Object.entries(grouped).map(([component, issues]) => {
        const cfg = COMPONENT_CONFIG[component] || COMPONENT_CONFIG.General;
        const Icon = cfg.icon;
        const c = cfg.colorClass;
        return (
          <div key={component} className="bg-[#030712] border border-teal-500/20 rounded-xl overflow-hidden">
            <div className={`flex items-center gap-3 px-6 py-4 bg-${c}-500/5 border-b border-${c}-500/20`}>
              <Icon className={`w-5 h-5 text-${c}-400`} />
              <h4 className="text-base font-semibold text-white">{cfg.label}</h4>
              <span className={`ml-auto px-2.5 py-1 bg-${c}-500/10 border border-${c}-500/30 rounded-full text-xs font-semibold text-${c}-400`}>
                {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'}
              </span>
            </div>
            <div className="divide-y divide-gray-800/30">
              {issues.map((issue, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-800/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${c}-400 mt-2 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 mb-1">{issue.message}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          issue.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          issue.severity === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {issue.severity}
                        </span>
                        {issue.latency_ms != null && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {issue.latency_ms}ms
                            {issue.threshold_ms != null && ` (threshold: ${issue.threshold_ms}ms)`}
                          </span>
                        )}
                        {issue.span_name && (
                          <span className="text-[10px] text-gray-600 font-mono">{issue.span_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Metric issues (from evaluation engine) */}
      {metricIssues.length > 0 && (
        <div className="bg-[#030712] border border-teal-500/20 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-red-500/5 border-b border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h4 className="text-base font-semibold text-white">Metric Issues</h4>
            <span className="ml-auto px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs font-semibold text-red-400">
              {metricIssues.length} {metricIssues.length === 1 ? 'Issue' : 'Issues'}
            </span>
          </div>
          <div className="divide-y divide-gray-800/30">
            {metricIssues.map((issue, idx) => (
              <div key={idx} className="px-6 py-4 hover:bg-gray-800/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 mb-1">{issue.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        issue.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        issue.severity === 'major' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {issue.severity}
                      </span>
                      {issue.metric_name && (
                        <span className="text-[10px] text-gray-500 capitalize">{issue.metric_name.replace(/_/g, ' ')}</span>
                      )}
                      {issue.category && (
                        <span className="text-[10px] text-gray-600 capitalize">{issue.category.replace(/_/g, ' ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TestReportView = ({ report, evaluation, transcriptData: initialTranscriptData, simulationData, onBack, isUploaded, callId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('');
  const [showTraces, setShowTraces] = useState(false);
  const topBarContext = useContext(TopBarContext);
  const transcriptData = initialTranscriptData;

  // Fetch trace data and issues when callId is available
  const { data: traceData, isLoading: isTraceLoading } = useCallTrace(callId);
  const { data: issuesData, isLoading: isIssuesLoading } = useCallIssues(callId);

  // Trace exists if we have a callId and the fetch returned data (not null/404)
  const hasTrace = !!callId && !!traceData;

  // Update TopBar with back button when this component mounts, and restore previous state on unmount
  useEffect(() => {
    const setter = topBarContext?.setTopBarState;
    if (!setter) return;

    // Save previous state so we can restore it on unmount
    const prev = topBarContext.topBarState || { showBackButton: false, onBack: null };

    setter({ showBackButton: true, onBack });

    return () => {
      setter(prev);
    };
  }, [topBarContext?.setTopBarState, onBack]);

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
    { id: 'issues', label: 'Issues', icon: AlertTriangle }
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

  const insightCategoryScores = useMemo(() => {
    if (!Array.isArray(evaluationData?.category_scores)) return [];

    const scores = evaluationData.category_scores.map(cat => {
      const score = cat.score || 0;
      const normalizedScore = score <= 1 ? Math.round(score * 100) : Math.round(score);

      return {
        category: cat.category,
        score: normalizedScore,
        weight: cat.weight || 0
      };
    });

    return scores;
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
        // Special override: ensure hallucination is its own category
        if (mName === 'hallucination') {
          category = 'hallucination';
        }
        // Special override: ensure pronunciation is its own category
        if (mName === 'pronunciation_accuracy') {
          category = 'pronunciation';
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

  // Get call recording URL
  const callRecordingUrl = transcriptData?.audio_url || report?.call_recording;

  // Render category-specific view
  const renderCategoryView = () => {
    console.log('Rendering category:', activeCategory);
    console.log('Category data:', categoryMap[activeCategory]);

    switch (activeCategory) {
      case 'accuracy':
        return <AccuracyView response={categoryMap.accuracy} transcriptData={transcriptData} onBack={handleBackToOverview} />;

      case 'latency':
        return <LatencyOverview 
          response={categoryMap.latency} 
          onBack={handleBackToOverview}
          callRecordingUrl={callRecordingUrl}
        />;

      case 'audio_quality':
        return <AudioOverview response={categoryMap.audio_quality} onBack={handleBackToOverview} />;

      case 'endpointing':
        return <EndpointingOverview response={categoryMap.endpointing} onBack={handleBackToOverview} />;

      case 'persona':
        return <PersonaOverview response={categoryMap.persona} onBack={handleBackToOverview} />;

      case 'task_completion':
        return <TaskCompletionOverview response={categoryMap.task_completion} onBack={handleBackToOverview} />;

      case 'conversation_quality':
        return <ConversationOverview response={categoryMap.conversation_quality} transcriptData={transcriptData} onBack={handleBackToOverview} />;

      case 'gibberish':
        return (
          <GibberishDetection
            response={{
              metric_results: categoryMap.gibberish?.metrics || []
            }}
          />
        );
      
      case 'hallucination':
        return <HallucinationOverview response={categoryMap.hallucination} onBack={handleBackToOverview} />;

      case 'pronunciation':
        return <PronunciationOverview response={categoryMap.pronunciation} onBack={handleBackToOverview} />;

      default:
        return null;
    }
  };

  // Handle trace view navigation
  if (showTraces && hasTrace) {
    return (
      <TraceViewer
        traceData={traceData}
        onBack={() => setShowTraces(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Title and View Traces Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex-shrink-0">
          Call Analysis
        </h2>
        
        {/* View Traces Button - only when a Langfuse trace exists for this call */}
        {hasTrace && (
          <button
            onClick={() => setShowTraces(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 hover:border-teal-500/50 rounded-lg text-teal-400 hover:text-teal-300 transition-all shadow-lg"
          >
            <GitBranch className="w-5 h-5" />
            <span className="text-sm font-semibold">View Traces</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className={`bg-[#030712] border rounded-xl p-5 ${getScoreBg(evaluationData?.overall_score || 0)}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-semibold uppercase">Overall Score</p>
            {evaluationData?.passed ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
          </div>
          <p className={`text-xl font-bold ${getScoreColor(evaluationData?.overall_score || 0)}`}>
            {evaluationData?.overall_score || 0}%
          </p>
        </div>

        <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-5">
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

        <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <p className="text-xs text-gray-400 font-semibold uppercase">Issues Found</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {evaluationData?.issues_found || 0}
          </p>
        </div>

        <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-5">
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
          categoryScores={insightCategoryScores}
          clickable={true}
        />
      )}

      {/* Render Category View if active */}
      {activeCategory && renderCategoryView()}

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
                <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-6">
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
            </>
          )}

          {activeTab === 'transcript' && (
            <>
              {transcriptData ? (
                <CallTranscriptPanel
                  transcriptData={transcriptData}
                  callRecordingUrl={callRecordingUrl}
                  isUploaded={isUploaded}
                />
              ) : (
                <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No transcript data available</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'issues' && (
            <IssuesTab
              callId={callId}
              issuesData={issuesData}
              isLoading={isIssuesLoading}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TestReportView;
