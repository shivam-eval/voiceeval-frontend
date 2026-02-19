import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  GitBranch,
  Clock,
  DollarSign,
  BarChart2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTraces, useSyncTraces, useSyncStatus } from '../../hooks/useObservability';
import TraceViewer from '../evaluation/viewreport/TraceViewer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDuration(ms) {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTimestamp(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  const cfg = {
    passed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', label: 'Passed' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', label: 'Failed' },
  }[status] || { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20', label: 'Pending' };

  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TraceRow — single row in the list
// ---------------------------------------------------------------------------
function TraceRow({ trace }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        // Emit custom event so parent can open nested viewer when provided
        const evt = new CustomEvent('openTraceViewer', { detail: trace });
        window.dispatchEvent(evt);
      }}
      className="flex items-center gap-4 px-5 py-4 bg-dark-panel border border-gray-800/50 rounded-xl hover:border-teal-500/30 hover:bg-teal-500/5 cursor-pointer transition-all group"
    >
      {/* Trace ID + session */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono text-gray-200 truncate group-hover:text-teal-400 transition-colors">
          {trace.trace_id}
        </p>
        {trace.session_id && (
          <p className="text-xs text-gray-500 mt-0.5 truncate font-mono">
            Session: {trace.session_id}
          </p>
        )}
      </div>

      {/* Agent */}
      {trace.agent_id && (
        <div className="hidden md:block w-36 flex-shrink-0">
          <p className="text-xs text-gray-400 truncate">{trace.agent_id}</p>
        </div>
      )}

      {/* Duration */}
      <div className="flex items-center gap-1 w-20 flex-shrink-0">
        <Clock className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-sm text-gray-300 font-mono">{formatDuration(trace.duration_ms)}</span>
      </div>

      {/* Spans */}
      <div className="flex items-center gap-1 w-16 flex-shrink-0">
        <BarChart2 className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-sm text-gray-300">{trace.spans?.length ?? trace.total_spans ?? 0}</span>
      </div>

      {/* Cost */}
      <div className="hidden sm:flex items-center gap-1 w-20 flex-shrink-0">
        <DollarSign className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-sm text-gray-300 font-mono">
          {(trace.total_cost_usd || 0).toFixed(4)}
        </span>
      </div>

      {/* Status */}
      <div className="w-24 flex-shrink-0">
        <StatusBadge status={trace.evaluation_status} />
      </div>

      {/* Time */}
      <div className="hidden lg:block w-36 flex-shrink-0 text-right">
        <span className="text-xs text-gray-500">{formatTimestamp(trace.start_time)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
const TracesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [showTraceViewer, setShowTraceViewer] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const filters = { search, page, limit };
  const { data, isLoading, refetch } = useTraces(filters);
  const syncMutation = useSyncTraces();
  const { data: syncStatus } = useSyncStatus();

  const traces = data?.traces || [];
  const totalPages = data?.pages || 1;

  const handleSync = () => syncMutation.mutate(false);

  // Auto-refresh traces when page mounts or filters change
  useEffect(() => {
    // Ensure we fetch latest traces from DB when entering the page
    refetch();
  }, [refetch]);

  // Listener for TraceRow clicks to open nested TraceViewer
  useEffect(() => {
    function handler(e) {
      const trace = e.detail;
      setSelectedTrace(trace);
      setShowTraceViewer(true);
    }
    window.addEventListener('openTraceViewer', handler);
    return () => window.removeEventListener('openTraceViewer', handler);
  }, []);

  // Helper: classify/analyze spans (copied from TraceDetailPage)
  function classifySpan(name) {
    const lower = (name || '').toLowerCase();
    if (new Set(['stt_node', 'stt_request']).has(lower) || lower.includes('stt') || lower.includes('speech_to_text'))
      return ['STT', 3.0];
    if (new Set(['tts_node', 'tts_request']).has(lower) || lower.includes('tts') || lower.includes('text_to_speech'))
      return ['TTS', 2.0];
    if (new Set(['llm_node', 'llm_request', 'open.chat']).has(lower) || lower.includes('llm') || lower.includes('language_model'))
      return ['LLM', 5.0];
    if (lower.includes('tool') || lower.includes('function') || lower.includes('function_call'))
      return ['Tool Call', null];
    return [null, null];
  }

  function analyzeSpanIssues(spans) {
    const issues = [];
    for (const span of spans || []) {
      const name = span.name || '';
      const isError = span.status === 'ERROR';
      const latencyS = (span.duration_ms || 0) / 1000;
      const [component, threshold] = classifySpan(name);

      if (isError) {
        issues.push({
          component: component || 'General',
          severity: 'high',
          message: `Error detected in span '${name}'`,
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

  function transformTraceToViewerFormat(trace) {
    if (!trace) return null;
    return {
      trace: {
        id: trace.trace_id,
        name: trace.metadata?.name || (trace.agent_id ? `Agent: ${trace.agent_id}` : trace.trace_id),
        timestamp: trace.start_time,
        environment: trace.metadata?.environment || 'production',
        latency: (trace.duration_ms || 0) / 1000,
        observations: (trace.spans || []).map((span) => ({
          id: span.span_id,
          traceId: span.trace_id || trace.trace_id,
          parentObservationId: span.parent_span_id || null,
          type: span.kind === 'CLIENT' ? 'GENERATION' : 'SPAN',
          name: span.name || 'unnamed',
          level: span.status === 'ERROR' ? 'ERROR' : 'DEFAULT',
          statusMessage: span.status === 'ERROR' ? `Error in span '${span.name}'` : null,
          startTime: span.start_time,
          endTime: span.end_time,
          latency: (span.duration_ms || 0) / 1000,
          timeToFirstToken: null,
          model: span.model_name || null,
          modelParameters: null,
          completionStartTime: null,
          inputCost: null,
          outputCost: null,
          totalCost: span.cost_usd || 0,
          inputUsage: span.input_tokens || 0,
          outputUsage: span.output_tokens || 0,
          totalUsage: (span.input_tokens || 0) + (span.output_tokens || 0),
          toolDefinitions: '{}',
          toolCalls: [],
          toolCallNames: [],
          metadata: JSON.stringify(span.attributes || {}),
        })),
      },
    };
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-400/10 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Traces</h1>
                <p className="text-sm text-gray-400">
                  Production voice agent traces from Langfuse
                </p>
              </div>
            </div>
            {syncStatus?.last_sync_time && (
              <p className="text-xs text-gray-500 mt-2 ml-13">
                Last synced: {new Date(syncStatus.last_sync_time).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSync}
              disabled={syncMutation.isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-teal-400/10 border border-teal-400/30 text-teal-400 rounded-lg hover:bg-teal-400/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${syncMutation.isLoading ? 'animate-spin' : ''}`} />
              {syncMutation.isLoading ? 'Syncing…' : 'Sync'}
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by trace ID, session ID, or agent…"
            className="w-full pl-10 pr-4 py-2.5 bg-dark-panel border border-gray-800/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 text-sm"
          />
        </div>
      </div>

      {/* Count */}
      <div className="mb-3">
        <p className="text-sm text-gray-500">
          {data?.total != null ? (
            <>Showing <span className="text-white">{traces.length}</span> of <span className="text-white">{data.total}</span> traces</>
          ) : ''}
        </p>
      </div>

      {/* Table header */}
      {traces.length > 0 && (
        <div className="flex items-center gap-4 px-5 py-2 mb-1">
          <div className="flex-1 text-xs font-medium text-gray-500 uppercase tracking-wide">Trace ID</div>
          <div className="hidden md:block w-36 flex-shrink-0 text-xs font-medium text-gray-500 uppercase tracking-wide">Agent</div>
          <div className="w-20 flex-shrink-0 text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</div>
          <div className="w-16 flex-shrink-0 text-xs font-medium text-gray-500 uppercase tracking-wide">Spans</div>
          <div className="hidden sm:block w-20 flex-shrink-0 text-xs font-medium text-gray-500 uppercase tracking-wide">Cost</div>
          <div className="w-24 flex-shrink-0 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
          <div className="hidden lg:block w-36 flex-shrink-0 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Time</div>
        </div>
      )}

      {/* Rows */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
        </div>
      ) : traces.length > 0 ? (
        <div className="space-y-2">
          {traces.map((trace) => (
            <TraceRow key={trace.trace_id} trace={trace} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-dark-panel border border-gray-800/50 rounded-xl">
          <GitBranch className="w-12 h-12 text-gray-700 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No traces found</h3>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
            {search
              ? 'No traces match your search. Try a different query.'
              : 'No traces synced yet. Click Sync to pull traces from Langfuse.'}
          </p>
          {!search && (
            <button
              onClick={handleSync}
              disabled={syncMutation.isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-teal-400/10 border border-teal-400/30 text-teal-400 rounded-lg hover:bg-teal-400/20 transition-colors font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncMutation.isLoading ? 'animate-spin' : ''}`} />
              {syncMutation.isLoading ? 'Syncing…' : 'Sync from Langfuse'}
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 bg-dark-panel border border-gray-800/50 text-gray-400 hover:text-white rounded-lg hover:bg-dark-input transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-400">
            Page <span className="text-white font-medium">{page}</span> of{' '}
            <span className="text-white font-medium">{totalPages}</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 bg-dark-panel border border-gray-800/50 text-gray-400 hover:text-white rounded-lg hover:bg-dark-input transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Nested Trace Viewer */}
      {showTraceViewer && selectedTrace && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-6">
          <div className="w-full max-w-6xl h-[90vh] bg-[#0b1220] rounded-xl overflow-auto border border-gray-800/60">
            <TraceViewer
              traceData={transformTraceToViewerFormat(selectedTrace)}
              issues={analyzeSpanIssues(selectedTrace?.spans)}
              onBack={() => {
                setShowTraceViewer(false);
                setSelectedTrace(null);
                // refetch to ensure latest list
                refetch();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TracesPage;
