import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Folder,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Zap,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { ResponsivePie } from '@nivo/pie';
import SimulationAgentDirectoriesView from '../../components/SimulationAgentDirectoriesView';
import { useV2Folders, useV2Calls, useV2Evals } from '../../hooks/useV2Evaluations';
import { useAgents } from '../../hooks/useAgents';

/* ================= CONSTANTS ================= */
const TEAL_COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a', '#042f2e'];
const CALLS_PER_PAGE = 10;

const BOOLEAN_METRICS = {
  issue_resolved: { title: 'Issue Resolved', icon: CheckCircle },
  hallucination: { title: 'Hallucination', icon: AlertTriangle },
  gibberish: { title: 'Gibberish', icon: MessageSquare },
};

/* ================= KPI CARD COMPONENTS ================= */
const Card = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 ${className}`}>
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400 mb-6">
      {Icon && <Icon className="w-4 h-4" />}
      {title}
    </div>
    {children}
  </div>
);

const MetricCard = ({ title, icon, rate, count }) => (
  <Card title={title} icon={icon}>
    <div className="flex flex-col items-center py-6">
      <div className="text-5xl font-bold text-teal-400">
        {Math.round((rate ?? 0) * 100)}%
      </div>
      <div className="text-sm text-gray-500 mt-2">
        Detected in {count ?? 0} calls
      </div>
    </div>
  </Card>
);

/* ================= PAGINATION ================= */
const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange, itemName = 'items' }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const displayedCount = Math.min(totalItems, itemsPerPage);
  if (totalItems === 0) return null;

  return (
    <div className="mt-8 flex items-center justify-between">
      <p className="text-gray-500 text-sm">
        Showing {displayedCount} of {totalItems} {totalItems === 1 ? itemName.slice(0, -1) : itemName}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 bg-dark-panel border border-gray-800 rounded hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-4 py-2 text-sm text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 bg-dark-panel border border-gray-800 rounded hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
const RunsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [callsPage, setCallsPage] = useState(1);

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
    const folder = folders.find((f) => (f.folder_id || f.id || f._id) === folderId);
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

  const evals = useMemo(() => {
    if (!evalsData?.evals) return [];
    return evalsData.evals;
  }, [evalsData]);

  const aggregate = useMemo(() => {
    if (!evalsData?.aggregate) return null;
    return evalsData.aggregate;
  }, [evalsData]);

  // Build a map of call_id -> eval for quick lookup
  const evalsByCallId = useMemo(() => {
    const map = {};
    evals.forEach((ev) => {
      if (ev.call_id) map[ev.call_id] = ev;
    });
    return map;
  }, [evals]);

  // Compute aggregated KPIs from v2 evals data
  const kpis = useMemo(() => {
    if (evals.length === 0) return null;

    const totalEvals = evals.length;
    let hallucinationCount = 0;
    let issueResolvedCount = 0;
    let gibberishCount = 0;
    let totalLatency = 0;
    let latencyCount = 0;
    const abandonmentReasons = {};

    evals.forEach((ev) => {
      // Extract from kpi_results
      if (Array.isArray(ev.kpi_results)) {
        ev.kpi_results.forEach((kpi) => {
          const name = (kpi.kpi_name || kpi.name || '').toLowerCase();
          if (name === 'issue_resolved' && kpi.value === true) issueResolvedCount++;
          if (name === 'hallucination' && kpi.value === true) hallucinationCount++;
          if (name === 'gibberish' && kpi.value === true) gibberishCount++;
          if (name === 'abandonment_reason' && kpi.value) {
            const reason = String(kpi.value).toLowerCase();
            abandonmentReasons[reason] = (abandonmentReasons[reason] || 0) + 1;
          }
        });
      }

      // Extract latency from metric_results
      if (Array.isArray(ev.metric_results)) {
        const latencyMetric = ev.metric_results.find(
          (m) => m.metric_name === 'response_latency' || m.name === 'response_latency'
        );
        if (latencyMetric?.details?.average_ms) {
          totalLatency += latencyMetric.details.average_ms;
          latencyCount++;
        }
      }
    });

    return {
      issue_resolved: { rate: totalEvals > 0 ? issueResolvedCount / totalEvals : 0, count: issueResolvedCount },
      hallucination: { rate: totalEvals > 0 ? hallucinationCount / totalEvals : 0, count: hallucinationCount },
      gibberish: { rate: totalEvals > 0 ? gibberishCount / totalEvals : 0, count: gibberishCount },
      avg_latency: { value: latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0, count: latencyCount },
      abandonment_reason: { distribution: abandonmentReasons },
    };
  }, [evals]);

  // Handlers
  const handleAgentSelect = (id) => setSearchParams({ agentId: id });
  const handleFolderSelect = (id) => {
    setCallsPage(1);
    setSearchParams({ agentId, folderId: id });
  };
  const handleBackToAgents = () => setSearchParams({});
  const handleBackToFolders = () => setSearchParams({ agentId });
  const handleCallClick = (call) => {
    const callId = call.call_id || call.id || call._id;
    navigate(`/runs/call/${callId}`);
  };

  // Formatters
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
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
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
      <button onClick={handleBackToAgents} className="hover:text-teal-400 transition-colors">
        All Agents
      </button>
      {agentId && (
        <>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={handleBackToFolders}
            className={`transition-colors ${folderId ? 'hover:text-teal-400' : 'text-teal-400 font-semibold'}`}
          >
            {agentName}
          </button>
        </>
      )}
      {folderId && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-teal-400 font-semibold">{folderName}</span>
        </>
      )}
    </div>
  );

  // ==========================================
  // Level 3: Folder view — calls + KPIs
  // ==========================================
  if (agentId && folderId) {
    const startIdx = (callsPage - 1) * CALLS_PER_PAGE;
    const endIdx = startIdx + CALLS_PER_PAGE;
    const paginatedCalls = calls.slice(startIdx, endIdx);

    // Abandonment pie chart data
    const abandonmentData = kpis
      ? Object.entries(kpis.abandonment_reason?.distribution ?? {})
          .filter(([, v]) => v > 0)
          .map(([id, value]) => ({
            id,
            label: id.charAt(0).toUpperCase() + id.slice(1),
            value,
          }))
      : [];
    const totalAbandonment = abandonmentData.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="p-8 bg-dark-bg min-h-screen text-white">
        {/* Header — matches CallsPageHeader style */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{folderName}</h1>
          {renderBreadcrumb()}
        </div>

        {/* KPI Section — matches observability KPISection layout */}
        {(kpis || evalsLoading) && (
          <div className="space-y-6 mb-8">
            {evalsLoading ? (
              <div className="h-64 animate-pulse bg-gray-800/30 rounded-lg" />
            ) : kpis ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: Metric cards */}
                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
                  {Object.entries(BOOLEAN_METRICS).map(([key, cfg]) => (
                    <MetricCard
                      key={key}
                      {...cfg}
                      rate={kpis[key]?.rate}
                      count={kpis[key]?.count}
                    />
                  ))}

                  {/* Avg Latency */}
                  <Card title="Avg Latency" icon={Zap}>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-teal-400">
                        {kpis.avg_latency?.value || 0} ms
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Across {kpis.avg_latency?.count ?? 0} {kpis.avg_latency?.count === 1 ? 'call' : 'calls'}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right side: Abandonment Reason Pie Chart */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingDown className="w-5 h-5 text-teal-400" />
                    <h3 className="text-lg font-semibold text-gray-100">Abandonment Reason</h3>
                  </div>
                  {abandonmentData.length > 0 ? (
                    <>
                      <div className="h-64 relative">
                        <ResponsivePie
                          data={abandonmentData}
                          colors={TEAL_COLORS}
                          innerRadius={0.6}
                          padAngle={2}
                          cornerRadius={4}
                          activeOuterRadiusOffset={8}
                          borderWidth={0}
                          arcLabel={(d) => `${d.value}`}
                          arcLabelsTextColor="#ffffff"
                          arcLabelsSkipAngle={10}
                          enableArcLinkLabels={false}
                          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                          theme={{
                            labels: { text: { fontSize: 18, fontWeight: 700, fill: '#ffffff' } },
                            tooltip: {
                              container: {
                                background: '#1f2937', color: '#fff', fontSize: 13,
                                borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                border: '1px solid #374151', padding: '10px 14px',
                              },
                            },
                          }}
                          tooltip={({ datum }) => (
                            <div className="px-3 py-2">
                              <strong>{datum.label}</strong> · {datum.value} {datum.value === 1 ? 'call' : 'calls'}
                            </div>
                          )}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div className="text-3xl font-bold text-teal-400">{totalAbandonment}</div>
                          <div className="text-xs text-gray-400 mt-1">Total</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">Total Calls</div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-sm text-gray-500">
                      No abandonment data yet
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Aggregate stats bar */}
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

        {/* Calls Table — matches observability CallsTable layout */}
        <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Index</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Timestamp</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Avg Latency</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Total Score</th>
                </tr>
              </thead>
              <tbody>
                {callsLoading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Loading calls...
                      </div>
                    </td>
                  </tr>
                ) : calls.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <BarChart3 className="w-12 h-12 text-gray-600" />
                        <p className="text-gray-500">No calls found in this folder</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCalls.map((call, index) => {
                    const callId = call.call_id || call.id || call._id;
                    const evalDoc = evalsByCallId[callId];
                    const score = call.eval?.overall_score ?? evalDoc?.overall_score;
                    const duration = call.duration ?? call.recording?.duration;
                    const createdAt = call.created_at || call.timestamp;
                    const status = call.status;

                    // Extract latency from eval metric_results
                    let avgLatency = null;
                    if (evalDoc?.metric_results) {
                      const latencyMetric = evalDoc.metric_results.find(
                        (m) => m.metric_name === 'response_latency' || m.name === 'response_latency'
                      );
                      if (latencyMetric?.details?.average_ms) {
                        avgLatency = Math.round(latencyMetric.details.average_ms);
                      }
                    }

                    // Determine score display
                    const renderScore = () => {
                      const isProcessing = ['ongoing', 'transcribing', 'evaluating', 'running'].includes(status);
                      const isFailed = status?.includes('_failed') || status === 'failed';

                      if (isProcessing) {
                        const stageText = status === 'transcribing' ? 'Transcribing...'
                          : status === 'evaluating' ? 'Evaluating...'
                          : 'Processing...';
                        return (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                            {stageText}
                          </div>
                        );
                      }

                      if (isFailed) {
                        return (
                          <div className="flex items-center gap-2 text-sm text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            Failed
                          </div>
                        );
                      }

                      if (score !== undefined && score !== null) {
                        const pct = (score > 1 ? score : score * 100).toFixed(1);
                        return (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${parseFloat(pct) >= 80 ? 'bg-green-500' : parseFloat(pct) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="text-sm text-gray-300">{pct}</span>
                          </div>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-600" />
                          <span className="text-sm text-gray-500">--</span>
                        </div>
                      );
                    };

                    return (
                      <tr
                        key={callId}
                        onClick={() => handleCallClick(call)}
                        className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors group cursor-pointer"
                      >
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {calls.length - (startIdx + index)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {formatDate(createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {formatDuration(duration)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {avgLatency ? `${avgLatency}ms` : '--'}
                        </td>
                        <td className="px-4 py-3">
                          {renderScore()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {calls.length > 0 && (
          <Pagination
            currentPage={callsPage}
            totalItems={calls.length}
            itemsPerPage={CALLS_PER_PAGE}
            onPageChange={setCallsPage}
            itemName="calls"
          />
        )}
      </div>
    );
  }

  // ==========================================
  // Level 2: Folders table for an agent
  // ==========================================
  if (agentId) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{agentName}</h1>
          {renderBreadcrumb()}
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
                        <p className="text-gray-400 text-lg font-medium">No simulation runs found</p>
                        <p className="text-gray-500 text-sm">Run a simulation to see results here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  folders.map((folder) => {
                    const id = folder.folder_id || folder.id || folder._id;
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

  // ==========================================
  // Level 1: Agent selection
  // ==========================================
  return (
    <div className="p-8 bg-dark-bg min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Runs</h1>
        <p className="text-gray-400 text-sm mt-1">Select an agent to view simulation runs and evaluations</p>
      </div>
      <SimulationAgentDirectoriesView
        showAllAgents={true}
        onAgentSelect={handleAgentSelect}
      />
    </div>
  );
};

export default RunsPage;
