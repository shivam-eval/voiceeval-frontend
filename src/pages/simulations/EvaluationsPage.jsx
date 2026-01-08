import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Calendar, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { useSimulations } from '../../hooks/useSimulations';
import DashboardLoader from '../../components/DashboardLoader';

const EvaluationsPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch all simulations
    const { data: simulationsData, isLoading } = useSimulations();
    const simulations = simulationsData?.simulations || [];

    // Filter simulations that are completed (have evaluations)
    const completedSimulations = simulations.filter(sim =>
        sim.status === 'completed' || sim.status === 'failed'
    );

    // Apply filters
    const filteredSimulations = completedSimulations.filter(sim => {
        const name = sim.metadata?.test_suite_name || sim.metadata?.flow_tree_name || sim.test_suite_id || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sim.simulation_id?.toLowerCase().includes(searchTerm.toLowerCase());

        const scoreRaw = 
            sim.metrics?.overall_score ?? 
            sim.metrics?.average_score ?? 
            sim.simulation_evaluation?.average_overall_score ?? 
            0;
        const score = scoreRaw * 100;

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'passed' && score >= 70) ||
            (statusFilter === 'failed' && score < 70);

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (simulation) => {
        const scoreRaw = 
            simulation.metrics?.overall_score ?? 
            simulation.metrics?.average_score ?? 
            simulation.simulation_evaluation?.average_overall_score ?? 
            0;
        const score = scoreRaw * 100;
        if (simulation.status === 'failed') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400 border border-red-500/30">
                    <XCircle className="w-3 h-3" />
                    Failed
                </span>
            );
        }
        if (score >= 80) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Excellent
                </span>
            );
        }
        if (score >= 70) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400 border border-blue-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Good
                </span>
            );
        }
        return null;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 70) return 'text-blue-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDuration = (ms) => {
        if (!ms) return 'N/A';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        return `${seconds}s`;
    };

    if (isLoading) {
        return <DashboardLoader message="Loading evaluations..." />;
    }

    return (
        <div className="h-screen overflow-hidden flex flex-col bg-dark-bg">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-800 bg-dark-surface">
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Evaluations</h1>
                            <p className="text-gray-400">
                                Review evaluation results from completed simulation runs
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-dark-input rounded-lg border border-gray-700">
                                <div className="text-xs text-gray-400">Total Evaluations</div>
                                <div className="text-2xl font-bold text-white">{completedSimulations.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by simulation ID or test suite..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 bg-dark-input border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-dark-input border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                        >
                            <option value="all">All Results</option>
                            <option value="passed">Passed (≥70%)</option>
                            <option value="failed">Failed (&lt;70%)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                {filteredSimulations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="bg-dark-surface border border-gray-800 rounded-lg p-12 text-center max-w-md">
                            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Evaluations Found</h3>
                            <p className="text-gray-400 mb-6">
                                {completedSimulations.length === 0
                                    ? "Complete a simulation run to see evaluation results here."
                                    : "No evaluations match your current filters."}
                            </p>
                            <Link
                                to="/simulation/runs"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <Play className="w-4 h-4" />
                                View Simulations
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredSimulations.map((simulation) => (
                            <div
                                key={simulation.simulation_id}
                                onClick={() => navigate(`/evaluations/results/${simulation.simulation_id}`)}
                                className="bg-dark-surface border border-gray-800 rounded-lg p-6 hover:border-primary-500/50 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                                                {simulation.metadata?.test_suite_name || simulation.metadata?.flow_tree_name || 'Unnamed Test Suite'}
                                            </h3>
                                            {getStatusBadge(simulation)}
                                        </div>
                                        <p className="text-sm text-gray-400 font-mono">
                                            {simulation.simulation_id}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {(() => {
                                            const scoreRaw = 
                                                simulation.metrics?.overall_score ?? 
                                                simulation.metrics?.average_score ?? 
                                                simulation.simulation_evaluation?.average_overall_score ?? 
                                                0;
                                            const score = scoreRaw * 100;
                                            return (
                                                <>
                                                    <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                                                        {Math.round(score)}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">Overall Score</div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-5 gap-4 pt-4 border-t border-gray-800">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Test Cases</div>
                                        <div className="text-sm font-semibold text-white">
                                            {simulation.progress?.completed || 0} / {simulation.progress?.total_sessions || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Progress</div>
                                        <div className="text-sm font-semibold text-white">
                                            {simulation.progress?.percentage ? Math.round(simulation.progress.percentage) : 0}%
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Start Time
                                        </div>
                                        <div className="text-sm font-semibold text-white">
                                            {formatDateTime(simulation.timestamps?.started_at || simulation.timestamps?.created_at || simulation.created_at)}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            End Time
                                        </div>
                                        <div className="text-sm font-semibold text-white">
                                            {formatDateTime(simulation.timestamps?.completed_at || simulation.timestamps?.ended_at || simulation.timestamps?.updated_at || simulation.updated_at)}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Duration
                                        </div>
                                        <div className="text-sm font-semibold text-white">
                                            {formatDuration(simulation.metrics?.total_duration_ms)}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {(simulation.progress?.total_sessions || 0) > 0 && (
                                    <div className="mt-4">
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${(simulation.metrics?.overall_score || 0) >= 0.7
                                                    ? 'bg-green-500'
                                                    : 'bg-yellow-500'
                                                    }`}
                                                style={{
                                                    width: `${simulation.progress?.percentage || 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvaluationsPage;
