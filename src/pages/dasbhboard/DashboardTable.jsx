import GenericTable from "../../components/TestCaseTable";
  const testResults = [
    { id: 'TC-001', scenario: 'Happy Customer - Service Package', score: 94, duration: '3:12', outcome: 'Appointment', status: 'success' },
    { id: 'TC-002', scenario: 'Upgrade Seeker - Trade-In', score: 91, duration: '2:38', outcome: 'Appointment', status: 'success' },
    { id: 'TC-003', scenario: 'Skeptical Customer', score: 79, duration: '4:02', outcome: 'Email Sent', status: 'warning' },
    { id: 'TC-004', scenario: 'Busy Customer', score: 89, duration: '0:45', outcome: 'Callback', status: 'success' },
    { id: 'TC-005', scenario: 'Satisfied Referrer', score: 93, duration: '3:28', outcome: 'Referral', status: 'success' },
    { id: 'TC-006', scenario: 'Indecisive Customer', score: 81, duration: '3:55', outcome: 'Email Sent', status: 'warning' },
    { id: 'TC-007', scenario: 'DNC Request', score: 98, duration: '0:32', outcome: 'DNC Honored', status: 'success' },
    { id: 'TC-008', scenario: 'Competitor Loyal', score: 72, duration: '4:15', outcome: 'Declined', status: 'error' }
  ]

  const activityFeed = [
    { type: 'success', message: 'Test TC-001 completed successfully', time: '2 min ago' },
    { type: 'warning', message: 'Low score detected in TC-003', time: '15 min ago' },
    { type: 'info', message: 'Compliance check passed for all tests', time: '1 hour ago' },
    { type: 'success', message: 'New test run started: TC-009', time: '2 hours ago' },
    { type: 'info', message: 'System prompt updated', time: '3 hours ago' }
  ]
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return (
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  const getActivityIcon = (type) => {
    if (type === 'success') return <div className="w-2 h-2 bg-green-400 rounded-full" />
    if (type === 'warning') return <div className="w-2 h-2 bg-yellow-400 rounded-full" />
    return <div className="w-2 h-2 bg-teal-400 rounded-full" />
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-yellow-400'
    if (score >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

const DashboardTable = () => {
    return ( <>
         <div className="grid grid-cols-3 gap-6">
        <GenericTable
          title="Test Results"
          data={testResults}
          columns={[
            { key: 'id', label: 'Test ID', render: v => <span className="text-white font-mono">{v}</span> },
            { key: 'scenario', label: 'Scenario' },
            { key: 'score', label: 'Score', render: v => <span className={`font-semibold ${getScoreColor(v)}`}>{v}%</span> },
            { key: 'duration', label: 'Duration', render: v => <span className="text-gray-400">{v}</span> },
            { key: 'outcome', label: 'Outcome', render: v => <span className="text-gray-400">{v}</span> },
            { key: 'status', label: 'Status', render: (_, row) => getStatusIcon(row.status) }
          ]}
        />

        {/* Activity Feed */}
        <div className="col-span-1 bg-dark-panel rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-xl font-semibold text-white mb-4">Activity Feed</h2>
          <div className="space-y-4">
            {activityFeed.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1.5">{getActivityIcon(a.type)}</div>
                <div>
                  <p className="text-gray-300 text-sm">{a.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </> );
}
 
export default DashboardTable;