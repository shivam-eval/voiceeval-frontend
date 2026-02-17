import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import Button from "./Button";
import { X, Download, Search, CheckCircle, Clock, Phone, ExternalLink } from "lucide-react";
import { useFetchBolnaCalls, useImportBolnaCalls } from "../hooks/useCalls";

const BolnaImportModal = ({ isOpen, onClose, agentId, agentName, onImportComplete }) => {
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().slice(0, 16);
    });
    const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 16));
    const [bolnaCalls, setBolnaCalls] = useState([]);
    const [selectedCallIds, setSelectedCallIds] = useState(new Set());
    const [hasFetched, setHasFetched] = useState(false);

    const fetchBolnaCalls = useFetchBolnaCalls();
    const importBolnaCalls = useImportBolnaCalls();

    const isFetching = fetchBolnaCalls.isPending;
    const isImporting = importBolnaCalls.isPending;

    const handleFetchCalls = async () => {
        if (!fromDate || !toDate) {
            toast.error("Please select both start and end dates.");
            return;
        }

        if (new Date(fromDate) >= new Date(toDate)) {
            toast.error("Start date must be before end date.");
            return;
        }

        try {
            const result = await fetchBolnaCalls.mutateAsync({
                agent_id: agentId,
                from_date: new Date(fromDate).toISOString(),
                to_date: new Date(toDate).toISOString(),
            });

            const calls = result?.calls || result?.executions || [];
            setBolnaCalls(calls);
            setSelectedCallIds(new Set());
            setHasFetched(true);

            if (calls.length === 0) {
                toast.info("No calls found for the selected date range.");
            } else {
                toast.success(`Found ${calls.length} call${calls.length !== 1 ? "s" : ""}.`);
            }
        } catch (error) {
            toast.error(`Failed to fetch calls: ${error.message || "Unknown error"}`);
        }
    };

    const handleToggleCall = (callId) => {
        setSelectedCallIds((prev) => {
            const next = new Set(prev);
            if (next.has(callId)) {
                next.delete(callId);
            } else {
                next.add(callId);
            }
            return next;
        });
    };

    const handleToggleAll = () => {
        if (selectedCallIds.size === bolnaCalls.length) {
            setSelectedCallIds(new Set());
        } else {
            setSelectedCallIds(new Set(bolnaCalls.map((c) => c.id || c.execution_id)));
        }
    };

    const handleImport = async () => {
        if (selectedCallIds.size === 0) {
            toast.error("Please select at least one call to import.");
            return;
        }

        const selectedCalls = bolnaCalls.filter(
            (c) => selectedCallIds.has(c.id) || selectedCallIds.has(c.execution_id)
        );

        try {
            await importBolnaCalls.mutateAsync({
                agent_id: agentId,
                calls: selectedCalls,
            });

            toast.success(
                `Successfully imported ${selectedCalls.length} call${selectedCalls.length !== 1 ? "s" : ""}. Auto-evaluation started.`
            );
            onImportComplete?.();
            handleClose();
        } catch (error) {
            toast.error(`Failed to import calls: ${error.message || "Unknown error"}`);
        }
    };

    const handleClose = () => {
        setBolnaCalls([]);
        setSelectedCallIds(new Set());
        setHasFetched(false);
        onClose();
    };

    const formatDuration = (seconds) => {
        if (!seconds && seconds !== 0) return "--";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "--";
        return new Date(dateStr).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const selectedCount = selectedCallIds.size;
    const allSelected = bolnaCalls.length > 0 && selectedCount === bolnaCalls.length;

    const totalSelectedDuration = useMemo(() => {
        const selectedCalls = bolnaCalls.filter(
            (c) => selectedCallIds.has(c.id) || selectedCallIds.has(c.execution_id)
        );
        const totalSec = selectedCalls.reduce((sum, c) => sum + (c.duration || c.conversation_duration || 0), 0);
        const mins = Math.floor(totalSec / 60);
        const secs = Math.floor(totalSec % 60);
        return `${mins}m ${secs}s`;
    }, [bolnaCalls, selectedCallIds]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Download className="w-6 h-6 text-teal-400" />
                                Import Calls from Bolna
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Fetch and import call recordings from{" "}
                                <span className="text-teal-400 font-medium">{agentName || "Bolna Agent"}</span>
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Date Range Section */}
                        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Date Range
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Start Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400 transition-colors [color-scheme:dark]"
                                        disabled={isFetching}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        End Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400 transition-colors [color-scheme:dark]"
                                        disabled={isFetching}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleFetchCalls}
                                disabled={isFetching || !fromDate || !toDate}
                                className={`mt-4 w-full px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                                    !isFetching && fromDate && toDate
                                        ? "bg-teal-500/15 border border-teal-500/40 text-teal-400 hover:bg-teal-500/25 shadow-[0_0_15px_rgba(20,184,166,0.08)]"
                                        : "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-700"
                                }`}
                            >
                                {isFetching ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full" />
                                        Fetching Calls...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        Fetch Calls
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Calls List */}
                        {hasFetched && (
                            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-semibold text-white">
                                            {bolnaCalls.length} Call{bolnaCalls.length !== 1 ? "s" : ""} Found
                                        </h3>
                                        {selectedCount > 0 && (
                                            <span className="text-xs bg-teal-500/15 text-teal-400 px-2.5 py-1 rounded-full font-medium">
                                                {selectedCount} selected &middot; {totalSelectedDuration}
                                            </span>
                                        )}
                                    </div>
                                    {bolnaCalls.length > 0 && (
                                        <button
                                            onClick={handleToggleAll}
                                            className="text-xs text-gray-400 hover:text-teal-400 font-medium transition-colors"
                                        >
                                            {allSelected ? "Deselect All" : "Select All"}
                                        </button>
                                    )}
                                </div>

                                {bolnaCalls.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <Phone className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm">No calls found for this date range.</p>
                                        <p className="text-gray-500 text-xs mt-1">Try adjusting the date range.</p>
                                    </div>
                                ) : (
                                    <div className="max-h-[340px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full">
                                            <thead className="sticky top-0 bg-gray-800 z-10">
                                                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                                                    <th className="px-4 py-3 w-10">
                                                        <input
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            onChange={handleToggleAll}
                                                            className="rounded border-gray-600 bg-gray-900 text-teal-400 focus:ring-teal-400/30 focus:ring-offset-0 cursor-pointer"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3">Call ID</th>
                                                    <th className="px-4 py-3">Date</th>
                                                    <th className="px-4 py-3">Duration</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Audio</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700/50">
                                                {bolnaCalls.map((call) => {
                                                    const callId = call.id || call.execution_id;
                                                    const isSelected = selectedCallIds.has(callId);
                                                    const duration = call.duration || call.conversation_duration || 0;
                                                    const audioUrl = call.recording_url || call.audio_url || call.recording;
                                                    const status = call.status || call.call_status || "completed";
                                                    const createdAt = call.created_at || call.start_time || call.timestamp;

                                                    return (
                                                        <tr
                                                            key={callId}
                                                            onClick={() => handleToggleCall(callId)}
                                                            className={`cursor-pointer transition-colors ${
                                                                isSelected
                                                                    ? "bg-teal-500/8 hover:bg-teal-500/12"
                                                                    : "hover:bg-gray-800/60"
                                                            }`}
                                                        >
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => handleToggleCall(callId)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="rounded border-gray-600 bg-gray-900 text-teal-400 focus:ring-teal-400/30 focus:ring-offset-0 cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-sm font-mono text-gray-300 truncate block max-w-[180px]" title={callId}>
                                                                    {callId?.substring(0, 12)}...
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-sm text-gray-400">{formatDateTime(createdAt)}</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-sm text-white font-medium">{formatDuration(duration)}</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                                        status === "completed" || status === "ended"
                                                                            ? "bg-green-500/15 text-green-400"
                                                                            : status === "failed"
                                                                            ? "bg-red-500/15 text-red-400"
                                                                            : "bg-gray-600/30 text-gray-400"
                                                                    }`}
                                                                >
                                                                    {status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {audioUrl ? (
                                                                    <a
                                                                        href={audioUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1 text-xs font-medium"
                                                                    >
                                                                        <ExternalLink className="w-3 h-3" />
                                                                        Play
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-gray-600 text-xs">--</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info Box */}
                        {hasFetched && bolnaCalls.length > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                                <div className="text-blue-400 flex-shrink-0 mt-0.5">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <p className="text-sm text-blue-400 leading-relaxed">
                                    Selected calls will be downloaded and automatically evaluated using your configured evaluation pipeline.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex items-center justify-between bg-gray-900 flex-shrink-0">
                    <div className="text-sm text-gray-500">
                        {selectedCount > 0 ? (
                            <span>
                                <span className="text-teal-400 font-semibold">{selectedCount}</span> call{selectedCount !== 1 ? "s" : ""} ready to import
                            </span>
                        ) : hasFetched ? (
                            "Select calls to import"
                        ) : (
                            "Set date range and fetch calls"
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" onClick={handleClose} disabled={isImporting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            loading={isImporting}
                            disabled={selectedCount === 0 || isImporting}
                            icon={<Download className="w-4 h-4" />}
                        >
                            Import {selectedCount > 0 ? `${selectedCount} Call${selectedCount !== 1 ? "s" : ""}` : "Selected"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BolnaImportModal;
