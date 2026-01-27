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

    // Humanize metric names
    const humanizeMetricName = (name) => {
        if (!name) return "Unknown Metric";
        if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
        return String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    const humanizedName = humanizeMetricName(name);

    // Format details for display
    const formatDetails = (detailsObj) => {
        if (!detailsObj || typeof detailsObj !== 'object') return null;

        return Object.entries(detailsObj).map(([key, val]) => {
            const lowerKey = key.toLowerCase().replace(/_/g, ' ');
            if (val === null || val === undefined || 
                lowerKey.includes('llm usage') || 
                lowerKey.includes('data type') || 
                lowerKey.includes('unit') || 
                lowerKey.includes('conversation turns')) return null;

            // Handle objects like conversion or outcome
            let displayVal = String(val);
            if (typeof val === 'object' && val !== null) {
                if (val.outcome) displayVal = String(val.outcome);
                else if (val.converted !== undefined) displayVal = val.converted ? 'Yes' : 'No';
                else if (val.transferred !== undefined) displayVal = val.transferred ? 'Yes' : 'No';
                else displayVal = JSON.stringify(val);
            }

            // Humanize 'category' values
            if (key.toLowerCase() === 'category') {
                displayVal = humanizeMetricName(displayVal);
            }

            return (
                <div key={key} className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-300">
                        {displayVal}
                    </span>
                </div>
            );
        }).filter(Boolean);
    };

    return (
        <div className="bg-[#030712] rounded-xl p-6 border border-teal-500/20 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                        {humanizedName}
                    </span>
                    <div className={`${colorClasses[color]?.split(' ')[0] || 'text-white'} text-base font-normal`}>
                        {formattedValue}
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            {((details && Object.keys(details).length > 0) || confidence !== undefined || unit) && (
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-6 border-t border-gray-800/50">
                   {confidence !== undefined && (
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Confidence</span>
                            <span className={`text-sm font-semibold ${confidenceBadgeClasses[confidenceColor]?.split(' ')[1] || 'text-gray-300'}`}>
                                {Math.round(confidence * 100)}%
                            </span>
                        </div>
                    )}
                    {unit && (
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Unit</span>
                            <span className="text-sm text-gray-300">{unit}</span>
                        </div>
                    )}
                    {formatDetails(details)}
                </div>
            )}

            {/* Reasoning Toggle Section */}
            {reasoning && (
                <div className="flex flex-col gap-2 pt-6 border-t border-gray-800/50">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 group transition-all"
                    >
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-gray-400">
                            Reasoning
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="w-3 h-3 text-gray-500 group-hover:text-gray-400" />
                        ) : (
                            <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-gray-400" />
                        )}
                    </button>
                    
                    {isExpanded && (
                        <p className="text-sm text-gray-300 leading-relaxed mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            {reasoning}
                        </p>
                    )}
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
