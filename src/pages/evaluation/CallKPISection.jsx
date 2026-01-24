import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { BarChart3 } from 'lucide-react';
import KPIDetailCard from '../../components/KPIDetailCard';

/**
 * Call KPI Section Component
 * Displays call-level KPIs in evaluation reports
 * Groups into Static (standard) and Dynamic (agent-specific) KPIs
 */
const CallKPISection = ({ kpiResults, evaluation }) => {
    // Separate static and dynamic KPIs
    const { staticKPIs, dynamicKPIs } = useMemo(() => {
        if (!kpiResults || kpiResults.length === 0) {
            return { staticKPIs: [], dynamicKPIs: [] };
        }

        const static_kpis = [];
        const dynamic_kpis = [];

        kpiResults.forEach((kpi) => {
            if (kpi.is_dynamic) {
                dynamic_kpis.push(kpi);
            } else {
                static_kpis.push(kpi);
            }
        });

        return { staticKPIs: static_kpis, dynamicKPIs: dynamic_kpis };
    }, [kpiResults]);

    // Don't render if no KPIs
    if (!kpiResults || kpiResults.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/30">
                    <BarChart3 className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Business KPIs</h2>
                    <p className="text-gray-400 text-sm">
                        {staticKPIs.length} standard metrics, {dynamicKPIs.length} agent-specific metrics
                    </p>
                </div>
            </div>

            {/* Static KPIs Section */}
            {staticKPIs.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <span>Standard Metrics</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">
                            {staticKPIs.length}
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        {staticKPIs.map((kpi, index) => (
                            <KPIDetailCard key={kpi.kpi_type || kpi.kpi_name || index} kpi={kpi} />
                        ))}
                    </div>
                </div>
            )}

            {/* Dynamic KPIs Section */}
            {dynamicKPIs.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                        <span>Agent-Specific Metrics</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            {dynamicKPIs.length} Dynamic
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        {dynamicKPIs.map((kpi, index) => (
                            <KPIDetailCard key={kpi.kpi_type || kpi.kpi_name || index} kpi={kpi} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

CallKPISection.propTypes = {
    kpiResults: PropTypes.arrayOf(
        PropTypes.shape({
            kpi_name: PropTypes.string,
            kpi_type: PropTypes.string.isRequired,
            value: PropTypes.any.isRequired,
            confidence: PropTypes.number,
            reasoning: PropTypes.string,
            details: PropTypes.object,
            is_dynamic: PropTypes.bool,
            kpi_schema: PropTypes.object,
        })
    ),
    evaluation: PropTypes.object,
};

CallKPISection.defaultProps = {
    kpiResults: [],
    evaluation: null,
};

export default CallKPISection;
