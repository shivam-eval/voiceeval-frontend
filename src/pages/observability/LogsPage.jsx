import { useState } from "react";
import SectionHeader from "../../components/SectionHeader";

const LogsPage = () => {
    const [logLevel, setLogLevel] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const breadcrumbItems = [
        { label: "Observability", path: "/observability/calls" },
        { label: "Logs" },
    ];

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                <SectionHeader
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    title="System Logs"
                    description="View system logs and debug information"
                    breadcrumbItems={breadcrumbItems}
                />

                {/* Filters */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                            />
                        </div>
                        <select
                            value={logLevel}
                            onChange={(e) => setLogLevel(e.target.value)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-teal-400"
                        >
                            <option value="all">All Levels</option>
                            <option value="error">Error</option>
                            <option value="warn">Warning</option>
                            <option value="info">Info</option>
                            <option value="debug">Debug</option>
                        </select>
                    </div>
                </div>

                {/* Logs Display */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50">
                    <div className="text-center py-12 text-gray-500">
                        <p className="mb-2">Log streaming coming soon...</p>
                        <p className="text-sm">Real-time system logs and debugging information will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogsPage;
