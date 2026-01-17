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

const InboundPage = () => {
    const navigate = useNavigate();
    const [selectedSimulations, setSelectedSimulations] = useState([]);
    const [showRunModal, setShowRunModal] = useState(false);
    const [phoneNumberModal, setPhoneNumberModal] = useState({
        isOpen: false,
        phoneNumber: '',
        testSuiteId: ''
    });
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

    const handleRowClick = (simulation) => {
        // Show modal with phone number instead of navigating
        setPhoneNumberModal({
            isOpen: true,
            phoneNumber: simulation.metadata?.phone_number || '+1 (555) 123-4567', // Default if not available
            testSuiteId: simulation.test_suite_id || simulation.metadata?.test_suite_id || 'N/A'
        });
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
                    navigate(`/inbound/runs/${result.new_simulation_id}`);
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

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <h3 className="text-red-400 font-semibold mb-2">Error loading inbound sessions</h3>
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
                        <h1 className="text-4xl font-bold text-white mb-2">Inbound Sessions</h1>
                        <p className="text-gray-400">View and manage all inbound simulation sessions</p>
                    </div>
                    <button
                        onClick={() => setShowRunModal(true)}
                        className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                    >
                        <Play className="w-5 h-5" />
                        Create New Inbound Session
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Search inbound sessions..."
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
                                Loading inbound sessions...
                            </div>
                        </div>
                    ) : !data || data.simulations.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                                    <Play className="w-8 h-8 text-gray-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-400 text-lg font-medium">No inbound sessions found</p>
                                    <p className="text-gray-500 text-sm">Run your first inbound simulation to see results here</p>
                                </div>
                                <button
                                    onClick={() => setShowRunModal(true)}
                                    className="mt-2 flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors"
                                >
                                    <Play className="w-5 h-5" />
                                    Create Your First Inbound Session
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                                            <th className="px-4 py-3">Test Suite ID</th>
                                            <th className="px-4 py-3">Agent</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-300">
                                        {data.simulations.map((sim) => (
                                            <tr
                                                key={sim.simulation_id}
                                                onClick={() => handleRowClick(sim)}
                                                className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-4 py-3">
                                                    <code className="text-xs text-teal-400 bg-teal-500/5 px-2 py-1 rounded border border-teal-500/10 group-hover:border-teal-500/30 transition-colors">
                                                        {truncateId(sim.test_suite_id || sim.metadata?.test_suite_id || 'N/A')}
                                                    </code>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-white font-medium">
                                                        {(() => {
                                                            const agentName = sim.metadata?.name || sim.name || sim.metadata?.agent_name || sim.agent_name || '-';
                                                            // Remove "Agent " prefix if present
                                                            return agentName !== '-' ? agentName.replace(/^Agent\s+/i, '') : agentName;
                                                        })()}
                                                    </span>
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

            {/* Phone Number Modal */}
            {phoneNumberModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-panel border border-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8 relative">
                        {/* Close button */}
                        <button
                            onClick={() => setPhoneNumberModal({ isOpen: false, phoneNumber: '', testSuiteId: '' })}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-teal-500/10 rounded-full border border-teal-500/30">
                                <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white text-center mb-2">
                            Initiate Call
                        </h2>

                        {/* Test Suite ID */}
                        <p className="text-gray-400 text-center mb-6">
                            Test Suite: <span className="text-teal-400 font-mono">{phoneNumberModal.testSuiteId}</span>
                        </p>

                        {/* Message */}
                        <p className="text-gray-300 text-center mb-6">
                            Please initiate a call on this number:
                        </p>

                        {/* Phone Number Display */}
                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-center gap-3">
                                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-3xl font-bold text-white tracking-wider">
                                    {phoneNumberModal.phoneNumber}
                                </span>
                            </div>
                        </div>

                        {/* Copy Button */}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(phoneNumberModal.phoneNumber);
                                toast.success('Phone number copied to clipboard!');
                            }}
                            className="w-full bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg font-semibold hover:bg-teal-500/20 transition-colors mb-3"
                        >
                            Copy Number
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={() => setPhoneNumberModal({ isOpen: false, phoneNumber: '', testSuiteId: '' })}
                            className="w-full bg-gray-800 border border-gray-700 text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InboundPage;
