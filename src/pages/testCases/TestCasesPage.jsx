import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, Plus, Filter, MoreVertical, Trash2, Eye, ChevronDown } from 'lucide-react';
import { useTestSuites, useDeleteTestSuite, useCreateTestSuite } from "../../hooks/useTestSuites";
import { useAgents } from "../../hooks/useAgents";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import ConfirmationModal from "../../components/ConfirmationModal";
import CreateTestSuiteModal from "../../components/CreateTestSuiteModal";
import GenericDropdown from "../../components/DropDown";

const TestCasesPage = () => {
    const navigate = useNavigate();

    // Filters and search
    const [searchQuery, setSearchQuery] = useState("");
    const [agentFilter, setAgentFilter] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger',
        confirmText: 'Confirm'
    });

    // Fetch test suites
    const { data, isLoading, error } = useTestSuites({
        search: searchQuery,
        agent_id: agentFilter,
    });

    // Fetch agents for filter dropdown
    const { data: agentsData } = useAgents({ limit: 100 });

    const agentOptions = useMemo(() => [
        { label: "All Agents", value: "" },
        ...(agentsData?.agents?.map(agent => ({
            label: (agent?.name || agent?.agent_name) ? `${agent?.name || agent?.agent_name} (${agent?.agent_id})` : agent?.agent_id,
            value: agent.agent_id
        })) || [])
    ], [agentsData]);

    // Mutations
    const deleteTestSuite = useDeleteTestSuite();
    const createTestSuite = useCreateTestSuite();

    const handleCreateSuite = (formData) => {
        // Close modal immediately
        setShowCreateModal(false);
        toast.info("Creating test suite in background...");

        createTestSuite.mutate(formData, {
            onSuccess: () => {
                toast.success("Test suite created successfully");
            }
        });
    };


    const handleDelete = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Test Suite",
            message: "Are you sure you want to delete this test suite?",
            confirmText: "Delete",
            variant: "danger",
            onConfirm: async () => {
                try {
                    await deleteTestSuite.mutateAsync(id);
                    toast.success("Test suite deleted successfully");
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    // Error handled by global interceptor
                }
            }
        });
    };

    const handleBulkDelete = async () => {
        setConfirmModal({
            isOpen: true,
            title: "Bulk Delete",
            message: `Are you sure you want to delete ${selectedRows.length} test suites?`,
            confirmText: "Delete",
            variant: "danger",
            onConfirm: async () => {
                try {
                    await Promise.all(selectedRows.map(id => deleteTestSuite.mutateAsync(id)));
                    setSelectedRows([]);
                    toast.success(`${selectedRows.length} test suites deleted successfully`);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    // Error handled by global interceptor
                }
            }
        });
    };

    // Table columns
    const columns = [
        {
            key: "name",
            label: "Name",
            sortable: true,
            render: (value, row) => (
                <div>
                    <div className="font-medium text-white">{value}</div>
                    {row.description && (
                        <div className="text-xs text-gray-500 truncate max-w-md">{row.description}</div>
                    )}
                </div>
            ),
        },
        {
            key: "owner",
            label: "Owner",
            sortable: true,
            render: (value) => value || "-",
        },
        {
            key: "metadata",
            label: "Records",
            sortable: false,
            render: (value) => (
                <span className="text-teal-400 font-medium">
                    {value?.total_cases || 0}
                </span>
            ),
        },
        {
            key: "simulation_summary",
            label: "Last Run",
            sortable: false,
            render: (value) => {
                if (!value) {
                    return <Badge variant="default" size="sm">Not Tested</Badge>;
                }
                if (value.has_active) {
                    return (
                        <Badge variant="warning" size="sm">
                            <span className="flex items-center gap-1">
                                <span className="animate-pulse">●</span> Running
                            </span>
                        </Badge>
                    );
                }
                if (value.last_status === 'completed') {
                    const passed = value.completed || 0;
                    const total = value.total_sessions || 0;
                    const allPassed = value.failed === 0;
                    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
                    return (
                        <Badge variant={allPassed ? "success" : "warning"} size="sm">
                            {passed}/{total} Passed ({percentage}%)
                        </Badge>
                    );
                }
                if (value.last_status === 'failed') {
                    return <Badge variant="danger" size="sm">Failed</Badge>;
                }
                return <Badge variant="default" size="sm">{value.last_status || 'Unknown'}</Badge>;
            },
        },
        {
            key: "created_at",
            label: "Created",
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString(),
        },
        {
            key: "updated_at",
            label: "Last Updated",
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString(),
        },
    ];

    return (
        <div className="p-8 bg-dark-bg min-h-screen text-white">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Test Suites</h1>
                    <p className="text-gray-400">Create and manage test suites for your agents</p>
                </div>

                {/* Header Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Search test suites..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-dark-panel border border-gray-800 rounded-lg py-3 px-5 text-base focus:outline-none focus:border-teal-500 transition-colors text-white placeholder-gray-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 w-72">
                            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Agent:</span>
                            <GenericDropdown
                                options={agentOptions}
                                value={agentFilter || ""}
                                onChange={(val) => setAgentFilter(val)}
                                className="flex-1"
                            />
                        </div>

                        <button className="bg-dark-panel border border-gray-800 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors shadow-lg">
                            Search
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedRows.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-red-500/20 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete Selected ({selectedRows.length})
                            </button>
                        )}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                        >
                            <Plus className="w-5 h-5" />
                            Create Test Set
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3 text-red-400">
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <p>Error loading test suites: {error.message}</p>
                    </div>
                )}

                {/* Table Container */}
                <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
                    <Table
                        columns={columns}
                        data={data?.test_suites || []}
                        loading={isLoading}
                        selectable
                        selectedRows={selectedRows}
                        onSelectionChange={setSelectedRows}
                        primaryKey="test_suite_id"
                        onRowClick={(row) => navigate(`/test-cases/${row.test_suite_id}`)}
                        emptyMessage="No test suites found. Create your first test suite to get started!"
                        actions={(row) => (
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/test-cases/${row.test_suite_id}`);
                                    }}
                                    className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-teal-400 transition-colors"
                                    title="View/Edit"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(row.test_suite_id);
                                    }}
                                    className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Delete Test Suite"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Create Test Suite Modal */}
            <CreateTestSuiteModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateSuite}
                isLoading={createTestSuite.isPending}
                agents={agentsData?.agents || []}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
                isLoading={deleteTestSuite.isPending}
            />
        </div>
    );
};

export default TestCasesPage;
