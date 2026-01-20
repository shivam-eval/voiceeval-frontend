import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Phone, Copy, X, RefreshCw, Search, Trash2, StopCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// Hooks
import {
    useSimulations,
    useDeleteSimulation,
    useCancelSimulation,
    useRunInboundSimulation
} from '../../hooks/useSimulations';
import { useClients } from '../../hooks/useClients';
import { useTestSuites } from '../../hooks/useTestSuites';

// Components
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import GenericDropdown from '../../components/DropDown';
import ConfirmationModal from '../../components/ConfirmationModal';

// API services (for direct calls where hooks are too much or for specific lookups)
import clientService from '../../api/services/client.service';
import simulationsService from '../../api/services/simulations';

// ============================================================================
// MODALS
// ============================================================================

const PhoneNumberModal = ({ isOpen, phoneNumber, testSuiteId, onClose }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(phoneNumber);
        toast.info('Phone number copied to clipboard!');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-panel border border-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-teal-500/10 rounded-full border border-teal-500/30">
                        <Phone className="w-12 h-12 text-teal-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-2">
                    Initiate Call
                </h2>

                <p className="text-gray-400 text-center mb-6">
                    Test Suite: <span className="text-teal-400 font-mono">{testSuiteId}</span>
                </p>

                <p className="text-gray-300 text-center mb-6">
                    Please initiate a call on this number:
                </p>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center gap-3">
                        <Phone className="w-5 h-5 text-teal-400" />
                        <span className="text-3xl font-bold text-white tracking-wider">
                            {phoneNumber}
                        </span>
                    </div>
                </div>

                <Button
                    onClick={handleCopy}
                    className="w-full mb-3 flex items-center justify-center gap-2"
                >
                    <Copy className="w-4 h-4" />
                    Copy Number
                </Button>

                <Button
                    onClick={onClose}
                    variant="secondary"
                    className="w-full"
                >
                    Close
                </Button>
            </div>
        </div>
    );
};

