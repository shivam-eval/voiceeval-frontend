import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { agentsApi, flowsApi } from "../../utils/api";
import WorkspaceDashboard from "./index";
import DashboardLoader from "../../components/DashboardLoader";

const WorkspaceLoader = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [systemConfig, setSystemConfig] = useState(null);

    const agentId = searchParams.get("agent");
    const flowId = searchParams.get("flow");

    useEffect(() => {
        if (!agentId) {
            setError("No agent ID provided");
            setLoading(false);
            return;
        }

        loadWorkspaceData();
    }, [agentId, flowId]);

    const loadWorkspaceData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch agent data
            const agent = await agentsApi.get(agentId);
            const systemPrompt = agent.metadata?.system_prompt || agent.metadata?.configuration?.system_prompt || "";

            // Fetch flows for this agent
            const flowsResponse = await flowsApi.listByAgent(agentId);
            const flows = flowsResponse?.flows || [];

            if (flows.length === 0) {
                setError("No flows found for this agent. Please generate a flow first.");
                setLoading(false);
                return;
            }

            // Use the specified flow or the most recent one
            let selectedFlow;
            if (flowId) {
                selectedFlow = flows.find(f => f.flow_id === flowId);
                if (!selectedFlow) {
                    setError("Flow not found");
                    setLoading(false);
                    return;
                }
            } else {
                // Get the most recent flow
                selectedFlow = flows[0];
            }

            // Fetch full flow data
            const fullFlow = await flowsApi.get(selectedFlow.flow_id);

            // Generate mermaid diagram
            const mermaidResponse = await flowsApi.getMermaid(selectedFlow.flow_id);

            // Build system config for WorkspaceDashboard
            const config = {
                systemPrompt: systemPrompt,
                flowData: {
                    name: fullFlow.name,
                    description: fullFlow.description,
                    nodes: fullFlow.nodes,
                    edges: fullFlow.edges,
                    metadata: fullFlow.metadata,
                },
                mermaid: mermaidResponse.mermaid,
            };

            setSystemConfig(config);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load workspace data:", err);
            setError(err.message || "Failed to load workspace data");
            setLoading(false);
        }
    };

    if (loading) {
        return <DashboardLoader message="Loading workspace..." />;
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-red-900/20 border border-red-500 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-red-400 mb-2">Error</h3>
                        <p className="text-gray-300 mb-4">{error}</p>
                        <button
                            onClick={() => navigate(`/agents/${agentId}`)}
                            className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg transition-colors"
                        >
                            Back to Agent
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!systemConfig) {
        return null;
    }

    return <WorkspaceDashboard systemConfig={systemConfig} />;
};

export default WorkspaceLoader;
