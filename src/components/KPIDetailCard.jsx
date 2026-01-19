import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatKPIValue, getKPIIcon, getKPIColor, getConfidenceColor } from '../utils/kpiFormatters';

/**
 * Detailed KPI Card for Evaluation Reports
 * Shows KPI value, confidence, and expandable LLM reasoning
 */
const KPIDetailCard = ({ kpi }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        kpi_name,
        kpi_type,
        value,
        confidence,
        reasoning,
        details,
        is_dynamic,
        kpi_schema,
    } = kpi;

    // Use schema if available, otherwise infer from KPI
    const schema = kpi_schema || {};
    const name = schema.name || kpi_name || kpi_type;
    const description = schema.description || '';
    const dataType = schema.data_type || (typeof value === 'boolean' ? 'boolean' : typeof value === 'number' && Number.isInteger(value) ? 'int' : 'float');
    const unit = schema.unit || '';

    const Icon = getKPIIcon(kpi_type, kpi_type);
    const color = getKPIColor(value, dataType);
    const confidenceColor = getConfidenceColor(confidence || 1.0);
    const formattedValue = formatKPIValue(value, dataType, unit);

    // Color mappings
    const colorClasses = {
        teal: 'text-teal-400 border-teal-500/30 bg-teal-500/5',
        green: 'text-green-400 border-green-500/30 bg-green-500/5',
        yellow: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
        red: 'text-red-400 border-red-500/30 bg-red-500/5',
        blue: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
        gray: 'text-gray-400 border-gray-500/30 bg-gray-500/5',
    };

    const confidenceBadgeClasses = {
        green: 'bg-green-500/20 text-green-400 border-green-500/30',
        yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const cardColorClass = colorClasses[color] || colorClasses.gray;
    const confidenceBadgeClass = confidenceBadgeClasses[confidenceColor] || confidenceBadgeClasses.green;

    // Format details for display
    const formatDetails = (detailsObj) => {
        if (!detailsObj || typeof detailsObj !== 'object') return null;

        return Object.entries(detailsObj).map(([key, val]) => {
            if (val === null || val === undefined) return null;
            return (
                <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-gray-300">{String(val)}</span>
                </div>
            );
        }).filter(Boolean);
    };

    return (
        <div className={`bg-dark-panel rounded-lg p-4 border ${cardColorClass}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${cardColorClass}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-white font-semibold">{name}</h4>
                        {description && (
                            <p className="text-gray-500 text-xs mt-0.5">{description}</p>
                        )}
                    </div>
                </div>
                {is_dynamic && (
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        Dynamic
                    </span>
                )}
            </div>

            {/* Value */}
            <div className="mb-3">
                <div className={`text-3xl font-bold ${colorClasses[color]?.split(' ')[0] || 'text-white'}`}>
                    {formattedValue}
                </div>
            </div>

            {/* Confidence and Expand Button */}
            <div className="flex items-center justify-between mb-2">
                {confidence !== undefined && confidence < 1.0 && (
                    <span className={`text-xs px-2 py-1 rounded border ${confidenceBadgeClass}`}>
                        {Math.round(confidence * 100)}% confident
                    </span>
                )}
                {reasoning && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors ml-auto"
                    >
                        <span>Reasoning</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                )}
            </div>

            {/* Expandable Reasoning */}
            {isExpanded && reasoning && (
                <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700/50">
                    <p className="text-sm text-gray-300 leading-relaxed">{reasoning}</p>
                </div>
            )}

            {/* Details */}
            {details && Object.keys(details).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-1">
                    {formatDetails(details)}
                </div>
            )}
        </div>
    );
};

KPIDetailCard.propTypes = {
    kpi: PropTypes.shape({
        kpi_name: PropTypes.string,
        kpi_type: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
        confidence: PropTypes.number,
        reasoning: PropTypes.string,
        details: PropTypes.object,
        is_dynamic: PropTypes.bool,
        kpi_schema: PropTypes.object,
    }).isRequired,
};

export default KPIDetailCard;
