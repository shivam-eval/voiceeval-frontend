/**
 * KPI formatting utilities for display
 */

import {
    CheckCircle2,
    TrendingUp,
    ArrowRight,
    Flag,
    Shield,
    DollarSign,
    Hash,
    Clock,
    Phone,
    AlertCircle,
} from 'lucide-react';

/**
 * Format KPI value based on data type and unit
 * @param {*} value - The KPI value
 * @param {string} dataType - Data type (int, float, boolean, string, list, dict)
 * @param {string} unit - Unit (USD, %, count, minutes, etc.)
 * @returns {string} Formatted value
 */
export const formatKPIValue = (value, dataType, unit = '') => {
    if (value === null || value === undefined) return '--';

    // Auto-detect object type if dataType isn't explicitly set correctly
    const effectiveDataType = (typeof value === 'object' && !Array.isArray(value)) ? 'object' : dataType;

    switch (effectiveDataType) {
        case 'boolean':
            return value === true ? 'YES' : value === false ? 'NO' : '--';

        case 'int':
            return (unit && unit !== 'count') ? `${value} ${unit}` : value.toString();

        case 'float':
            if (unit === '%' || unit === 'percentage') {
                // If value is 0-1, convert to percentage. If 0-100, keep as is.
                const percentage = (value >= 0 && value <= 1) ? (value * 100).toFixed(1) : value.toFixed(1);
                return `${percentage}%`;
            } else if (unit === 'USD' || unit === '$' || unit === 'INR') {
                const symbol = unit === 'INR' ? '₹' : (unit === 'USD' || unit === '$') ? '$' : unit;
                return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else {
                return (unit && unit !== 'count') ? `${value.toFixed(2)} ${unit}` : value.toFixed(2);
            }

        case 'string':
            return value;

        case 'list':
            if (Array.isArray(value)) {
                return value.length > 0 ? value.join(', ') : 'None';
            }
            return 'None';

        case 'dict':
        case 'object':
            if (typeof value === 'object') {
                // 1. Conversion Rate object
                if (value.converted !== undefined) {
                    return value.converted ? 'CONVERTED' : 'NO CONVERSION';
                }
                // 2. Transfer Rate object
                if (value.transferred !== undefined) {
                    return value.transferred ? 'TRANSFERRED' : 'NOT TRANSFERRED';
                }
                // 3. Objection Handling object
                if (value.objections_detected !== undefined) {
                    return `${value.objections_handled || 0} / ${value.objections_detected || 0} handled`;
                }
                // 4. Outcome object
                if (value.outcome !== undefined) {
                    return String(value.outcome).toUpperCase();
                }
                // 5. Abandonment reason object { reason, abandoned }
                if (value.reason !== undefined) {
                    const reason = String(value.reason).replace(/_/g, ' ');
                    return reason.charAt(0).toUpperCase() + reason.slice(1).toLowerCase();
                }
                // 6. General object fallback - check if it has a 'value' field itself
                if (value.value !== undefined) return String(value.value);

                // Final fallback: show count of keys
                return `${Object.keys(value).length} details`;
            }
            return '--';

        default:
            return String(value);
    }
};

/**
 * Get icon component for a KPI
 * @param {string} kpiType - KPI type or ID
 * @param {string} kpiId - KPI ID (for dynamic KPIs)
 * @returns {React.Component} Lucide icon component
 */
const NoIcon = () => null;

export const getKPIIcon = (kpiType, kpiId) => {
    // No icon for abandonment_reason
    if (kpiType === 'abandonment_reason') return NoIcon;

    // Map standard static KPIs
    const staticIconMap = {
        fcr: CheckCircle2,
        first_call_resolution: CheckCircle2,
        conversion: TrendingUp,
        transfer: ArrowRight,
        outcome: Flag,
        call_outcome: Flag,
        objection_handling: Shield,
    };

    if (staticIconMap[kpiType]) {
        return staticIconMap[kpiType];
    }

    // Map dynamic KPIs based on common keywords
    const kpiLower = (kpiId || kpiType || '').toLowerCase();

    if (kpiLower.includes('payment') || kpiLower.includes('amount') || kpiLower.includes('price') || kpiLower.includes('discount') || kpiLower.includes('offered')) {
        return DollarSign;
    }
    if (kpiLower.includes('count') || kpiLower.includes('number') || kpiLower.includes('quantity')) {
        return Hash;
    }
    if (kpiLower.includes('time') || kpiLower.includes('duration') || kpiLower.includes('minute')) {
        return Clock;
    }
    if (kpiLower.includes('call') || kpiLower.includes('phone')) {
        return Phone;
    }

    // Default icon
    return AlertCircle;
};

/**
 * Get color based on KPI performance
 * @param {*} value - KPI value
 * @param {string} dataType - Data type
 * @param {number} goodThreshold - Threshold for good performance (default: 0.8)
 * @param {number} warningThreshold - Threshold for warning (default: 0.6)
 * @returns {string} Tailwind color class
 */
export const getKPIColor = (value, dataType, goodThreshold = 0.8, warningThreshold = 0.6) => {
    if (value === null || value === undefined) return 'gray';

    // For booleans, true is good, false is bad
    if (dataType === 'boolean') {
        return value ? 'teal' : 'red';
    }

    // For numeric values (rates, percentages, scores)
    if (dataType === 'float' || dataType === 'int') {
        let normalizedValue = value;

        // Normalize to 0-1 range if value > 1 (assume it's a percentage)
        if (value > 1 && value <= 100) {
            normalizedValue = value / 100;
        }

        if (normalizedValue >= goodThreshold) return 'teal';
        if (normalizedValue >= warningThreshold) return 'yellow';
        return 'red';
    }

    // For other types, use neutral color
    return 'blue';
};

/**
 * Get confidence badge color
 * @param {number} confidence - Confidence score (0-1)
 * @returns {string} Tailwind color class
 */
export const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'yellow';
    return 'red';
};

/**
 * Calculate percentage from value and data type
 * @param {*} value - KPI value
 * @param {string} dataType - Data type
 * @returns {number} Percentage (0-100) or null
 */
export const calculateKPIPercentage = (value, dataType) => {
    if (value === null || value === undefined) return null;

    if (dataType === 'boolean') {
        return value ? 100 : 0;
    }

    if (dataType === 'float' || dataType === 'int') {
        // If value is 0-1, convert to percentage
        if (value <= 1) {
            return value * 100;
        }
        // If value is already > 1, assume it's a percentage
        return value;
    }

    return null;
};

/**
 * Get KPI category for grouping
 * @param {object} kpiSchema - KPI schema object
 * @returns {string} Category name
 */
export const getKPICategory = (kpiSchema) => {
    if (kpiSchema?.category) {
        return kpiSchema.category;
    }

    // Infer from KPI type
    const kpiType = kpiSchema?.kpi_type || kpiSchema?.kpi_id || '';

    const categoryMap = {
        fcr: 'quality',
        conversion: 'business_outcome',
        transfer: 'efficiency',
        outcome: 'business_outcome',
        objection_handling: 'quality',
    };

    return categoryMap[kpiType] || 'other';
};

/**
 * Get human-readable aggregation method label
 * @param {string} method - Aggregation method (sum, avg, rate, etc.)
 * @returns {string} Human-readable label
 */
export const getAggregationMethodLabel = (method) => {
    const labelMap = {
        sum: 'Total',
        avg: 'Average',
        rate: 'Rate',
        count: 'Count',
        min: 'Minimum',
        max: 'Maximum',
        median: 'Median',
        concat_unique: 'Unique Values',
        merge: 'Combined',
    };

    return labelMap[method] || method;
};
