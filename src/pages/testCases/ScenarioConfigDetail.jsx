import { useParams } from "react-router-dom";
import { useScenarioConfig } from "../../hooks/useScenarioConfigs";
import Button from "../../components/Button";
import Badge from "../../components/Badge";

const ScenarioConfigDetail = () => {
    const { configId } = useParams();
    const { data, isLoading, error } = useScenarioConfig(configId);

    if (isLoading) {
        return <div className="p-8 text-white">Loading...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-400">Error loading scenario config: {error.message}</div>;
    }

    const cfg = data || {};
    const metadata = cfg.metadata || {};

    const copySystemPrompt = async () => {
        const text = cfg.system_prompt || metadata.system_prompt || "";
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            // best-effort toast not used to avoid extra imports
        } catch (e) {
            console.error("copy failed", e);
        }
    };

    return (
        <div className="p-8 bg-dark-bg min-h-screen text-white">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{cfg.config_name || "Scenario Config"}</h1>
                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                            <Badge variant="default" size="sm">{cfg.speaker_name || "Unknown Speaker"}</Badge>
                            <Badge variant="info" size="sm">
                                {cfg.primary_language || "Hindi"}
                                {cfg.code_switching && cfg.secondary_language ? ` / ${cfg.secondary_language}` : ""}
                            </Badge>
                            {cfg.code_switching && <Badge variant="purple" size="sm">Code Switching</Badge>}
                            <div className="text-sm text-gray-400 font-mono">{cfg.config_id}</div>
                            <div className="text-sm text-gray-400">Agent: <span className="font-mono text-gray-200 ml-1">{cfg.agent_id}</span></div>
                        </div>
                        {cfg.objective && <p className="text-gray-400 mt-3 max-w-3xl">{cfg.objective}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button onClick={() => window.history.back()} variant="outline">Back</Button>
                        <Button onClick={copySystemPrompt}>Copy System Prompt</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
                            <h3 className="text-xl font-semibold mb-3">System Prompt</h3>
                            { (cfg.system_prompt || metadata.system_prompt) ? (
                                <pre className="text-sm bg-black/20 p-4 rounded overflow-auto whitespace-pre-wrap" style={{ maxHeight: 360 }}>
                                    {cfg.system_prompt || metadata.system_prompt}
                                </pre>
                            ) : (
                                <div className="text-gray-500">No system prompt provided.</div>
                            )}
                        </div>

                        <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
                            <h3 className="text-xl font-semibold mb-3">Input Parameters</h3>
                            {cfg.input_params && Object.keys(cfg.input_params).length > 0 ? (
                                <pre className="text-sm bg-black/20 p-4 rounded overflow-auto" style={{ maxHeight: 300 }}>
                                    {JSON.stringify(cfg.input_params, null, 2)}
                                </pre>
                            ) : (
                                <div className="text-gray-500">No input parameters.</div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
                            <h4 className="text-lg font-semibold text-white mb-2">Details</h4>
                            <div className="text-sm text-gray-400 space-y-2">
                                <div><strong className="text-gray-300">Primary Language:</strong> {cfg.primary_language || "-"}</div>
                                <div><strong className="text-gray-300">Code Switching:</strong> {cfg.code_switching ? "Yes" : "No"}</div>
                                {cfg.code_switching && (
                                    <div><strong className="text-gray-300">Secondary Language:</strong> {cfg.secondary_language || "-"}</div>
                                )}
                                <div><strong className="text-gray-300">Demography:</strong> {metadata.demography || "-"}</div>
                                {cfg.error && <div className="text-red-400">Error: {String(cfg.error)}</div>}
                            </div>
                        </div>

                        {/* Quick Actions removed per request */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioConfigDetail;