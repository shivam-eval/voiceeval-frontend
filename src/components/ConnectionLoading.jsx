import { useEffect, useState } from "react";

const loadingSteps = [
  { id: 1, text: "Extracting System Prompts" },
  { id: 2, text: "Generating Canonical Flow" },
  { id: 3, text: "Creating Flow Diagram" },
];

const ConnectionLoading = ({ extractedConfig, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!extractedConfig) return;

    let mounted = true;

    const runFakeSetup = async () => {
      // STEP 1
      setCurrentStep(0);
      setProgress(15);
      await delay(900);

      // STEP 2
      if (!mounted) return;
      setCurrentStep(1);
      setProgress(45);
      await delay(1200);

      // STEP 3
      if (!mounted) return;
      setCurrentStep(2);
      setProgress(75);
      await delay(1000);

      // COMPLETE
      if (!mounted) return;
      setProgress(100);

      setTimeout(() => {
        if (mounted && onComplete) {
          onComplete(); // nothing to pass — everything is hardcoded
        }
      }, 600);
    };

    runFakeSetup();

    return () => {
      mounted = false;
    };
  }, [extractedConfig, onComplete]);

  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Voice<span className="text-teal-400">Eval</span>
          </h1>
          <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
            Setting up your workspace
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl">
            Preparing your Voice AI agent for evaluation.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800/50 shadow-xl">
          <div className="space-y-4 mb-8">
            {loadingSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    isActive
                      ? "bg-gray-800 border-teal-400/50"
                      : isCompleted
                      ? "bg-gray-800/50 border-gray-700 opacity-70"
                      : "bg-gray-800/30 border-gray-800 opacity-50"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-full bg-teal-400 flex items-center justify-center">
                        ✓
                      </div>
                    ) : isActive ? (
                      <div className="w-10 h-10 rounded-full bg-teal-400/20 border-2 border-teal-400 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-teal-400 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-700 border border-gray-600" />
                    )}
                  </div>

                  <p className="text-white text-base font-medium">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-green-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-center text-sm text-gray-400">
            {progress < 100 ? `Processing… ${progress}%` : "Complete!"}
          </p>
        </div>
      </div>
    </div>
  );
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default ConnectionLoading;
