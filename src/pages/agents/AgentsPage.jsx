import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, Plus, Trash2 } from "lucide-react";
import { useAgents, useDeleteAgent, useTestAgent, useCloneAgent, useCreateAgent } from "../../hooks/useAgents";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import GenericDropdown from "../../components/DropDown";
import PlatformSelection from "../platformSelection/PlatformSelection";
import ConnectionForm from "../connectAgent";
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

    // Options for dropdowns
    const directionOptions = useMemo(() => [
        { label: "All Directions", value: "" },
        { label: "Inbound", value: "inbound" },
        { label: "Outbound", value: "outbound" },
        { label: "Both", value: "both" },
    ], []);

    const statusOptions = useMemo(() => [
        { label: "All Status", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Error", value: "error" },
    ], []);

    // Modal state
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(null);

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
        <div className="p-8 bg-dark-bg min-h-screen text-white">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Agents</h1>
                    <p className="text-gray-400">Manage your connected voice agents</p>
                </div>

                {/* Header Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-dark-panel border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 w-56 overflow-visible">
                            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Direction:</span>
                            <GenericDropdown
                                options={directionOptions}
                                value={directionFilter || ""}
                                onChange={(val) => setDirectionFilter(val || null)}
                                className="flex-1"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 w-48 overflow-visible">
                            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Status:</span>
                            <GenericDropdown
                                options={statusOptions}
                                value={statusFilter || ""}
                                onChange={(val) => setStatusFilter(val || null)}
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
                            onClick={() => setShowConnectModal(true)}
                            className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                        >
                            <Plus className="w-5 h-5" />
                            Connect New Agent
                        </button>
                    </div>
                </div>

                {/* Bulk Actions (Old) - Removed as it's now in Header Controls */}
                

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
