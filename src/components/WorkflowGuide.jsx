import { Link } from "react-router-dom";

const WorkflowGuide = ({ currentStep, totalSteps, nextStep, nextStepPath }) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="bg-gradient-to-r from-teal-400/10 to-blue-400/10 border border-teal-400/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                        Your Progress
                    </h3>
                    <p className="text-gray-400 text-sm">
                        Step {currentStep} of {totalSteps}
                    </p>
                </div>
                <div className="text-teal-400 font-bold text-2xl">
                    {Math.round(progress)}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                <div
                    className="bg-gradient-to-r from-teal-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Next Step */}
            {nextStep && nextStepPath && (
                <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Next: {nextStep}</span>
                    <Link
                        to={nextStepPath}
                        className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        Continue
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default WorkflowGuide;
