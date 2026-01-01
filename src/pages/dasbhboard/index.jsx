import DashboardCards from './Dashboardcards'
import DashboardTable from './Dashboardtable'


const Dashboard = () => {
  /* -------------------- DATA -------------------- */
  const categoryPerformance = [
    { name: 'Script Adherence', score: 90, target: 85 },
    { name: 'Natural Flow', score: 77, target: 80 },
    { name: 'Objection Handling', score: 71, target: 75 },
    { name: 'Technical Performance', score: 93, target: 90 },
    { name: 'Compliance', score: 100, target: 100 },
    { name: 'Customer Satisfaction', score: 86, target: 85 }
  ]

  const summaryStats = {
    totalTests: 124,
    avgResponseTime: '1.8s',
    activeIssues: 3,
    emailCaptureRate: 82.5
  }

  /* -------------------- HELPERS -------------------- */


  const getBarColor = (score, target) => {
    if (score >= target) return 'bg-teal-400'
    if (score >= target - 5) return 'bg-yellow-400'
    return 'bg-orange-400'
  }

  

  /* -------------------- RENDER -------------------- */

  return (
    <div className="w-full max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your Voice AI agent performance</p>
      </div>

      {/* KPI Cards */}
   <DashboardCards/>

      {/* Table + Activity Feed */}
     <DashboardTable/>

      {/* Category Performance + Summary Statistics */}
      <div className="grid grid-cols-3 gap-6">
        {/* Category Performance */}
        <div className="col-span-2 bg-dark-panel rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-xl font-semibold text-white mb-4">Category Performance</h2>
          <div className="space-y-4">
            {categoryPerformance.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{c.score}%</span>
                    <span className="text-gray-500 text-xs">/ {c.target}%</span>
                  </div>
                </div>
                <div className="h-2 bg-dark-input rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(c.score, c.target)} transition-all duration-500`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="col-span-1 bg-dark-panel rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-xl font-semibold text-white mb-4">Summary Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-dark-input rounded-lg">
              <span className="text-gray-400 text-sm">Total Tests Run</span>
              <span className="text-white font-semibold">{summaryStats.totalTests}</span>
            </div>
            <div className="flex justify-between p-3 bg-dark-input rounded-lg">
              <span className="text-gray-400 text-sm">Avg Response Time</span>
              <span className="text-white font-semibold">{summaryStats.avgResponseTime}</span>
            </div>
            <div className="flex justify-between p-3 bg-dark-input rounded-lg">
              <span className="text-gray-400 text-sm">Active Issues</span>
              <span className="text-red-400 font-semibold">{summaryStats.activeIssues}</span>
            </div>
            <div className="flex justify-between p-3 bg-dark-input rounded-lg">
              <span className="text-gray-400 text-sm">Email Capture Rate</span>
              <span className="text-white font-semibold">{summaryStats.emailCaptureRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
