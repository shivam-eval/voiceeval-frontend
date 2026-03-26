import { useState, useEffect } from "react";
import { Play, X, CheckSquare, Square, Phone, Globe, Copy, Check } from "lucide-react";
import Button from "./Button";
import { outboundSimApi } from "../utils/api";

const RunSimulationsModal = ({ isOpen, onClose, allTestCases, preSelected }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [simulationName, setSimulationName] = useState("");
    const [triggerMode, setTriggerMode] = useState("api_trigger");
    const [endpoint, setEndpoint] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [authType, setAuthType] = useState("api_key");
    const [payloadFormat, setPayloadFormat] = useState("");
    const [payloadError, setPayloadError] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

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
        setTriggerMode("api_trigger");
        setEndpoint("");
        setApiKey("");
        setAuthType("api_key");
        setPayloadFormat("");
        setPayloadError(null);
        setIsRunning(false);
        setResults(null);
        setError(null);
        setCopied(false);
        onClose();
    };

    const handleRun = async () => {
        if (triggerMode === "api_trigger" && !endpoint.trim()) return;
        if (triggerMode === "api_trigger" && !payloadFormat.trim()) return;
        if (selectedIds.length === 0) return;

        setIsRunning(true);
        setError(null);
        setResults(null);

        try {
            let parsedPayload = null;
            if (triggerMode === "api_trigger" && payloadFormat.trim()) {
                try {
                    parsedPayload = JSON.parse(payloadFormat.trim());
                } catch {
                    setError("Invalid JSON in Payload Format");
                    setIsRunning(false);
                    return;
                }
            }
            const payload = {
                test_case_ids: selectedIds,
                trigger_mode: triggerMode,
                ...(simulationName.trim() && { folder_name: simulationName.trim() }),
            };
            if (triggerMode === "api_trigger") {
                payload.endpoint = endpoint.trim();
                payload.auth_type = authType;
                if (apiKey.trim()) payload.api_key = apiKey.trim();
                if (parsedPayload) payload.sample_payload = parsedPayload;
            }
            const resp = await outboundSimApi.run(payload);
            setResults(resp);
        } catch (err) {
            setError(err.message || "Failed to trigger simulations");
        } finally {
            setIsRunning(false);
        }
    };

    const handleCopyPhone = () => {
        if (results?.sim_phone_number) {
            navigator.clipboard.writeText(results.sim_phone_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 shadow-xl max-h-[90vh] overflow-y-auto">
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

                            {/* Trigger Mode Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    How should calls be triggered?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTriggerMode("api_trigger")}
                                        disabled={isRunning}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                                            triggerMode === "api_trigger"
                                                ? "border-teal-500 bg-teal-500/10"
                                                : "border-gray-700 bg-dark-bg hover:border-gray-600"
                                        }`}
                                    >
                                        <Globe className={`w-5 h-5 flex-shrink-0 ${triggerMode === "api_trigger" ? "text-teal-400" : "text-gray-500"}`} />
                                        <div>
                                            <div className={`text-sm font-medium ${triggerMode === "api_trigger" ? "text-white" : "text-gray-400"}`}>
                                                API Trigger
                                            </div>
                                            <div className="text-xs text-gray-500">We POST to your endpoint</div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTriggerMode("self_dial")}
                                        disabled={isRunning}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                                            triggerMode === "self_dial"
                                                ? "border-teal-500 bg-teal-500/10"
                                                : "border-gray-700 bg-dark-bg hover:border-gray-600"
                                        }`}
                                    >
                                        <Phone className={`w-5 h-5 flex-shrink-0 ${triggerMode === "self_dial" ? "text-teal-400" : "text-gray-500"}`} />
                                        <div>
                                            <div className={`text-sm font-medium ${triggerMode === "self_dial" ? "text-white" : "text-gray-400"}`}>
                                                Self-Dial
                                            </div>
                                            <div className="text-xs text-gray-500">Your agent calls our number</div>
                                        </div>
                                    </button>
                                </div>
                                {triggerMode === "self_dial" && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        We'll display a phone number after setup. Have your agent call it once per test case — they'll be processed sequentially.
                                    </p>
                                )}
                            </div>

                            {/* API Trigger fields — only shown in api_trigger mode */}
                            {triggerMode === "api_trigger" && (
                                <>
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
                                            Sample Payload <span className="text-red-400 font-normal">*</span>
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
                                </>
                            )}

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
                                    disabled={
                                        (triggerMode === "api_trigger" && !endpoint.trim()) ||
                                        (triggerMode === "api_trigger" && !payloadFormat.trim()) ||
                                        isRunning ||
                                        selectedIds.length === 0 ||
                                        !!payloadError
                                    }
                                    loading={isRunning}
                                    icon={!isRunning && <Play className="w-4 h-4" />}
                                >
                                    {isRunning
                                        ? (triggerMode === "self_dial" ? "Queuing test cases..." : "Triggering calls...")
                                        : `Run ${selectedIds.length > 0 ? `(${selectedIds.length})` : ""}`
                                    }
                                </Button>
                            </div>
                        </>
                    ) : (
                        /* Results view */
                        <>
                            {/* Self-dial phone number card */}
                            {results.trigger_mode === "self_dial" && results.sim_phone_number && (
                                <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-5">
                                    <div className="text-sm font-medium text-teal-300 mb-2">
                                        Have your agent call this number
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl font-bold text-white font-mono tracking-wider">
                                            {results.sim_phone_number}
                                        </div>
                                        <button
                                            onClick={handleCopyPhone}
                                            className="p-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 transition-colors"
                                            title="Copy phone number"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4 text-teal-400" />}
                                        </button>
                                    </div>
                                    <div className="mt-3 text-xs text-gray-400 space-y-1">
                                        <p><span className="text-teal-400 font-medium">{results.queued_count}</span> test case{results.queued_count !== 1 ? 's' : ''} queued and waiting for inbound calls.</p>
                                        <p>Trigger one outbound call from your agent for each test case. They will be matched sequentially.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-dark-bg rounded-lg p-3 border border-gray-800">
                                    <div className="text-2xl font-bold text-white">{results.total}</div>
                                    <div className="text-xs text-gray-500 mt-1">Total</div>
                                </div>
                                <div className="bg-dark-bg rounded-lg p-3 border border-teal-500/20">
                                    <div className="text-2xl font-bold text-teal-400">
                                        {results.trigger_mode === "self_dial" ? results.queued_count : results.triggered_count}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {results.trigger_mode === "self_dial" ? "Queued" : "Triggered"}
                                    </div>
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
                                            {r.call_triggered && results.trigger_mode !== "self_dial" && (
                                                <div className="text-gray-500 text-xs mt-0.5">
                                                    HTTP {r.call_response_status}
                                                </div>
                                            )}
                                            {r.call_triggered && results.trigger_mode === "self_dial" && (
                                                <div className="text-gray-500 text-xs mt-0.5">
                                                    Queued — waiting for call
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

export default RunSimulationsModal;
