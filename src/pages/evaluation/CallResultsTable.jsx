import React from 'react';
import { Eye, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

const CallResultsTable = ({ transcriptResults = [], onViewReport }) => {
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

  // Mock scores for demo (in real app, fetch from evaluation results)
  const mockScores = [94, 87, 79, 91, 82, 88, 76, 93];

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
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Session ID
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Score
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Transcript ID
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {transcriptResults.map((result, index) => {
              const mockScore = mockScores[index % mockScores.length];
              
              return (
                <tr 
                  key={result.transcript_result_id || index}
                  className="border-b border-gray-800/30 hover:bg-[#1e2433] transition-colors group"
                >
                  {/* Test Case Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="text-white font-medium text-sm">
                          {result.test_id?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Test'}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Test Case #{index + 1}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Session ID */}
                  <td className="px-6 py-4">
                    <span className="text-gray-400 font-mono text-xs">
                      {result.session_id || 'N/A'}
                    </span>
                  </td>

                  {/* Score */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-bold text-lg ${getScoreColor(mockScore)}`}>
                        {mockScore}%
                      </span>
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            mockScore >= 90 ? 'bg-green-400' :
                            mockScore >= 75 ? 'bg-yellow-400' :
                            mockScore >= 60 ? 'bg-orange-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${mockScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(result.status)}
                  </td>

                  {/* Transcript ID */}
                  <td className="px-6 py-4">
                    <span className="text-gray-500 font-mono text-xs">
                      {result.transcript_result_id?.substring(0, 20) || 'N/A'}...
                    </span>
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
