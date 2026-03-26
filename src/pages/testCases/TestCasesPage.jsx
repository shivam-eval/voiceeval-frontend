import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Play, Plus } from 'lucide-react';
import { useTestCases } from "../../hooks/useTestCases";
import { useAgents } from "../../hooks/useAgents";
import { useCreateTestSuite } from "../../hooks/useTestSuites";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import GenericDropdown from "../../components/DropDown";
import SimulationAgentDirectoriesView from "../../components/SimulationAgentDirectoriesView";
import CreateTestCaseModal from "../../components/CreateTestCaseModal";
import RunSimulationsModal from "../../components/RunSimulationsModal";

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
        {
            key: "created_at",
            label: "Generated",
            sortable: false,
            render: (value) => {
                if (!value) return <span className="text-gray-600">—</span>;
                const d = new Date(value);
                return (
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                        <div>{d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                        <div className="text-gray-600">{d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                    </div>
                );
            },
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
