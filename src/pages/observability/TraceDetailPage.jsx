import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useTrace, useTraceEvaluation, useEvaluateTrace } from '../../hooks/useObservability';

const TraceDetailPage = () => {
  const { traceId } = useParams();
  const navigate = useNavigate();
  
  const { data: trace, isLoading: traceLoading } = useTrace(traceId);
  const { data: evaluation, isLoading: evalLoading } = useTraceEvaluation(traceId);
  const evaluateMutation = useEvaluateTrace();

  const handleEvaluate = () => {
    evaluateMutation.mutate({ traceId, options: {} });
  };

  if (traceLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Trace Not Found</h2>
          <p className="text-gray-400 mb-4">The trace you're looking for doesn't exist</p>
          <button
            onClick={() => navigate('/observability/traces')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Traces
          </button>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/observability/traces')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Traces
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trace Details</h1>
            <p className="text-gray-400 mt-1 font-mono">{trace.trace_id}</p>
          </div>
          
          {!evaluation?.evaluated && (
            <button
              onClick={handleEvaluate}
              disabled={evaluateMutation.isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <PlayCircleIcon className="w-5 h-5" />
              {evaluateMutation.isLoading ? 'Evaluating...' : 'Evaluate Trace'}
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <ClockIcon className="w-4 h-4" />
            Duration
          </div>
          <p className="text-2xl font-bold text-white">
            {formatDuration(trace.duration_ms)}
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <ChartBarIcon className="w-4 h-4" />
            Spans
          </div>
          <p className="text-2xl font-bold text-white">
            {trace.spans?.length || 0}
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <CurrencyDollarIcon className="w-4 h-4" />
            Total Cost
          </div>
          <p className="text-2xl font-bold text-white">
            ${trace.total_cost_usd?.toFixed(4) || '0.0000'}
          </p>
        </div>

        {evaluation?.evaluated && evaluation.evaluation && (
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-5">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              {evaluation.evaluation.passed ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-500" />
              )}
              Evaluation Score
            </div>
            <p className="text-2xl font-bold text-primary-400">
              {evaluation.evaluation.overall_score}%
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trace Information */}
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Trace Information</h2>
            
            <div className="space-y-3">
              <div className="flex items-start justify-between py-2 border-b border-dark-700">
                <span className="text-gray-400">Trace ID</span>
                <span className="text-white font-mono text-sm">{trace.trace_id}</span>
              </div>
              
              <div className="flex items-start justify-between py-2 border-b border-dark-700">
                <span className="text-gray-400">Session ID</span>
                <Link
                  to={`/observability/sessions/${trace.session_id}`}
                  className="text-primary-400 hover:text-primary-300 font-mono text-sm"
                >
                  {trace.session_id}
                </Link>
              </div>
              
              {trace.agent_id && (
                <div className="flex items-start justify-between py-2 border-b border-dark-700">
                  <span className="text-gray-400">Agent ID</span>
                  <span className="text-white font-mono text-sm">{trace.agent_id}</span>
                </div>
              )}
              
              <div className="flex items-start justify-between py-2 border-b border-dark-700">
                <span className="text-gray-400">Start Time</span>
                <span className="text-white text-sm">{formatTimestamp(trace.start_time)}</span>
              </div>
              
              <div className="flex items-start justify-between py-2">
                <span className="text-gray-400">End Time</span>
                <span className="text-white text-sm">{formatTimestamp(trace.end_time)}</span>
              </div>
            </div>
          </div>

          {/* Spans Timeline */}
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Spans Timeline</h2>
            
            {trace.spans && trace.spans.length > 0 ? (
              <div className="space-y-3">
                {trace.spans.map((span, idx) => (
                  <div key={idx} className="bg-dark-900 border border-dark-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-medium">{span.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{span.span_type}</p>
                      </div>
                      <span className="text-sm text-gray-400">
                        {formatDuration(span.duration_ms)}
                      </span>
                    </div>
                    
                    {span.input && (
                      <div className="mt-3 p-3 bg-dark-800 rounded border border-dark-700">
                        <p className="text-xs text-gray-400 mb-1">Input</p>
                        <pre className="text-sm text-white overflow-x-auto">
                          {typeof span.input === 'string' 
                            ? span.input 
                            : JSON.stringify(span.input, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {span.output && (
                      <div className="mt-2 p-3 bg-dark-800 rounded border border-dark-700">
                        <p className="text-xs text-gray-400 mb-1">Output</p>
                        <pre className="text-sm text-white overflow-x-auto">
                          {typeof span.output === 'string' 
                            ? span.output 
                            : JSON.stringify(span.output, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {span.cost_usd && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-gray-400">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        ${span.cost_usd.toFixed(6)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No spans available</p>
            )}
          </div>

          {/* Metadata */}
          {trace.metadata && Object.keys(trace.metadata).length > 0 && (
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Metadata</h2>
              <pre className="text-sm text-gray-300 bg-dark-900 p-4 rounded border border-dark-700 overflow-x-auto">
                {JSON.stringify(trace.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Evaluation Result */}
          {evaluation?.evaluated && evaluation.evaluation && (
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Evaluation Result</h2>
              
              <div className={`flex items-center justify-center gap-2 p-4 rounded-lg mb-4 ${
                evaluation.evaluation.passed 
                  ? 'bg-green-900/20 border border-green-700' 
                  : 'bg-red-900/20 border border-red-700'
              }`}>
                {evaluation.evaluation.passed ? (
                  <>
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    <span className="text-green-500 font-semibold">Passed</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-6 h-6 text-red-500" />
                    <span className="text-red-500 font-semibold">Failed</span>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Overall Score</span>
                  <span className="text-2xl font-bold text-primary-400">
                    {(evaluation.evaluation.overall_score * 100).toFixed(1)}%
                  </span>
                </div>

                {evaluation.evaluation.category_scores && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Category Scores</h3>
                    <div className="space-y-2">
                      {evaluation.evaluation.category_scores.map((category, idx) => (
                        <div key={idx} className="bg-dark-900 rounded p-3 border border-dark-700">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm capitalize">
                              {category.category.replace(/_/g, ' ')}
                            </span>
                            <span className={`text-sm font-medium ${
                              category.passed ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {category.passed ? 'Pass' : 'Fail'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Score: {(category.score.parsedValue * 100).toFixed(0)}% (Weight: {(category.weight * 100).toFixed(0)}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evaluation.evaluation.issues && evaluation.evaluation.issues.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Issues</h3>
                    <div className="space-y-2">
                      {evaluation.evaluation.issues.map((issue, idx) => (
                        <div key={idx} className="bg-red-900/20 border border-red-700 rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              issue.severity === 'critical' ? 'bg-red-600' : 
                              issue.severity === 'high' ? 'bg-orange-600' : 'bg-yellow-600'
                            }`}>
                              {issue.severity}
                            </span>
                            <span className="text-white text-sm">{issue.metric_name}</span>
                          </div>
                          <p className="text-xs text-gray-300 mt-1">{issue.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  to={`/evaluations/report/${evaluation.evaluation.evaluation_id}`}
                  className="block w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center font-medium"
                >
                  View Full Evaluation Report
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            
            <div className="space-y-2">
              <Link
                to={`/observability/sessions/${trace.session_id}`}
                className="flex items-center gap-2 w-full px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
              >
                <CalendarIcon className="w-5 h-5" />
                View Session
              </Link>
              
              {!evaluation?.evaluated && (
                <button
                  onClick={handleEvaluate}
                  disabled={evaluateMutation.isLoading}
                  className="flex items-center gap-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  <PlayCircleIcon className="w-5 h-5" />
                  Evaluate Now
                </button>
              )}
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trace.trace_id);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5" />
                Copy Trace ID
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraceDetailPage;
