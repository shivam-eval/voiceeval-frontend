import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSimulation, useSimulationSessions } from '../../hooks/useSimulations';
import EvaluationDashboard from '../evaluation/index';
import DashboardLoader from '../../components/DashboardLoader';
import { WorkflowProvider } from '../../context/WorkFlowContext';
import {
    transformToLegacyDashboardFormat,
    transformSimulationForOverview
} from '../../utils/evaluationDataTransform';

const SimulationEvaluationPage = () => {
    const { simulationId } = useParams();
    const navigate = useNavigate();

    // Fetch simulation data
    const { data: simulation, isLoading: simulationLoading, error: simulationError } = useSimulation(simulationId);

    // Fetch all sessions for this simulation
    const { data: sessionsData, isLoading: sessionsLoading } = useSimulationSessions(simulationId);

    const isLoading = simulationLoading || sessionsLoading;
    const sessions = sessionsData?.sessions || [];

    console.log('SimulationEvaluationPage - Simulation:', simulation);
    console.log('SimulationEvaluationPage - Sessions:', sessions);

    // Transform sessions to evaluations format (sessions ARE evaluations with transcript data)
    const evaluations = sessions.map(session => {
        // Session data already contains what we need for evaluation display
        // Calculate score if not present (from simulation percentage or metrics)
        const sessionScore = session.metrics?.score;
        const simulationScore = (simulation?.metrics?.overall_score || 0) * 100;

        const calculatedScore = sessionScore !== undefined
            ? sessionScore
            : simulationScore;

        return {
            evaluation_id: session.session_id,
            session_id: session.session_id,
            path_id: session.test_case_id,
            test_case_name: session.metadata?.test_case_name || session.test_case_name || `Test Case ${session.session_id}`,
            overall_score: calculatedScore / 100, // Convert percentage to decimal for legacy dashboard
            passed: session.status === 'completed' && calculatedScore >= 70,
            issues_found: 0, // Can be calculated from transcript analysis
            execution_time_ms: session.transcript?.metadata?.duration_ms || session.duration_ms || 0,
            recommendations: [], // Placeholder - can be generated from analysis
            category_scores: [], // Placeholder - needs evaluation engine
            metric_results: [], // Placeholder - needs evaluation engine
            failure_propagation: {},
            transcript_steps: session.transcript?.steps || session.transcript_steps || [],
            metadata: session.metadata || {},
            audio_files: session.audio_files || []
        };
    });

    if (isLoading) {
        return <DashboardLoader message="Loading evaluation results..." />;
    }

    if (simulationError || !simulation) {
        return (
            <div className="p-8">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <h3 className="text-red-400 font-semibold mb-2">Error loading evaluation</h3>
                    <p className="text-gray-400">{simulationError?.message || 'Simulation not found'}</p>
                    <button
                        onClick={() => navigate('/simulation/runs')}
                        className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                    >
                        Back to Simulations
                    </button>
                </div>
            </div>
        );
    }

    if (evaluations.length === 0) {
        return (
            <div className="p-8">
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6">
                    <h3 className="text-yellow-400 font-semibold mb-2">No Sessions Available</h3>
                    <p className="text-gray-400">
                        This simulation has no sessions yet. Sessions are created when the simulation runs test cases.
                    </p>
                    <button
                        onClick={() => navigate(`/simulation/runs/${simulationId}`)}
                        className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Simulation
                    </button>
                </div>
            </div>
        );
    }

    // Transform data to legacy dashboard format
    const dashboardData = transformToLegacyDashboardFormat(simulation, evaluations);

    console.log('Dashboard data:', dashboardData);

    // Handler for navigating back
    const handleBack = () => {
        navigate(`/simulation/runs/${simulationId}`);
    };

    return (
        <WorkflowProvider initialWorkflow={dashboardData}>
            <div className="min-h-screen bg-dark-bg">
                <EvaluationDashboard
                    onBack={handleBack}
                />
            </div>
        </WorkflowProvider>
    );
};

export default SimulationEvaluationPage;
