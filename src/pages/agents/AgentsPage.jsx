import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAgents, useDeleteAgent, useTestAgent, useCloneAgent, useCreateAgent } from "../../hooks/useAgents";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import PlatformSelection from "../platformSelection/PlatformSelection";
import ConnectionForm from "../connectAgent";
import GenerateFlowModal from "../../components/GenerateFlowModal";
import { useWorkflow } from "../../context/WorkFlowContext";

import ConfirmationModal from "../../components/ConfirmationModal";

const AgentsPage = () => {
    const navigate = useNavigate();
    const { setAssistantId } = useWorkflow();

    // Filters and search
    // ... existing state ...
    const [searchQuery, setSearchQuery] = useState("");
    const [platformFilter, setPlatformFilter] = useState([]);
    const [directionFilter, setDirectionFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);

    // Modal state
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [showGenerateFlowModal, setShowGenerateFlowModal] = useState(false);
    const [selectedAgentForFlow, setSelectedAgentForFlow] = useState(null);

    // Confirmation Modal State
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        isLoading: false
    });

    // Fetch agents
    // ... useAgents hook ...
    const { data, isLoading, error } = useAgents({
        search: searchQuery,
        provider: platformFilter.length > 0 ? platformFilter : undefined,
        direction: directionFilter,
        status: statusFilter,
    });

    // Mutations
    const deleteAgent = useDeleteAgent();
    // ... other hooks ...
    const testAgent = useTestAgent();
    const cloneAgent = useCloneAgent();
    const createAgent = useCreateAgent();

    // ... existing handlers ...
    const handlePlatformSelect = (platformId) => {
        setSelectedPlatform(platformId);
    };

    const handleConnect = async ({ apiKey, agentId, name, customPrompt, direction, phoneNumber }) => {
        // ... existing handleConnect logic ...
        try {
            const result = await createAgent.mutateAsync({
                provider: selectedPlatform,
                api_key: apiKey || undefined,
                provider_agent_id: agentId || undefined,
                name: name || undefined,
                direction: direction || "both",
                phone_number: phoneNumber || undefined,
                custom_prompt: selectedPlatform === 'custom' ? customPrompt : undefined
            });

            // Store the agentId (assistant ID) in global context
            if (agentId) {
                setAssistantId(agentId);
            }

            setShowConnectModal(false);
            setSelectedPlatform(null);
            toast.success("Agent connected successfully!");

            // Automatically trigger flow generation
            if (result?.agent_id) {
                try {
                    const { generateFlow } = await import('../../api/services/generation.service');
                    await generateFlow({ agent_id: result.agent_id });
                } catch (flowError) {
                    console.error("Auto flow generation failed:", flowError);
                    toast.warning("Agent created but flow generation failed. You can generate it manually from the agent details page.");
                }
            }
        } catch (error) {
            // Error handled by global interceptor
        }
    };

    const handleCloseModal = () => {
        setShowConnectModal(false);
        setSelectedPlatform(null);
    };

    const handleBackToPlatformSelection = () => {
        setSelectedPlatform(null);
    };

    const handleDelete = (id) => {
        setConfirmationModal({
            isOpen: true,
            title: "Delete Agent",
            message: "Are you sure you want to delete this agent? This action cannot be undone.",
            variant: "danger",
            confirmText: "Delete",
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, isLoading: true }));
                try {
                    console.log("🚀 Executing delete for:", id);
                    await deleteAgent.mutateAsync(id);
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                    toast.success("Agent deleted successfully");
                    console.log("✅ Delete successful");
                } catch (error) {
                    console.error("❌ Delete failed:", error);
                    // Error handled by global interceptor
                    setConfirmationModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleTest = async (id) => {
        // ... existing handleTest logic ...
        try {
            const result = await testAgent.mutateAsync(id);
            if (result.success) {
                toast.success("Connection successful!");
            } else {
                toast.error(`Connection failed: ${result.message}`);
            }
        } catch (error) {
            // Error handled by global interceptor
        }
    };

    const handleClone = async (id) => {
        // ... existing handleClone logic ...
        try {
            await cloneAgent.mutateAsync(id);
            toast.success("Agent cloned successfully");
        } catch (error) {
            // Error handled by global interceptor
        }
    };

    const handleBulkDelete = () => {
        setConfirmationModal({
            isOpen: true,
            title: "Delete Agents",
            message: `Are you sure you want to delete ${selectedRows.length} agents? This action cannot be undone.`,
            variant: "danger",
            confirmText: "Delete All",
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, isLoading: true }));
                try {
                    console.log("🚀 Executing bulk delete for:", selectedRows);
                    await Promise.all(selectedRows.map(id => deleteAgent.mutateAsync(id)));
                    setSelectedRows([]);
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                    toast.success(`${selectedRows.length} agents deleted successfully`);
                    console.log("✅ Bulk delete successful");
                } catch (error) {
                    console.error("❌ Bulk delete failed:", error);
                    // Error handled by global interceptor
                    setConfirmationModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    // ... Table columns ...
    const columns = [
        {
            key: "provider",
            label: "Provider",
            sortable: true,
            render: (value) => (
                <span className="capitalize font-medium">{value}</span>
            ),
        },
        {
            key: "agent_name",
            label: "Agent Name",
            sortable: true,
            render: (value, row) => (
                <div>
                    <div className="font-medium text-white">{value || row.name || "Unnamed Agent"}</div>
                    <div className="text-xs text-gray-500">{row.agent_id}</div>
                </div>
            ),
        },
        {
            key: "phone_number",
            label: "Phone Number",
            sortable: false,
            render: (value) => value || "-",
        },
        {
            key: "direction", // Keep key for potential sorting if backend supports it mapped, or filtered locally
            label: "Direction",
            sortable: true,
            render: (value, row) => {
                const direction = row.metadata?.direction || value || "unknown";
                return (
                    <Badge variant={direction === "inbound" ? "info" : "primary"} size="sm">
                        {direction}
                    </Badge>
                );
            },
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (value) => {
                const variantMap = {
                    active: "success",
                    inactive: "default",
                    error: "error",
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
    ];

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Agents</h1>
                        <p className="text-gray-400">Manage your connected voice agents</p>
                    </div>
                    <Button
                        onClick={() => setShowConnectModal(true)}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        }
                    >
                        Connect New Agent
                    </Button>
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
                                placeholder="Search by agent name, ID, or phone number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                            />
                        </div>

                        <select
                            value={directionFilter || ""}
                            onChange={(e) => setDirectionFilter(e.target.value || null)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-teal-400"
                        >
                            <option value="">All Directions</option>
                            <option value="inbound">Inbound</option>
                            <option value="outbound">Outbound</option>
                            <option value="both">Both</option>
                        </select>

                        <select
                            value={statusFilter || ""}
                            onChange={(e) => setStatusFilter(e.target.value || null)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-teal-400"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="error">Error</option>
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
                        <p className="text-red-400">Error loading agents: {error.message}</p>
                    </div>
                )}

                {/* Table */}
                <Table
                    columns={columns}
                    data={data?.agents || []}
                    loading={isLoading}
                    selectable
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    primaryKey="agent_id"
                    onRowClick={(row) => navigate(`/agents/${row.agent_id}`)}
                    emptyMessage="No agents found. Connect your first agent to get started!"
                    actions={(row) => (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAgentForFlow(row.agent_id);
                                    setShowGenerateFlowModal(true);
                                }}
                                className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-teal-400 transition-colors"
                                title="Generate Flow"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTest(row.agent_id);
                                }}
                                className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                title="Test Connection"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClone(row.agent_id);
                                }}
                                className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                title="Clone Agent"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(row.agent_id);
                                }}
                                className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                                title="Delete Agent"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </>
                    )}
                />
            </div>

            {/* Connect Agent Modal */}
            {/* ... */}
            {showConnectModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-bg rounded-2xl max-w-2xl w-full border border-gray-800 relative overflow-hidden">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 z-10 group"
                        >
                            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-6">
                            {/* Modal Content */}
                            {!selectedPlatform ? (
                                <PlatformSelection onSelectPlatform={handlePlatformSelect} />
                            ) : (
                                <ConnectionForm
                                    platform={selectedPlatform}
                                    onConnect={handleConnect}
                                    isConnecting={createAgent.isPending}
                                    onBack={handleBackToPlatformSelection}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Flow Modal */}
            <GenerateFlowModal
                isOpen={showGenerateFlowModal}
                onClose={() => {
                    setShowGenerateFlowModal(false);
                    setSelectedAgentForFlow(null);
                }}
                agentId={selectedAgentForFlow}
                onFlowGenerated={(flowData) => {
                }}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                isLoading={confirmationModal.isLoading}
                variant={confirmationModal.variant}
                confirmText={confirmationModal.confirmText}
            />
        </div>
    );
};

export default AgentsPage;
