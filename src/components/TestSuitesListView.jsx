import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, FileText, Search, Plus } from 'lucide-react';
import { useTestSuites } from '../hooks/useTestSuites';
import RunSimulationModal from './RunSimulationModal';

/**
 * TestSuitesListView - Shows test suites for a selected agent
 * Allows running simulations from each test suite
 */
const TestSuitesListView = ({ 
  agentId,
  showRunSimulation = true,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showRunModal, setShowRunModal] = useState(false);
  const [selectedTestSuite, setSelectedTestSuite] = useState(null);

  const getSafePage = useCallback((value, fallback = 1) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }, []);

  const [page, setPage] = useState(() => getSafePage(searchParams.get('testSuitesPage'), 1));
  const itemsPerPage = 10;

  // Fetch test suites filtered by agent_id (exclude audio-generated)
  const { data: testSuitesData, isLoading, refetch } = useTestSuites({
    agent_id: agentId,
    search: searchTerm,
    skip: (page - 1) * itemsPerPage,
    limit: itemsPerPage,
    exclude_audio: true,
  });

  const testSuites = useMemo(() => {
    return testSuitesData?.test_suites || testSuitesData || [];
  }, [testSuitesData]);

  const totalCount = testSuitesData?.total || testSuites.length;

  const updateParams = useCallback((updates, replace = false) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      return next;
    }, { replace });
  }, [setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    updateParams({ testSuitesPage: String(newPage) });
  }, [updateParams]);

  const handleRowClick = (testSuite) => {
    // Navigate to simulations page filtered by this test suite
    navigate(`/simulations?view=simulations&agent=${agentId}&testSuite=${testSuite.test_suite_id}&testSuiteName=${encodeURIComponent(testSuite.name || '')}`);
  };

  const handleRunSimulation = (e, testSuite) => {
    e.stopPropagation();
    setSelectedTestSuite(testSuite);
    setShowRunModal(true);
  };

  // Reset pagination when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search test suites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-panel border border-gray-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-teal-500 text-white"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                <th className="px-4 py-3">Test Suite Name</th>
                <th className="px-4 py-3 text-center">Test Cases</th>
                <th className="px-4 py-3 text-center">Created</th>
                {showRunSimulation && <th className="px-4 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={showRunSimulation ? "4" : "3"} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading test suites...
                    </div>
                  </td>
                </tr>
              ) : testSuites.length === 0 ? (
                <tr>
                  <td colSpan={showRunSimulation ? "4" : "3"} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                        <FileText className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium">No test suites found</p>
                      <p className="text-gray-500 text-sm">
                        {searchTerm ? 'Try adjusting your search' : 'Create a test suite to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                testSuites.map(suite => (
                  <tr
                    key={suite.test_suite_id}
                    className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group"
                    onClick={() => handleRowClick(suite)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-teal-500/5 rounded border border-teal-500/10 group-hover:border-teal-500/30 transition-colors">
                          <FileText className="w-4 h-4 text-teal-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold text-sm">
                            {suite.name || 'Untitled Test Suite'}
                          </span>
                          {suite.description && (
                            <span className="text-gray-500 text-xs mt-0.5">
                              {suite.description.substring(0, 60)}
                              {suite.description.length > 60 ? '...' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-semibold">
                        {suite.test_case_count || suite.test_cases?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 text-xs">
                      {suite.created_at ? new Date(suite.created_at).toLocaleDateString() : '-'}
                    </td>
                    {showRunSimulation && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => handleRunSimulation(e, suite)}
                            className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-3 py-1.5 rounded text-xs font-semibold hover:bg-teal-500/20 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Run Simulation
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {testSuites.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{(page - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium text-white">{Math.min(page * itemsPerPage, totalCount)}</span> of{' '}
            <span className="font-medium text-white">{totalCount}</span> test suites
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-dark-panel border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-dark-panel border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Run Simulation Modal */}
      {showRunModal && selectedTestSuite && (
        <RunSimulationModal
          isOpen={showRunModal}
          onClose={() => {
            setShowRunModal(false);
            setSelectedTestSuite(null);
          }}
          preSelectedTestSuiteId={selectedTestSuite.test_suite_id}
          preSelectedAgentId={agentId}
        />
      )}
    </div>
  );
};

export default TestSuitesListView;
