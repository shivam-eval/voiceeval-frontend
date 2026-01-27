import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEvents } from '../../context/EventsContext';

const CallResultsTable = ({ transcriptResults = [], onViewReport, evaluationData = [], simulationId = '' }) => {
  // Track call evaluation progress
  const [callProgress, setCallProgress] = useState({});
  const { subscribe } = useEvents();

  // Subscribe to call evaluation updates
  useEffect(() => {
    const unsubscribe = subscribe('call_evaluation_update', (data) => {
      console.log('📡 Call evaluation update received:', data);

      const { call_id, status, stage, message, error, overall_score, session_id, evaluation_id } = data;

      if (call_id) {
        setCallProgress(prev => ({
          ...prev,
          [call_id]: {
            status,
            stage,
            message,
            error,
            overall_score,
            session_id,
            evaluation_id,
            timestamp: Date.now()
          }
        }));

        // Show toast notifications on completion or failure
        if (status === 'completed') {
          const scoreText = overall_score !== undefined ? ` (Score: ${Math.round(overall_score * 100)}%)` : '';
          toast.success(`✅ Evaluation completed for ${call_id}${scoreText}`, {
            autoClose: 4000,
            position: 'bottom-right'
          });
        } else if (status === 'failed') {
          toast.error(`❌ Evaluation failed for ${call_id}: ${error || 'Unknown error'}`, {
            autoClose: 5000,
            position: 'bottom-right'
          });
        }

        // If completed or failed, remove from progress after 3 seconds
        if (status === 'completed' || status === 'failed') {
          setTimeout(() => {
            setCallProgress(prev => {
              const updated = { ...prev };
              delete updated[call_id];
              return updated;
            });
          }, 3000);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();

    if (statusLower === 'completed' || statusLower === 'success') {
      return (
        <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs font-medium">
          Passed
        </span>
      );
    }

    if (statusLower === 'failed' || statusLower === 'error') {
      return (
        <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-medium">
          Failed
        </span>
      );
    }

    return (
      <span className="px-2 py-1 bg-gray-500/10 border border-gray-500/20 rounded text-gray-400 text-xs font-medium">
        {status}
      </span>
    );
  };

  const renderProgressIndicator = (callId) => {
    const progress = callProgress[callId];
    if (!progress) return null;

    const { stage, message, status } = progress;

    const stageLabels = {
      'initialization': 'Initializing...',
      'transcribing': 'Transcribing Audio...',
      'generating_test_suite': 'Generating Test Suite...',
      'evaluating': 'Running Evaluation...',
      'completed': 'Completed!',
      'failed': 'Failed'
    };

    const stageLabel = stageLabels[stage] || message || 'Processing...';

    if (status === 'completed') {
      return (
        <div className="flex items-center gap-2 text-green-400 text-xs animate-fade-in">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{stageLabel}</span>
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className="flex items-center gap-2 text-red-400 text-xs animate-fade-in">
          <XCircle className="w-3.5 h-3.5" />
          <span>{progress.error || stageLabel}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-teal-400 text-xs animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>{stageLabel}</span>
      </div>
    );
  };

  return (
    <div className="bg-dark-panel rounded-xl border border-gray-800/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800/50 bg-dark-panel/50">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-teal-400" />
          Call Results
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Detailed results for each test case execution
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/50 bg-dark-panel/30">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Test Case
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Score
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {transcriptResults.map((result, index) => {
              // Extract metadata and IDs from the new simulation response format if needed
              const metadata = result.metadata || {};
              const testId = metadata.test_id || result.test_id || 'Unknown Test';
              const transcriptResultId = metadata.transcript_result_id || result.transcript_result_id || 'N/A';
              const sessionId = result.session_id || metadata.session_id || 'N/A';
              const status = result.status || 'Unknown';

              // Use actual score from result data (handle different possible structures)
              const actualScore = result.overall_score || result.metrics?.overall_score || 0;

              return (
                <tr
                  key={transcriptResultId || index}
                  className="border-b border-gray-800/30 hover:bg-[#1e2433] transition-colors group"
                >
                  {/* Test Case Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">
                          {testId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Test Case #{index + 1}
                        </p>
                        {/* Real-time progress indicator */}
                        {result.call_id && renderProgressIndicator(result.call_id)}
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-bold text-lg ${getScoreColor(actualScore)}`}>
                        {actualScore}%
                      </span>
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${actualScore >= 90 ? 'bg-green-400' :
                            actualScore >= 75 ? 'bg-yellow-400' :
                              actualScore >= 60 ? 'bg-orange-400' : 'bg-red-400'
                            }`}
                          style={{ width: `${actualScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(status)}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewReport(result)}
                      className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg text-sm font-medium transition-all border border-teal-500/20 hover:border-teal-500/40 flex items-center gap-2 mx-auto group-hover:scale-105"
                    >
                      <Eye className="w-4 h-4" />
                      View Report
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {(!transcriptResults || transcriptResults.length === 0) && (
        <div className="px-6 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 text-sm">No test results available</p>
        </div>
      )}
    </div>
  );
};

export default CallResultsTable;