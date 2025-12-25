import React from 'react';

const EvaluationTable = ({onViewReport}) => {
  const testResults = [
    { id: 'TC-001', scenario: 'Happy Customer - Service Package', score: 94, duration: '3:12', outcome: 'Appointment', status: 'success' },
    { id: 'TC-002', scenario: 'Upgrade Seeker - Trade-In', score: 91, duration: '2:38', outcome: 'Appointment', status: 'success' },
    { id: 'TC-003', scenario: 'Skeptical Customer', score: 79, duration: '4:02', outcome: 'Email Sent', status: 'warning' },
    { id: 'TC-004', scenario: 'Busy Customer', score: 89, duration: '0:45', outcome: 'Callback', status: 'success' },
    { id: 'TC-005', scenario: 'Satisfied Referrer', score: 93, duration: '3:28', outcome: 'Referral', status: 'success' },
    { id: 'TC-006', scenario: 'Indecisive Customer', score: 81, duration: '3:55', outcome: 'Email Sent', status: 'warning' },
    { id: 'TC-007', scenario: 'DNC Request', score: 98, duration: '0:32', outcome: 'DNC Honored', status: 'success' },
    { id: 'TC-008', scenario: 'Competitor Loyal', score: 72, duration: '4:15', outcome: 'Declined', status: 'error' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return (
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const handleViewReport = (testId) => {
    console.log(`Viewing report for ${testId}`);
  };

  return (
    <div className="bg-dark-panel rounded-xl">
       
      {/* Test Results Table */}
      
      <div className="bg-dark-panel rounded-xl border p-6 border-gray-800/50 overflow-hidden">
      <h2 className="text-xl font-semibold text-white">TEST RESULTS</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
          
            <thead>
              <tr className="border-b border-gray-800/50 bg-dark-panel">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Test ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Scenario</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Score</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Duration</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Outcome</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`border-b border-gray-800/30 hover:bg-[#1e2433] transition-colors ${
                    index === testResults.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="text-white font-mono text-sm">{row.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 text-sm">{row.scenario}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold text-sm ${getScoreColor(row.score)}`}>
                      {row.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-sm">{row.duration}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-sm">{row.outcome}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusIcon(row.status)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                       onClick={() => onViewReport(row)}
                      className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg text-sm font-medium transition-colors border border-teal-500/20"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluationTable;