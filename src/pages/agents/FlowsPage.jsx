import { useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import Button from "../../components/Button";

const FlowsPage = () => {
    const [flows, setFlows] = useState([]);

    const breadcrumbItems = [
        { label: "Agents", path: "/agents" },
        { label: "Flows" },
    ];

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                <SectionHeader
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    }
                    title="Conversation Flows"
                    description="Manage and visualize conversation flows for your voice agents"
                    breadcrumbItems={breadcrumbItems}
                    actions={
                        <Button
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            }
                        >
                            Generate New Flow
                        </Button>
                    }
                />

                {/* Empty State */}
                <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-teal-400/20 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No flows yet</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Generate conversation flows from your connected agents to visualize and manage dialogue paths
                        </p>
                        <Button>Generate Your First Flow</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlowsPage;
