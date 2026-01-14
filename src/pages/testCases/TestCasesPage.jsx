import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTestSuites, useDeleteTestSuite, useCreateTestSuite } from "../../hooks/useTestSuites";
import { useAgents } from "../../hooks/useAgents";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import ConfirmationModal from "../../components/ConfirmationModal";
import CreateTestSuiteModal from "../../components/CreateTestSuiteModal";

const TestCasesPage = () => {
    const navigate = useNavigate();

    // Filters and search
    const [searchQuery, setSearchQuery] = useState("");
    const [agentFilter, setAgentFilter] = useState(null);
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
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Test Suites</h1>
                        <p className="text-gray-400">Create and manage test suites for your agents</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            }
                        >
                            Create Test Set
                        </Button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by ID, name, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                            />
                        </div>

                        <select
                            value={agentFilter || ""}
                            onChange={(e) => setAgentFilter(e.target.value || null)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-teal-400"
                        >
                            <option value="">All Agents</option>
                            {agentsData?.agents?.map((agent) => (
                                <option key={agent.agent_id} value={agent.agent_id}>
                                    {(agent?.name || agent?.agent_name) ? `${agent?.name || agent?.agent_name} (${agent?.agent_id})` : agent?.agent_id}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedRows.length > 0 && (
                    <div className="mb-4 flex items-center gap-4">
                        <span className="text-gray-400">{selectedRows.length} selected</span>
                        <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                            Delete Selected
                        </Button>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                        <p className="text-red-400">Error loading test suites: {error.message}</p>
                    </div>
                )}

                {/* Table */}
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
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/test-cases/${row.test_suite_id}`);
                                }}
                                className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                title="View/Edit"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(row.test_suite_id);
                                }}
                                className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                                title="Delete Test Suite"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </>
                    )}
                />
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
