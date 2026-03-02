import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Play, Plus, X, CheckSquare, Square } from 'lucide-react';
import { useTestCases } from "../../hooks/useTestCases";
import { useAgents } from "../../hooks/useAgents";
import { useCreateTestSuite } from "../../hooks/useTestSuites";
import { outboundSimApi } from "../../utils/api";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import GenericDropdown from "../../components/DropDown";
import SimulationAgentDirectoriesView from "../../components/SimulationAgentDirectoriesView";
import CreateTestCaseModal from "../../components/CreateTestCaseModal";

// ---------- Run Simulations Modal ----------

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

    // Pre-populate selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedIds(
                preSelected.length > 0
                    ? preSelected
                    : allTestCases.map(tc => tc.tc_id)
            );
            setResults(null);
            setError(null);
        }
    }, [isOpen]);

    const allSelected = selectedIds.length === allTestCases.length;
    const toggleAll = () =>
        setSelectedIds(allSelected ? [] : allTestCases.map(tc => tc.tc_id));
    const toggleOne = (id) =>
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );

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
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 shadow-xl">
                {/* Header */}
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
                                    <label className="text-sm font-medium text-gray-300">
                                        Select Test Cases
                                    </label>
                                    <button
                                        onClick={toggleAll}
                                        className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors"
                                        disabled={isRunning}
                                    >
                                        {allSelected
                                            ? <><CheckSquare className="w-3.5 h-3.5" /> Deselect all</>
                                            : <><Square className="w-3.5 h-3.5" /> Select all</>
                                        }
                                    </button>
                                </div>
                                <div className="bg-dark-bg rounded-lg border border-gray-800 divide-y divide-gray-800/60 max-h-52 overflow-y-auto">
                                    {allTestCases.map(tc => {
                                        const checked = selectedIds.includes(tc.tc_id);
                                        const name = tc.scenario_config?.config_name || tc.tc_id;
                                        const objective = tc.scenario_config?.objective;
                                        return (
                                            <label
                                                key={tc.tc_id}
                                                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/40 transition-colors ${isRunning ? "pointer-events-none opacity-60" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleOne(tc.tc_id)}
                                                    className="mt-0.5 accent-teal-500 w-4 h-4 flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <div className="text-sm text-white font-medium truncate">{name}</div>
                                                    {objective && (
                                                        <div className="text-xs text-gray-500 truncate">{objective}</div>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-600 mt-1.5">
                                    {selectedIds.length} of {allTestCases.length} selected
                                </p>
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

                            {/* Endpoint input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Call Trigger Endpoint
                                </label>
                                <input
                                    type="text"
                                    value={endpoint}
                                    onChange={e => setEndpoint(e.target.value)}
                                    placeholder="https://your-agent-endpoint/outbound"
                                    className="w-full bg-dark-bg border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                                    disabled={isRunning}
                                />
                                <p className="text-xs text-gray-600 mt-1.5">
                                    Each test case's params will be resolved and POSTed to this URL.
                                </p>
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

                            {/* Error */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-1">
                                <Button variant="outline" onClick={handleClose} disabled={isRunning}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleRun}
                                    disabled={!endpoint.trim() || isRunning || selectedIds.length === 0 || !!payloadError}
                                    loading={isRunning}
                                    icon={!isRunning && <Play className="w-4 h-4" />}
                                >
                                    {isRunning ? "Triggering calls..." : `Run ${selectedIds.length > 0 ? `(${selectedIds.length})` : ""}`}
                                </Button>
                            </div>
                        </>
                    ) : (
                        /* Results view */
                        <>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-dark-bg rounded-lg p-3 border border-gray-800">
                                    <div className="text-2xl font-bold text-white">{results.total}</div>
                                    <div className="text-xs text-gray-500 mt-1">Total</div>
                                </div>
                                <div className="bg-dark-bg rounded-lg p-3 border border-teal-500/20">
                                    <div className="text-2xl font-bold text-teal-400">{results.triggered_count}</div>
                                    <div className="text-xs text-gray-500 mt-1">Triggered</div>
                                </div>
                                <div className="bg-dark-bg rounded-lg p-3 border border-red-500/20">
                                    <div className="text-2xl font-bold text-red-400">{results.failed_count}</div>
                                    <div className="text-xs text-gray-500 mt-1">Failed</div>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {results.results.map(r => (
                                    <div
                                        key={r.tc_id}
                                        className={`flex items-start gap-3 rounded-lg p-3 border text-sm ${
                                            r.call_triggered
                                                ? "bg-teal-500/5 border-teal-500/20"
                                                : "bg-red-500/5 border-red-500/20"
                                        }`}
                                    >
                                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${r.call_triggered ? "bg-teal-400" : "bg-red-400"}`} />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-mono text-gray-400 text-xs truncate">{r.tc_id}</div>
                                            {r.error && <div className="text-red-400 text-xs mt-0.5">{r.error}</div>}
                                            {r.call_triggered && (
                                                <div className="text-gray-500 text-xs mt-0.5">
                                                    HTTP {r.call_response_status}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-1">
                                <Button variant="outline" onClick={handleClose}>Close</Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ---------- Main Page ----------

const TestCasesPage = () => {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [agentFilter, setAgentFilter] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [showRunModal, setShowRunModal] = useState(false);
    const [showCreateTestCaseModal, setShowCreateTestCaseModal] = useState(false);

    const { data, isLoading, error, refetch: refetchTestCases } = useTestCases(agentFilter);

    const { data: agentsData } = useAgents({ limit: 100 });
    const createTestSuite = useCreateTestSuite();

    const agentOptions = useMemo(() => [
        { label: "All Agents", value: "" },
        ...(agentsData?.agents?.map(agent => ({
            label: (agent?.name || agent?.agent_name)
                ? `${agent?.name || agent?.agent_name} (${agent?.agent_id})`
                : agent?.agent_id,
            value: agent.agent_id,
        })) || [])
    ], [agentsData]);

    const selectedAgentName = useMemo(() => {
        if (!agentFilter || !agentsData?.agents) return agentFilter;
        const agent = agentsData.agents.find(
            a => a.agent_id === agentFilter || a.provider_agent_id === agentFilter
        );
        return agent?.name || agent?.agent_name || agentFilter;
    }, [agentFilter, agentsData]);

    const filteredData = useMemo(() => {
        if (!data) return [];
        if (!searchQuery) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(tc => {
            const sc = tc.scenario_config || {};
            return (
                (sc.config_name || "").toLowerCase().includes(q) ||
                (sc.objective || "").toLowerCase().includes(q) ||
                (sc.speaker_name || "").toLowerCase().includes(q) ||
                (tc.tc_id || "").toLowerCase().includes(q)
            );
        });
    }, [data, searchQuery]);

    const columns = [
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
            key: "interruption_config",
            label: "Interruption",
            sortable: false,
            render: (value) => {
                const variantMap = { low: "success", medium: "warning", high: "danger" };
                const level = value || "medium";
                return <Badge variant={variantMap[level] || "default"} size="sm">{level}</Badge>;
            },
        },
        {
            key: "tc_id",
            label: "Test Case ID",
            sortable: false,
            render: (value) => (
                <div className="text-xs text-gray-500 font-mono truncate max-w-xs">{value}</div>
            ),
        },
    ];

    if (!agentFilter) {
        return (
            <div className="p-8 bg-dark-bg min-h-screen text-white">
                <div className="w-full max-w-screen-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Test Cases</h1>
                        <p className="text-gray-400">Select an agent to view its test cases</p>
                    </div>
                    <SimulationAgentDirectoriesView
                        onAgentSelect={(agentId) => setAgentFilter(agentId)}
                        showHeader={true}
                        showAllAgents={true}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-dark-bg min-h-screen text-white">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Test Cases</h1>
                        <p className="text-gray-400">Test cases for agent: {selectedAgentName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => setShowCreateTestCaseModal(true)}
                        >
                            Create Test Case
                        </Button>
                        {filteredData.length > 0 && (
                            <Button
                                variant="primary"
                                icon={<Play className="w-4 h-4" />}
                                onClick={() => setShowRunModal(true)}
                            >
                                Run Simulations{selectedRows.length > 0 ? ` (${selectedRows.length})` : ""}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Search test cases..."
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
                        <button
                            onClick={() => {}}
                            className="bg-dark-panel border border-gray-800 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3 text-red-400">
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <p>Error loading test cases: {error.message}</p>
                    </div>
                )}

                {/* Table */}
                <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
                    <Table
                        columns={columns}
                        data={filteredData}
                        loading={isLoading}
                        selectable
                        selectedRows={selectedRows}
                        onSelectionChange={setSelectedRows}
                        primaryKey="tc_id"
                        onRowClick={(row) => {
                            const configId = row.scenario_config?.config_id || row.scenario_config_id;
                            if (configId) navigate(`/testing/scenario-configs/${configId}`);
                        }}
                        emptyMessage="No test cases found for the selected agent."
                    />
                </div>
            </div>

            <RunSimulationsModal
                isOpen={showRunModal}
                onClose={() => setShowRunModal(false)}
                allTestCases={filteredData}
                preSelected={selectedRows.map(r => r.tc_id)}
            />

            <CreateTestCaseModal
                isOpen={showCreateTestCaseModal}
                onClose={() => setShowCreateTestCaseModal(false)}
                agentId={agentFilter}
                agents={agentsData?.agents || []}
                onSubmitAI={async (suiteData) => {
                    await createTestSuite.mutateAsync(suiteData);
                    setShowCreateTestCaseModal(false);
                }}
                isLoadingAI={createTestSuite.isPending}
                onCreated={() => {
                    refetchTestCases?.();
                }}
            />
        </div>
    );
};

export default TestCasesPage;
