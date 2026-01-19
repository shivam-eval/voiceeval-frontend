import React from 'react';
import PropTypes from 'prop-types';
import BusinessKPICard from './BusinessKPICard';

/**
 * KPI Metrics Grid Component
 * Displays multiple KPI cards in a responsive grid layout
 */
const KPIMetricsGrid = ({ kpis, columns = 4, loading, emptyMessage = 'No KPI data available' }) => {
    // Loading skeleton
    if (loading) {
        const skeletonCount = columns * 2; // Show 2 rows of skeletons
        return (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columns, 3)} xl:grid-cols-${columns} gap-4`}>
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <div
                        key={`skeleton-${index}`}
                        className="bg-dark-panel rounded-xl p-4 border border-gray-800/50 animate-pulse"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                        </div>
                        <div className="mb-1">
                            <div className="h-8 w-24 bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 w-20 bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty state
    if (!kpis || kpis.length === 0) {
        return (
            <div className="bg-dark-panel rounded-xl p-8 border border-gray-800/50 text-center">
                <div className="text-gray-400 text-sm">{emptyMessage}</div>
            </div>
        );
    }

    // Determine grid columns class based on count
    const getGridClass = () => {
        if (columns === 2) return 'grid-cols-1 md:grid-cols-2';
        if (columns === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        if (columns === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    };

    return (
        <div className={`grid ${getGridClass()} gap-4`}>
            {kpis.map((kpi, index) => (
                <BusinessKPICard
                    key={kpi.kpi_id || kpi.kpiId || `kpi-${index}`}
                    kpiId={kpi.kpi_id || kpi.kpiId}
                    name={kpi.name}
                    value={kpi.value}
                    unit={kpi.unit}
                    dataType={kpi.data_type || kpi.dataType}
                    aggregationMethod={kpi.aggregation_method || kpi.aggregationMethod}
                    description={kpi.description}
                    confidence={kpi.confidence}
                    isStatic={kpi.is_static !== undefined ? kpi.is_static : !kpi.is_dynamic}
                />
            ))}
        </div>
    );
};

KPIMetricsGrid.propTypes = {
    kpis: PropTypes.arrayOf(
        PropTypes.shape({
            kpi_id: PropTypes.string,
            kpiId: PropTypes.string,
            name: PropTypes.string.isRequired,
            value: PropTypes.any.isRequired,
            unit: PropTypes.string,
            data_type: PropTypes.string,
            dataType: PropTypes.string,
            aggregation_method: PropTypes.string,
            aggregationMethod: PropTypes.string,
            description: PropTypes.string,
            confidence: PropTypes.number,
            is_static: PropTypes.bool,
            is_dynamic: PropTypes.bool,
        })
    ),
    columns: PropTypes.number,
    loading: PropTypes.bool,
    emptyMessage: PropTypes.string,
};

KPIMetricsGrid.defaultProps = {
    kpis: [],
    columns: 4,
    loading: false,
    emptyMessage: 'No KPI data available',
};

export default KPIMetricsGrid;
