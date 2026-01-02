import React from 'react';
import { User, Bot, Clock, Mic, Volume2, AlertCircle } from 'lucide-react';

const TurnByTurnAnalysis = ({ steps = [], stepHealth = {} }) => {
  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (ms) => {
    if (!ms) return 'N/A';
    const date = new Date(ms);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getHealthStatus = (turnId) => {
    const health = stepHealth[turnId];
    if (!health) return null;

    if (!health.is_healthy && !health.is_tainted) {
      return {
        label: 'Critical Failure',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        icon: AlertCircle
      };
    }

    if (health.is_tainted) {
      return {
        label: 'Tainted',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        icon: AlertCircle
      };
    }

    return {
      label: 'Healthy',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      icon: null
    };
  };

  return (
    <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-teal-400" />
        Turn-by-Turn Analysis
      </h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isUser = step.turn_role === 'user';
          const healthStatus = getHealthStatus(step.turn_id);
          const HealthIcon = healthStatus?.icon;

          return (
            <div 
              key={step.turn_id || index}
              className={`relative pl-12 pb-6 ${
                index !== steps.length - 1 ? 'border-l-2 border-gray-800/50 ml-6' : ''
              }`}
            >
              {/* Timeline Node */}
              <div className={`absolute left-0 top-0 -ml-6 w-12 h-12 rounded-full flex items-center justify-center ${
                isUser ? 'bg-blue-500/10 border-2 border-blue-500/30' : 'bg-purple-500/10 border-2 border-purple-500/30'
              }`}>
                {isUser ? (
                  <User className="w-5 h-5 text-blue-400" />
                ) : (
                  <Bot className="w-5 h-5 text-purple-400" />
                )}
              </div>

              {/* Turn Content */}
              <div className="bg-dark-input rounded-lg p-4 border border-gray-800/50 hover:border-gray-700/50 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      isUser 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {isUser ? 'SIMULATOR' : 'AGENT'}
                    </span>
                    
                    <span className="text-gray-500 font-mono text-xs">
                      Turn #{step.turn_number}
                    </span>

                    <span className="text-gray-600 text-xs">•</span>

                    <span className="text-gray-500 font-mono text-xs">
                      {step.turn_id}
                    </span>
                  </div>

                  {/* Health Status Badge */}
                  {healthStatus && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${healthStatus.bg} ${healthStatus.border} border`}>
                      {HealthIcon && <HealthIcon className={`w-3 h-3 ${healthStatus.color}`} />}
                      <span className={`text-xs font-medium ${healthStatus.color}`}>
                        {healthStatus.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Transcript Text */}
                <div className="mb-4">
                  <p className="text-white text-sm leading-relaxed">
                    {step.text || <span className="text-gray-500 italic">No transcript available</span>}
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-800/50">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Duration</span>
                    </div>
                    <p className="text-xs font-mono text-gray-300">
                      {formatDuration(step.duration_ms)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Start Time</span>
                    </div>
                    <p className="text-xs font-mono text-gray-300">
                      {formatTimestamp(step.speech_start_ms)}
                    </p>
                  </div>

                  {step.tts_start_ms && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Volume2 className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">TTS Time</span>
                      </div>
                      <p className="text-xs font-mono text-gray-300">
                        {formatDuration(step.tts_end_ms - step.tts_start_ms)}
                      </p>
                    </div>
                  )}

                  {step.overlap_detected && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-yellow-500">Overlap</span>
                      </div>
                      <p className="text-xs font-mono text-yellow-400">
                        {formatDuration(step.overlap_ms)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Failed Metrics (if any) */}
                {stepHealth[step.turn_id]?.failed_metrics?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-800/50">
                    <p className="text-xs text-gray-500 mb-2">Failed Metrics:</p>
                    <div className="flex flex-wrap gap-2">
                      {stepHealth[step.turn_id].failed_metrics.map((metric, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-mono"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tainted By */}
                {stepHealth[step.turn_id]?.tainted_by_turn_id && (
                  <div className="mt-3 pt-3 border-t border-gray-800/50">
                    <p className="text-xs text-yellow-500">
                      ⚠️ Tainted by failure in{' '}
                      <span className="font-mono font-semibold">
                        {stepHealth[step.turn_id].tainted_by_turn_id}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {(!steps || steps.length === 0) && (
        <div className="text-center py-12">
          <Mic className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No conversation turns available</p>
        </div>
      )}
    </div>
  );
};

export default TurnByTurnAnalysis;
