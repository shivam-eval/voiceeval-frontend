import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTestSuites, useDeleteTestSuite, useCloneTestSuite, useCreateTestSuite } from "../../hooks/useTestSuites";
import { useAgents } from "../../hooks/useAgents";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import CreateTestSuiteModal from "../../components/CreateTestSuiteModal";
import ImportTestSuiteModal from "../../components/ImportTestSuiteModal";

const TestCasesPage = () => {
    const navigate = useNavigate();

    // Filters and search
    const [searchQuery, setSearchQuery] = useState("");
    const [agentFilter, setAgentFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Fetch test suites
    const { data, isLoading, error } = useTestSuites({
        search: searchQuery,
        agent_id: agentFilter,
        status: statusFilter,
    });

    // Fetch agents for filter dropdown
    const { data: agentsData } = useAgents({ limit: 100 });

    // Mutations
    const deleteTestSuite = useDeleteTestSuite();
    const cloneTestSuite = useCloneTestSuite();
    const createTestSuite = useCreateTestSuite();

    const handleCreateSuite = async (formData) => {
        try {
            await createTestSuite.mutateAsync({
                name: formData.name,
                description: formData.description,
                owner: formData.owner,
                agent_id: formData.agent_id,
                test_cases: [],
            });
            setShowCreateModal(false);
        } catch (error) {
            alert(error.message);
        }
    };


    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this test suite?")) {
            try {
                await deleteTestSuite.mutateAsync(id);
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleClone = async (id) => {
        try {
            await cloneTestSuite.mutateAsync(id);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleBulkDelete = async () => {
        if (confirm(`Are you sure you want to delete ${selectedRows.length} test suites?`)) {
            try {
                await Promise.all(selectedRows.map(id => deleteTestSuite.mutateAsync(id)));
                setSelectedRows([]);
            } catch (error) {
                alert(error.message);
            }
        }
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
            key: "status",
            label: "Status",
            sortable: true,
            render: (value) => {
                const variantMap = {
                    draft: "default",
                    ready: "success",
                    archived: "warning",
                };
                return (
                    <Badge variant={variantMap[value] || "default"} size="sm">
                        {value}
                    </Badge>
                );
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
                        <h1 className="text-4xl font-bold text-white mb-2">Test Sets</h1>
                        <p className="text-gray-400">Create and manage test suites for your agents</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowImportModal(true)}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            }
                        >
                            Import Test Suite
                        </Button>
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
                                <option key={agent._id} value={agent._id}>
                                    {agent.agent_name || agent.agent_id}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter || ""}
                            onChange={(e) => setStatusFilter(e.target.value || null)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-teal-400"
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="ready">Ready</option>
                            <option value="archived">Archived</option>
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
                    onRowClick={(row) => navigate(`/test-cases/${row._id}`)}
                    emptyMessage="No test suites found. Create your first test suite to get started!"
                    actions={(row) => (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/test-cases/${row._id}`);
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
                                    handleClone(row._id);
                                }}
                                className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                title="Clone Test Suite"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(row._id);
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

            {/* Import Test Suite Modal */}
            <ImportTestSuiteModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => setShowImportModal(false)}
            />
        </div>
    );
};

export default TestCasesPage;
