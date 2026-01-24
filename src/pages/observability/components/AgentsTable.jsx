import React from 'react';
import { Folder, ChevronRight, Brain, Plus } from 'lucide-react';

const AgentsTable = ({
    filteredCategories,
    isCategoriesLoading,
    displayedAgents,
    agentsPage,
    agentsPerPage,
    agentsData,
    onDirectoryClick,
    onEvaluateAll,
    onAddCalls,
    isEvaluating
}) => {
    const getAgentName = (cat) => {
        const agent = agentsData?.agents?.find(a => a.provider_agent_id === cat || a.agent_id === cat);
        const rawName = agent?.name || agent?.agent_name || `Agent ${cat.substring(0, 8)}`;
        return rawName.replace(/^Agent\s+/i, '');
    };

    const totalPages = Math.ceil(displayedAgents.length / agentsPerPage);
    const startIdx = (agentsPage - 1) * agentsPerPage;
    const endIdx = startIdx + agentsPerPage;
    const paginatedAgents = displayedAgents.slice(startIdx, endIdx);

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                    <th className="px-4 py-3">Agent Name</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
                {isCategoriesLoading ? (
                    <tr>
                        <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                Loading agents...
                            </div>
                        </td>
                    </tr>
                ) : filteredCategories.length === 0 ? (
                    <tr>
                        <td colSpan="2" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                                    <Folder className="w-8 h-8 text-gray-500" />
                                </div>
                                <p className="text-gray-400 text-lg font-medium">No agents found</p>
                                <button
                                    onClick={onAddCalls}
                                    className="mt-2 flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Your First Call
                                </button>
                            </div>
                        </td>
                    </tr>
                ) : (
                    paginatedAgents.map(cat => (
                        <tr
                            key={cat}
                            className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group"
                            onClick={() => onDirectoryClick(cat)}
                        >
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-teal-500/5 rounded border border-teal-500/10 group-hover:border-teal-500/30 transition-colors">
                                        <Folder className="w-4 h-4 text-teal-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-semibold text-sm">
                                            {getAgentName(cat)}
                                        </span>
                                        <span className="text-gray-500 text-xs font-mono">{cat}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEvaluateAll(cat);
                                        }}
                                        disabled={isEvaluating}
                                        className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded text-xs font-semibold hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                                    >
                                        <Brain className="w-3.5 h-3.5" />
                                        Evaluate All
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDirectoryClick(cat);
                                        }}
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-teal-400 transition-colors px-2 py-1.5"
                                    >
                                        <span className="text-xs font-medium">View Calls</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default AgentsTable;
