import React from 'react';

/**
 * MetricCard - Large card with icon, label, and content
 * Used for displaying key simulation metrics
 */
export const MetricCard = ({ icon: Icon, iconColor, iconBgColor, label, children, className = '' }) => {
    return (
        <div className={`bg-gray-900 rounded-xl p-6 border border-gray-800/50 ${className}`}>
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="text-sm text-gray-400">{label}</div>
            </div>
            {children}
        </div>
    );
};

/**
 * StatCard - Compact card for displaying statistics
 * Used for quick stats like passed/failed counts
 */
export const StatCard = ({
    icon: Icon,
    iconColor = 'text-gray-400',
    label,
    value,
    valueColor = 'text-white',
    borderColor = 'border-gray-800/50',
    className = ''
}) => {
    return (
        <div className={`bg-gray-900 rounded-lg p-4 border ${borderColor} ${className}`}>
            <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${iconColor}`} />
                <span className="text-xs text-gray-400">{label}</span>
            </div>
            <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        </div>
    );
};

export default { MetricCard, StatCard };
