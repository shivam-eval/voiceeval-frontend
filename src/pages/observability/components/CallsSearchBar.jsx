import React, { useMemo } from 'react';
import { Search, ChevronLeft, Plus, Brain, Download } from 'lucide-react';
import GenericDropdown from '../../../components/DropDown';

const CallsSearchBar = ({
    viewMode,
    searchTerm,
    onSearchChange,
    directory,
    currentOptions,
    onDirectoryChange,
    onBackToDirectories,
    onEvaluateAll,
    onAddCalls,
    onImportBolna,
    isEvaluating
}) => {
    const isBolnaAgent = useMemo(() => {
        if (!directory || !currentOptions) return false;
        const selected = currentOptions.find((opt) => opt.value === directory);
        return selected?.platform === 'bolna';
    }, [directory, currentOptions]);

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3 w-full md:w-auto">
                {viewMode === 'calls' && (
                    <button
                        onClick={onBackToDirectories}
                        className="p-3 bg-dark-panel border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white shadow-lg"
                        title="Back to Agents"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
                <div className="relative flex-1 md:w-64">
                    <input
                        type="text"
                        placeholder={viewMode === 'directories' ? "Search agents..." : "Search calls..."}
                        className="w-full bg-dark-panel border border-gray-800 rounded-lg py-3 px-5 pl-5 text-base focus:outline-none focus:border-teal-500 transition-colors text-white placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                {viewMode === 'calls' && (
                    <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 min-w-[200px]">
                        <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Agent:</span>
                        <GenericDropdown
                            options={currentOptions}
                            value={directory}
                            onChange={onDirectoryChange}
                            className="flex-1"
                        />
                    </div>
                )}
                <button className="bg-dark-panel border border-gray-800 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors shadow-lg">
                    Search
                </button>
            </div>

            <div className="flex items-center gap-3">
                {viewMode === 'calls' && isBolnaAgent && (
                    <button
                        onClick={onImportBolna}
                        className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-orange-500/20 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                    >
                        <Download className="w-5 h-5" />
                        Import from Bolna
                    </button>
                )}
                {viewMode === 'calls' && (
                    <button
                        onClick={() => onEvaluateAll(directory)}
                        disabled={isEvaluating}
                        className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-purple-500/20 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.1)] disabled:opacity-50"
                    >
                        <Brain className="w-5 h-5" />
                        Evaluate All
                    </button>
                )}
                <button
                    onClick={onAddCalls}
                    className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                >
                    <Plus className="w-5 h-5" />
                    Add Calls
                </button>
            </div>
        </div>
    );
};

export default CallsSearchBar;
