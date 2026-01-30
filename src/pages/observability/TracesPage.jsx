import React, { useState } from 'react';
import { 
  PhoneIcon,
  ArrowPathIcon,
  PlayCircleIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';
import { useTraces, useEvaluateTrace, useEvaluateBatch, useSyncTraces, useSyncStatus } from '../../hooks/useObservability';
import TraceCard from './components/TraceCard';
import FilterBar from './components/FilterBar';

const TracesPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    search: '',
    agentId: '',
    sessionId: '',
    timeRange: '7d',
  });

  const [selectedTraces, setSelectedTraces] = useState([]);

  // Hooks
  const { data, isLoading, refetch } = useTraces(filters);
  const evaluateTraceMutation = useEvaluateTrace();
  const evaluateBatchMutation = useEvaluateBatch();
  const syncMutation = useSyncTraces();
  const { data: syncStatus } = useSyncStatus();

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      status: '',
      search: '',
      agentId: '',
      sessionId: '',
      timeRange: '7d',
    });
  };

  const handleSync = () => {
    syncMutation.mutate(false);
  };

  const handleEvaluateTrace = (traceId) => {
    evaluateTraceMutation.mutate({ traceId, options: {} });
  };

  const handleEvaluateBatch = () => {
    if (selectedTraces.length === 0) {
      return;
    }
    evaluateBatchMutation.mutate({ traceIds: selectedTraces, options: {} });
    setSelectedTraces([]);
  };

  const handleTraceSelect = (traceId) => {
    setSelectedTraces(prev => 
      prev.includes(traceId) 
        ? prev.filter(id => id !== traceId)
        : [...prev, traceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTraces.length === data?.traces?.length) {
      setSelectedTraces([]);
    } else {
      setSelectedTraces(data?.traces?.map(t => t.trace_id) || []);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Traces</h1>
            <p className="text-gray-400 mt-1">
              View and evaluate production voice agent traces
            </p>
            {syncStatus?.last_sync_time && (
              <p className="text-xs text-gray-500 mt-1">
                Last synced: {new Date(syncStatus.last_sync_time).toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {selectedTraces.length > 0 && (
              <button
                onClick={handleEvaluateBatch}
                disabled={evaluateBatchMutation.isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayCircleIcon className="w-5 h-5" />
                Evaluate Selected ({selectedTraces.length})
              </button>
            )}
            <button
              onClick={handleSync}
              disabled={syncMutation.isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sync traces from LangFuse"
            >
              <CloudArrowDownIcon className={`w-5 h-5 ${syncMutation.isLoading ? 'animate-bounce' : ''}`} />
              {syncMutation.isLoading ? 'Syncing...' : 'Sync from LangFuse'}
            </button>
            <button
              onClick={() => refetch()}
              className="p-2 bg-dark-800 border border-dark-700 text-white rounded-lg hover:bg-dark-700 transition-colors"
              title="Refresh traces list"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
        />
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing <span className="font-medium text-white">{data?.traces?.length || 0}</span> of{' '}
          <span className="font-medium text-white">{data?.total || 0}</span> traces
        </p>
        
        {data?.traces?.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
          >
            {selectedTraces.length === data?.traces?.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Traces List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : data?.traces?.length > 0 ? (
        <div className="space-y-4">
          {data.traces.map(trace => (
            <div key={trace.trace_id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedTraces.includes(trace.trace_id)}
                onChange={() => handleTraceSelect(trace.trace_id)}
                className="mt-6 w-4 h-4 text-primary-600 bg-dark-900 border-dark-700 rounded focus:ring-primary-500"
              />
              <div className="flex-1">
                <TraceCard 
                  trace={trace} 
                  onEvaluate={handleEvaluateTrace}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-12 text-center">
          <PhoneIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No traces found</h3>
          <p className="text-gray-400">
            {filters.search || filters.status || filters.agentId || filters.sessionId
              ? 'Try adjusting your filters'
              : 'Start ingesting traces from your production agents'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-dark-800 border border-dark-700 text-white rounded-lg hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(data.pages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    filters.page === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 border border-dark-700 text-gray-300 hover:bg-dark-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === data?.pages}
            className="px-4 py-2 bg-dark-800 border border-dark-700 text-white rounded-lg hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TracesPage;
