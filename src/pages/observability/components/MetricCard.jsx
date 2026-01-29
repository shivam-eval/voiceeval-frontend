import React from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  format = 'number',
  trend = 'neutral'
}) => {
  const formatValue = (val) => {
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'currency':
        return `$${val}`;
      case 'duration':
        return `${val}s`;
      default:
        return val;
    }
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    if (change > 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4" />;
    } else if (change < 0) {
      return <ArrowTrendingDownIcon className="w-4 h-4" />;
    }
    return <MinusIcon className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!change) return 'text-gray-400';
    
    // For metrics where higher is better (pass rate, score)
    if (trend === 'positive') {
      return change > 0 ? 'text-green-500' : 'text-red-500';
    }
    
    // For metrics where lower is better (cost, duration)
    if (trend === 'negative') {
      return change > 0 ? 'text-red-500' : 'text-green-500';
    }
    
    // Neutral trend
    return 'text-gray-400';
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-5 hover:border-primary-500 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">
            {formatValue(value)}
          </p>
        </div>
        {Icon && (
          <div className="bg-primary-600/10 p-2 rounded-lg">
            <Icon className="w-6 h-6 text-primary-400" />
          </div>
        )}
      </div>

      {/* Change Indicator */}
      {change !== undefined && change !== null && (
        <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="font-medium">
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-gray-500 ml-1">
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
