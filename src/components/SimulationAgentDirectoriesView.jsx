import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Folder, ChevronRight, Play, Plus, Search } from 'lucide-react';
import { useSimulationCategories } from '../hooks/useSimulations';
import { useAgents } from '../hooks/useAgents';

/**
 * SimulationAgentDirectoriesView - Shows agent directories for simulations
 * Uses the /simulation/categories endpoint
 */
const SimulationAgentDirectoriesView = ({ 
  onAgentSelect,
  showHeader = true,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');

  const getSafePage = useCallback((value, fallback = 1) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }, []);

  const [agentsPage, setAgentsPage] = useState(() => getSafePage(searchParams.get('agentsPage'), 1));
  const agentsPerPage = 10;

  // Fetch data
  const { data: categoriesData, isLoading: isCategoriesLoading } = useSimulationCategories();
  const { data: agentsData } = useAgents();

  // Process categories from simulation categories endpoint
  const filteredCategories = useMemo(() => {
    if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
      return categoriesData.categories
        .filter(cat => cat.has_agent !== false && cat.simulation_count > 0)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          platform: cat.platform,
          count: cat.simulation_count
        }));
    }
    return [];
  }, [categoriesData]);

  // Display agents with search
  const displayedAgents = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    return filteredCategories.filter(cat => {
      const name = cat.name || cat.id;
      return name.toLowerCase().includes(searchLower) || 
             cat.id.toLowerCase().includes(searchLower);
    });
  }, [filteredCategories, searchTerm]);

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

  const handleAgentsPageChange = useCallback((page) => {
    setAgentsPage(page);
    updateParams({ agentsPage: String(page) });
  }, [updateParams]);

  // Event handlers
  const handleDirectoryClick = (agentId) => {
    if (onAgentSelect) {
      onAgentSelect(agentId);
    }
  };

  // Reset pagination when search changes
  useEffect(() => {
    setAgentsPage(1);
  }, [searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(displayedAgents.length / agentsPerPage);
  const startIdx = (agentsPage - 1) * agentsPerPage;
  const endIdx = startIdx + agentsPerPage;
  const paginatedAgents = displayedAgents.slice(startIdx, endIdx);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {showHeader && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-panel border border-gray-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-teal-500 text-white"
            />
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                <th className="px-4 py-3">Agent Name</th>
                <th className="px-4 py-3 text-center">Simulations</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {isCategoriesLoading ? (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading agents...
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                        <Folder className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium">No agents with simulations found</p>
                      <p className="text-gray-500 text-sm">Create a simulation to see agents here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAgents.map(cat => (
                  <tr
                    key={cat.id}
                    className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group"
                    onClick={() => handleDirectoryClick(cat.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-teal-500/5 rounded border border-teal-500/10 group-hover:border-teal-500/30 transition-colors">
                          <Folder className="w-4 h-4 text-teal-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold text-sm">
                            {cat.name}
                          </span>
                          <span className="text-gray-500 text-xs font-mono">{cat.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-400 text-xs font-semibold">
                        {cat.count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectoryClick(cat.id);
                          }}
                          className="flex items-center gap-1.5 text-gray-400 hover:text-teal-400 transition-colors px-2 py-1.5"
                        >
                          <span className="text-xs font-medium">View Sessions</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredCategories.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{startIdx + 1}</span> to{' '}
            <span className="font-medium text-white">{Math.min(endIdx, displayedAgents.length)}</span> of{' '}
            <span className="font-medium text-white">{displayedAgents.length}</span> agents
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleAgentsPageChange(agentsPage - 1)}
              disabled={agentsPage === 1}
              className="px-4 py-2 bg-dark-panel border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => handleAgentsPageChange(agentsPage + 1)}
              disabled={agentsPage >= totalPages}
              className="px-4 py-2 bg-dark-panel border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationAgentDirectoriesView;
