import React, { useRef, useEffect } from 'react';
import { Upload, Plus, AlertCircle, Download, Trash2 } from 'lucide-react';
import Badge from '../../../components/Badge';
import { extractNoiseFromSessionId, getNoiseProfileBadgeVariant } from '../../../utils/noiseUtils';

const CallsTable = ({
  calls,
  isCallsLoading,
  error,
  callsPage,
  callsPerPage,
  onRowClick,
  onDeleteCall,
  onDownload,
  onAddCalls,
  formatDate,
  getMetricValue,
  isDeleting,
  onPageChange // Add this prop to update page
}) => {
  // Store the current page in a ref
  const pageRef = useRef(callsPage);

  // Update ref when page changes
  useEffect(() => {
    pageRef.current = callsPage;
  }, [callsPage]);

  // Restore page on mount if needed
  useEffect(() => {
    if (onPageChange && pageRef.current !== callsPage) {
      onPageChange(pageRef.current);
    }
  }, []);

  const startIdx = (callsPage - 1) * callsPerPage;
  const endIdx = startIdx + callsPerPage;
  const paginatedCalls = calls.slice(startIdx, endIdx);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800/50">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Index</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Timestamp</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Duration</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Avg Latency</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Total Score</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isCallsLoading ? (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  Loading calls...
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center">
                <div className="flex items-center justify-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  Error loading calls: {error.message}
                </div>
              </td>
            </tr>
          ) : calls.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-12 h-12 text-gray-600" />
                  <p className="text-gray-500">No calls found in this directory</p>
                  <p className="text-sm text-gray-600">Upload recordings to start evaluating your voice flows</p>
                  <button
                    onClick={onAddCalls}
                    className="mt-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Calls
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            paginatedCalls.map((call, index) => (
              <tr
                key={call.call_id}
                onClick={() => onRowClick(call)}
                className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors group cursor-pointer"
              >
                <td className="px-4 py-3 text-sm text-gray-300">
                  {calls.length - (startIdx + index)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {formatDate(call.created_at)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}m ${Math.floor(call.duration_seconds % 60)}s` : '--'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {(() => {
                    // Primary: Get from metric_results (source of truth)
                    const responseLatencyMetric = call.evaluation?.metric_results?.find(m => m.metric_name === 'response_latency');
                    if (responseLatencyMetric?.details?.average_ms) {
                      return `${Math.round(responseLatencyMetric.details.average_ms)}ms`;
                    }
                    
                    // Fallback: Try category_scores for backwards compatibility
                    const latencyCategory = call.evaluation?.category_scores?.find(cat => cat.category === 'latency');
                    const latencyMetric = latencyCategory?.metrics?.find(m => m.name === 'response_latency');
                    
                    if (latencyMetric?.score !== undefined && latencyMetric?.score !== null) {
                      // Score is normalized 0-1, multiply by threshold or use average from details if available
                      const avgLatency = latencyMetric.score * 1000;
                      return `${Math.round(avgLatency)}ms`;
                    }
                    
                    return '--';
                  })()}
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const evalStatus = (call.evaluation?.status || call.evaluation_status || '').toLowerCase();
                    const callStatus = (call.status || '').toLowerCase();
                    const processingStage = (call.processing_stage || '').toLowerCase();

                    const isEvaluatingCall = ['processing', 'evaluating', 'in_progress', 'running'].includes(evalStatus);
                    const isProcessing = callStatus === 'processing' || processingStage === 'transcribing' || processingStage === 'evaluating';
                    const isStillProcessing = !['evaluated', 'completed', 'done', 'finished'].includes(processingStage);
                    const hasEvalIdButNoData = call.evaluation_id && !call.evaluation && isStillProcessing;

                    if (isEvaluatingCall || isProcessing || hasEvalIdButNoData) {
                      const stageText = processingStage === 'transcribing' 
                        ? 'Transcribing...' 
                        : processingStage === 'evaluating' 
                        ? 'Evaluating...' 
                        : 'Processing...';
                      return (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                          {stageText}
                        </div>
                      );
                    }

                    if (callStatus === 'failed' || evalStatus === 'failed') {
                      return (
                        <div className="flex items-center gap-2 text-sm text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          Failed
                        </div>
                      );
                    }

                    const overallScore = call.evaluation?.overall_score;
                    if (overallScore !== undefined && overallScore !== null) {
                      const scorePercentage = (overallScore * 100).toFixed(1);
                      return (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${parseFloat(scorePercentage) >= 80 ? 'bg-green-500' : parseFloat(scorePercentage) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm text-gray-300">{scorePercentage}</span>
                        </div>
                      );
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                        <span className="text-sm text-gray-500">--</span>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload && onDownload(call);
                      }}
                      className="p-1.5 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCall(call.call_id);
                      }}
                      disabled={isDeleting}
                      className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CallsTable;