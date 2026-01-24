import React from 'react';
import { ChevronRight } from 'lucide-react';

const CallsPageHeader = ({ viewMode, directory, agentsData, onBackToDirectories }) => {
    const getAgentName = (agentId) => {
        const agent = agentsData?.agents?.find(a => a.provider_agent_id === agentId || a.agent_id === agentId);
        const rawName = agent?.name || agent?.agent_name || agentId.replace(/[_-]/g, ' ');
        return rawName.replace(/^Agent\s+/i, '');
    };

    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Calls Observability</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span
                    className={`cursor-pointer hover:text-teal-400 transition-colors ${viewMode === 'directories' ? 'text-teal-400 font-semibold' : ''}`}
                    onClick={onBackToDirectories}
                >
                    Agents
                </span>
                {viewMode === 'calls' && (
                    <>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-teal-400 font-semibold">
                            {getAgentName(directory)}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

export default CallsPageHeader;
