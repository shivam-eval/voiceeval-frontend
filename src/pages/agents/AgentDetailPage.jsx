import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { BarChart3, Settings, FileText, Bot, Plus, Play, X, CheckSquare, Square, Pencil, Trash2 } from "lucide-react";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Table from "../../components/Table";
import { useAgent, useDeleteAgent, useReExtractAgent } from "../../hooks/useAgents";
import { useAgentParams, useCreateParam, useUpdateParam, useDeleteParam } from "../../hooks/useParams";
import { useTestSuites } from "../../hooks/useTestSuites";
import { useTestCases } from "../../hooks/useTestCases";
import { useAgentFlows, useDeleteFlow } from "../../hooks/useFlows";
import { outboundSimApi } from "../../utils/api";
import DashboardLoader from "../../components/DashboardLoader";
import GenerateFlowModal from "../../components/GenerateFlowModal";
import GenerateTestSuiteModal from "../../components/GenerateTestSuiteModal";
import CreateTestCaseModal from "../../components/CreateTestCaseModal";
import FlowDiagramModal from "../../components/FlowDiagramModal";
import { useCreateTestSuite } from "../../hooks/useTestSuites";

// ---------- Run Simulations Modal (same as TestCasesPage) ----------
const RunSimulationsModal = ({ isOpen, onClose, allTestCases, preSelected }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [simulationName, setSimulationName] = useState("");
    const [endpoint, setEndpoint] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [authType, setAuthType] = useState("api_key");
    const [payloadFormat, setPayloadFormat] = useState("");
    const [payloadError, setPayloadError] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedIds(preSelected.length > 0 ? preSelected : allTestCases.map(tc => tc.tc_id));
            setResults(null);
            setError(null);
        }
    }, [isOpen]);

    const allSelected = selectedIds.length === allTestCases.length;
    const toggleAll = () => setSelectedIds(allSelected ? [] : allTestCases.map(tc => tc.tc_id));
    const toggleOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleClose = () => {
        setSimulationName("");
        setEndpoint("");
        setApiKey("");
        setAuthType("api_key");
        setPayloadFormat("");
        setPayloadError(null);
        setIsRunning(false);
        setResults(null);
        setError(null);
        onClose();
    };

    const handleRun = async () => {
        if (!endpoint.trim() || selectedIds.length === 0) return;
        setIsRunning(true);
        setError(null);
        setResults(null);
        try {
            let parsedPayload = null;
            if (payloadFormat.trim()) {
                try {
                    parsedPayload = JSON.parse(payloadFormat.trim());
                } catch {
                    setError("Invalid JSON in Payload Format");
                    setIsRunning(false);
                    return;
                }
            }
            const resp = await outboundSimApi.run({
                test_case_ids: selectedIds,
                endpoint: endpoint.trim(),
                ...(apiKey.trim() && { api_key: apiKey.trim() }),
                ...(parsedPayload && { sample_payload: parsedPayload }),
                ...(simulationName.trim() && { folder_name: simulationName.trim() }),
                auth_type: authType,
            });
            setResults(resp);
        } catch (err) {
            setError(err.message || "Failed to trigger simulations");
        } finally {
            setIsRunning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h3 className="text-xl font-bold text-white">Run Simulations</h3>
                    <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    {!results ? (
                        <>
                            {/* Test case selection list */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-300">Select Test Cases</label>
                                    <button onClick={toggleAll} className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors" disabled={isRunning}>
                                        {allSelected ? <><CheckSquare className="w-3.5 h-3.5" /> Deselect all</> : <><Square className="w-3.5 h-3.5" /> Select all</>}
                                    </button>
                                </div>
                                <div className="bg-dark-bg rounded-lg border border-gray-800 divide-y divide-gray-800/60 max-h-52 overflow-y-auto">
                                    {allTestCases.map(tc => {
                                        const checked = selectedIds.includes(tc.tc_id);
                                        return (
                                            <label key={tc.tc_id} className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/40 transition-colors ${isRunning ? "pointer-events-none opacity-60" : ""}`}>
                                                <input type="checkbox" checked={checked} onChange={() => toggleOne(tc.tc_id)} className="mt-0.5 accent-teal-500 w-4 h-4 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-sm text-white font-medium truncate">{tc.scenario_config?.config_name || tc.tc_id}</div>
                                                    {tc.scenario_config?.objective && <div className="text-xs text-gray-500 truncate">{tc.scenario_config.objective}</div>}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-600 mt-1.5">{selectedIds.length} of {allTestCases.length} selected</p>
                            </div>

                            {/* Simulation Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Simulation Name <span className="text-gray-600 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={simulationName}
                                    onChange={e => setSimulationName(e.target.value)}
                                    placeholder="e.g. Regression Run — March 2026"
                                    className="w-full bg-dark-bg border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                                    disabled={isRunning}
                                />
                                <p className="text-xs text-gray-600 mt-1.5">Give this simulation run a name to identify it in your history.</p>
                            </div>

                            {/* Endpoint */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Call Trigger Endpoint</label>
                                <input type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="https://your-agent-endpoint/outbound" className="w-full bg-dark-bg border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors" disabled={isRunning} />
                                <p className="text-xs text-gray-600 mt-1.5">Each test case's params will be resolved and POSTed to this URL.</p>
                            </div>

                            {/* API Key + Auth Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    API Key <span className="text-gray-600 font-normal">(optional)</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={e => setApiKey(e.target.value)}
                                        placeholder="Your API key"
                                        className="flex-1 bg-dark-bg border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                                        disabled={isRunning}
                                    />
                                    <select
                                        value={authType}
                                        onChange={e => setAuthType(e.target.value)}
                                        className="bg-dark-bg border border-gray-700 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors"
                                        disabled={isRunning}
                                    >
                                        <option value="api_key">X-API-Key</option>
                                        <option value="bearer">Bearer</option>
                                    </select>
                                </div>
                                <p className="text-xs text-gray-600 mt-1.5">
                                    Sent as <span className="font-mono">{authType === "bearer" ? "Authorization: Bearer <key>" : "X-API-Key: <key>"}</span> on every call.
                                </p>
                            </div>

                            {/* Sample Payload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Sample Payload <span className="text-gray-600 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={payloadFormat}
                                    onChange={e => {
                                        setPayloadFormat(e.target.value);
                                        if (e.target.value.trim()) {
                                            try {
                                                JSON.parse(e.target.value.trim());
                                                setPayloadError(null);
                                            } catch {
                                                setPayloadError("Invalid JSON");
                                            }
                                        } else {
                                            setPayloadError(null);
                                        }
                                    }}
                                    placeholder={'{\n  "customer_phone": "9876543210",\n  "name": "John Doe",\n  "campaign": "sales"\n}'}
                                    rows={5}
                                    className={`w-full bg-dark-bg border rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none transition-colors resize-y ${
                                        payloadError ? "border-red-500/60 focus:border-red-500" : "border-gray-700 focus:border-teal-500"
                                    }`}
                                    disabled={isRunning}
                                />
                                {payloadError ? (
                                    <p className="text-xs text-red-400 mt-1.5">{payloadError}</p>
                                ) : (
                                    <p className="text-xs text-gray-600 mt-1.5">
                                        Paste a sample JSON payload with real values. An AI will map fields to your test case parameters automatically.
                                    </p>
                                )}
                            </div>

                            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}
                            <div className="flex justify-end gap-3 pt-1">
                                <Button variant="outline" onClick={handleClose} disabled={isRunning}>Cancel</Button>
                                <Button variant="primary" onClick={handleRun} disabled={!endpoint.trim() || isRunning || selectedIds.length === 0 || !!payloadError} loading={isRunning} icon={!isRunning && <Play className="w-4 h-4" />}>
                                    {isRunning ? "Triggering calls..." : `Run ${selectedIds.length > 0 ? `(${selectedIds.length})` : ""}`}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-dark-bg rounded-lg p-3 border border-gray-800"><div className="text-2xl font-bold text-white">{results.total}</div><div className="text-xs text-gray-500 mt-1">Total</div></div>
                                <div className="bg-dark-bg rounded-lg p-3 border border-teal-500/20"><div className="text-2xl font-bold text-teal-400">{results.triggered_count}</div><div className="text-xs text-gray-500 mt-1">Triggered</div></div>
                                <div className="bg-dark-bg rounded-lg p-3 border border-red-500/20"><div className="text-2xl font-bold text-red-400">{results.failed_count}</div><div className="text-xs text-gray-500 mt-1">Failed</div></div>
                            </div>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {results.results.map(r => (
                                    <div key={r.tc_id} className={`flex items-start gap-3 rounded-lg p-3 border text-sm ${r.call_triggered ? "bg-teal-500/5 border-teal-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${r.call_triggered ? "bg-teal-400" : "bg-red-400"}`} />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-mono text-gray-400 text-xs truncate">{r.tc_id}</div>
                                            {r.error && <div className="text-red-400 text-xs mt-0.5">{r.error}</div>}
                                            {r.call_triggered && <div className="text-gray-500 text-xs mt-0.5">HTTP {r.call_response_status}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-1"><Button variant="outline" onClick={handleClose}>Close</Button></div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const AgentDetailPage = () => {
    const navigate = useNavigate();
    const { agentId } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const [showGenerateFlowModal, setShowGenerateFlowModal] = useState(false);
    const [showGenerateTestSuiteModal, setShowGenerateTestSuiteModal] = useState(false);
    const [showCreateTestCaseModal, setShowCreateTestCaseModal] = useState(false);
    const [selectedFlowForTestGen, setSelectedFlowForTestGen] = useState(null);
    const [showFlowDiagramModal, setShowFlowDiagramModal] = useState(false);
    const [selectedFlowForDiagram, setSelectedFlowForDiagram] = useState(null);

    // Fetch agent data
    const { data: agent, isLoading, error, refetch } = useAgent(agentId);

    // Fetch flows for this agent
    const { data: flowsData, isLoading: flowsLoading, refetch: refetchFlows } = useAgentFlows(agentId);
    const flows = flowsData?.flows || [];

    // Fetch input params for this agent
    const { data: agentParams, isLoading: paramsLoading } = useAgentParams(agentId);

    // Fetch v2 test cases for this agent
    const { data: testCasesData, isLoading: testCasesLoading, error: testCasesError, refetch: refetchTestCases } = useTestCases(agentId);
    const testCases = testCasesData || [];
    const [tcSearchQuery, setTcSearchQuery] = useState("");
    const [selectedTcRows, setSelectedTcRows] = useState([]);
    const [showRunModal, setShowRunModal] = useState(false);

    // Param modal state: null = closed, 'add' = new, object = editing
    const [paramModal, setParamModal] = useState(null);
    const [paramForm, setParamForm] = useState({ key: "", value_type: "string", description: "" });

    // Mutations
    const deleteAgent = useDeleteAgent();
    const deleteFlow = useDeleteFlow();
    const createTestSuite = useCreateTestSuite();
    const reExtractAgent = useReExtractAgent();
    const createParam = useCreateParam(agentId);
    const updateParam = useUpdateParam(agentId);
    const deleteParam = useDeleteParam(agentId);


    // Handler functions

    const handleReExtract = async () => {
        if (confirm("Re-extract agent configuration? This will fetch the latest configuration from the platform.")) {
            try {
                // Use stored values from the agent
                // Platform might be stored as 'provider' or 'platform'
                const platform = agent.platform || agent.provider || 'vapi';

                const reExtractData = {
                    platform: platform.toLowerCase(),
                    agent_id: agent.agent_id,
                };

                // Add api_key - check multiple possible locations
                const apiKey = agent.api_key ||
                    agent.metadata?.api_key ||
                    agent.credentials?.api_key;

                if (apiKey) {
                    reExtractData.api_key = apiKey;
                }

                await reExtractAgent.mutateAsync(reExtractData);

                toast.success("Agent configuration re-extracted successfully!");

                // Refetch agent data to show updated config
                await refetch();
            } catch (error) {
                // Error handled by global interceptor
            }
        }
    };


    const handleGenerateFlow = () => {
        setShowGenerateFlowModal(true);
    };

    const handleGenerateTestSuiteFromFlow = (flow) => {
        setSelectedFlowForTestGen(flow);
        setShowGenerateTestSuiteModal(true);
    };

    const handleTestSuiteGenerated = async (testSuiteData) => {
        setShowGenerateTestSuiteModal(false);
        setSelectedFlowForTestGen(null);
        // Force refetch test suites - need to use useQueryClient
        // Wait a bit for backend to save, then refetch
        setTimeout(async () => {
            window.location.reload(); // Simple reload to ensure fresh data
        }, 500);
    };

    const handleDeleteFlow = async (flowId) => {
        if (confirm("Are you sure you want to delete this flow?")) {
            try {
                await deleteFlow.mutateAsync(flowId);
                toast.success("Flow deleted successfully");
                await refetchFlows();
            } catch (error) {
                // Error handled by global interceptor
            }
        }
    };

    const handleCreateTestSuite = async (formData) => {
        try {
            await createTestSuite.mutateAsync({
                ...formData,
                agent_id: agentId,
                test_cases: [],
            });
            setShowCreateTestCaseModal(false);
            toast.success("Test suite created successfully");
        } catch (error) {
            // Error handled by global interceptor
        }
    };

    const handleCopySystemPrompt = () => {
        if (systemPrompt) {
            navigator.clipboard.writeText(systemPrompt);
            toast.success("System prompt copied to clipboard");
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
        { id: "configuration", label: "Configuration", icon: <Settings className="w-4 h-4" /> },
        { id: "test-cases", label: "Test Cases", icon: <FileText className="w-4 h-4" /> },
    ];

    if (isLoading) {
        return <DashboardLoader message="Loading agent details..." />;
    }

    if (error || !agent) {
        return (
            <div className="p-8">
                <div className="text-center py-12">
                    <div className="text-red-400 text-lg mb-4">Failed to load agent</div>
                    <Button onClick={() => navigate("/agents")}>Back to Agents</Button>
                </div>
            </div>
        );
    }

    const getPlatformColor = (platform) => {
        const colors = {
            vapi: "from-purple-400 to-pink-500",
            elevenlabs: "from-orange-400 to-red-500",
            cartesia: "from-teal-400 to-blue-500",
        };
        return colors[platform?.toLowerCase()] || "from-gray-400 to-gray-600";
    };

    const getStatusBadge = (status) => {
        const variants = {
            active: "success",
            inactive: "warning",
            error: "danger",
        };
        return variants[status?.toLowerCase()] || "default";
    };

    const metadata = agent.metadata || {};
    const config = metadata.configuration || {};
    const tools = config.tools || [];
    const systemPrompt = metadata.system_prompt || config.system_prompt || "No system prompt configured";

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/agents")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Agents
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 bg-gradient-to-br ${getPlatformColor(agent.platform)} rounded-xl flex items-center justify-center`}>
                                <Bot className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">
                                    {agent.name}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span>{agent.provider}</span>
                                    <span>•</span>
                                    <span>
                                        Created {new Date(agent.created_at).toLocaleDateString()}
                                    </span>
                                    {agent.phone_number && (
                                        <>
                                            <span>•</span>
                                            <span>{agent.phone_number}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadge(agent.status)}>
                                {agent.status || "Unknown"}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-800 mb-8">
                    <div className="flex items-center gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? 'text-teal-400 border-b-2 border-teal-400'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <div className="text-sm text-gray-400 mb-2">Platform</div>
                                <div className="text-2xl font-bold text-white mb-2 capitalize">{agent.platform}</div>
                                <Badge variant={getStatusBadge(agent.status)} size="sm">
                                    {agent.status === "active" ? "Connected" : agent.status}
                                </Badge>
                                <div className="text-xs text-gray-500 mt-2">
                                    Last sync: {new Date(agent.updated_at).toLocaleString()}
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <div className="text-sm text-gray-400 mb-2">Extraction Status</div>
                                <div className="text-2xl font-bold text-white mb-2">
                                    {metadata.system_prompt ? "Extracted" : "Pending"}
                                </div>
                                <div className="text-sm text-gray-500">{tools.length} tools found</div>
                                {!metadata.system_prompt && (
                                    <Button variant="outline" size="sm" className="mt-2 w-full">
                                        Extract Now
                                    </Button>
                                )}
                            </div>

                            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <div className="text-sm text-gray-400 mb-2">Test Cases</div>
                                <div className="text-2xl font-bold text-teal-400 mb-2">
                                    {testCasesLoading ? "..." : testCases.length}
                                </div>
                                <button
                                    onClick={() => setActiveTab("test-cases")}
                                    className="text-sm text-gray-500 hover:text-teal-400 transition-colors"
                                >
                                    View all →
                                </button>
                            </div>

                            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <div className="text-sm text-gray-400 mb-2">Flows</div>
                                <div className="text-2xl font-bold text-purple-400 mb-2">
                                    {flowsLoading ? "..." : flows.length}
                                </div>
                                <button
                                    onClick={() => setActiveTab("flows")}
                                    className="text-sm text-gray-500 hover:text-teal-400 transition-colors"
                                >
                                    View all →
                                </button>
                            </div>
                        </div>

                        {/* Agent Information */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <h3 className="text-lg font-semibold text-white mb-4">Agent Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Agent ID</div>
                                    <div className="text-white font-mono text-sm">{agent.agent_id}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Phone Number</div>
                                    <div className="text-white">{agent.phone_number || "Not configured"}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Direction</div>
                                    <div className="text-white capitalize">{agent.direction || "Not specified"}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Created</div>
                                    <div className="text-white">{new Date(agent.created_at).toLocaleString()}</div>
                                </div>
                                <div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleReExtract}
                                    disabled={reExtractAgent.isPending}
                                >
                                    {reExtractAgent.isPending ? "Re-extracting..." : "Re-extract Config"}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleGenerateFlow}
                                >
                                    Generate Flow
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowCreateTestCaseModal(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Test Case
                                </Button>
                            </div>
                        </div>

                        {/* Flows Section in Overview */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Flows</h3>
                                <Button
                                    size="sm"
                                    onClick={handleGenerateFlow}
                                    className="bg-teal-400 hover:bg-teal-500 text-white"
                                >
                                    Generate New Flow
                                </Button>
                            </div>
                            {flowsLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading flows...</div>
                            ) : flows.length > 0 ? (
                                <div className="space-y-4">
                                    {flows.map((flow) => (
                                        <div
                                            key={flow.flow_id}
                                            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-teal-400/50 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="text-white font-semibold mb-1">{flow.name}</h4>
                                                    {flow.description && (
                                                        <p className="text-gray-400 text-sm mb-2">{flow.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-gray-500">
                                                            {new Date(flow.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedFlowForDiagram(flow);
                                                        setShowFlowDiagramModal(true);
                                                    }}
                                                >
                                                    Preview
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleGenerateTestSuiteFromFlow(flow)}
                                                >
                                                    Generate Test Suite
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteFlow(flow.flow_id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-500 mb-2">No flows generated yet</div>
                                    <Button size="sm" onClick={handleGenerateFlow}>
                                        Generate Flow
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "configuration" && (
                    <div className="space-y-8">
                        {/* System Prompt */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">System Prompt</h3>
                                <button
                                    onClick={handleCopySystemPrompt}
                                    className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy
                                </button>
                            </div>
                            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                {systemPrompt}
                            </div>
                        </div>

                        {/* Tools & Functions */}
                        {tools && tools.length > 0 && (
                            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Tools & Functions ({tools.length})
                                </h3>
                                <div className="space-y-3">
                                    {tools.map((tool, index) => (
                                        <div key={index} className="bg-gray-950 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-medium text-white">{tool.name || tool.type || `Tool ${index + 1}`}</div>
                                                <Badge variant="info" size="sm">Enabled</Badge>
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {tool.description || "No description available"}
                                            </div>
                                            {tool.parameters && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Parameters: {Object.keys(tool.parameters).join(", ")}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Parameters */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">
                                    Input Parameters ({agentParams?.length ?? 0})
                                </h3>
                                <button
                                    onClick={() => {
                                        setParamForm({ key: "", value_type: "string", description: "" });
                                        setParamModal("add");
                                    }}
                                    className="flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 transition-colors"
                                >
                                    <Plus size={15} />
                                    Add Parameter
                                </button>
                            </div>
                            {paramsLoading ? (
                                <div className="text-center py-6 text-gray-500">Loading...</div>
                            ) : agentParams?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-gray-400 text-xs border-b border-gray-800">
                                                <th className="text-left pb-2 pr-4">Key</th>
                                                <th className="text-left pb-2 pr-4">Type</th>
                                                <th className="text-left pb-2">Description</th>
                                                <th className="pb-2" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {agentParams.map((param) => (
                                                <tr key={param.param_id} className="group">
                                                    <td className="py-2 pr-4 font-mono text-teal-400">{param.key}</td>
                                                    <td className="py-2 pr-4">
                                                        <Badge variant="info" size="sm">{param.value_type}</Badge>
                                                    </td>
                                                    <td className="py-2 text-gray-400">{param.description || "—"}</td>
                                                    <td className="py-2 pl-4">
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    setParamForm({ key: param.key, value_type: param.value_type, description: param.description || "" });
                                                                    setParamModal(param);
                                                                }}
                                                                className="text-gray-400 hover:text-white transition-colors"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm(`Delete parameter "${param.key}"?`)) return;
                                                                    try {
                                                                        await deleteParam.mutateAsync(param.param_id);
                                                                        toast.success("Parameter deleted");
                                                                    } catch {
                                                                        toast.error("Failed to delete parameter");
                                                                    }
                                                                }}
                                                                className="text-gray-400 hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No input parameters defined
                                </div>
                            )}
                        </div>

                        {/* Add / Edit Param Modal */}
                        {paramModal !== null && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-xl">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-semibold text-white">
                                            {paramModal === "add" ? "Add Parameter" : "Edit Parameter"}
                                        </h3>
                                        <button onClick={() => setParamModal(null)} className="text-gray-400 hover:text-white">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Key <span className="text-red-400">*</span></label>
                                            <input
                                                type="text"
                                                value={paramForm.key}
                                                onChange={(e) => setParamForm((f) => ({ ...f, key: e.target.value }))}
                                                placeholder="e.g. customer_name"
                                                disabled={paramModal !== "add"}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-400 disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Type <span className="text-red-400">*</span></label>
                                            <select
                                                value={paramForm.value_type}
                                                onChange={(e) => setParamForm((f) => ({ ...f, value_type: e.target.value }))}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400"
                                            >
                                                <option value="string">string</option>
                                                <option value="number">number</option>
                                                <option value="boolean">boolean</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                                            <input
                                                type="text"
                                                value={paramForm.description}
                                                onChange={(e) => setParamForm((f) => ({ ...f, description: e.target.value }))}
                                                placeholder="Optional description"
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button onClick={() => setParamModal(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                                            Cancel
                                        </button>
                                        <Button
                                            size="sm"
                                            onClick={async () => {
                                                if (!paramForm.key.trim()) { toast.error("Key is required"); return; }
                                                try {
                                                    if (paramModal === "add") {
                                                        await createParam.mutateAsync({ key: paramForm.key.trim(), value_type: paramForm.value_type, description: paramForm.description.trim() || undefined });
                                                        toast.success("Parameter added");
                                                    } else {
                                                        await updateParam.mutateAsync({ paramId: paramModal.param_id, data: { value_type: paramForm.value_type, description: paramForm.description.trim() || undefined } });
                                                        toast.success("Parameter updated");
                                                    }
                                                    setParamModal(null);
                                                } catch {
                                                    toast.error(paramModal === "add" ? "Failed to add parameter" : "Failed to update parameter");
                                                }
                                            }}
                                            disabled={createParam.isPending || updateParam.isPending}
                                        >
                                            {createParam.isPending || updateParam.isPending ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Model Configuration (hide if no configuration from backend) */}
                        {config && Object.keys(config).length > 0 && (
                            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <h3 className="text-lg font-semibold text-white mb-4">Model Configuration</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Model</div>
                                        <div className="text-white">{config.model || agent.model_type || "Not specified"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Temperature</div>
                                        <div className="text-white">{config.temperature ?? "Default"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Max Tokens</div>
                                        <div className="text-white">{config.max_tokens || "Default"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Provider</div>
                                        <div className="text-white capitalize">{config.provider || agent.platform}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Voice Settings */}
                        {(agent.platform === "elevenlabs" || agent.platform === "cartesia" || config.voice) && (
                            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <h3 className="text-lg font-semibold text-white mb-4">Voice Settings</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Voice Provider</div>
                                        <div className="text-white capitalize">{agent.platform}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Voice ID</div>
                                        <div className="text-white font-mono text-sm">
                                            {config.voice?.voice_id || config.voice_id || "Default"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                        {activeTab === "test-cases" && (
                    <div className="space-y-6">
                        {/* Header row */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-1">Test Cases</h3>
                                <p className="text-gray-400 text-sm">{testCases.length} test case{testCases.length !== 1 ? "s" : ""} for this agent</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={() => setShowCreateTestCaseModal(true)}
                                >
                                    Create Test Case
                                </Button>
                                {testCases.length > 0 && (
                                    <Button
                                        variant="primary"
                                        icon={<Play className="w-4 h-4" />}
                                        onClick={() => setShowRunModal(true)}
                                    >
                                        Run Simulations{selectedTcRows.length > 0 ? ` (${selectedTcRows.length})` : ""}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Search test cases..."
                                value={tcSearchQuery}
                                onChange={(e) => setTcSearchQuery(e.target.value)}
                                className="w-full bg-dark-bg border border-gray-800 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-teal-500 transition-colors text-white placeholder-gray-500"
                            />
                        </div>

                        {/* Error */}
                        {testCasesError && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
                                Error loading test cases: {testCasesError.message}
                            </div>
                        )}

                        {/* Table */}
                        <div className="bg-dark-bg rounded-xl overflow-hidden border border-gray-800/50">
                            <Table
                                columns={[
                                    {
                                        key: "scenario_config",
                                        label: "Scenario",
                                        sortable: false,
                                        render: (sc) => {
                                            const config = sc || {};
                                            return (
                                                <div>
                                                    <div className="font-medium text-white">{config.config_name || "-"}</div>
                                                    {config.objective && (
                                                        <div className="text-xs text-gray-500 truncate max-w-md">{config.objective}</div>
                                                    )}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        key: "scenario_config_speaker",
                                        label: "Speaker",
                                        sortable: false,
                                        render: (_, row) => (row.scenario_config && row.scenario_config.speaker_name) || "-",
                                    },
                                    {
                                        key: "scenario_config_language",
                                        label: "Language",
                                        sortable: false,
                                        render: (_, row) => {
                                            const sc = row.scenario_config;
                                            if (!sc) return "-";
                                            const parts = [sc.primary_language || ""];
                                            if (sc.code_switching && sc.secondary_language) parts.push(sc.secondary_language);
                                            return parts.filter(Boolean).join(" / ") || "-";
                                        },
                                    },
                                    {
                                        key: "bg_noise_config",
                                        label: "Noise Profile",
                                        sortable: false,
                                        render: (cfg) => cfg?.profile
                                            ? <Badge variant="default" size="sm">{cfg.profile}</Badge>
                                            : "-",
                                    },
                                    {
                                        key: "tc_id",
                                        label: "Test Case ID",
                                        sortable: false,
                                        render: (value) => (
                                            <div className="text-xs text-gray-500 font-mono truncate max-w-xs">{value}</div>
                                        ),
                                    },
                                ]}
                                data={testCases.filter(tc => {
                                    if (!tcSearchQuery) return true;
                                    const q = tcSearchQuery.toLowerCase();
                                    const sc = tc.scenario_config || {};
                                    return (
                                        (sc.config_name || "").toLowerCase().includes(q) ||
                                        (sc.objective || "").toLowerCase().includes(q) ||
                                        (sc.speaker_name || "").toLowerCase().includes(q) ||
                                        (tc.tc_id || "").toLowerCase().includes(q)
                                    );
                                })}
                                loading={testCasesLoading}
                                selectable
                                selectedRows={selectedTcRows}
                                onSelectionChange={setSelectedTcRows}
                                primaryKey="tc_id"
                                onRowClick={(row) => {
                                    const configId = row.scenario_config?.config_id || row.scenario_config_id;
                                    if (configId) navigate(`/testing/scenario-configs/${configId}`);
                                }}
                                emptyMessage="No test cases found for this agent."
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Generate Flow Modal */}
            <GenerateFlowModal
                isOpen={showGenerateFlowModal}
                onClose={() => setShowGenerateFlowModal(false)}
                agentId={agentId}
                onFlowGenerated={refetchFlows}
            />

            {/* Generate Test Suite from Flow Modal */}
            {selectedFlowForTestGen && (
                <GenerateTestSuiteModal
                    isOpen={showGenerateTestSuiteModal}
                    onClose={() => {
                        setShowGenerateTestSuiteModal(false);
                        setSelectedFlowForTestGen(null);
                    }}
                    flowId={selectedFlowForTestGen.flow_id}
                    agentId={agentId}
                    onTestSuiteGenerated={handleTestSuiteGenerated}
                />
            )}

            {/* Create Test Case Modal (unified: AI or Manual) */}
            <CreateTestCaseModal
                isOpen={showCreateTestCaseModal}
                onClose={() => setShowCreateTestCaseModal(false)}
                agentId={agentId}
                agents={[agent]}
                onSubmitAI={handleCreateTestSuite}
                isLoadingAI={createTestSuite.isPending}
                onCreated={() => {
                    refetchTestCases?.();
                }}
            />

            {/* Flow Diagram Modal */}
            {selectedFlowForDiagram && (
                <FlowDiagramModal
                    isOpen={showFlowDiagramModal}
                    onClose={() => {
                        setShowFlowDiagramModal(false);
                        setSelectedFlowForDiagram(null);
                    }}
                    flowId={selectedFlowForDiagram.flow_id}
                    flowName={selectedFlowForDiagram.name}
                />
            )}

            {/* Run Simulations Modal */}
            <RunSimulationsModal
                isOpen={showRunModal}
                onClose={() => setShowRunModal(false)}
                allTestCases={testCases.filter(tc => {
                    if (!tcSearchQuery) return true;
                    const q = tcSearchQuery.toLowerCase();
                    const sc = tc.scenario_config || {};
                    return (
                        (sc.config_name || "").toLowerCase().includes(q) ||
                        (sc.objective || "").toLowerCase().includes(q) ||
                        (sc.speaker_name || "").toLowerCase().includes(q) ||
                        (tc.tc_id || "").toLowerCase().includes(q)
                    );
                })}
                preSelected={selectedTcRows.map(r => r.tc_id)}
            />
        </div>
    );
};

export default AgentDetailPage;