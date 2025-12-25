import React from 'react';
import { User, Phone, MapPin, Briefcase, GraduationCap, IndianRupee, Info, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const PersonaRow = ({ icon: Icon, label, value, className = '' }) => (
  <div className={`flex items-start space-x-2 ${className}`}>
    <div className="text-teal-400 mt-0.5">
      <Icon size={14} />
    </div>
    <div className="flex-1">
      <div className="text-xs text-gray-400 font-medium">{label}</div>
      <div className="text-sm text-white">{value || 'N/A'}</div>
    </div>
  </div>
);

const TestCaseCard = ({ testCase, isExpanded, onToggle }) => {
  if (!testCase.persona) {
    // Fallback in case persona data is missing
    testCase.persona = {
      name: 'Unknown User',
      age: 'Not specified',
      city: 'Not specified',
      occupation: 'Not specified',
      education: 'Not specified',
      annualIncome: 'Not specified',
      creditScore: 'N/A',
      employmentStatus: 'Not specified'
    };
  }

  const { persona } = testCase;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-teal-400/50 transition-colors">
      {/* Test Case Title */}
      {testCase.title && (
        <div className="mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">{testCase.icon || '📋'}</span>
            {testCase.title}
          </h2>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <User className="mr-2 text-teal-400" size={18} />
            {persona.name}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {persona.occupation} • {persona.city}
          </p>
        </div>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-4 py-2 bg-teal-400/10 hover:bg-teal-400/20 border border-teal-400/30 rounded-lg text-teal-400 transition-colors text-sm font-medium"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show Details
            </>
          )}
        </button>
      </div>

      {/* Persona Details - Always Visible */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <PersonaRow icon={Briefcase} label="Occupation" value={persona.occupation} />
        <PersonaRow icon={MapPin} label="Location" value={persona.city} />
        <PersonaRow icon={GraduationCap} label="Education" value={persona.education} />
        <PersonaRow icon={IndianRupee} label="Income" value={persona.annualIncome} />
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Test Case Script/Conversation */}
          {testCase.script && (
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center">
                <MessageSquare className="mr-2 text-teal-400" size={16} />
                Test Case Conversation
              </h4>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {testCase.script}
                </pre>
              </div>
            </div>
          )}

          {/* Additional Persona Details */}
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <Info className="mr-2 text-teal-400" size={16} />
              Additional Persona Details
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <PersonaRow icon={User} label="Age" value={persona.age} />
              <PersonaRow icon={Phone} label="Employment" value={persona.employmentStatus} />
              {persona.loanAmount && (
                <PersonaRow icon={IndianRupee} label="Loan Amount" value={persona.loanAmount} />
              )}
              {persona.loanPurpose && (
                <PersonaRow icon={Info} label="Loan Purpose" value={persona.loanPurpose} />
              )}
              <PersonaRow 
                icon={Info} 
                label="Credit Score" 
                value={persona.creditScore} 
                className={persona.creditScore > 750 ? 'text-green-400' : 'text-amber-400'}
              />
            </div>

            {persona.lastLoanTaken && (
              <div className="mt-4">
                <PersonaRow 
                  icon={Info} 
                  label="Last Loan" 
                  value={`Taken ${persona.lastLoanTaken}`} 
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseCard;