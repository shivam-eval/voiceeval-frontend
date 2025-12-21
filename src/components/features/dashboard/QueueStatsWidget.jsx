import { useState, useEffect } from 'react'
import { getQueueStats } from '../../../api'

const QueueStatsWidget = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getQueueStats()
        setStats(response.data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch queue stats:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Poll queue stats every 5 seconds
    const interval = setInterval(fetchStats, 5000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-700 rounded w-16"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Queue Status</h4>
        <p className="text-xs text-red-400">Unavailable</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h4 className="text-sm font-medium text-gray-400 mb-3">Queue Status</h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Queued</span>
          <span className="text-sm font-semibold text-yellow-400">
            {stats.queued || 0}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Running</span>
          <span className="text-sm font-semibold text-teal-400">
            {stats.running || 0}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Completed</span>
          <span className="text-sm font-semibold text-green-400">
            {stats.completed || 0}
          </span>
        </div>
        
        {stats.failed > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Failed</span>
            <span className="text-sm font-semibold text-red-400">
              {stats.failed}
            </span>
          </div>
        )}
      </div>
      
      {stats.active_workers !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Active Workers</span>
            <span className="text-sm font-semibold text-blue-400">
              {stats.active_workers} / {stats.max_workers || 2}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default QueueStatsWidget
