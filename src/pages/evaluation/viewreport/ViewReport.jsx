import CallTranscriptPanel from "./CallTranscription";

const TestReportView = ({ report, onBack }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Test Report
          </h2>
          <p className="text-sm text-gray-400">
            Session ID: {report?.session_id || "TC-001"}
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium"
        >
          ← Back to Results
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-400">Score</p>
          <p className="text-2xl font-semibold text-green-400">
            {report?.score ?? 94}%
          </p>
        </div>

        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-400">Duration</p>
          <p className="text-lg font-semibold text-white">
            {report?.duration ?? "3:12"}
          </p>
        </div>

        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-400">Outcome</p>
          <p className="text-lg font-semibold text-white">
            {report?.outcome ?? "Appointment"}
          </p>
        </div>

        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-400">Status</p>
          <p className="text-lg font-semibold text-teal-400">
            {report?.status ?? "Success"}
          </p>
        </div>
      </div>

      {/* Transcript + Audio */}
      <CallTranscriptPanel />

      {/* Placeholder for future sections */}
      <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6 text-gray-400 text-sm">
        More insights (accuracy highlights, timeline, metrics) will appear here.
      </div>
    </div>
  );
};

export default TestReportView;
