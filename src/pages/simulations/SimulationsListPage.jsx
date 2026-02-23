import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Eye, StopCircle, RefreshCw, Download, Trash2, Search, ChevronDown, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSimulations, useDeleteSimulation, useRerunSimulation, useCancelSimulation } from '../../hooks/useSimulations';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import RunSimulationModal from '../../components/RunSimulationModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import GenericDropdown from '../../components/DropDown';
import SimulationAgentDirectoriesView from '../../components/SimulationAgentDirectoriesView';
import TestSuitesListView from '../../components/TestSuitesListView';

const SimulationsListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // View state - either 'agents', 'test-suites', or 'simulations'
    const viewMode = searchParams.get('view') || 'agents';
    const selectedAgent = searchParams.get('agent') || '';
    const selectedTestSuite = searchParams.get('testSuite') || '';
    const testSuiteName = searchParams.get('testSuiteName') || '';
    
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
        limit: 20,
        agentId: selectedAgent || undefined,
        testSuiteId: selectedTestSuite || undefined
    });

    // Update URL params
    const updateParams = (updates) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            Object.entries(updates).forEach(([key, value]) => {
                if (value) next.set(key, value);
                else next.delete(key);
            });
            return next;
        });
    };

    // Handle agent selection
    const handleAgentSelect = (agentId) => {
        updateParams({ view: 'simulations', agent: agentId, testSuite: '', testSuiteName: '' });
        setFilters({ ...filters, agentId, testSuiteId: undefined, skip: 0 });
    };

    // Handle back to agents
    const handleBackToAgents = () => {
        updateParams({ view: 'agents', agent: '', testSuite: '', testSuiteName: '' });
        setFilters({ ...filters, agentId: undefined, testSuiteId: undefined, search: '', status: '', skip: 0 });
    };

    // Handle back to test suites
    const handleBackToTestSuites = () => {
        updateParams({ testSuite: '', testSuiteName: '' });
        setFilters({ ...filters, testSuiteId: undefined, search: '', skip: 0 });
    };

    // Sync filters when URL params change
    useEffect(() => {
        if (viewMode === 'simulations') {
            setFilters(prev => ({ 
                ...prev, 
                agentId: selectedAgent || undefined,
                testSuiteId: selectedTestSuite || undefined 
            }));
        }
    }, [selectedAgent, selectedTestSuite, viewMode]);

    // Fetch simulations with filters (only when in simulations view with test suite selected)
    const { data, isLoading, error, refetch } = useSimulations(filters, {
        enabled: viewMode === 'simulations' && !!selectedTestSuite,
    });
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

    // Show agents view if no agent is selected
    if (viewMode === 'agents') {
        return (
            <div className="p-8 bg-dark-bg min-h-screen text-white">
                <div className="w-full max-w-screen-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Outbound Sessions - Select Agent
                        </h1>
                        <p className="text-gray-400">
                            Choose an agent to view test cases and run simulations
                        </p>
                    </div>
                    
                    <SimulationAgentDirectoriesView 
                        onAgentSelect={handleAgentSelect}
                        showHeader={true}
                    />
                </div>
            </div>
        );
    }

    // Show test suites view for selected agent (when no test suite selected)
    if (viewMode === 'simulations' && selectedAgent && !selectedTestSuite) {
        return (
            <div className="p-8 bg-dark-bg min-h-screen text-white">
                <div className="w-full max-w-screen-2xl mx-auto">
                    {/* Back button */}
                    <button
                        onClick={handleBackToAgents}
                        className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors mb-4"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Agents</span>
                    </button>
                    
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Test Cases</h1>
                        <p className="text-gray-400">Select a test case to view simulations or run a new one</p>
                    </div>

                    <TestSuitesListView 
                        agentId={selectedAgent}
                        showRunSimulation={true}
                    />
                </div>
            </div>
        );
    }

    // Show simulations list for selected test suite
    if (viewMode === 'simulations' && selectedAgent && selectedTestSuite) {
        return (
            <div className="p-8 bg-dark-bg min-h-screen text-white">
                <div className="w-full max-w-screen-2xl mx-auto">
                    {/* Breadcrumb navigation */}
                    <div className="flex items-center gap-2 text-sm mb-6">
                        <button
                            onClick={handleBackToAgents}
                            className="text-gray-400 hover:text-teal-400 transition-colors"
                        >
                            Agents
                        </button>
                        <span className="text-gray-600">/</span>
                        <button
                            onClick={handleBackToTestSuites}
                            className="text-gray-400 hover:text-teal-400 transition-colors"
                        >
                            Test Cases
                        </button>
                        <span className="text-gray-600">/</span>
                        <span className="text-teal-400">{testSuiteName || 'Simulations'}</span>
                    </div>

                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                {testSuiteName || 'Test Case'} Simulations
                            </h1>
                            <p className="text-gray-400">View and manage simulation runs for this test case</p>
                        </div>
                        <button
                            onClick={() => setShowRunModal(true)}
                            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            <Play className="w-5 h-5" />
                            Run New Simulation
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search simulations..."
                                value={filters.search}
                                onChange={handleSearch}
                                className="w-full pl-12 pr-4 py-3 bg-dark-panel border border-gray-800 rounded-lg focus:outline-none focus:border-teal-500 transition-colors text-white"
                            />
                        </div>
                        <div className="w-56">
                            <GenericDropdown
                                options={[
                                    { label: "All Statuses", value: "" },
                                    { label: "Running", value: "running" },
                                    { label: "Completed", value: "completed" },
                                    { label: "Failed", value: "failed" },
                                    { label: "Cancelled", value: "cancelled" },
                                ]}
                                value={filters.status}
                                onChange={handleStatusFilter}
                                placeholder="Filter by status"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Simulations Table */}
                    {isLoading ? (
                        <div className="bg-dark-panel rounded-xl p-12 text-center border border-gray-800">
                            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading simulations...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                            <h3 className="text-red-400 font-semibold mb-2">Error loading simulations</h3>
                            <p className="text-gray-400">{error.message}</p>
                            <Button onClick={() => refetch()} className="mt-4">
                                Retry
                            </Button>
                        </div>
                    ) : filteredSimulations.length === 0 ? (
                        <div className="bg-dark-panel rounded-xl p-12 text-center border border-gray-800">
                            <Play className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400 mb-4">
                                {filters.search ? `No simulations found matching "${filters.search}"` : 'No simulations yet for this test case'}
                            </p>
                            <button
                                onClick={() => setShowRunModal(true)}
                                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Run First Simulation
                            </button>
                        </div>
                    ) : (
                        <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-900/50 border-b border-gray-800">
                                        <tr>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-400 uppercase">Simulation ID</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-400 uppercase">Status</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-400 uppercase">Started</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-400 uppercase">Duration</th>
                                            <th className="text-right p-4 text-sm font-semibold text-gray-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSimulations.map((sim) => (
                                            <tr
                                                key={sim.simulation_id}
                                                onClick={() => handleRowClick(sim.simulation_id)}
                                                className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
                                            >
                                                <td className="p-4">
                                                    <code className="text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded">
                                                        {sim.simulation_id?.slice(0, 12)}...
                                                    </code>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={
                                                        sim.status === 'completed' ? 'success' :
                                                        sim.status === 'running' ? 'info' :
                                                        sim.status === 'failed' ? 'danger' : 'warning'
                                                    }>
                                                        {sim.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-gray-300 text-sm">
                                                    {sim.timestamps?.started_at ? new Date(sim.timestamps.started_at).toLocaleString() : '-'}
                                                </td>
                                                <td className="p-4 text-gray-300 text-sm">
                                                    {sim.metrics?.total_duration_ms ? `${(sim.metrics.total_duration_ms / 1000).toFixed(1)}s` : '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => handleRerun(e, sim.simulation_id)}
                                                            className="p-2 text-gray-400 hover:text-teal-400 hover:bg-gray-800 rounded transition-colors"
                                                            title="Rerun"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                        {sim.status === 'running' && (
                                                            <button
                                                                onClick={(e) => handleCancel(e, sim.simulation_id)}
                                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <StopCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(e, sim.simulation_id)}
                                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {filteredTotal > filters.limit && (
                                <div className="flex items-center justify-between p-4 bg-gray-900/30 border-t border-gray-800">
                                    <p className="text-sm text-gray-400">
                                        Showing {filters.skip + 1} to {Math.min(filters.skip + filters.limit, filteredTotal)} of {filteredTotal} simulations
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(Math.max(0, filters.skip - filters.limit))}
                                            disabled={filters.skip === 0}
                                            className="px-4 py-2 bg-dark-panel border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(filters.skip + filters.limit)}
                                            disabled={filters.skip + filters.limit >= filteredTotal}
                                            className="px-4 py-2 bg-dark-panel border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Modals */}
                    <RunSimulationModal
                        isOpen={showRunModal}
                        onClose={() => setShowRunModal(false)}
                        preSelectedTestSuite={selectedTestSuite}
                        preSelectedAgent={selectedAgent}
                        onSuccess={(data) => {
                            setShowRunModal(false);
                            if (data?.simulation_id) {
                                navigate(`/simulation/runs/${data.simulation_id}`);
                            }
                        }}
                    />

                    <ConfirmationModal
                        isOpen={confirmModal.isOpen}
                        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                        onConfirm={confirmModal.onConfirm}
                        title={confirmModal.title}
                        message={confirmModal.message}
                        confirmText={confirmModal.confirmText}
                        variant={confirmModal.variant}
                        isLoading={deleteSimulation.isPending || rerunSimulation.isPending || cancelSimulation.isPending}
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <h3 className="text-red-400 font-semibold mb-2">Error loading data</h3>
                    <p className="text-gray-400">{error.message}</p>
                    <Button onClick={() => refetch()} className="mt-4">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // Fallback - should not reach here in normal flow
    return (
        <div className="p-8 bg-dark-bg min-h-screen text-white">
            <div className="w-full max-w-screen-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Outbound Sessions
                    </h1>
                    <p className="text-gray-400">
                        Select an agent to view test cases
                    </p>
                </div>
                <button
                    onClick={handleBackToAgents}
                    className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors"
                >
                    View Agents
                </button>
            </div>

            {/* Modals */}
            <RunSimulationModal
                isOpen={showRunModal}
                onClose={() => setShowRunModal(false)}
                onSuccess={(data) => {
                    setShowRunModal(false);
                    if (data?.simulation_id) {
                        navigate(`/simulation/runs/${data.simulation_id}`);
                    }
                }}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
                isLoading={deleteSimulation.isPending || rerunSimulation.isPending || cancelSimulation.isPending}
            />
        </div>
    );
};

export default SimulationsListPage;
