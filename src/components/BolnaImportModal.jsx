import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { X, Download, Calendar, Phone, ExternalLink, Loader2 } from "lucide-react";
import { useFetchBolnaCalls, useImportBolnaCalls } from "../hooks/useCalls";

const BolnaImportModal = ({ isOpen, onClose, agentId, bolnaAgentId, agentName, onImportComplete }) => {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [bolnaCalls, setBolnaCalls] = useState([]);
  const [selectedCallIds, setSelectedCallIds] = useState(new Set());
  const [hasFetched, setHasFetched] = useState(false);

  const fetchBolnaCalls = useFetchBolnaCalls();
  const importBolnaCalls = useImportBolnaCalls();

  const isFetching = fetchBolnaCalls.isPending;
  const isImporting = importBolnaCalls.isPending;

  const handleFetchCalls = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    try {
      const result = await fetchBolnaCalls.mutateAsync({
        agent_id: bolnaAgentId || agentId,
        from_date: new Date(startDate + "T00:00:00").toISOString(),
        to_date: new Date(endDate + "T23:59:59").toISOString(),
      });

      const calls = result?.calls || result?.executions || [];
      setBolnaCalls(calls);
      setSelectedCallIds(new Set());
      setHasFetched(true);

      if (calls.length === 0) {
        toast.info("No calls found for the selected date range.");
      }
    } catch (error) {
      toast.error(`Failed to fetch calls: ${error.message || "Unknown error"}`);
    }
  };

  const handleToggleCall = (callId) => {
    setSelectedCallIds((prev) => {
      const next = new Set(prev);
      if (next.has(callId)) next.delete(callId);
      else next.add(callId);
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
        `Imported ${selectedCalls.length} call${selectedCalls.length !== 1 ? "s" : ""}. Auto-evaluation started.`
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
    const selected = bolnaCalls.filter(
      (c) => selectedCallIds.has(c.id) || selectedCallIds.has(c.execution_id)
    );
    const totalSec = selected.reduce(
      (sum, c) => sum + (c.duration || c.conversation_duration || 0),
      0
    );
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${mins}m ${secs}s`;
  }, [bolnaCalls, selectedCallIds]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl w-full transition-all ${
            hasFetched && bolnaCalls.length > 0 ? "max-w-3xl" : "max-w-md"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Import Calls from Bolna</h3>
                {agentName && (
                  <p className="text-xs text-gray-500 mt-0.5">{agentName}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <p className="text-sm text-gray-400">
              Select a date range to fetch call recordings from Bolna for evaluation.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  max={today}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      setStartDate("");
                      return;
                    }
                    if (value > today) return;
                    setStartDate(value);
                    if (endDate && new Date(value) > new Date(endDate)) {
                      setEndDate(value);
                    }
                  }}
                  disabled={isFetching}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2.5
                             text-white text-sm focus:outline-none focus:border-teal-500
                             transition [color-scheme:dark] disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  max={today}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      setEndDate("");
                      return;
                    }
                    if (startDate && value < startDate) {
                      setEndDate(startDate);
                      return;
                    }
                    setEndDate(value);
                  }}
                  disabled={isFetching}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2.5
                             text-white text-sm focus:outline-none focus:border-teal-500
                             transition [color-scheme:dark] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Calls Table — shown after fetch */}
            {hasFetched && (
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#222]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">
                      {bolnaCalls.length} call{bolnaCalls.length !== 1 ? "s" : ""} found
                    </span>
                    {selectedCount > 0 && (
                      <span className="text-xs bg-teal-500/15 text-teal-400 px-2 py-0.5 rounded-full font-medium">
                        {selectedCount} selected &middot; {totalSelectedDuration}
                      </span>
                    )}
                  </div>
                  {bolnaCalls.length > 0 && (
                    <button
                      onClick={handleToggleAll}
                      className="text-xs text-gray-400 hover:text-teal-400 font-medium transition"
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>

                {bolnaCalls.length === 0 ? (
                  <div className="py-10 text-center">
                    <Phone className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No calls in this range.</p>
                    <p className="text-xs text-gray-500 mt-0.5">Try a different date range.</p>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-[#222] z-10">
                        <tr className="text-left text-[11px] text-gray-500 uppercase tracking-wider">
                          <th className="px-4 py-2.5 w-10">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={handleToggleAll}
                              className="rounded border-gray-600 bg-[#2a2a2a] text-teal-400 focus:ring-teal-400/30 focus:ring-offset-0 cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-2.5">Call ID</th>
                          <th className="px-4 py-2.5">Date</th>
                          <th className="px-4 py-2.5">Duration</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Audio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
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
                              className={`cursor-pointer transition ${
                                isSelected
                                  ? "bg-teal-500/[0.06] hover:bg-teal-500/10"
                                  : "hover:bg-[#222]"
                              }`}
                            >
                              <td className="px-4 py-2.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleCall(callId)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="rounded border-gray-600 bg-[#2a2a2a] text-teal-400 focus:ring-teal-400/30 focus:ring-offset-0 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className="text-sm font-mono text-gray-300 truncate block max-w-[160px]"
                                  title={callId}
                                >
                                  {callId?.substring(0, 12)}...
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-sm text-gray-400">
                                {formatDateTime(createdAt)}
                              </td>
                              <td className="px-4 py-2.5 text-sm text-white font-medium">
                                {formatDuration(duration)}
                              </td>
                              <td className="px-4 py-2.5">
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
                              <td className="px-4 py-2.5">
                                {audioUrl ? (
                                  <a
                                    href={audioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-teal-400 hover:text-teal-300 transition inline-flex items-center gap-1 text-xs font-medium"
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
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
            <button
              onClick={handleClose}
              disabled={isFetching || isImporting}
              className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400
                         hover:bg-gray-800 transition text-sm font-medium
                         disabled:opacity-50"
            >
              Cancel
            </button>

            {hasFetched && bolnaCalls.length > 0 ? (
              <button
                onClick={handleImport}
                disabled={selectedCount === 0 || isImporting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                           bg-teal-500/20 border border-teal-500/40 text-teal-400
                           hover:bg-teal-500/30 transition text-sm font-bold
                           disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Import {selectedCount > 0 ? `${selectedCount} Call${selectedCount !== 1 ? "s" : ""}` : "Selected"}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleFetchCalls}
                disabled={isFetching || !startDate || !endDate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                           bg-teal-500/20 border border-teal-500/40 text-teal-400
                           hover:bg-teal-500/30 transition text-sm font-bold
                           disabled:opacity-50"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Fetch Calls
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BolnaImportModal;
