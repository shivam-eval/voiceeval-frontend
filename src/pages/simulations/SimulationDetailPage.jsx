import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    ArrowLeft, StopCircle, RefreshCw, Download, MoreVertical,
    CheckCircle, XCircle, Users, Zap, AlertTriangle, Clock,
    ChevronRight, ChevronDown, Eye, BarChart3, Hash, Activity, Star
} from 'lucide-react';
import { useSimulationWithLiveUpdates, useSimulationSessions, useCancelSimulation, useRerunSimulation, useDeleteSimulation } from '../../hooks/useSimulations';
import { useBatchEvaluateSimulation, useBatchEvaluationStatus } from '../../hooks/useEvaluations';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { getEvaluationResults } from '../../api';
import { useWorkflow } from '../../context/WorkFlowContext';

const SimulationDetailPage = () => {
    const { simulationId } = useParams();
    const navigate = useNavigate();
    const [expandedSessions, setExpandedSessions] = useState([]);
    const [sessionFilter, setSessionFilter] = useState('all');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluationTaskId, setEvaluationTaskId] = useState(null);
    const [evaluationProgress, setEvaluationProgress] = useState(null);
    const { setSimulationResult } = useWorkflow();

    // Fetch simulation with live updates (auto-polls if running)
    const { data: simulation, isLoading, error } = useSimulationWithLiveUpdates(simulationId);
    const { data: sessionsData } = useSimulationSessions(simulationId, {
        status: sessionFilter === 'all' ? '' : sessionFilter
    });

    const cancelSimulation = useCancelSimulation();
    const rerunSimulation = useRerunSimulation();
    const deleteSimulation = useDeleteSimulation();
    const batchEvaluate = useBatchEvaluateSimulation();
    
    // Poll task status if evaluating
    const { data: taskStatus } = useBatchEvaluationStatus(evaluationTaskId, {
        enabled: !!evaluationTaskId
    });

    // Handle task completion
    useEffect(() => {
        if (taskStatus?.status === 'completed') {
            setIsEvaluating(false);
            setEvaluationTaskId(null);
            setEvaluationProgress(null);
            navigate(`/evaluations/results/${simulationId}`);
        } else if (taskStatus?.status === 'failed') {
            setIsEvaluating(false);
            setEvaluationTaskId(null);
            setEvaluationProgress(null);
            toast.error('Evaluation failed: ' + (taskStatus.error || 'Unknown error'));
        } else if (taskStatus?.progress) {
            setEvaluationProgress(taskStatus.progress);
        }
    }, [taskStatus, simulationId, navigate]);

    const toggleSession = (sessionId) => {
        setExpandedSessions(prev =>
            prev.includes(sessionId)
                ? prev.filter(id => id !== sessionId)
                : [...prev, sessionId]
        );
    };

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this simulation?')) {
            try {
                await cancelSimulation.mutateAsync(simulationId);
                toast.success('Simulation cancelled');
            } catch (error) {
                // Error handled by global interceptor
            }
        }
    };

    const handleRerun = async () => {
        if (window.confirm('This will create a new simulation. Continue?')) {
            try {
                const result = await rerunSimulation.mutateAsync(simulationId);
                toast.success('Simulation rerun initiated');
                navigate(`/simulation/runs/${result.new_simulation_id}`);
            } catch (error) {
                // Error handled by global interceptor
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure? This will permanently delete all simulation data.')) {
            try {
                await deleteSimulation.mutateAsync(simulationId);
                toast.success('Simulation deleted');
                navigate('/simulation/runs');
            } catch (error) {
                // Error handled by global interceptor
            }
        }
    };

    const handleViewEvaluation = async () => {
        setIsEvaluating(true);
        setEvaluationProgress(null);
        
        try {
            // First, check if evaluation already exists
            try {
                const existingEvaluation = await getEvaluationResults(simulationId);
                if (existingEvaluation.data && existingEvaluation.data.evaluations?.length > 0) {
                    // Evaluation exists, navigate directly to results
                    console.log('Existing evaluation found, navigating to results');
                    setIsEvaluating(false);
                    navigate(`/evaluations/results/${simulationId}`);
                    return;
                }
            } catch (error) {
                // Evaluation doesn't exist, continue to create new one
                console.log('No existing evaluation found, creating new one');
            }

            // No existing evaluation, call batch evaluate API
            const result = await batchEvaluate.mutateAsync({ 
                simulationId, 
                configOverrides: {} 
            });

            // Check if cached results returned immediately
            if (result.cached || result.status === 'completed') {
                setIsEvaluating(false);
                navigate(`/evaluations/results/${simulationId}`);
            } else {
                // Start polling with task_id
                setEvaluationTaskId(result.task_id);
            }
        } catch (error) {
            // Error handled by global interceptor
            setIsEvaluating(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (ms) => {
        if (!ms) return '-';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const getStatusBadgeVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'running':
                return 'info';
            case 'failed':
                return 'danger';
            default:
                return 'default';
        }
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mb-4"></div>
                        <p className="text-gray-400">Loading simulation details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !simulation) {
        return (
            <div className="p-8">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <h3 className="text-red-400 font-semibold mb-2">Error loading simulation</h3>
                    <p className="text-gray-400">{error?.message || 'Simulation not found'}</p>
                    <Button onClick={() => navigate('/simulation/runs')} className="mt-4">
                        Back to Simulations
                    </Button>
                </div>
            </div>
        );
    }

    if (isEvaluating) {
        const progress = evaluationProgress || { total: 0, evaluated: 0, failed: 0 };
        const percentage = progress.total > 0 ? Math.round((progress.evaluated / progress.total) * 100) : 0;
        
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-screen">
                    <div className="bg-gray-900 rounded-xl p-12 border border-gray-800/50 shadow-xl max-w-2xl w-full">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-teal-400 mb-6"></div>
                            <h2 className="text-3xl font-bold text-white mb-3">
                                Running Batch Evaluation
                            </h2>
                            <p className="text-gray-400 mb-4">
                                Analyzing simulation results and generating evaluation metrics...
                            </p>
                            {progress.total > 0 && (
                                <div className="mt-6 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Progress: {progress.evaluated} / {progress.total} sessions</span>
                                        <span>{percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-teal-400 to-green-400 transition-all duration-300" 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    {progress.failed > 0 && (
                                        <p className="text-orange-400 text-sm">
                                            ⚠️ {progress.failed} session(s) failed to evaluate
                                        </p>
                                    )}
                                    {progress.current_session_id && (
                                        <p className="text-gray-500 text-xs">
                                            Current: {progress.current_session_id}
                                        </p>
                                    )}
                                </div>
                            )}
                            {!progress.total && (
                                <div className="mt-6">
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-teal-400 to-green-400 animate-pulse" style={{ width: '70%' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const sessions = sessionsData?.sessions || [];

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/simulation/runs')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Simulations
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-3">
                                Simulation {simulation.simulation_id.substring(0, 12)}...
                            </h1>
                            <div className="flex items-center gap-3">
                                {(simulation.metadata?.test_suite_name || simulation.metadata?.flow_tree_name) && (
                                    <Badge variant="default">{simulation.metadata?.test_suite_name || simulation.metadata?.flow_tree_name}</Badge>
                                )}
                                {simulation.metadata?.agent_name && (
                                    <Badge variant="default">Agent: {simulation.metadata.agent_name}</Badge>
                                )}
                                <Badge variant={getStatusBadgeVariant(simulation.status)}>
                                    {simulation.status}
                                    {simulation.status === 'running' && (
                                        <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                    )}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {simulation.status === 'running' && (
                                <Button
                                    onClick={handleCancel}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <StopCircle className="w-4 h-4" />
                                    Cancel
                                </Button>
                            )}
                            {simulation.status === 'completed' && (
                                <>
                                    <Button
                                        onClick={handleRerun}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Rerun
                                    </Button>
                                    <Button
                                        onClick={handleViewEvaluation}
                                        disabled={isEvaluating}
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        {isEvaluating ? 'Evaluating...' : 'View Evaluation'}
                                    </Button>
                                </>
                            )}
                            <Button
                                onClick={handleDelete}
                                className="bg-gray-700 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            >
                                <AlertTriangle className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-teal-400/20 flex items-center justify-center">
                                <Hash className="w-5 h-5 text-teal-400" />
                            </div>
                            <div className="text-sm text-gray-400">Simulation ID</div>
                        </div>
                        <code className="text-xs text-teal-400 bg-gray-800 px-2 py-1 rounded block mt-2">
                            {simulation.simulation_id}
                        </code>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-400/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="text-sm text-gray-400">Status</div>
                        </div>
                        <div className="mt-2">
                            <Badge variant={getStatusBadgeVariant(simulation.status)} className="text-base">
                                {simulation.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-purple-400/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="text-sm text-gray-400">Started</div>
                        </div>
                        <div className="text-sm text-white mt-2">{formatDateTime(simulation.timestamps?.started_at || simulation.timestamps?.created_at)}</div>
                        {simulation.metrics?.total_duration_ms && (
                            <div className="text-xs text-gray-400 mt-1">Duration: {formatDuration(simulation.metrics.total_duration_ms)}</div>
                        )}
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                                <Star className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="text-sm text-gray-400">Overall Score</div>
                        </div>
                        {simulation.metrics?.overall_score !== null && simulation.metrics?.overall_score !== undefined ? (
                            <div className={`text-3xl font-bold mt-2 ${simulation.metrics.overall_score >= 0.9 ? 'text-green-400' :
                                simulation.metrics.overall_score >= 0.7 ? 'text-yellow-400' :
                                    'text-red-400'
                                }`}>
                                {(simulation.metrics.overall_score * 100).toFixed(1)}%
                            </div>
                        ) : (
                            <div className="text-2xl text-gray-500 mt-2">-</div>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                {simulation.status === 'completed' && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800/50">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-400">Total Sessions</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{simulation.progress?.total_sessions || 0}</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-green-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-gray-400">Passed</span>
                            </div>
                            <div className="text-2xl font-bold text-green-400">{simulation.progress?.completed || 0}</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-red-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-xs text-gray-400">Failed</span>
                            </div>
                            <div className="text-2xl font-bold text-red-400">{simulation.progress?.failed || 0}</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800/50">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs text-gray-400">Avg Latency</span>
                            </div>
                            <div className="text-2xl font-bold text-white">-</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-orange-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                <span className="text-xs text-gray-400">Issues</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-400">-</div>
                        </div>
                    </div>
                )}

                {/* Sessions Table */}
                <div className="bg-gray-900 rounded-xl border border-gray-800/50 overflow-hidden">
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-4">Sessions</h2>
                        <div className="flex gap-2">
                            {['all', 'completed', 'failed', 'running'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setSessionFilter(filter)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${sessionFilter === filter
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {filter}
                                    {filter === 'all' && simulation.progress?.total_sessions && ` (${simulation.progress.total_sessions})`}
                                    {filter === 'completed' && simulation.progress?.completed && ` (${simulation.progress.completed})`}
                                    {filter === 'failed' && simulation.progress?.failed && ` (${simulation.progress.failed})`}
                                    {filter === 'running' && simulation.progress?.active && ` (${simulation.progress.active})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-400">No sessions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-800/50 border-b border-gray-800">
                                    <tr>
                                        <th className="w-10 px-4 py-3"></th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Session ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Test Case</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Score</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Duration</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Started</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {sessions.map((session) => (
                                        <>
                                            <tr
                                                key={session.session_id}
                                                className="hover:bg-gray-800/50 transition-colors cursor-pointer"
                                                onClick={() => toggleSession(session.session_id)}
                                            >
                                                <td className="px-4 py-3">
                                                    {expandedSessions.includes(session.session_id) ? (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <code className="text-xs text-teal-400 bg-gray-800 px-2 py-1 rounded">
                                                        {session.session_id.substring(0, 12)}...
                                                    </code>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    {session.metadata?.test_case_name || session.test_case_id}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={getStatusBadgeVariant(session.status)}>
                                                        {session.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {session.metrics?.score !== null && session.metrics?.score !== undefined ? (
                                                        <span className={`text-sm font-semibold ${session.metrics.score >= 90 ? 'text-green-400' :
                                                            session.metrics.score >= 70 ? 'text-yellow-400' :
                                                                'text-red-400'
                                                            }`}>
                                                            {session.metrics.score.toFixed(1)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-300">
                                                    {formatDuration(session.transcript?.metadata?.duration_ms)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-300">
                                                    {formatDateTime(session.timestamps?.started_at)}
                                                </td>
                                            </tr>
                                            {expandedSessions.includes(session.session_id) && (
                                                <tr>
                                                    <td colSpan={7} className="bg-gray-800/30 p-6">
                                                        <div className="text-sm text-gray-300">
                                                            <p className="font-semibold mb-2">Session Details</p>
                                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                                <div>
                                                                    <span className="text-gray-400">Test Case ID:</span>
                                                                    <span className="ml-2 text-white">{session.test_case_id}</span>
                                                                </div>
                                                                {session.agent_id && (
                                                                    <div>
                                                                        <span className="text-gray-400">Agent ID:</span>
                                                                        <span className="ml-2 text-white">{session.agent_id}</span>
                                                                    </div>
                                                                )}
                                                                {session.error_message && (
                                                                    <div className="col-span-2">
                                                                        <span className="text-red-400">Error:</span>
                                                                        <span className="ml-2 text-red-300">{session.error_message}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mt-4 text-xs text-gray-400">
                                                                Click on a session to view transcript, metrics, and detailed results.
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimulationDetailPage;
