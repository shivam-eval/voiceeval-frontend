import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Phone } from 'lucide-react';
import { useFolderCalls } from '../hooks/useFolders';

/**
 * CallsInFolderView - Shows individual calls within a folder
 */
const CallsInFolderView = ({ folderId }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch calls for folder
  const { data: callsData, isLoading } = useFolderCalls(folderId, {
    skip: (page - 1) * itemsPerPage,
    limit: itemsPerPage,
  });

  const calls = useMemo(() => {
    return callsData?.calls || [];
  }, [callsData]);

  const totalCount = callsData?.total || 0;

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Get status badge color and text
  const getStatusBadge = (status) => {
    let bgColor = 'bg-gray-700';
    let textColor = 'text-gray-200';
    let displayText = status;

    if (status === 'evals_done') {
      bgColor = 'bg-teal-500/20';
      textColor = 'text-teal-400';
      displayText = 'Evals Done';
    } else if (status?.includes('_failed')) {
      bgColor = 'bg-red-500/20';
      textColor = 'text-red-400';
      displayText = 'Failed';
    } else if (['ongoing', 'transcribing', 'evaluating'].includes(status)) {
      bgColor = 'bg-amber-500/20';
      textColor = 'text-amber-400';
      displayText = status.charAt(0).toUpperCase() + status.slice(1);
    }

    return (
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}>
        {displayText}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Table Container */}
      <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                <th className="px-4 py-3">Call ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Test Case ID</th>
                <th className="px-4 py-3 text-center">Created</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading calls...
                    </div>
                  </td>
                </tr>
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                        <Phone className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium">No calls in this folder</p>
                    </div>
                  </td>
                </tr>
              ) : (
                calls.map(call => (
                  <tr
                    key={call.call_id}
                    className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-500/5 rounded border border-blue-500/10">
                          <Phone className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-white font-semibold text-sm font-mono">
                          {call.call_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(call.status)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm font-mono">
                      {call.test_case_id}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 text-sm">
                      {call.created_at ? new Date(call.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Prev
          </button>
          {pageNumbers.map(num => (
            <button
              key={num}
              onClick={() => handlePageChange(num)}
              className={`px-3 py-2 rounded text-sm ${
                page === num
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CallsInFolderView;
