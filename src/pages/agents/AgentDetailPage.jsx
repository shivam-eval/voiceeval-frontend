import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import { useAgent, useTestAgent, useDeleteAgent } from "../../hooks/useAgents";
import { useTestSuites } from "../../hooks/useTestSuites";
import { useGenerateFlow } from "../../hooks/useGeneration";
import DashboardLoader from "../../components/DashboardLoader";
import GenerateFlowModal from "../../components/GenerateFlowModal";
import CreateTestSuiteModal from "../../components/CreateTestSuiteModal";
import { useCreateTestSuite } from "../../hooks/useTestSuites";

const AgentDetailPage = () => {
    const navigate = useNavigate();
    const { agentId } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const [showGenerateFlowModal, setShowGenerateFlowModal] = useState(false);
    const [showCreateTestSuiteModal, setShowCreateTestSuiteModal] = useState(false);
    
    // Fetch agent data
    const { data: agent, isLoading, error, refetch } = useAgent(agentId);
    
    // Fetch test suites for this agent
    const { data: testSuitesData, isLoading: testSuitesLoading } = useTestSuites({ agent_id: agentId });
    const testSuites = testSuitesData?.test_suites || [];
    
    // Mutations
    const testAgent = useTestAgent();
    const deleteAgent = useDeleteAgent();
    const generateFlow = useGenerateFlow();
    const createTestSuite = useCreateTestSuite();

    // Handler functions
    const handleTestConnection = async () => {
        try {
            const result = await testAgent.mutateAsync(agentId);
            alert(result.success ? "Connection successful!" : `Connection failed: ${result.message}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };
    
    const handleReExtract = async () => {
        if (confirm("Re-extract agent configuration? This will overwrite existing data.")) {
            try {
                await deleteAgent.mutateAsync(agentId);
                alert("Agent deleted. Please reconnect to re-extract.");
                navigate("/agents");
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };
    
    const handleGenerateFlow = () => {
        setShowGenerateFlowModal(true);
    };
    
    const handleFlowGenerated = async (flowData) => {
        setShowGenerateFlowModal(false);
        await refetch();
    };
    
    const handleCreateTestSuite = async (formData) => {
        try {
            await createTestSuite.mutateAsync({
                ...formData,
                agent_id: agentId,
                test_cases: [],
            });
            setShowCreateTestSuiteModal(false);
        } catch (error) {
            alert(error.message);
        }
    };
    
    const tabs = [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "configuration", label: "Configuration", icon: "⚙️" },
        { id: "flows", label: "Flows", icon: "🔄" },
        { id: "test-suites", label: "Test Suites", icon: "📋" },
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
                            <div className={`w-16 h-16 bg-gradient-to-br ${getPlatformColor(agent.platform)} rounded-xl flex items-center justify-center text-3xl`}>
                                🤖
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">
                                    {agent.agent_name || agent.agent_id}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span>Platform: {agent.platform}</span>
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
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleTestConnection}
                                disabled={testAgent.isPending}
                            >
                                {testAgent.isPending ? "Testing..." : "Test"}
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleGenerateFlow}
                            >
                                ⚡ Generate Flow
                            </Button>
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
                                className={`px-6 py-3 font-medium transition-all ${activeTab === tab.id
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
                                <div className="text-sm text-gray-400 mb-2">Test Suites</div>
                                <div className="text-2xl font-bold text-teal-400 mb-2">
                                    {testSuitesLoading ? "..." : testSuites.length}
                                </div>
                                <button 
                                    onClick={() => setActiveTab("test-suites")}
                                    className="text-sm text-gray-500 hover:text-teal-400 transition-colors"
                                >
                                    View all →
                                </button>
                            </div>

                            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <div className="text-sm text-gray-400 mb-2">Flows</div>
                                <div className="text-2xl font-bold text-teal-400 mb-2">
                                    {metadata.flow_data ? "1" : "0"}
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
                                    <div className="text-sm text-gray-400 mb-1">Model Type</div>
                                    <div className="text-white">{agent.model_type || "Not specified"}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Created</div>
                                    <div className="text-white">{new Date(agent.created_at).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Last Updated</div>
                                    <div className="text-white">{new Date(agent.updated_at).toLocaleString()}</div>
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
                                    onClick={handleTestConnection}
                                    disabled={testAgent.isPending}
                                >
                                    {testAgent.isPending ? "Testing..." : "Test Connection"}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={handleReExtract}
                                >
                                    Re-extract Config
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
                                    onClick={() => setShowCreateTestSuiteModal(true)}
                                >
                                    Create Test Suite
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "configuration" && (
                    <div className="space-y-8">
                        {/* System Prompt */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">System Prompt</h3>
                                <button className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
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
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Tools & Functions ({tools.length})
                            </h3>
                            {tools.length > 0 ? (
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
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No tools configured
                                </div>
                            )}
                        </div>

                        {/* Model Configuration */}
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

                {activeTab === "flows" && (
                    <div className="space-y-6">
                        {metadata.flow_data ? (
                            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Generated Flow</h3>
                                        <p className="text-sm text-gray-400">
                                            Generated {new Date(agent.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/workspace?agent=${agentId}`)}>View Diagram</Button>
                                        <Button variant="outline" size="sm" onClick={() => setShowCreateTestSuiteModal(true)}>Generate Test Suite</Button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-gray-400">Flow extracted</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔄</div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Flows Generated</h3>
                                <p className="text-gray-400 mb-6">
                                    Generate a conversation flow from your agent configuration
                                </p>
                                <Button onClick={handleGenerateFlow}>Generate Flow</Button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "test-suites" && (
                    <div className="space-y-6">
                        {testSuitesLoading ? (
                            <DashboardLoader message="Loading test suites..." />
                        ) : testSuites.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-white">Test Suites for this Agent</h3>
                                    <Button size="sm" onClick={() => setShowCreateTestSuiteModal(true)}>
                                        Create Test Suite
                                    </Button>
                                </div>
                                {testSuites.map((suite) => (
                                    <div 
                                        key={suite._id} 
                                        onClick={() => navigate(`/test-cases/${suite._id}`)}
                                        className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-teal-400/50 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-white mb-2">{suite.name}</h4>
                                                {suite.description && (
                                                    <p className="text-gray-400 text-sm mb-3">{suite.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500">Test Cases:</span>
                                                        <span className="text-teal-400 font-medium">{suite.metadata?.total_cases || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500">Status:</span>
                                                        <Badge variant={suite.status === "ready" ? "success" : "default"} size="sm">
                                                            {suite.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500">Updated:</span>
                                                        <span className="text-white">{new Date(suite.updated_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📋</div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Test Suites</h3>
                                <p className="text-gray-400 mb-6">
                                    Create test suites to evaluate this agent
                                </p>
                                <Button onClick={() => setShowCreateTestSuiteModal(true)}>Create Test Suite</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Generate Flow Modal */}
            <GenerateFlowModal
                isOpen={showGenerateFlowModal}
                onClose={() => setShowGenerateFlowModal(false)}
                agentId={agent?.agent_id}
                agentMongoId={agentId}
                onFlowGenerated={handleFlowGenerated}
            />
            
            {/* Create Test Suite Modal */}
            <CreateTestSuiteModal
                isOpen={showCreateTestSuiteModal}
                onClose={() => setShowCreateTestSuiteModal(false)}
                onSubmit={handleCreateTestSuite}
                isLoading={createTestSuite.isPending}
                agents={[agent]}
                defaultAgentId={agentId}
            />
        </div>
    );
};

export default AgentDetailPage;
