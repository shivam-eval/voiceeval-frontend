import SectionHeader from "../../components/SectionHeader";

const AgentConfigurationPage = () => {
    const breadcrumbItems = [
        { label: "Agents", path: "/agents" },
        { label: "Configuration" },
    ];

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                <SectionHeader
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                    title="Agent Configuration"
                    description="Configure agent settings, dropoff nodes, and advanced parameters"
                    breadcrumbItems={breadcrumbItems}
                />

                {/* Configuration Sections */}
                <div className="space-y-6">
                    {/* Dropoff Nodes */}
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50">
                        <h3 className="text-xl font-bold text-white mb-4">Dropoff Nodes</h3>
                        <p className="text-gray-400 mb-4">
                            Configure dropoff nodes to identify where users exit the conversation flow
                        </p>
                        <div className="text-center py-8 text-gray-500">
                            Dropoff node configuration coming soon...
                        </div>
                    </div>

                    {/* Prompt Templates */}
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50">
                        <h3 className="text-xl font-bold text-white mb-4">Prompt Templates</h3>
                        <p className="text-gray-400 mb-4">
                            Manage system prompts and conversation templates
                        </p>
                        <div className="text-center py-8 text-gray-500">
                            Prompt template management coming soon...
                        </div>
                    </div>

                    {/* Voice Settings */}
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50">
                        <h3 className="text-xl font-bold text-white mb-4">Voice Settings</h3>
                        <p className="text-gray-400 mb-4">
                            Configure voice parameters and TTS settings
                        </p>
                        <div className="text-center py-8 text-gray-500">
                            Voice settings coming soon...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentConfigurationPage;
