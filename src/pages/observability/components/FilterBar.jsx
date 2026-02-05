import React from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const FilterBar = ({ filters, onFiltersChange, onClear }) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'passed', label: 'Passed' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
  ];

  const timeRangeOptions = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const hasActiveFilters = filters.status || filters.search || filters.agentId || filters.sessionId;

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Trace ID or Session ID..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value, page: 1 })}
          className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value, page: 1 })}
            className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Agent ID Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Agent ID
          </label>
          <input
            type="text"
            placeholder="Filter by agent..."
            value={filters.agentId || ''}
            onChange={(e) => onFiltersChange({ ...filters, agentId: e.target.value, page: 1 })}
            className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Session ID Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Session ID
          </label>
          <input
            type="text"
            placeholder="Filter by session..."
            value={filters.sessionId || ''}
            onChange={(e) => onFiltersChange({ ...filters, sessionId: e.target.value, page: 1 })}
            className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Time Range Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Time Range
          </label>
          <select
            value={filters.timeRange || '7d'}
            onChange={(e) => onFiltersChange({ ...filters, timeRange: e.target.value, page: 1 })}
            className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Range (if selected) */}
      {filters.timeRange === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={filters.startDate || ''}
              onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              End Date
            </label>
            <input
              type="datetime-local"
              value={filters.endDate || ''}
              onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}

      {/* Active Filters & Clear Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-dark-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FunnelIcon className="w-4 h-4" />
            <span>Active filters applied</span>
          </div>
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-300 hover:text-white bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
