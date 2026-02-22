import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import RunSimulationModal from "../../components/RunSimulationModal";
import { useSimulations } from "../../hooks/useSimulations";
import Badge from "../../components/Badge";

const SimulationsPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showRunModal, setShowRunModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const navigate = useNavigate();

    // Fetch simulations
    const { data: simulationsData, isLoading } = useSimulations({
        search: searchQuery || undefined,
        status: statusFilter || undefined
    });

    // Filter out inbound_loopback and audio-based simulations
    const simulations = useMemo(() => {
        const allSims = simulationsData?.simulations || [];
        return allSims.filter(sim => {
            const isInbound = sim.call_mode === 'inbound_loopback';
            const isAudioBased = sim.simulation_id?.startsWith('sim_audio');
            return !isInbound && !isAudioBased;
        });
    }, [simulationsData]);
    
    const hasSimulations = simulations.length > 0;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const formatDuration = (ms) => {
        if (!ms) return '-';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    };

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'success';
            case 'running': return 'info';
            case 'failed': return 'danger';
            default: return 'default';
        }
    };

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Simulations</h1>
                        <p className="text-gray-400">Monitor and manage your test executions</p>
                    </div>
                    <button
                        onClick={() => setShowRunModal(true)}
                        className="px-6 py-3 bg-teal-400 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run New Simulation
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search simulations by ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 focus:outline-none focus:border-teal-400"
                        >
                            <option value="">All Status</option>
                            <option value="running">Running</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Simulations Table or Empty State */}
                {isLoading ? (
                    <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mb-4"></div>
                        <p className="text-gray-400">Loading simulations...</p>
                    </div>
                ) : !hasSimulations ? (
                    <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-teal-400/20 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No simulations found</h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                {searchQuery || statusFilter ? 'Try adjusting your filters' : 'Run your first simulation to start evaluating your voice agent'}
                            </p>
                            <button
                                onClick={() => setShowRunModal(true)}
                                className="px-6 py-3 bg-teal-400 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors"
                            >
                                Run Your First Simulation
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800/50 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-800/50 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Simulation ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Test Suite</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Progress</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Started</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {simulations.map((sim) => (
                                    <tr
                                        key={sim.simulation_id}
                                        onClick={() => navigate(`/simulation/runs/${sim.simulation_id}`)}
                                        className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <code className="text-xs text-teal-400 bg-gray-800 px-2 py-1 rounded">
                                                {sim.simulation_id.substring(0, 16)}...
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {sim.metadata?.test_suite_name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusVariant(sim.status)}>
                                                {sim.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {sim.progress?.completed || 0}/{sim.progress?.total_sessions || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            {(sim.metrics?.overall_score !== null && sim.metrics?.overall_score !== undefined) ? (
                                                <span className={`text-sm font-semibold ${(sim.metrics.overall_score * 100) >= 90 ? 'text-green-400' :
                                                    (sim.metrics.overall_score * 100) >= 70 ? 'text-yellow-400' :
                                                        'text-red-400'
                                                    }`}>
                                                    {(sim.metrics.overall_score * 100).toFixed(1)}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {formatDate(sim.timestamps?.started_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {formatDuration(sim.metrics?.total_duration_ms)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Run Simulation Modal */}
            <RunSimulationModal
                isOpen={showRunModal}
                onClose={() => setShowRunModal(false)}
            />
        </div>
    );
};

export default SimulationsPage;
