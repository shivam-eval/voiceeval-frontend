import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, StopCircle, RefreshCw, Download, Trash2, Search, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSimulations, useDeleteSimulation, useRerunSimulation, useCancelSimulation } from '../../hooks/useSimulations';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import RunSimulationModal from '../../components/RunSimulationModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import GenericDropdown from '../../components/DropDown';

const SimulationsListPage = () => {
    const navigate = useNavigate();
    const [selectedSimulations, setSelectedSimulations] = useState([]);
    const [showRunModal, setShowRunModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger',
        confirmText: 'Confirm'
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        skip: 0,
        limit: 20
    });

    // Fetch simulations with filters
    const { data, isLoading, error, refetch } = useSimulations(filters);
    const deleteSimulation = useDeleteSimulation();
    const rerunSimulation = useRerunSimulation();
    const cancelSimulation = useCancelSimulation();

    // Handlers
    const handleSearch = (e) => {
        setFilters({ ...filters, search: e.target.value, skip: 0 });
    };

    const handleStatusFilter = (status) => {
        setFilters({ ...filters, status, skip: 0 });
    };

    const handlePageChange = (newSkip) => {
        setFilters({ ...filters, skip: newSkip });
    };

    const handleRowClick = (simulationId) => {
        navigate(`/simulation/runs/${simulationId}`);
    };

    const handleDelete = async (e, simulationId) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: 'Delete Simulation',
            message: 'Are you sure you want to delete this simulation? This action cannot be undone.',
            confirmText: 'Delete',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await deleteSimulation.mutateAsync(simulationId);
                    toast.success('Simulation deleted successfully');
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    // Error handled by global interceptor
                }
            }
        });
    };

    const handleRerun = async (e, simulationId) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: 'Rerun Simulation',
            message: 'This will create a new simulation with the same parameters. Continue?',
            confirmText: 'Rerun',
            variant: 'teal',
            onConfirm: async () => {
                try {
                    const result = await rerunSimulation.mutateAsync(simulationId);
                    toast.success(`Simulation rerun initiated!`);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    navigate(`/simulation/runs/${result.new_simulation_id}`);
                } catch (error) {
                    // Error handled by global interceptor
                }
            }
        });
    };

    const handleCancel = async (e, simulationId) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: 'Cancel Simulation',
            message: 'Are you sure you want to cancel this running simulation?',
            confirmText: 'Cancel Simulation',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await cancelSimulation.mutateAsync(simulationId);
                    toast.success('Simulation cancelled successfully');
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    // Error handled by global interceptor
                }
            }
        });
    };

    const getStatusBadgeVariant = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'running':
                return 'info';
            case 'failed':
                return 'danger';
            case 'queued':
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return '-';
        // Check for epoch (1970) or very old dates which usually indicate default/missing values
        if (date.getFullYear() <= 1970) return '-';
        
        return date.toLocaleString();
    };

    const formatDuration = (ms) => {
        if (!ms) return '-';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const truncateId = (id) => {
        if (!id) return '';
        return id.length > 12 ? `${id.substring(0, 12)}...` : id;
    };

    // Filter out inbound sessions from the general sessions list so inbound runs
    // are only visible on the Inbound page.
    const filteredSimulations = (data?.simulations || []).filter((sim) => {
        const callMode = (sim.call_mode || sim.metadata?.call_mode || '').toString().toLowerCase();
        return !callMode.includes('inbound');
    });
    const filteredTotal = filteredSimulations.length;

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <h3 className="text-red-400 font-semibold mb-2">Error loading simulations</h3>
                    <p className="text-gray-400">{error.message}</p>
                    <Button onClick={() => refetch()} className="mt-4">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-dark-bg min-h-screen text-white">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Sessions</h1>
                        <p className="text-gray-400">View and manage all simulation sessions</p>
                    </div>
                    <button
                        onClick={() => setShowRunModal(true)}
                        className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                    >
                        <Play className="w-5 h-5" />
                        Create New Session
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Search sessions..."
                                value={filters.search}
                                onChange={handleSearch}
                                className="w-full bg-dark-panel border border-gray-800 rounded-lg py-3 px-5 text-base focus:outline-none focus:border-teal-500 transition-colors text-white placeholder-gray-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 w-56">
                            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Status:</span>
                            <GenericDropdown
                                options={[
                                    { label: "All Statuses", value: "" },
                                    { label: "Running", value: "running" },
                                    { label: "Completed", value: "completed" },
                                    { label: "Failed", value: "failed" },
                                    { label: "Queued", value: "queued" }
                                ]}
                                value={filters.status || ""}
                                onChange={(val) => handleStatusFilter(val)}
                                className="flex-1"
                            />
                        </div>

                        <button className="bg-dark-panel border border-gray-800 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors shadow-lg">
                            Search
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                Loading sessions...
                            </div>
                        </div>
                    ) : !data || filteredSimulations.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                                    <Play className="w-8 h-8 text-gray-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-400 text-lg font-medium">No sessions found</p>
                                    <p className="text-gray-500 text-sm">Run your first simulation to see results here</p>
                                </div>
                                <button
                                    onClick={() => setShowRunModal(true)}
                                    className="mt-2 flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors"
                                >
                                    <Play className="w-5 h-5" />
                                    Create Your First Session
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                                        <th className="px-4 py-3">Simulation ID</th>
                                        <th className="px-4 py-3">Test Suite</th>
                                        <th className="px-4 py-3">Started</th>
                                        <th className="px-4 py-3">Duration</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Progress</th>
                                        <th className="px-4 py-3 text-center">Success Rate</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-300">
                                    {filteredSimulations.map((sim) => (
                                        <tr
                                            key={sim.simulation_id}
                                            onClick={() => handleRowClick(sim.simulation_id)}
                                            className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-4 py-3">
                                                <code className="text-xs text-teal-400 bg-teal-500/5 px-2 py-1 rounded border border-teal-500/10 group-hover:border-teal-500/30 transition-colors">
                                                    {truncateId(sim.simulation_id)}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-semibold text-sm">
                                                        {sim.metadata?.test_suite_name || sim.metadata?.flow_tree_name || sim.test_suite_id}
                                                    </span>
                                                    {sim.metadata?.agent_name && (
                                                        <span className="text-gray-500 text-xs mt-0.5">
                                                            Agent: {sim.metadata.agent_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400">
                                                {formatDateTime(sim.timestamps?.started_at || sim.timestamps?.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-400">
                                                {formatDuration(sim.metrics?.total_duration_ms)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={getStatusBadgeVariant(sim.status)}>
                                                    <span className="flex items-center gap-1.5">
                                                        {sim.status === 'running' && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                                        )}
                                                        {sim.status}
                                                    </span>
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                                                        <span>{Math.round(sim.progress?.percentage || 0)}%</span>
                                                        <span>{sim.progress?.completed || 0}/{sim.progress?.total_sessions || 0}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-800/50 rounded-full h-1.5 overflow-hidden border border-gray-700/30">
                                                        <div
                                                            className="bg-teal-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]"
                                                            style={{ width: `${sim.progress?.percentage || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {sim.progress?.total_sessions > 0 ? (
                                                    (() => {
                                                        const percentage = (sim.progress.completed / sim.progress.total_sessions);
                                                        return (
                                                            <span className={`font-bold ${percentage >= 0.9 ? 'text-green-400' :
                                                                percentage >= 0.7 ? 'text-yellow-400' :
                                                                    'text-red-400'
                                                                }`}>
                                                                {Math.round(percentage * 100)}%
                                                            </span>
                                                        );
                                                    })()
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRowClick(sim.simulation_id);
                                                        }}
                                                        className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-teal-400 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {sim.status === 'running' ? (
                                                        <button
                                                            onClick={(e) => handleCancel(e, sim.simulation_id)}
                                                            className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                                                            title="Cancel Simulation"
                                                        >
                                                            <StopCircle className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={(e) => handleRerun(e, sim.simulation_id)}
                                                                className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-purple-400 transition-colors"
                                                                title="Rerun Simulation"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(e, sim.simulation_id)}
                                                                className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                                                                title="Delete Simulation"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                            {/* Pagination */}
                            {filteredTotal > filters.limit && (
                                <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-800 flex items-center justify-between">
                                    <div className="text-sm text-gray-400">
                                        Showing {filters.skip + 1} to {Math.min(filters.skip + filters.limit, filteredTotal)} of {filteredTotal} sessions
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handlePageChange(Math.max(0, filters.skip - filters.limit))}
                                            disabled={filters.skip === 0}
                                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            onClick={() => handlePageChange(filters.skip + filters.limit)}
                                            disabled={filters.skip + filters.limit >= data.total}
                                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <RunSimulationModal
                isOpen={showRunModal}
                onClose={() => setShowRunModal(false)}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
                isLoading={deleteSimulation.isLoading || rerunSimulation.isLoading || cancelSimulation.isLoading}
            />
        </div>
    );
};

export default SimulationsListPage;
