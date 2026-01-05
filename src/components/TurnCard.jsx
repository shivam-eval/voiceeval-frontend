import { MessageSquare } from "lucide-react";

/* =========================
   TURN CARD COMPONENT
========================= */

const TurnCard = ({ step, index }) => {
  const isAgent = step.step_type === 'speak' || step.step_type === 'initial_inbound';
  const isPassed = step.passed;

  return (
    <div className="flex gap-4 mb-6">
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
        isAgent 
          ? 'bg-purple-500/20 border-2 border-purple-500/30'
          : 'bg-blue-500/20 border-2 border-blue-500/30'
        }`}>
        {isAgent ? (
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded ${isAgent
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-blue-500/20 text-blue-300'
              }`}>
              {isAgent ? 'AGENT' : 'USER'}
            </span>
            <span className="text-gray-500 text-sm">
              Turn #{index + 1} • {step.turn_id || `turn_${String(index + 1).padStart(3, '0')}`}
            </span>
          </div>
          <div className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${isPassed
              ? 'bg-green-900/30 text-green-400 border border-green-700/50'
              : 'bg-red-900/30 text-red-400 border border-red-700/50'
            }`}>
            {isPassed ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Healthy
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Critical Failure
              </>
            )}
          </div>
        </div>

        {/* Message Card */}
        <div className={`rounded-xl p-5 border ${isPassed
            ? 'bg-gray-900/40 border-gray-800/50'
            : 'bg-red-950/20 border-red-900/40'
          }`}>
          {/* Main Text */}
          <p className="text-gray-200 leading-relaxed mb-4">
            {step.actual_text || step.actual_response || step.expected_utterance || step.expected_response || 'No text available'}
          </p>

          {/* Expected Content Section */}
          {isAgent && (step.expected_utterance || step.expected_response || step.expected_greeting) && (
            <div className="pt-4 border-t border-gray-800/50">
              <div className="text-xs font-medium text-gray-500 mb-2">Expected Response:</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {step.expected_utterance || step.expected_response || step.expected_greeting}
              </p>
            </div>
          )}

          {/* Expected Keywords */}
          {step.expected_keywords && step.expected_keywords.length > 0 && (
            <div className="pt-4 border-t border-gray-800/50">
              <div className="text-xs font-medium text-gray-500 mb-2.5">Expected Keywords:</div>
              <div className="flex flex-wrap gap-2">
                {step.expected_keywords.map((keyword, kidx) => (
                  <span
                    key={kidx}
                    className="px-2.5 py-1 bg-teal-500/10 text-teal-300 rounded-md text-xs border border-teal-500/20"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          {step.reasoning && (
            <div className="pt-4 border-t border-gray-800/50">
              <div className="text-xs font-medium text-gray-500 mb-2">Analysis:</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {step.reasoning}
              </p>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="mt-4 pt-3 border-t border-gray-800/50 flex items-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Duration</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Start Time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   MAIN COMPONENT
========================= */

export default function TurnByTurnAnalysis({ steps = [], title = "Turn-by-Turn Analysis" }) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-950 border border-gray-800/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
      </div>

      {/* Turn Cards */}
      <div className="space-y-0">
        {steps.map((step, index) => (
          <TurnCard key={index} step={step} index={index} />
        ))}
      </div>
    </div>
  );
}