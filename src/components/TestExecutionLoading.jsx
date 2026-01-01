import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkflow } from "../context/WorkFlowContext";

const TestExecutionLoading = ({ simulationId, onComplete, onError }) => {
  const navigate = useNavigate();

  // execution state
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);

  // UI animation state
  const [progress, setProgress] = useState(0);

  // Completion state
  const [isCompleted, setIsCompleted] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const { setEvaluationResult } = useWorkflow();

  /* -------------------------------------------------
     0️⃣ Check for existing evaluation results on mount
  -------------------------------------------------- */
  useEffect(() => {
    const checkExistingEvaluation = async () => {
      if (!simulationId) return;

      try {
        const res = await fetch(
          `http://localhost:8001/api/v1/simulation/${simulationId}/summary`,
          {
            method: "GET",
            headers: { accept: "application/json" },
          }
        );

        if (res.ok) {
          const existingResult = await res.json();
          console.log("✅ Found existing summary:", existingResult);

          // Check if all sessions are completed
          const allCompleted =
            existingResult.sessions?.passed?.length +
            existingResult.sessions?.failed?.length ===
            existingResult.total_sessions;

          if (allCompleted) {
            setEvaluationResult(existingResult);
            // REMOVED: Don't navigate to evaluation page
            // Just save to context, evaluation dashboard will handle display
          }
        }
      } catch (err) {
        console.log("No existing summary found, proceeding with execution");
      }
    };

    checkExistingEvaluation();
  }, [simulationId, setEvaluationResult]);

  /* -------------------------------------------------
     1️⃣ Poll simulation summary
  -------------------------------------------------- */
  useEffect(() => {
    if (!simulationId) return;

    const pollSummary = async () => {
      try {
        const res = await fetch(
          `http://localhost:8001/api/v1/simulation/${simulationId}/summary`,
          {
            method: "GET",
            headers: { accept: "application/json" },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch summary: ${res.status}`);
        }

        const data = await res.json();
        console.log("📊 Simulation summary:", data);

        setSummary(data);
        setTotalSessions(data.total_sessions || 0);

        // Combine all sessions (passed, failed, active)
        const allSessions = [
          ...(data.sessions?.passed || []).map(s => ({ ...s, status: 'passed' })),
          ...(data.sessions?.failed || []).map(s => ({ ...s, status: 'failed' })),
          ...(data.sessions?.active || []).map(s => ({ ...s, status: 'active' })),
        ];

        setSessions(allSessions);

        // Calculate progress
        const completed =
          (data.sessions?.passed?.length || 0) +
          (data.sessions?.failed?.length || 0);

        const newProgress = data.total_sessions > 0
          ? Math.round((completed / data.total_sessions) * 100)
          : 0;

        setProgress(newProgress);

        // Check if all sessions are completed
        if (completed === data.total_sessions && data.total_sessions > 0 && !isCompleted) {
          console.log("✅ Simulation run completed!");

          setIsCompleted(true);

          // Save to context
          setEvaluationResult(data);

          // REMOVED: Don't auto-navigate to evaluation page
          // Call onComplete callback if provided
          onComplete?.(data);
        }
      } catch (err) {
        console.error("Summary polling failed:", err);
        onError?.(err);
      }
    };

    // Initial poll
    pollSummary();

    // Poll every 2 seconds
    const interval = setInterval(pollSummary, 2000);

    return () => clearInterval(interval);
  }, [simulationId, setEvaluationResult, onComplete, onError]);

  /* -------------------------------------------------
     UI - Test Case Grid
  -------------------------------------------------- */
  const getSessionStatus = (sessionId) => {
    const session = sessions.find(s => s.session_id === sessionId);
    return session?.status || 'pending';
  };

  const getSessionByIndex = (index) => {
    return sessions[index];
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
      <div className="bg-dark-panel rounded-2xl p-12 border border-gray-800/50 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isCompleted ? "Simulation Run Completed" : "Running Test Cases"}
          </h2>
          <p className="text-gray-400">
            {summary ? (
              <>
                Completed {(summary.sessions?.passed?.length || 0) + (summary.sessions?.failed?.length || 0)} of {totalSessions} tests
              </>
            ) : (
              "Initializing test execution..."
            )}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-dark-input rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-green-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>0%</span>
            <span className="text-teal-400 font-semibold text-base">{progress}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-dark-input rounded-xl p-4 border border-green-800/30">
              <div className="text-green-400 text-2xl font-bold">
                {summary.sessions?.passed?.length || 0}
              </div>
              <div className="text-gray-400 text-sm mt-1">Passed</div>
            </div>

            <div className="bg-dark-input rounded-xl p-4 border border-red-800/30">
              <div className="text-red-400 text-2xl font-bold">
                {summary.sessions?.failed?.length || 0}
              </div>
              <div className="text-gray-400 text-sm mt-1">Failed</div>
            </div>

            <div className="bg-dark-input rounded-xl p-4 border border-yellow-800/30">
              <div className="text-yellow-400 text-2xl font-bold">
                {summary.sessions?.active?.length || 0}
              </div>
              <div className="text-gray-400 text-sm mt-1">Running</div>
            </div>
          </div>
        )}

        {/* Test Case Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Test Cases</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: totalSessions }, (_, index) => {
              const session = getSessionByIndex(index);
              const status = session?.status || 'pending';

              return (
                <div
                  key={index}
                  className={`
                    relative rounded-lg p-4 border-2 transition-all duration-500
                    ${status === 'passed'
                      ? 'bg-green-400/10 border-green-400 shadow-lg shadow-green-400/20 animate-pulse-once'
                      : status === 'failed'
                        ? 'bg-red-400/10 border-red-400 shadow-lg shadow-red-400/20'
                        : status === 'active'
                          ? 'bg-yellow-400/10 border-yellow-400 animate-pulse'
                          : 'bg-dark-input border-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm mb-1">
                        Run {index + 1}
                      </div>
                      {session && (
                        <div className="text-xs text-gray-400 truncate">
                          {session.path_id || session.session_id}
                        </div>
                      )}
                    </div>

                    <div className="ml-2">
                      {status === 'passed' && (
                        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {status === 'failed' && (
                        <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      {status === 'active' && (
                        <svg className="w-6 h-6 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      {status === 'pending' && (
                        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {session?.completed_at && (
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(session.completed_at).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading State for No Data Yet */}
        {!summary && (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 mx-auto text-teal-400 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400">Loading test execution data...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-once {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-once {
          animation: pulse-once 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default TestExecutionLoading;