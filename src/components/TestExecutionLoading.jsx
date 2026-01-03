import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useWorkflow } from "../context/WorkFlowContext";

const TestExecutionLoading = ({ simulationId, onComplete, onError }) => {
  const navigate = useNavigate();
  
  // execution state
  const [totalActive, setTotalActive] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [executionFinished, setExecutionFinished] = useState(false);

  // stability guard
  const [stableCompletedCount, setStableCompletedCount] = useState(0);

  // UI animation state
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const { setEvaluationResult } = useWorkflow();

  /* -------------------------------------------------
     0️⃣ Check for existing evaluation results on mount
  -------------------------------------------------- */
  useEffect(() => {
    const checkExistingEvaluation = async () => {
      if (!simulationId) return;

      try {
        const res = await fetch(
          `http://localhost:8001/api/v1/evaluate/${simulationId}`,
          {
            method: "GET",
            headers: { accept: "application/json" },
          }
        );

        if (res.ok) {
          const existingResult = await res.json();
          console.log("✅ Found existing evaluation:", existingResult);
          
          setEvaluationResult(existingResult);
          // Direct navigation to evaluation page
          navigate("/evaluation", { 
            state: { evaluationResult: existingResult, simulationId } 
          });
        }
      } catch (err) {
        console.log("No existing evaluation found, proceeding with execution");
      }
    };

    checkExistingEvaluation();
  }, [simulationId, navigate, setEvaluationResult]);

  /* -------------------------------------------------
     1️⃣ Poll simulation status
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

        // ✅ Stable terminal condition
        if (Array.isArray(data.completed) && data.completed.length > 0) {
          if (completed === stableCompletedCount) {
            setStableCompletedCount((prev) => prev + 1);
          } else {
            setStableCompletedCount(0);
          }
        }

        // require 2 consecutive stable polls
        if (stableCompletedCount >= 1) {
          setExecutionFinished(true);
        }
      } catch (err) {
        console.error("Status polling failed:", err);
        toast.error(`Status polling failed: ${err.message}`);
        onError?.(err);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [stableCompletedCount, onError]);

  /* -------------------------------------------------
     2️⃣ Animate steps
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
     4️⃣ Run batch evaluation & navigate to results
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

        if (!res.ok) {
          throw new Error(`Evaluation failed with status ${res.status}`);
        }

        const evaluationResult = await res.json();
        console.log("✅ Evaluation Result:", evaluationResult);

        setEvaluationResult(evaluationResult);
        onComplete?.(evaluationResult);

        // Navigate to evaluation page with results
        navigate("/evaluation", { 
          state: { evaluationResult, simulationId } 
        });
      } catch (err) {
        console.error("Evaluation failed:", err);
        toast.error(`Evaluation failed: ${err.message}`);
        onError?.(err);
        
        // Navigate to evaluation page even on error (with fallback UI)
        navigate("/evaluation", { 
          state: { error: err.message, simulationId } 
        });
      }
    };

    runEvaluation();
  }, [executionFinished, simulationId, onComplete, onError, navigate, setEvaluationResult]);

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

        {executionFinished && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center text-teal-400">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating evaluation results...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestExecutionLoading;