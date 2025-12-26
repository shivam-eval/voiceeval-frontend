import React, { useState, useEffect } from 'react';
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

const TestReportView = ({ report, transcriptData, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [evaluationData, setEvaluationData] = useState(null);

  // Mock evaluation data (in production, fetch from API)
  useEffect(() => {
    // Simulate fetching evaluation data
    setEvaluationData({
      overall_score: 87,
      passed: true,
      category_scores: [
        { category: 'accuracy', score: 82 },
        { category: 'task_completion', score: 91 },
        { category: 'latency', score: 88 },
        { category: 'audio_quality', score: 85 },
        { category: 'conversation_quality', score: 89 },
        { category: 'endpointing', score: 78 },
        { category: 'cost', score: 95 },
        { category: 'persona', score: 92 }
      ],
      failure_propagation: {
        critical_failure_turns: ['turn_003'],
        total_tainted_steps: 2,
        propagation_depth: 2,
        cascading_failures: {
          'turn_003': ['turn_004', 'turn_005']
        },
        step_health: {
          'turn_001': { turn_id: 'turn_001', is_healthy: true, is_tainted: false, failed_metrics: [] },
          'turn_002': { turn_id: 'turn_002', is_healthy: true, is_tainted: false, failed_metrics: [] },
          'turn_003': { turn_id: 'turn_003', is_healthy: false, is_tainted: false, failed_metrics: ['semantic_accuracy'] },
          'turn_004': { turn_id: 'turn_004', is_healthy: false, is_tainted: true, tainted_by_turn_id: 'turn_003', failed_metrics: [] },
          'turn_005': { turn_id: 'turn_005', is_healthy: false, is_tainted: true, tainted_by_turn_id: 'turn_003', failed_metrics: [] }
        }
      }
    });
  }, [report]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'transcript', label: 'Transcript', icon: MessageSquare },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'propagation', label: 'Failure Analysis', icon: TrendingUp }
  ];

  // Prepare radar chart data
  const radarData = evaluationData?.category_scores.map(cat => ({
    category: cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    score: cat.score
  })) || [];

  // Mock latency timeline data
  const latencyData = [
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Test Report
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
              Transcript: <span className="font-mono text-gray-300">{report?.transcript_result_id?.substring(0, 12) || 'N/A'}...</span>
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
            <p className="text-xs text-gray-400 font-semibold uppercase">Duration</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {transcriptData?.metadata?.duration_ms 
              ? `${(transcriptData.metadata.duration_ms / 1000).toFixed(1)}s`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400 font-semibold uppercase">Total Turns</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {transcriptData?.metadata?.total_turns || 0}
          </p>
        </div>

        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-gray-400 font-semibold uppercase">Avg Latency</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {transcriptData?.metadata?.avg_response_latency_ms 
              ? `${(transcriptData.metadata.avg_response_latency_ms / 1000).toFixed(2)}s`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400 font-semibold uppercase">Est. Cost</p>
          </div>
          <p className="text-2xl font-bold text-white">
            1.02
          </p>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Category Scores Radar */}
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

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {evaluationData?.category_scores.map(cat => (
                <div 
                  key={cat.category}
                  className="bg-dark-panel border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        {cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className={`text-2xl font-bold ${getScoreColor(cat.score)}`}>
                        {cat.score}%
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
                          stroke={cat.score >= 90 ? '#22c55e' : cat.score >= 75 ? '#eab308' : '#ef4444'}
                          strokeWidth="3"
                          strokeDasharray={`${cat.score * 1.005}, 100.5`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

            {/* Detailed Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-3">Audio Quality</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Word Error Rate</span>
                    <span className="text-green-400 font-semibold">2.3%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Clarity Score</span>
                    <span className="text-green-400 font-semibold">94%</span>
                  </div>
                </div>
              </div>

              <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-3">Conversation Flow</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Context Maintained</span>
                    <span className="text-green-400 font-semibold">89%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Interruptions</span>
                    <span className="text-yellow-400 font-semibold">2</span>
                  </div>
                </div>
              </div>

              <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-3">Task Completion</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Goals Achieved</span>
                    <span className="text-green-400 font-semibold">4/5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Success Rate</span>
                    <span className="text-green-400 font-semibold">80%</span>
                  </div>
                </div>
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
    </div>
  );
};

export default TestReportView;
