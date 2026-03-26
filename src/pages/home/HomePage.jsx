import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    // Quick action handlers
    const handleConnectAgent = () => {
        navigate("/agents");
    };

    const handleCreateTestSuite = () => {
        navigate("/testing/test-cases");
    };

    const handleRunSimulation = () => {
        navigate("/runs");
    };

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Welcome to Voice<span className="text-teal-400">Eval</span>
                    </h1>
                    <p className="text-gray-400">
                        Evaluate and test your voice agents with comprehensive metrics
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <button
                        onClick={handleConnectAgent}
                        className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 hover:border-teal-400/50 transition-all group text-left"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-teal-400/20 flex items-center justify-center group-hover:bg-teal-400/30 transition-colors">
                                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white">Connect Agent</h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Connect a new voice agent from Retell, Vapi, Bland, or other platforms
                        </p>
                    </button>

                    <button
                        onClick={handleCreateTestSuite}
                        className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 hover:border-teal-400/50 transition-all group text-left"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-teal-400/20 flex items-center justify-center group-hover:bg-teal-400/30 transition-colors">
                                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white">Create Test Case</h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Generate test cases from your agent configuration or upload audio
                        </p>
                    </button>

                    <button
                        onClick={handleRunSimulation}
                        className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 hover:border-teal-400/50 transition-all group text-left"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-teal-400/20 flex items-center justify-center group-hover:bg-teal-400/30 transition-colors">
                                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white">Run Simulation</h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Execute test cases and evaluate your voice agent's performance
                        </p>
                    </button>
                </div>

                {/* Getting Started */}
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800/50">
                    <h2 className="text-2xl font-bold text-white mb-6">Get Started</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-teal-400 font-semibold">1</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Connect Your Agent</h3>
                                <p className="text-gray-400 text-sm">
                                    Link your voice agent platform and extract the configuration
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-teal-400 font-semibold">2</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Create Test Cases</h3>
                                <p className="text-gray-400 text-sm">
                                    Generate comprehensive test scenarios based on your agent's flow
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-teal-400 font-semibold">3</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Run & Evaluate</h3>
                                <p className="text-gray-400 text-sm">
                                    Execute simulations and get detailed metrics on performance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                {/* <div className="mt-8 bg-gray-900 rounded-2xl p-8 border border-gray-800/50">
                    <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
                    <div className="text-center py-12">
                        <div className="text-gray-500 mb-4">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-lg">No recent activity yet</p>
                            <p className="text-sm mt-2">Start by connecting an agent to see your workflow history</p>
                        </div>
                    </div>
                </div> */}
            </div >

        </div >
    );
};

export default HomePage;
