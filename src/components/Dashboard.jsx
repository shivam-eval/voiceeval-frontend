import { useState } from 'react'

const Dashboard = () => {
  // Sample data
  const kpiData = {
    successRate: { value: 78.5, change: 5.2, trend: 'up' },
    conversionRate: { value: 42.3, change: 8.1, trend: 'up' },
    avgCallDuration: '3:15',
    complianceScore: 99.8
  }

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

  const categoryPerformance = [
    { name: 'Script Adherence', score: 90, target: 85, color: 'teal' },
    { name: 'Natural Flow', score: 77, target: 80, color: 'yellow' },
    { name: 'Objection Handling', score: 71, target: 75, color: 'orange' },
    { name: 'Technical Performance', score: 93, target: 90, color: 'teal' },
    { name: 'Compliance', score: 100, target: 100, color: 'teal' },
    { name: 'Customer Satisfaction', score: 86, target: 85, color: 'teal' }
  ]

  const summaryStats = {
    totalTests: 124,
    avgResponseTime: '1.8s',
    activeIssues: 3,
    emailCaptureRate: 82.5
  }

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
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
      case 'info':
        return <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-yellow-400'
    if (score >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const getBarColor = (score, target) => {
    if (score >= target) return 'bg-teal-400'
    if (score >= target - 5) return 'bg-yellow-400'
    return 'bg-orange-400'
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Overview of your Voice AI agent performance</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <div className="text-gray-400 text-sm mb-2">Success Rate</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-white">{kpiData.successRate.value}%</span>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+{kpiData.successRate.change}%</span>
              </div>
            </div>
            <div className="h-1 bg-dark-input rounded-full overflow-hidden">
              <div className="h-full bg-teal-400" style={{ width: `${kpiData.successRate.value}%` }} />
            </div>
          </div>

          <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <div className="text-gray-400 text-sm mb-2">Conversion Rate</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-white">{kpiData.conversionRate.value}%</span>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+{kpiData.conversionRate.change}%</span>
              </div>
            </div>
            <div className="h-1 bg-dark-input rounded-full overflow-hidden">
              <div className="h-full bg-teal-400" style={{ width: `${kpiData.conversionRate.value}%` }} />
            </div>
          </div>

          <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <div className="text-gray-400 text-sm mb-2">Avg Call Duration</div>
            <div className="text-3xl font-bold text-white mb-2">{kpiData.avgCallDuration}</div>
            <div className="text-gray-500 text-xs">Within target range</div>
          </div>

          <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <div className="text-gray-400 text-sm mb-2">Compliance Score</div>
            <div className="text-3xl font-bold text-white mb-2">{kpiData.complianceScore}%</div>
            <div className="h-1 bg-dark-input rounded-full overflow-hidden">
              <div className="h-full bg-green-400" style={{ width: `${kpiData.complianceScore}%` }} />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Test Results Table - 2 columns */}
          <div className="col-span-2 bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Test ID</th>
                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Scenario</th>
                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Score</th>
                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Duration</th>
                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Outcome</th>
                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((test, index) => (
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-dark-input/50 transition-colors">
                      <td className="py-3 text-white text-sm font-mono">{test.id}</td>
                      <td className="py-3 text-gray-300 text-sm">{test.scenario}</td>
                      <td className="py-3">
                        <span className={`font-semibold ${getScoreColor(test.score)}`}>{test.score}%</span>
                      </td>
                      <td className="py-3 text-gray-400 text-sm">{test.duration}</td>
                      <td className="py-3 text-gray-400 text-sm">{test.outcome}</td>
                      <td className="py-3">
                        {getStatusIcon(test.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed - 1 column */}
          <div className="col-span-1 bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold text-white mb-4">Activity Feed</h2>
            <div className="space-y-4">
              {activityFeed.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-sm">{activity.message}</p>
                    <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Performance and Summary Stats */}
        <div className="grid grid-cols-3 gap-6">
          {/* Category Performance - 2 columns */}
          <div className="col-span-2 bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold text-white mb-4">Category Performance</h2>
            <div className="space-y-4">
              {categoryPerformance.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{category.score}%</span>
                      <span className="text-gray-500 text-xs">/ {category.target}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-dark-input rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(category.score, category.target)} transition-all duration-500`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Statistics - 1 column */}
          <div className="col-span-1 bg-dark-panel rounded-xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold text-white mb-4">Summary Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-input rounded-lg">
                <span className="text-gray-400 text-sm">Total Tests Run</span>
                <span className="text-white font-semibold">{summaryStats.totalTests}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-input rounded-lg">
                <span className="text-gray-400 text-sm">Avg Response Time</span>
                <span className="text-white font-semibold">{summaryStats.avgResponseTime}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-input rounded-lg">
                <span className="text-gray-400 text-sm">Active Issues</span>
                <span className="text-red-400 font-semibold">{summaryStats.activeIssues}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-input rounded-lg">
                <span className="text-gray-400 text-sm">Email Capture Rate</span>
                <span className="text-white font-semibold">{summaryStats.emailCaptureRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

