import React, { useRef } from 'react';
import { ArrowLeft, Clock, TrendingUp, Zap } from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import AudioPlayer from '../../../../components/AudioPlayer';

const LatencyOverview = ({ response, data, onBack, callRecordingUrl, onTimeSeek }) => {
  const audioPlayerRef = useRef(null);
  
  // Handle both single evaluation (response) and aggregated data (data)
  let metrics = [];
  let score = 0;

  if (response) {
    metrics = response?.metrics || [];
    score = response?.score || 0;
  } else if (data) {
    // Called from Dashboard with aggregated data
    const simEval = data.simulation_evaluation;
    if (simEval) {
      if (simEval.average_scores?.by_category?.latency !== undefined) {
        score = simEval.average_scores.by_category.latency;
      } else if (Array.isArray(simEval.average_category_scores)) {
        const cat = simEval.average_category_scores.find(c => c.category === 'latency');
        if (cat) {
          score = cat.average_score || 0;
        }
      }

      if (Array.isArray(simEval.average_metric_results)) {
        metrics = simEval.average_metric_results
          .filter(m => m.category === 'latency')
          .map(m => ({
            ...m,
            score: m.average_score,
            status: m.average_score >= 0.7 ? 'passed' : 'failed'
          }));
      }
    }

    if (metrics.length === 0 && Array.isArray(data.evaluations) && data.evaluations.length > 0) {
      metrics = data.evaluations[0].metric_results?.filter(m => m.category === 'latency') || [];
    }

    if (metrics.length === 0 && Array.isArray(data.category_scores)) {
      const latencyCategory = data.category_scores.find(c => c.category === 'latency');
      if (latencyCategory) {
        metrics = latencyCategory.metrics || [];
        if (score === 0) {
          score = latencyCategory.average_score || 0;
        }
      }
    }
  }

  // Extract latency series data for the line chart
  const responseLatencyMetric = metrics.find(m => 
    (m.metric_name || m.name) === 'response_latency'
  );

  const latencySeries = responseLatencyMetric?.details?.latency_series || [];
  const threshold = responseLatencyMetric?.details?.threshold || 2000;

  // Prepare data for Nivo line chart
  const chartData = [
    {
      id: 'Response Latency',
      data: latencySeries.map((point, index) => ({
        x: point.timestamp_ms / 1000,
        y: point.latency_ms,
        timestamp_ms: point.timestamp_ms,
        index: index
      }))
    },
    {
      id: 'Threshold',
      data: latencySeries.map((point) => ({
        x: point.timestamp_ms / 1000,
        y: threshold
      }))
    }
  ];

  // Handle point click - seek audio to timestamp
  const handlePointClick = (point) => {
    console.log('🟢 GRAPH CLICKED');
    console.log('point:', point);
    console.log('serieId:', point.seriesId);
    console.log('x (seconds):', point.data.x);

    // Check if it's the Response Latency line
    if (point.seriesId !== 'Response Latency') {
      console.warn('❌ Not response latency, ignoring');
      return;
    }

    const seconds = point.data.x;
    if (!Number.isFinite(seconds) || !callRecordingUrl) {
      console.error('❌ Invalid time or no audio URL');
      return;
    }

    console.log('➡️ Seeking to', seconds, 'seconds');
    
    // Use seekAndPlay method if available
    if (audioPlayerRef.current?.seekAndPlay) {
      audioPlayerRef.current.seekAndPlay(seconds);
    } else if (audioPlayerRef.current?.seek) {
      // Fallback to separate seek + play
      audioPlayerRef.current.seek(seconds);
      setTimeout(() => {
        if (audioPlayerRef.current?.play) {
          audioPlayerRef.current.play();
        }
      }, 100);
    }
    
    // Call external callback if provided
    if (onTimeSeek) {
      onTimeSeek(seconds);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No latency metrics available</p>
        </div>
      </div>
    );
  }

  const passedCount = metrics.filter(m => m.status === "passed" || m.passed === true).length;
  const totalCount = metrics.length;
  const failedCount = totalCount - passedCount;
  const normalizedScore = typeof score === 'number' ? (score > 1 ? Math.round(score) : Math.round(score * 100)) : 0;

  const humanizeMetricName = (name) => {
    if (!name) return "Unknown Metric";
    if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
    return String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate statistics for latency
  const avgLatency = responseLatencyMetric?.details?.average_ms || 0;
  const maxLatency = responseLatencyMetric?.details?.max_ms || 0;
  const minLatency = responseLatencyMetric?.details?.min_ms || 0;
  const p95Latency = responseLatencyMetric?.details?.p95_ms || 0;

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

      {/* Header Card */}
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Clock size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Latency Analytics</h2>
            <p className="text-gray-400 text-sm mt-1">Detailed performance metrics for response times and processing</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-4xl font-bold text-teal-400">{normalizedScore}%</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Overall Score</span>
          </div>

          <div className="h-10 w-px bg-gray-800" />

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

      {/* Latency Timeline Graph */}
      {latencySeries.length > 0 && (
        <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Latency Timeline</h2>
              <p className="text-gray-400 text-sm">
                {callRecordingUrl 
                  ? 'Click on any point to jump to that moment in the recording' 
                  : 'Response latency over time'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Average</div>
              <div className="text-2xl font-bold text-teal-400">{Math.round(avgLatency)}ms</div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Min</div>
              <div className="text-2xl font-bold text-green-400">{Math.round(minLatency)}ms</div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Max</div>
              <div className="text-2xl font-bold text-red-400">{Math.round(maxLatency)}ms</div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">P95</div>
              <div className="text-2xl font-bold text-orange-400">{Math.round(p95Latency)}ms</div>
            </div>
          </div>

          {/* Line Chart */}
          <div style={{ height: '400px' }}>
            <ResponsiveLine
              data={chartData}
              margin={{ top: 20, right: 120, bottom: 60, left: 80 }}
              xScale={{ type: 'linear' }}
              yScale={{
                type: 'linear',
                min: 0,
                max: 'auto',
                stacked: false,
                reverse: false
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Time (seconds)',
                legendOffset: 45,
                legendPosition: 'middle',
                format: (value) => formatTime(value)
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Latency (ms)',
                legendOffset: -60,
                legendPosition: 'middle'
              }}
              colors={['#14b8a6', '#ef4444']}
              lineWidth={3}
              pointSize={callRecordingUrl ? 10 : 8}
              pointColor={{ from: 'color' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              enableArea={true}
              areaOpacity={0.1}
              useMesh={true}
              enableSlices={false}
              onClick={(point) => handlePointClick(point)}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              theme={{
                text: { 
                  fill: '#9ca3af', 
                  fontSize: 12,
                  fontFamily: 'Inter, sans-serif'
                },
                grid: { 
                  line: { 
                    stroke: '#374151', 
                    strokeWidth: 1 
                  } 
                },
                axis: {
                  legend: {
                    text: {
                      fill: '#d1d5db',
                      fontSize: 13,
                      fontWeight: 600
                    }
                  }
                },
                tooltip: {
                  container: {
                    background: '#1f2937',
                    color: '#fff',
                    fontSize: 13,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    padding: '10px 14px',
                    border: '1px solid #374151'
                  }
                },
                crosshair: {
                  line: {
                    stroke: '#14b8a6',
                    strokeWidth: 2,
                    strokeOpacity: 0.5,
                    strokeDasharray: '6 6'
                  }
                }
              }}
              tooltip={({ point }) => (
                <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-lg">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {point.serieId}
                  </div>
                  <div className="text-sm text-white font-semibold">
                    {Math.round(point.data.y)}ms
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    at {formatTime(point.data.x)}
                  </div>
                  {point.serieId === 'Response Latency' && callRecordingUrl && (
                    <div className="text-xs text-teal-400 mt-2 italic">
                      Click to jump to this point
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Audio Player - Below the graph */}
      {callRecordingUrl && (
        <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Call Recording</h3>

            </div>
          </div>
          <AudioPlayer
            ref={audioPlayerRef}
            audioUrl={callRecordingUrl}
          />
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, idx) => {
          const isPassed = metric.status === "passed" || metric.passed === true;
          const mName = metric.metric_name || metric.name;
          const label = humanizeMetricName(mName);
          const valRaw =
            metric.value ??
            metric.details?.average_ms ??
            metric.details?.duration_ms ??
            (metric.details?.repetition_count !== undefined
              ? metric.details.repetition_count
              : 0);
          const isCount = mName === 'repetition_count';
          const unit = isCount ? '' : (mName === 'total_duration' ? 's' : 'ms');
          const valueDisplay = isCount ? valRaw : (mName === 'total_duration' ? `${(valRaw / 1000).toFixed(2)}${unit}` : `${Math.round(valRaw)}${unit}`);

          const details = Object.entries(metric.details || {})
            .filter(([key]) => !['passed', 'value', 'execution_time_ms', 'error_message', 'reasoning', 'agent_sentences', 'repetitions', 'threshold', 'latency_series', 'count', 'std_dev'].includes(key));

          return (
            <div key={idx} className={`rounded-xl p-6 border ${isPassed ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-red-950/10 border-red-900/20'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{label}</span>
                  <span className={`text-2xl font-bold ${isPassed ? 'text-teal-400' : 'text-red-400'}`}>
                    {valueDisplay}
                  </span>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {isPassed ? '✓ PASSED' : '✗ FAILED'}
                </div>
              </div>

              {details.length > 0 && (
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-6 border-t border-gray-800/50">
                  {details.map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-sm text-gray-300">
                        {typeof value === 'number' ? (key.includes('ms') ? `${Math.round(value)}ms` : value) : String(value)}
                      </span>
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
    </div>
  );
};

export default LatencyOverview;