const CreateInboundSessionModal = ({ isOpen, onClose, onSuccess }) => {
    const runInbound = useRunInboundSimulation();
    const { data: clientsData, isLoading: clientsLoading } = useClients();
    const { data: testSuitesData, isLoading: suitesLoading } = useTestSuites();

    const [formData, setFormData] = useState({
        client_id: '',
        test_suite_id: '',
        metadata: {}
    });

    const handleSubmit = async () => {
        if (!formData.client_id || !formData.test_suite_id) {
            toast.warning('Please select both a client and a test suite');
            return;
        }

        try {
            const result = await runInbound.mutateAsync(formData);

            // Find the client's inbound number for the success message
            const selectedClient = clientsData?.find(c => c.client_id === formData.client_id);
            const inboundNumber = selectedClient?.inbound_number || 'the designated number';

            toast.success(`Inbound session created! Call ${inboundNumber}`);

            if (onSuccess) {
                onSuccess({
                    ...result,
                    inbound_number: inboundNumber
                });
            }
            onClose();
        } catch (error) {
            // Error handled by global interceptor
        }
    };

    if (!isOpen) return null;

    const testSuites = testSuitesData?.test_suites || [];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-panel border border-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Create Inbound Session</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Client
                        </label>
                        <select
                            value={formData.client_id}
                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                            className="w-full bg-dark-input border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                            disabled={clientsLoading}
                        >
                            <option value="">{clientsLoading ? 'Loading clients...' : 'Select a client...'}</option>
                            {clientsData?.map((client) => (
                                <option key={client.client_id} value={client.client_id}>
                                    {client.client_id} - {client.inbound_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Test Suite
                        </label>
                        <select
                            value={formData.test_suite_id}
                            onChange={(e) => setFormData({ ...formData, test_suite_id: e.target.value })}
                            className="w-full bg-dark-input border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                            disabled={suitesLoading}
                        >
                            <option value="">{suitesLoading ? 'Loading test suites...' : 'Select a test suite...'}</option>
                            {testSuites.map((suite) => (
                                <option key={suite.test_suite_id} value={suite.test_suite_id}>
                                    {suite.name || suite.test_suite_id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={onClose}
                            variant="secondary"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={runInbound.isPending || !formData.client_id || !formData.test_suite_id}
                            className="flex-1"
                        >
                            {runInbound.isPending ? 'Creating...' : 'Create Session'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN PAGE
// ============================================================================

const InboundPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    const [phoneModal, setPhoneModal] = useState({ isOpen: false, phoneNumber: '', testSuiteId: '' });
    const [createModal, setCreateModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger',
        confirmText: 'Confirm'
    });

    // Filters for useSimulations hook
    const filters = useMemo(() => ({
        search: searchTerm,
        status: statusFilter,
        skip: (page - 1) * limit,
        limit: limit
    }), [searchTerm, statusFilter, page]);

    // Fetch simulations
    const { data: simulationsData, isLoading, refetch } = useSimulations(filters);
    const deleteSimulation = useDeleteSimulation();
    const cancelSimulation = useCancelSimulation();

    // Only show sessions with call_mode === 'inbound_loopback'
    const inboundSimulations = useMemo(() => {
        if (!simulationsData?.simulations) return [];
        return simulationsData.simulations.filter(
            sim => sim.call_mode === 'inbound_loopback'
        );
    }, [simulationsData]);

    const handleRowClick = async (sim) => {
        try {
            // We need to get the client's inbound number for this simulation
            // In the metadata we might have stored client_id
            const simulationDetail = await simulationsService.getSimulation(sim.simulation_id);
            const clientId = simulationDetail.metadata?.client_id;

            if (clientId) {
                const client = await clientService.getClient(clientId);
                setPhoneModal({
                    isOpen: true,
                    phoneNumber: client.inbound_number || 'N/A',
                    testSuiteId: sim.test_suite_id
                });
            } else {
                toast.error('Client information not linked to this session');
            }
        } catch (error) {
            toast.error('Failed to load session details');
        }
    };

    const handleCreateSuccess = (result) => {
        setPhoneModal({
            isOpen: true,
            phoneNumber: result.inbound_number,
            testSuiteId: result.test_suite_id || result.simulation_id
        });
    };

    const handleCancel = (e, simulationId) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: 'Cancel Simulation',
            message: 'Are you sure you want to cancel this running simulation?',
            confirmText: 'Cancel',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await cancelSimulation.mutateAsync(simulationId);
                    toast.success('Simulation cancelled');
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) { }
            }
        });
    };

    const handleDelete = (e, simulationId) => {
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
                    toast.success('Simulation deleted');
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) { }
            }
        });
    };

    const getStatusBadgeVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'success';
            case 'running': return 'info';
            case 'failed': return 'danger';
            case 'queued':
            case 'waiting_for_calls': return 'warning';
            default: return 'default';
        }
    };

    const truncateId = (id) => {
        if (!id) return '';
        return id.length > 12 ? `${id.substring(0, 12)}...` : id;
    };

    return (
        <div className="p-8 bg-dark-bg min-h-screen text-white">
            <div className="w-full max-w-screen-2xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Inbound Sessions</h1>
                        <p className="text-gray-400">View and manage all inbound simulation sessions</p>
                    </div>
                    <button
                        onClick={() => setCreateModal(true)}
                        className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                    >
                        <Play className="w-5 h-5" />
                        Create New Inbound Session
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-panel border border-gray-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-teal-500 text-white"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 w-56">
                        <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Status:</span>
                        <GenericDropdown
                            options={[
                                { label: "All Statuses", value: "" },
                                { label: "Waiting", value: "waiting_for_calls" },
                                { label: "Running", value: "running" },
                                { label: "Completed", value: "completed" },
                                { label: "Failed", value: "failed" }
                            ]}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            className="flex-1"
                        />
                    </div>

                    <button
                        onClick={() => refetch()}
                        className="p-3 bg-dark-panel border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Table */}
                <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                Loading inbound sessions...
                            </div>
                        </div>
                    ) : inboundSimulations.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                                    <Play className="w-8 h-8 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-lg font-medium">No inbound sessions found</p>
                                    <p className="text-gray-500 text-sm">Create your first inbound simulation to see results here</p>
                                </div>
                                <button
                                    onClick={() => setCreateModal(true)}
                                    className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.1)] mt-2"
                                >
                                    <Play className="w-5 h-5" />
                                    Create Your First Session
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                                        <th className="px-6 py-4">Simulation ID</th>
                                        <th className="px-6 py-4">Test Suite</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Progress</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-300">
                                    {inboundSimulations.map((sim) => (
                                        <tr
                                            key={sim.simulation_id}
                                            onClick={() => handleRowClick(sim)}
                                            className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <code className="text-xs text-teal-400 bg-teal-500/5 px-2 py-1 rounded border border-teal-500/10 group-hover:border-teal-500/30">
                                                    {truncateId(sim.simulation_id)}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {truncateId(sim.test_suite_id)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusBadgeVariant(sim.status)}>
                                                    {sim.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {sim.progress?.completed || 0} / {sim.progress?.total_test_cases || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {sim.status === 'running' && (
                                                        <button
                                                            onClick={(e) => handleCancel(e, sim.simulation_id)}
                                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <StopCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDelete(e, sim.simulation_id)}
                                                        className="p-2 text-gray-400 hover:bg-gray-700 rounded transition-colors"
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
                    )}
                </div>
            </div>

            <PhoneNumberModal
                isOpen={phoneModal.isOpen}
                phoneNumber={phoneModal.phoneNumber}
                testSuiteId={phoneModal.testSuiteId}
                onClose={() => setPhoneModal({ ...phoneModal, isOpen: false })}
            />

            <CreateInboundSessionModal
                isOpen={createModal}
                onClose={() => setCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
                isLoading={deleteSimulation.isPending || cancelSimulation.isPending}
            />
        </div>
    );
};

export default InboundPage;