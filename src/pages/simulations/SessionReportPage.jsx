import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSimulation, useSimulationSessions } from '../../hooks/useSimulations';
import ViewReport from '../evaluation/viewreport/ViewReport';
import DashboardLoader from '../../components/DashboardLoader';
import {
    transformSessionToReport,
    getTranscriptData,
    transformSimulationForOverview
} from '../../utils/evaluationDataTransform';

const SessionReportPage = () => {
    const { simulationId, sessionId } = useParams();
    const navigate = useNavigate();

    // Fetch simulation data for context
    const { data: simulation, isLoading: simulationLoading } = useSimulation(simulationId);

    // Fetch all sessions to find the specific one
    const { data: sessionsData, isLoading: sessionsLoading } = useSimulationSessions(simulationId, {
        status: '',
        include_evaluations: true
    });

    const isLoading = simulationLoading || sessionsLoading;
    const sessions = sessionsData?.sessions || [];

    // Find the specific session
    const session = sessions.find(s => s.session_id === sessionId);

    // Transform session to evaluation format
    const evaluation = session ? {
        evaluation_id: session.evaluation_id || session.session_id,
        session_id: session.session_id,
        path_id: session.path_id || session.test_case_id,
        test_case_name: session.test_case_name,
        overall_score: session.score ? session.score / 100 : 0,
        passed: session.status === 'completed' && (session.score || 0) >= 70,
        issues_found: session.issues_found || 0,
        execution_time_ms: session.duration_ms || 0,
        recommendations: session.recommendations || [],
        category_scores: session.category_scores || [],
        metric_results: session.metrics || session.metric_results || [],
        failure_propagation: session.failure_propagation || {
            critical_failure_turns: [],
            total_tainted_steps: 0,
            propagation_depth: 0,
            cascading_failures: {},
            step_health: {}
        },
        transcript_steps: session.transcript_steps,
        metadata: session.metadata,
        audio_files: session.audio_files
    } : null;

    const report = session ? transformSessionToReport(session) : null;
    const transcriptData = session && evaluation ? getTranscriptData(session, evaluation) : null;

    // Transform all sessions for simulation data context
    const allEvaluations = sessions.map(s => ({
        evaluation_id: s.evaluation_id || s.session_id,
        session_id: s.session_id,
        overall_score: s.score ? s.score / 100 : 0,
        passed: s.status === 'completed',
        execution_time_ms: s.duration_ms || 0
    }));

    const simulationData = simulation ? transformSimulationForOverview(simulation, allEvaluations) : null;

    const handleBack = () => {
        navigate(`/simulation/results/${simulationId}`);
    };

    if (isLoading) {
        return <DashboardLoader message="Loading session report..." />;
    }

    if (!session || !evaluation) {
        return (
            <div className="p-8">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <h3 className="text-red-400 font-semibold mb-2">Session Not Found</h3>
                    <p className="text-gray-400">The requested session could not be found.</p>
                    <button
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Results
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg p-8">
            <ViewReport
                report={report}
                evaluation={evaluation}
                transcriptData={transcriptData}
                simulationData={simulationData}
                onBack={handleBack}
            />
        </div>
    );
};

export default SessionReportPage;
