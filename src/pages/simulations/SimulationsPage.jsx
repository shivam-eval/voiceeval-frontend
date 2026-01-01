import { useState } from "react";

const SimulationsPage = () => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Simulations</h1>
                        <p className="text-gray-400">Monitor and manage your test executions</p>
                    </div>
                    <button className="px-6 py-3 bg-teal-400 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run New Simulation
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search simulations by ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                            />
                        </div>
                        <select className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 focus:outline-none focus:border-teal-400">
                            <option>All Status</option>
                            <option>Running</option>
                            <option>Completed</option>
                            <option>Failed</option>
                        </select>
                        <button className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            More Filters
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-teal-400/20 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No simulations run yet</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Run your first simulation to start evaluating your voice agent's performance
                        </p>
                        <button className="px-6 py-3 bg-teal-400 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors">
                            Run Your First Simulation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationsPage;
