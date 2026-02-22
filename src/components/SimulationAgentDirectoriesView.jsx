import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Folder, Search } from 'lucide-react';
import { useOutboundAgents } from '../hooks/useSimulations';

/**
 * SimulationAgentDirectoriesView - Shows agent directories for outbound simulations
 * Uses the /simulation/outbound-agents endpoint
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
  const { data: outboundAgentsData, isLoading: isAgentsLoading } = useOutboundAgents();

  // Process agents from outbound agents endpoint
  const filteredAgents = useMemo(() => {
    if (outboundAgentsData?.agents && Array.isArray(outboundAgentsData.agents)) {
      return outboundAgentsData.agents
        .map(agent => ({
          id: agent.id,
          name: agent.name,
          count: agent.folder_count
        }));
    }
    return [];
  }, [outboundAgentsData]);

  // Display agents with search
  const displayedAgents = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    return filteredAgents.filter(agent => {
      const name = agent.name || agent.id;
      return name.toLowerCase().includes(searchLower) ||
             agent.id.toLowerCase().includes(searchLower);
    });
  }, [filteredAgents, searchTerm]);

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
                <th className="px-4 py-3 text-center">Simulation Runs</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {isAgentsLoading ? (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading agents...
                    </div>
                  </td>
                </tr>
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                        <Folder className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium">No agents with simulation runs found</p>
                      <p className="text-gray-500 text-sm">Run an outbound simulation to see agents here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAgents.map(agent => (
                  <tr
                    key={agent.id}
                    className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group"
                    onClick={() => handleDirectoryClick(agent.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-teal-500/5 rounded border border-teal-500/10 group-hover:border-teal-500/30 transition-colors">
                          <Folder className="w-4 h-4 text-teal-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold text-sm">
                            {agent.name}
                          </span>
                          <span className="text-gray-500 text-xs font-mono">{agent.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-400 text-xs font-semibold">
                        {agent.count}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredAgents.length > 0 && totalPages > 1 && (
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
