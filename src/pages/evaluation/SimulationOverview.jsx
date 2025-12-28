import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const SimulationOverview = ({ simulationData }) => {
  const { 
    simulation_id, 
    execution_summary, 
    timing,
    transcript_results = []
  } = simulationData || {};

  const successRate = execution_summary 
    ? ((execution_summary.completed_test_cases / execution_summary.total_test_cases) * 100).toFixed(1)
    : 0;

  const avgDuration = timing 
    ? (timing.duration_ms / execution_summary.total_test_cases / 1000).toFixed(1)
    : 0;

    
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-dark-panel to-dark-panel/50 rounded-xl border border-gray-800/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Simulation Overview
            </h2>
            <p className="text-gray-400 text-sm font-mono">
              ID: {simulation_id || 'N/A'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-semibold text-sm">
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Tests */}
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5 hover:border-gray-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs text-gray-500 font-medium">TOTAL</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {execution_summary?.total_test_cases || 0}
          </p>
          <p className="text-xs text-gray-400">Test Cases</p>
        </div>

        {/* Success Rate */}
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5 hover:border-gray-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xs text-gray-500 font-medium">SUCCESS</span>
          </div>
          <p className="text-3xl font-bold text-green-400 mb-1">
            {successRate}%
          </p>
          <p className="text-xs text-gray-400">
            {execution_summary?.completed_test_cases || 0} Completed
          </p>
        </div>

        {/* Failed Tests */}
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5 hover:border-gray-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-xs text-gray-500 font-medium">FAILED</span>
          </div>
          <p className="text-3xl font-bold text-red-400 mb-1">
            {execution_summary?.failed_test_cases || 0}
          </p>
          <p className="text-xs text-gray-400">Test Cases</p>
        </div>

        {/* Avg Duration */}
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5 hover:border-gray-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs text-gray-500 font-medium">AVG TIME</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {avgDuration}s
          </p>
          <p className="text-xs text-gray-400">Per Test</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-400" />
          Execution Timeline
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Start Time</span>
            <span className="text-white font-mono">
              {timing ? new Date(timing.start_time_ms).toLocaleString() : 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">End Time</span>
            <span className="text-white font-mono">
              {timing ? new Date(timing.end_time_ms).toLocaleString() : 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-800/50">
            <span className="text-gray-400 font-semibold">Total Duration</span>
            <span className="text-teal-400 font-semibold font-mono">
              {timing ? (timing.duration_ms / 1000).toFixed(2) : 0}s
            </span>
          </div>
        </div>
      </div>

      {/* Test Flow Summary */}
      {simulationData?.flow_tree_name && (
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            Test Flow
          </h3>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <p className="text-teal-400 font-mono text-sm">
                {simulationData.flow_tree_name}
              </p>
            </div>
            
            <div className="flex-1 h-px bg-gradient-to-r from-teal-500/20 to-transparent" />
            
            <span className="text-xs text-gray-500">
              Schema v{simulationData.schema_version || '1.0'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationOverview;
