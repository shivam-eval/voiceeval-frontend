const TestCaseCard = ({ testCase, isExpanded, onToggle }) => {
  return (
    <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-400 font-semibold">
          {testCase.id}
        </div>

        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            {testCase.icon && <span>{testCase.icon}</span>}
            {testCase.title}
          </h4>
        </div>
      </div>

      {/* Content */}
      <div className="ml-14 space-y-4">
        {/* Toggle */}
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 uppercase tracking-wide transition-colors"
        >
          {isExpanded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Hide Script & Expected Response
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              View Script & Expected Response
            </>
          )}
        </button>

        {/* Script Section (ONLY this toggles) */}
        {isExpanded && (
          <div className="p-4 bg-dark-input rounded-lg border border-gray-700 space-y-2 animate-slide-up">
            <h6 className="text-sm font-semibold text-white">
              Script Simulation Agent Will Follow:
            </h6>
            <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed font-mono">
              {testCase.script}
            </div>
          </div>
        )}

        {/* Persona Grid (ALWAYS visible, NOT inside script) */}
       {/* Persona Grid (visible ONLY when collapsed) */}
{!isExpanded && (
  <div className="grid grid-cols-2 gap-3 text-sm pt-2">
    <PersonaRow label="Gender" value={testCase.persona.gender} />
    <PersonaRow label="Name" value={testCase.persona.name} />
    <PersonaRow label="Speaking Rate" value={testCase.persona.speakingRate} />
    <PersonaRow label="Interruption Tendency" value={testCase.persona.interruptionTendency} />

    <PersonaRow full label="Dialect" value={testCase.persona.dialect} />
    <PersonaRow full label="Personality" value={testCase.persona.personality} />
    <PersonaRow full label="Background Environment" value={testCase.persona.backgroundEnvironment} />
    <PersonaRow full label="Vehicle" value={testCase.persona.vehicle} />
    <PersonaRow full label="Current Situation" value={testCase.persona.currentSituation} />
  </div>
)}

      </div>
    </div>
  );
};

const PersonaRow = ({ label, value, full }) => (
  <div className={full ? "col-span-2" : undefined}>
    <span className="text-gray-400">{label}:</span>
    <span className="text-white ml-2">{value}</span>
  </div>
);

export default TestCaseCard;