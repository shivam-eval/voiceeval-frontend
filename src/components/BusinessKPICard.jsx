import React from 'react';
import PropTypes from 'prop-types';
import { formatKPIValue, getKPIIcon, getKPIColor } from '../utils/kpiFormatters';

/**
 * Individual KPI Card Component
 * Displays a single KPI with icon, value, unit, and metadata
 */
const BusinessKPICard = ({
    kpiId,
    name,
    value,
    unit,
    dataType,
    aggregationMethod,
    description,
    confidence,
    isStatic = true,
    onClick,
}) => {
    // Get formatting and styling
    const Icon = getKPIIcon(kpiId, kpiId);
    const color = getKPIColor(value, dataType);
    const formattedValue = formatKPIValue(value, dataType, unit);

    // Color mappings
    const colorClasses = {
        teal: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
        green: 'text-green-400 bg-green-500/10 border-green-500/30',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
        red: 'text-red-400 bg-red-500/10 border-red-500/30',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        gray: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    };

    const iconBgClasses = {
        teal: 'bg-teal-500/20 text-teal-400',
        green: 'bg-green-500/20 text-green-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
        red: 'bg-red-500/20 text-red-400',
        blue: 'bg-blue-500/20 text-blue-400',
        gray: 'bg-gray-500/20 text-gray-400',
    };

    const cardColorClass = colorClasses[color] || colorClasses.gray;
    const iconColorClass = iconBgClasses[color] || iconBgClasses.gray;

    return (
        <div
            className={`bg-dark-panel rounded-xl p-4 border ${cardColorClass} transition-all hover:bg-gray-800/30 ${onClick ? 'cursor-pointer' : ''
                }`}
            onClick={onClick}
            title={description}
        >
            {/* Header with Icon */}
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${iconColorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
                </div>

            {/* Value */}
            <div className="mb-1">
                <div className={`text-2xl font-bold ${colorClasses[color]?.split(' ')[0] || 'text-white'}`}>
                    {formattedValue}
                </div>
            </div>

            {/* Name */}
            <div className="text-gray-400 text-sm font-medium mb-2">{name}</div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                {aggregationMethod && <span className="capitalize">{aggregationMethod}</span>}
                {confidence !== undefined && confidence < 1.0 && (
                    <span className={`px-1.5 py-0.5 rounded ${confidence >= 0.8 ? 'bg-green-500/20 text-green-400' :
                        confidence >= 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                        }`}>
                        {Math.round(confidence * 100)}% sure
                    </span>
                )}
            </div>
        </div>
    );
};

BusinessKPICard.propTypes = {
    kpiId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    unit: PropTypes.string,
    dataType: PropTypes.oneOf(['int', 'float', 'boolean', 'string', 'list', 'dict']).isRequired,
    aggregationMethod: PropTypes.string,
    description: PropTypes.string,
    confidence: PropTypes.number,
    isStatic: PropTypes.bool,
    onClick: PropTypes.func,
};

BusinessKPICard.defaultProps = {
    unit: '',
    aggregationMethod: '',
    description: '',
    confidence: 1.0,
    isStatic: true,
    onClick: null,
};

export default BusinessKPICard;
