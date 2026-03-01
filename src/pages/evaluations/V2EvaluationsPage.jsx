import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Folder, ArrowLeft, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import SimulationAgentDirectoriesView from '../../components/SimulationAgentDirectoriesView';
import { useV2Folders, useV2Calls, useV2Evals } from '../../hooks/useV2Evaluations';
import { useAgents } from '../../hooks/useAgents';

const V2EvaluationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const agentId = searchParams.get('agentId') || '';
  const folderId = searchParams.get('folderId') || '';

  const { data: agentsData } = useAgents();
  const { data: foldersData, isLoading: foldersLoading } = useV2Folders(agentId);
  const { data: callsData, isLoading: callsLoading } = useV2Calls(folderId);
  const { data: evalsData, isLoading: evalsLoading } = useV2Evals(folderId);

  const agentName = useMemo(() => {
    if (!agentId || !agentsData?.agents) return agentId;
    const agent = agentsData.agents.find(
      (a) => a.agent_id === agentId || a.provider_agent_id === agentId || a.id === agentId
    );
    return agent?.name || agent?.agent_name || agentId;
  }, [agentId, agentsData]);

  const folderName = useMemo(() => {
    if (!folderId || !foldersData) return folderId;
    const folders = Array.isArray(foldersData) ? foldersData : foldersData?.folders || [];
    const folder = folders.find((f) => (f.id || f._id || f.folder_id) === folderId);
    return folder?.name || folder?.folder_name || folderId;
  }, [folderId, foldersData]);

  const folders = useMemo(() => {
    if (!foldersData) return [];
    return Array.isArray(foldersData) ? foldersData : foldersData?.folders || [];
  }, [foldersData]);

  const calls = useMemo(() => {
    if (!callsData) return [];
    return Array.isArray(callsData) ? callsData : callsData?.calls || [];
  }, [callsData]);

  const aggregate = useMemo(() => {
    if (!evalsData?.aggregate) return null;
    return evalsData.aggregate;
  }, [evalsData]);

  const handleAgentSelect = (id) => {
    setSearchParams({ agentId: id });
  };

  const handleFolderSelect = (id) => {
    setSearchParams({ agentId, folderId: id });
  };

  const handleBackToAgents = () => {
    setSearchParams({});
  };

  const handleBackToFolders = () => {
    setSearchParams({ agentId });
  };

  const handleCallClick = (call) => {
    const callId = call.call_id || call.id || call._id;
    navigate(`/testing/evaluations/call/${callId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatScore = (score) => {
    if (score === undefined || score === null) return '--';
    const num = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(num)) return '--';
    const pct = num > 1 ? num : num * 100;
    return `${pct.toFixed(1)}%`;
  };

  const formatRate = (rate) => {
    if (rate === undefined || rate === null) return '--';
    const num = typeof rate === 'number' ? rate : parseFloat(rate);
    if (isNaN(num)) return '--';
    const pct = num > 1 ? num : num * 100;
    return `${pct.toFixed(0)}%`;
  };

  // Breadcrumb
  const renderBreadcrumb = () => (
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
      <button
        onClick={handleBackToAgents}
        className="hover:text-teal-400 transition-colors"
      >
        All Agents
      </button>
      {agentId && (
        <>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={handleBackToFolders}
            className={`transition-colors ${folderId ? 'hover:text-teal-400' : 'text-white font-medium'}`}
          >
            {agentName}
          </button>
        </>
      )}
      {folderId && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white font-medium">{folderName}</span>
        </>
      )}
    </div>
  );

  // Level 3: Calls table for a folder
  if (agentId && folderId) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen text-white">
        {renderBreadcrumb()}

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBackToFolders}
            className="p-2 hover:bg-dark-panel rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{folderName}</h1>
            <p className="text-gray-400 text-sm">Evaluation results for calls in this folder</p>
          </div>
        </div>

        {/* Aggregate Stats */}
        {aggregate && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-dark-panel rounded-xl p-4 border border-gray-800/50">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Evaluated</p>
              <p className="text-2xl font-bold text-white">{aggregate.total_evaluated ?? '--'}</p>
            </div>
            <div className="bg-dark-panel rounded-xl p-4 border border-gray-800/50">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Avg Score</p>
              <p className="text-2xl font-bold text-teal-400">{formatScore(aggregate.avg_score)}</p>
            </div>
            <div className="bg-dark-panel rounded-xl p-4 border border-gray-800/50">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Pass Rate</p>
              <p className="text-2xl font-bold text-green-400">{formatRate(aggregate.pass_rate)}</p>
            </div>
            <div className="bg-dark-panel rounded-xl p-4 border border-gray-800/50">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Passed</p>
              <p className="text-2xl font-bold text-white">{aggregate.passed_count ?? '--'} / {aggregate.total_evaluated ?? '--'}</p>
            </div>
          </div>
        )}

        {/* Calls Table */}
        <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Call ID</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-300">
                {callsLoading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Loading calls...
                      </div>
                    </td>
                  </tr>
                ) : calls.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <BarChart3 className="w-8 h-8 text-gray-500" />
                        <p className="text-gray-400 text-lg font-medium">No calls found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  calls.map((call, index) => {
                    const score = call.overall_score ?? call.eval?.overall_score ?? call.evaluation?.overall_score;
                    const passed = call.passed ?? call.eval?.passed ?? call.evaluation?.passed;
                    const duration = call.duration ?? call.recording?.duration;
                    const createdAt = call.created_at || call.timestamp;
                    const callId = call.call_id || call.id || call._id;

                    return (
                      <tr
                        key={callId}
                        className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer"
                        onClick={() => handleCallClick(call)}
                      >
                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-300">
                            {callId ? `${String(callId).substring(0, 12)}...` : '--'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(createdAt)}</td>
                        <td className="px-4 py-3 text-gray-400">{formatDuration(duration)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${score !== undefined && score !== null ? 'text-teal-400' : 'text-gray-500'}`}>
                            {formatScore(score)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {passed === true ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
                              <CheckCircle className="w-3 h-3" /> Pass
                            </span>
                          ) : passed === false ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                              <XCircle className="w-3 h-3" /> Fail
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Level 2: Folders table for an agent
  if (agentId) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen text-white">
        {renderBreadcrumb()}

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBackToAgents}
            className="p-2 hover:bg-dark-panel rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{agentName}</h1>
            <p className="text-gray-400 text-sm">Simulations</p>
          </div>
        </div>

        <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                  <th className="px-4 py-3">Simulation</th>
                  <th className="px-4 py-3 text-center">Calls</th>
                  <th className="px-4 py-3 text-center">Avg Score</th>
                  <th className="px-4 py-3 text-center">Pass Rate</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-300">
                {foldersLoading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Loading folders...
                      </div>
                    </td>
                  </tr>
                ) : folders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Folder className="w-8 h-8 text-gray-500" />
                        <p className="text-gray-400 text-lg font-medium">No simulations found</p>
                        <p className="text-gray-500 text-sm">Run a simulation to see results here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  folders.map((folder) => {
                    const id = folder.id || folder._id || folder.folder_id;
                    const name = folder.name || folder.folder_name || id;
                    return (
                      <tr
                        key={id}
                        className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group"
                        onClick={() => handleFolderSelect(id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-teal-500/5 rounded border border-teal-500/10 group-hover:border-teal-500/30 transition-colors">
                              <Folder className="w-4 h-4 text-teal-400" />
                            </div>
                            <span className="text-white font-medium">{name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-400 text-xs font-semibold">
                            {folder.call_count ?? '--'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-teal-400 font-semibold">
                          {formatScore(folder.avg_score)}
                        </td>
                        <td className="px-4 py-3 text-center text-green-400 font-semibold">
                          {formatRate(folder.pass_rate)}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {formatDate(folder.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Level 1: Agent selection
  return (
    <div className="p-8 bg-dark-bg min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Evaluations</h1>
        <p className="text-gray-400 text-sm mt-1">Select an agent to view evaluation results</p>
      </div>
      <SimulationAgentDirectoriesView
        showAllAgents={true}
        onAgentSelect={handleAgentSelect}
      />
    </div>
  );
};

export default V2EvaluationsPage;
