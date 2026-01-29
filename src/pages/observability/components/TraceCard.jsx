import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircleIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const TraceCard = ({ trace, onEvaluate, compact = false }) => {
  const navigate = useNavigate();
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (compact) {
    return (
      <div 
        className="bg-dark-800 border border-dark-700 rounded-lg p-3 hover:border-primary-500 transition-all cursor-pointer"
        onClick={() => navigate(`/observability/traces/${trace.trace_id}`)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-gray-300 truncate">
                {trace.trace_id.substring(0, 12)}...
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(trace.evaluation_status)}`}>
                {getStatusIcon(trace.evaluation_status)}
                {trace.evaluation_status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formatTimestamp(trace.start_time)}
            </p>
          </div>
          {trace.evaluated && trace.evaluation_score !== null && (
            <div className="ml-3 text-right">
              <div className="text-lg font-bold text-primary-400">
                {trace.evaluation_score}%
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden hover:border-primary-500 transition-all">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getStatusIcon(trace.evaluation_status)}
              <h3 
                className="text-lg font-semibold text-white cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => navigate(`/observability/traces/${trace.trace_id}`)}
              >
                Trace ID: {trace.trace_id.substring(0, 16)}...
              </h3>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
              <span>Session: {trace.session_id}</span>
              <span>•</span>
              <span>{formatTimestamp(trace.start_time)}</span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(trace.evaluation_status)}`}>
            {trace.evaluation_status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Duration */}
          <div className="bg-dark-900 rounded-lg p-3 border border-dark-700">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <ClockIcon className="w-4 h-4" />
              Duration
            </div>
            <div className="text-white font-semibold">
              {formatDuration(trace.duration_ms)}
            </div>
          </div>

          {/* Spans */}
          <div className="bg-dark-900 rounded-lg p-3 border border-dark-700">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <ChartBarIcon className="w-4 h-4" />
              Spans
            </div>
            <div className="text-white font-semibold">
              {trace.spans?.length || 0}
            </div>
          </div>

          {/* Cost */}
          <div className="bg-dark-900 rounded-lg p-3 border border-dark-700">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <CurrencyDollarIcon className="w-4 h-4" />
              Cost
            </div>
            <div className="text-white font-semibold">
              ${trace.total_cost_usd?.toFixed(4) || '0.0000'}
            </div>
          </div>

          {/* Score */}
          {trace.evaluated && trace.evaluation_score !== null && (
            <div className="bg-dark-900 rounded-lg p-3 border border-dark-700">
              <div className="text-gray-400 text-xs mb-1">Score</div>
              <div className="text-2xl font-bold text-primary-400">
                {trace.evaluation_score}%
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-700">
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/observability/traces/${trace.trace_id}`)}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              View Details
            </button>
            {!trace.evaluated && onEvaluate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEvaluate(trace.trace_id);
                }}
                className="px-3 py-1.5 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors text-sm font-medium flex items-center gap-1"
              >
                <PlayCircleIcon className="w-4 h-4" />
                Evaluate
              </button>
            )}
          </div>
          {trace.evaluated && trace.evaluation_id && (
            <button
              onClick={() => navigate(`/evaluations/${trace.evaluation_id}`)}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
            >
              View Evaluation →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraceCard;
