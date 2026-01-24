import React from 'react';
import { BarChart3, Phone, Brain } from 'lucide-react';
import { formatKPIValue, getKPIIcon, getKPIColor } from '../../../utils/kpiFormatters';

const KPISection = ({
    kpisForDisplay,
    isLoadingKPIs,
    agentKPIsData,
    showKPIs,
    onToggleKPIs,
    onDiscoverKPIs,
    isDiscovering
}) => {
    const overviewKPIs = kpisForDisplay.filter(k => k.is_static).slice(0, 4);
    const agentSpecificKPIs = kpisForDisplay.filter(k => !k.is_static);

    const colorClasses = {
        teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', icon: 'bg-teal-500/20' },
        green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: 'bg-green-500/20' },
        yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: 'bg-yellow-500/20' },
        red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'bg-red-500/20' },
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'bg-blue-500/20' },
        gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', icon: 'bg-gray-500/20' },
    };

    const KPICard = ({ kpi, isDynamic = false }) => {
        const Icon = getKPIIcon(kpi.kpi_id, kpi.kpi_id);
        const color = getKPIColor(kpi.value, kpi.data_type);
        const formattedValue = formatKPIValue(kpi.value, kpi.data_type, kpi.unit);
        const colors = colorClasses[color] || colorClasses.gray;

        return (
            <div
                className="bg-[#030712] rounded-xl p-4 border border-teal-500/20 transition-all hover:bg-opacity-80 border-opacity-50"
                title={kpi.description}
            >
                <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg ${colors.icon}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-gray-400 text-xs font-medium line-clamp-1">
                        {kpi.name}
                    </div>
                </div>
                <div className={`text-xl font-bold ${colors.text}`}>
                    {formattedValue}
                </div>
            </div>
        );
    };

    return (
        <div className="mb-6 space-y-4">
            {/* Overview Section - First 4 Static KPIs */}
            {overviewKPIs.length > 0 && (
                <div className="bg-dark-panel rounded-xl border border-gray-800/50 p-5">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-teal-500/10 rounded-lg border border-teal-500/20">
                                <BarChart3 className="w-4 h-4 text-teal-400" />
                            </div>
                            <h3 className="text-base font-bold text-white">
                                Performance Overview
                                <span className="text-xs text-gray-500 ml-2 font-normal">(Last 30 Days)</span>
                            </h3>
                        </div>
                    </div>

                    {isLoadingKPIs ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <div key={idx} className="bg-gray-800/30 rounded-lg p-3 border border-gray-800/50 animate-pulse">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                                    </div>
                                    <div className="h-6 w-16 bg-gray-700 rounded mb-1"></div>
                                    <div className="h-3 w-24 bg-gray-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* Total Calls Card - Always first */}
                            <div
                                className="bg-[#030712] rounded-xl p-4 border border-blue-500/20 transition-all hover:bg-opacity-80"
                                title="Total calls analyzed in the last 30 days"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-blue-500/20">
                                        <Phone className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="text-gray-400 text-xs font-medium">
                                        Total Calls
                                    </div>
                                </div>
                                <div className="text-xl font-bold text-blue-400">
                                    {agentKPIsData?.total_calls || 0}
                                </div>
                            </div>

                            {/* Static KPI Cards */}
                            {overviewKPIs.map((kpi) => (
                                <KPICard key={kpi.kpi_id} kpi={kpi} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Agent-Specific Metrics Section */}
            {agentSpecificKPIs.length > 0 && (
                <div className="bg-dark-panel rounded-xl border border-gray-800/50 p-5">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <Brain className="w-4 h-4 text-purple-400" />
                            </div>
                            <h3 className="text-base font-bold text-white">
                                Agent-Specific Metrics
                                <span className="text-xs text-gray-500 ml-2 font-normal">({agentSpecificKPIs.length} metrics)</span>
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {agentSpecificKPIs.map((kpi) => (
                            <KPICard key={kpi.kpi_id} kpi={kpi} isDynamic />
                        ))}
                    </div>
                </div>
            )}

            {/* Discover KPIs CTA */}
            {!isLoadingKPIs && agentSpecificKPIs.length === 0 && overviewKPIs.length > 0 && (
                <div className="bg-purple-500/5 rounded-xl border border-purple-500/20 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <Brain className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-0.5">Discover Agent-Specific Metrics</h4>
                                <p className="text-xs text-gray-400">AI will analyze your calls to find unique KPIs for this agent</p>
                            </div>
                        </div>
                        <button
                            onClick={onDiscoverKPIs}
                            disabled={isDiscovering}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            <Brain className="w-4 h-4" />
                            {isDiscovering ? 'Discovering...' : 'Discover KPIs'}
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoadingKPIs && overviewKPIs.length === 0 && agentSpecificKPIs.length === 0 && (
                <div className="bg-dark-panel rounded-xl border border-gray-800/50 p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-gray-800/30 rounded-full border border-gray-700/50">
                            <BarChart3 className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">No KPI data available</p>
                            <p className="text-gray-500 text-xs">Start by evaluating some calls or click 'Discover KPIs' to find agent-specific metrics.</p>
                        </div>
                        <button
                            onClick={onDiscoverKPIs}
                            disabled={isDiscovering}
                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            <Brain className="w-4 h-4" />
                            {isDiscovering ? 'Discovering...' : 'Discover KPIs'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPISection;
