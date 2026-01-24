import React from 'react';
import { X, Brain, CheckCircle2 } from 'lucide-react';
import GenericDropdown from '../../../components/DropDown';
import Badge from '../../../components/Badge';

export const EvaluateModal = ({
    isOpen,
    onClose,
    evalAgentId,
    onAgentIdChange,
    agentOptions,
    onSubmit,
    isLoading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-dark-bg rounded-2xl max-w-md w-full border border-gray-800 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <Brain className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Evaluate All Calls</h3>
                            <p className="text-gray-400 text-sm">Configure evaluation parameters</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Select Agent
                            </label>
                            <GenericDropdown
                                options={agentOptions}
                                value={evalAgentId}
                                onChange={onAgentIdChange}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Manual Agent ID Input
                            </label>
                            <input
                                type="text"
                                value={evalAgentId}
                                onChange={(e) => onAgentIdChange(e.target.value)}
                                placeholder="Enter agent ID to evaluate against..."
                                className="w-full bg-dark-input border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                If provided, this ID will be used for the evaluation request.
                            </p>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={onSubmit}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Brain className="w-5 h-5" />
                                )}
                                Start Evaluation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const KPIDiscoveryModal = ({
    isOpen,
    onClose,
    discoveredKPIs,
    directory
}) => {
    if (!isOpen || !discoveredKPIs) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800 flex flex-col">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Discovered KPIs</h2>
                            <p className="text-sm text-gray-400">
                                AI discovered {discoveredKPIs.schemas?.length || 0} unique metrics for <span className="text-teal-400">{discoveredKPIs.agent_name || directory}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {discoveredKPIs.schemas?.map((schema, idx) => (
                            <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-purple-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                                        {schema.name}
                                    </h3>
                                    <Badge variant="purple" className="text-[10px] uppercase px-1.5 py-0">
                                        {schema.category?.replace('_', ' ') || 'Metric'}
                                    </Badge>
                                </div>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {schema.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 rounded text-xs text-gray-500 border border-gray-700">
                                        <span className="font-semibold text-gray-400">Unit:</span> {schema.unit || 'n/a'}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 rounded text-xs text-gray-500 border border-gray-700">
                                        <span className="font-semibold text-gray-400">Type:</span> {schema.data_type}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 rounded text-xs text-gray-500 border border-gray-700">
                                        <span className="font-semibold text-gray-400">Agg:</span> {schema.aggregation_method}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 flex gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-blue-400 font-bold mb-1">Getting Started</h4>
                            <p className="text-blue-400/80 text-sm leading-relaxed">
                                These KPIs have been registered for this agent. Once you evaluate calls,
                                the AI will automatically extract these metrics and calculate the aggregate scores shown on your dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
