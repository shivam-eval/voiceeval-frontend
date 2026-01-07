import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, StopCircle, RefreshCw, Download, Trash2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSimulations, useDeleteSimulation, useRerunSimulation, useCancelSimulation } from '../../hooks/useSimulations';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const SimulationsListPage = () => {
    const navigate = useNavigate();
    const [selectedSimulations, setSelectedSimulations] = useState([]);
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
        if (window.confirm('Are you sure you want to delete this simulation? This action cannot be undone.')) {
            try {
                await deleteSimulation.mutateAsync(simulationId);
                toast.success('Simulation deleted successfully');
            } catch (error) {
                // Error handled by global interceptor
            }
        }
    };

    const handleRerun = async (e, simulationId) => {
        e.stopPropagation();
        if (window.confirm('This will create a new simulation with the same parameters. Continue?')) {
            try {
                const result = await rerunSimulation.mutateAsync(simulationId);
                toast.success(`Simulation rerun initiated!`);
                navigate(`/simulation/runs/${result.new_simulation_id}`);
            } catch (error) {
                // Error handled by global interceptor
            }
        }
    };

    const handleCancel = async (e, simulationId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to cancel this running simulation?')) {
            try {
                await cancelSimulation.mutateAsync(simulationId);
                toast.success('Simulation cancelled successfully');
            } catch (error) {
                // Error handled by global interceptor
            }
        }
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
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Simulation Runs</h1>
                        <p className="text-gray-400">View and manage all simulation executions</p>
                    </div>
                    <Button
                        onClick={() => navigate('/simulation/evaluator')}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                        <Play className="w-5 h-5" />
                        Run New Simulation
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800/50 mb-6">
                    <div className="flex flex-wrap gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[300px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by simulation ID or test suite..."
                                    value={filters.search}
                                    onChange={handleSearch}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            {['All', 'Running', 'Completed', 'Failed', 'Queued'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusFilter(status === 'All' ? '' : status.toLowerCase())}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${(status === 'All' && !filters.status) || filters.status === status.toLowerCase()
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-gray-900 rounded-xl border border-gray-800/50 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                            <p className="text-gray-400 mt-4">Loading simulations...</p>
                        </div>
                    ) : !data || data.simulations.length === 0 ? (
                        <div className="p-12 text-center">
                            <Play className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No simulations yet</h3>
                            <p className="text-gray-400 mb-6">Run your first simulation to see results here</p>
                            <Button onClick={() => navigate('/simulation/evaluator')}>
                                Run New Simulation
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-800/50 border-b border-gray-800">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Simulation ID
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Test Suite
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Started
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Progress
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Score
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {data.simulations.map((sim) => (
                                            <tr
                                                key={sim.simulation_id}
                                                onClick={() => handleRowClick(sim.simulation_id)}
                                                className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <code className="text-sm text-teal-400 bg-gray-800 px-2 py-1 rounded">
                                                        {truncateId(sim.simulation_id)}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-white">
                                                        {sim.metadata?.test_suite_name || sim.metadata?.flow_tree_name || sim.test_suite_id}
                                                    </div>
                                                    {sim.metadata?.agent_name && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Agent: {sim.metadata.agent_name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {formatDateTime(sim.timestamps?.started_at || sim.timestamps?.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {formatDuration(sim.metrics?.total_duration_ms)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={getStatusBadgeVariant(sim.status)}>
                                                        {sim.status}
                                                        {sim.status === 'running' && (
                                                            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                                        )}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {sim.status === 'running' ? (
                                                        <div className="w-full">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="flex-1 bg-gray-800 rounded-full h-2">
                                                                    <div
                                                                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                                                                        style={{ width: `${sim.progress?.percentage || 0}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs text-gray-400">
                                                                    {Math.round(sim.progress?.percentage || 0)}%
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {sim.progress?.completed || 0}/{sim.progress?.total_sessions || 0} sessions
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-300">
                                                            {sim.progress?.completed || 0}/{sim.progress?.total_sessions || 0}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {sim.metrics?.overall_score !== null && sim.metrics?.overall_score !== undefined ? (
                                                        <div className={`text-sm font-semibold ${sim.metrics.overall_score >= 0.9 ? 'text-green-400' :
                                                            sim.metrics.overall_score >= 0.7 ? 'text-yellow-400' :
                                                                'text-red-400'
                                                            }`}>
                                                            {(sim.metrics.overall_score * 100).toFixed(1)}%
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRowClick(sim.simulation_id);
                                                            }}
                                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                        {sim.status === 'running' && (
                                                            <button
                                                                onClick={(e) => handleCancel(e, sim.simulation_id)}
                                                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <StopCircle className="w-4 h-4 text-red-400" />
                                                            </button>
                                                        )}
                                                        {sim.status === 'completed' && (
                                                            <button
                                                                onClick={(e) => handleRerun(e, sim.simulation_id)}
                                                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                                title="Rerun"
                                                            >
                                                                <RefreshCw className="w-4 h-4 text-teal-400" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(e, sim.simulation_id)}
                                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {data.total > filters.limit && (
                                <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-800 flex items-center justify-between">
                                    <div className="text-sm text-gray-400">
                                        Showing {filters.skip + 1} to {Math.min(filters.skip + filters.limit, data.total)} of {data.total} simulations
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
        </div>
    );
};

export default SimulationsListPage;
