import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { useTrace } from '../../hooks/useObservability';
import TraceViewer from '../evaluation/viewreport/TraceViewer';

// ---------------------------------------------------------------------------
// Latency thresholds (seconds) — mirrors backend _classify_span logic
// ---------------------------------------------------------------------------
const STT_THRESHOLD_S = 3.0;
const TTS_THRESHOLD_S = 2.0;
const LLM_THRESHOLD_S = 5.0;
const STT_NAMES = new Set(['stt_node', 'stt_request']);
const TTS_NAMES = new Set(['tts_node', 'tts_request']);
const LLM_NAMES = new Set(['llm_node', 'llm_request', 'open.chat']);
const TOOL_NAMES = new Set(['function_call', 'tool_call', 'function_node']);

function classifySpan(name) {
  const lower = (name || '').toLowerCase();
  if (STT_NAMES.has(lower) || lower.includes('stt') || lower.includes('speech_to_text'))
    return ['STT', STT_THRESHOLD_S];
  if (TTS_NAMES.has(lower) || lower.includes('tts') || lower.includes('text_to_speech'))
    return ['TTS', TTS_THRESHOLD_S];
  if (LLM_NAMES.has(lower) || lower.includes('llm') || lower.includes('language_model'))
    return ['LLM', LLM_THRESHOLD_S];
  if (TOOL_NAMES.has(lower) || lower.includes('tool') || lower.includes('function'))
    return ['Tool Call', null];
  return [null, null];
}

/**
 * Compute issues from observations (TraceViewer format: latency in seconds, level field).
 * The backend now returns /observability/traces/{id} in the same format as /calls/{id}/trace.
 */
function analyzeObservationIssues(observations) {
  const issues = [];
  for (const obs of observations || []) {
    const name = obs.name || '';
    const isError = obs.level === 'ERROR';
    const latencyS = obs.latency || 0; // latency is already in seconds
    const [component, threshold] = classifySpan(name);

    if (isError) {
      issues.push({
        component: component || 'General',
        severity: 'high',
        message: obs.statusMessage || `Error detected in span '${name}'`,
        spanName: name,
        latencyMs: Math.round(latencyS * 1000),
        thresholdMs: threshold ? Math.round(threshold * 1000) : null,
      });
      continue;
    }

    if (component && threshold && latencyS > threshold) {
      issues.push({
        component,
        severity: latencyS > threshold * 1.5 ? 'high' : 'medium',
        message: `${component} latency exceeded threshold (${latencyS.toFixed(2)}s > ${threshold.toFixed(1)}s threshold)`,
        spanName: name,
        latencyMs: Math.round(latencyS * 1000),
        thresholdMs: Math.round(threshold * 1000),
      });
    }
  }
  return issues;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const TraceDetailPage = () => {
  const { traceId } = useParams();
  const navigate = useNavigate();

  // Backend now returns { trace: { id, name, timestamp, latency, observations: [...] } }
  // — identical format to what useCallTrace returns from /calls/{id}/trace
  const { data, isLoading, error } = useTrace(traceId);

  const issues = useMemo(
    () => analyzeObservationIssues(data?.trace?.observations),
    [data]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Trace Not Found</h2>
          <p className="text-gray-400 mb-4">
            {error?.message || "The trace you're looking for doesn't exist or hasn't been synced yet."}
          </p>
          <button
            onClick={() => navigate('/observability/traces')}
            className="px-4 py-2 bg-teal-500/20 border border-teal-500/50 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors"
          >
            Back to Traces
          </button>
        </div>
      </div>
    );
  }

  // Pass data directly to TraceViewer — same format as the Calls page trace view
  return (
    <TraceViewer
      traceData={data}
      issues={issues}
      onBack={() => navigate('/observability/traces')}
    />
  );
};

export default TraceDetailPage;
