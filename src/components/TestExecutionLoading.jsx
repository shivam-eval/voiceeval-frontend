import { useEffect, useState } from "react";

/**
 * Props:
 *  - simulationId (string)  → returned from POST /api/v1/simulation/run
 *  - onComplete (optional)  → called after evaluation finishes
 *  - onError (optional)
 */
const TestExecutionLoading = ({ simulationId, onComplete, onError }) => {
  // execution state
  const [totalActive, setTotalActive] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [executionFinished, setExecutionFinished] = useState(false);

  // UI animation state
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  /* -------------------------------------------------
     1️⃣ Poll execution status (NO ID — Swagger correct)
  -------------------------------------------------- */
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch(
          "http://localhost:8001/api/v1/simulation/status",
          {
            method: "GET",
            headers: { accept: "application/json" },
          }
        );

        const data = await res.json();
        console.log("Simulation status:", data);

        const active = data.total_active ?? 0;
        const completed = data.total_completed ?? 0;

        setTotalActive(active);
        setTotalCompleted(completed);

        // terminal condition (Swagger-defined)
        if (active === 0 && completed > 0) {
          setExecutionFinished(true);
        }
      } catch (err) {
        console.error("Status polling failed:", err);
        onError?.(err);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [onError]);

  /* -------------------------------------------------
     2️⃣ Animate steps (1 simulation = 1 call)
  -------------------------------------------------- */
  useEffect(() => {
    if (currentStep < totalCompleted) {
      const t = setTimeout(() => {
        setCurrentStep((v) => v + 1);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [currentStep, totalCompleted]);

  /* -------------------------------------------------
     3️⃣ Smooth progress bar
  -------------------------------------------------- */
  useEffect(() => {
    const total = totalActive + totalCompleted;
    if (!total) return;

    const target = Math.round((currentStep / total) * 100);
    if (progress < target) {
      const t = setTimeout(() => {
        setProgress((p) => p + 1);
      }, 30);
      return () => clearTimeout(t);
    }
  }, [currentStep, totalActive, totalCompleted, progress]);

  /* -------------------------------------------------
     4️⃣ Run batch evaluation (Swagger exact)
  -------------------------------------------------- */
  useEffect(() => {
    if (!executionFinished) return;

    const runEvaluation = async () => {
      try {
        const res = await fetch(
          "http://localhost:8001/api/v1/evaluate/batch",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({
              simulation_id: simulationId,
            }),
          }
        );

        const evaluationResult = await res.json();

        // ✅ USER REQUEST: console evaluation result
        console.log("✅ Evaluation Result:", evaluationResult);

        onComplete?.(evaluationResult);
      } catch (err) {
        console.error("Evaluation failed:", err);
        onError?.(err);
      }
    };

    runEvaluation();
  }, [executionFinished, simulationId, onComplete, onError]);

  /* -------------------------------------------------
     UI
  -------------------------------------------------- */
  const total = totalActive + totalCompleted;

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
      <div className="bg-dark-panel rounded-2xl p-12 border border-gray-800/50 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Running Test Cases
          </h2>
          <p className="text-gray-400">
            {total > 0
              ? `Executing ${currentStep} of ${total} calls`
              : "Initializing…"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-3 bg-dark-input rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-green-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>0%</span>
            <span className="text-teal-400 font-semibold">{progress}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Grid (max 10 visual steps) */}
        {total > 0 && (
          <div className="grid grid-cols-5 gap-3 mb-8">
            {Array.from({ length: Math.min(total, 10) }, (_, i) => i + 1).map(
              (i) => {
                const done = i <= currentStep;
                const active = i === currentStep + 1;

                return (
                  <div
                    key={i}
                    className={`h-16 rounded-lg border-2 flex items-center justify-center text-lg font-semibold ${
                      done
                        ? "bg-teal-400/20 border-teal-400 text-teal-300"
                        : active
                        ? "bg-teal-400/10 border-teal-400 animate-pulse text-teal-400"
                        : "bg-dark-input border-gray-700 text-gray-400"
                    }`}
                  >
                    {done ? "✓" : i}
                  </div>
                );
              }
            )}
          </div>
        )}

        <div className="text-center text-gray-400 text-sm">
          Analyzing call performance…
        </div>
      </div>
    </div>
  );
};

export default TestExecutionLoading;
