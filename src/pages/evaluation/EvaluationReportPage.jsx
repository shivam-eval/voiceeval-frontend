import React, { useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEvaluation, useSessionEvaluations } from '../../hooks/useEvaluations';
import { useSimulation } from '../../hooks/useSimulations';
import { useEvents } from '../../context/EventsContext';
import ViewReport from './viewreport/ViewReport';
import DashboardLoader from '../../components/DashboardLoader';
import { ArrowLeft } from 'lucide-react';
import {
  transformSessionToReport,
  getTranscriptData
} from '../../utils/evaluationDataTransform';

const EvaluationReportPage = () => {
  const { evaluationId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const navigate = useNavigate();
  const { subscribe } = useEvents();

  // If we have evaluationId, fetch by ID
  const {
    data: evaluationById,
    isLoading: isLoadingById,
    error: errorById,
    refetch: refetchById
  } = useEvaluation(evaluationId && evaluationId !== 'session' ? evaluationId : null);

  // If we have a sessionId, fetch by session ID using the session endpoint
  const {
    data: evaluationsBySession,
    isLoading: isLoadingBySession,
    error: errorBySession,
    refetch: refetchBySession
  } = useSessionEvaluations(sessionId);

  const evaluation = useMemo(() => {
    if (evaluationById) {
      return Array.isArray(evaluationById) ? evaluationById[0] : evaluationById;
    }

    if (evaluationsBySession) {
      const list = Array.isArray(evaluationsBySession)
        ? evaluationsBySession
        : (evaluationsBySession?.evaluations || []);
      return list[0];
    }

    return null;
  }, [evaluationById, evaluationsBySession]);

  // Fetch simulation details to get the audio_file
  const simulationId = evaluation?.simulation_id || evaluation?.simulation?.simulation_id;
  const { data: simulationDetails } = useSimulation(simulationId);

  // Subscribe to SSE events for real-time evaluation updates (replaces polling)
  React.useEffect(() => {
    const unsubscribe = subscribe('call_evaluation_update', (data) => {
      console.log('📡 Evaluation update received:', data);

      const { status, evaluation_id, session_id, error, overall_score } = data;

      // Check if this update is for our evaluation
      const isOurEvaluation =
        (evaluationId && evaluation_id === evaluationId) ||
        (sessionId && session_id === sessionId);

      if (!isOurEvaluation) return;

      // Show toast and refetch when evaluation completes
      if (status === 'completed') {
        const scoreText = overall_score !== undefined ? ` (Score: ${Math.round(overall_score * 100)}%)` : '';
        toast.success(`✅ Evaluation completed${scoreText}`, {
          autoClose: 4000,
          position: 'bottom-right'
        });
        console.log('✅ Our evaluation completed, refetching data...');
        if (sessionId) {
          refetchBySession();
        } else if (evaluationId && evaluationId !== 'session') {
          refetchById();
        }
      } else if (status === 'failed') {
        toast.error(`❌ Evaluation failed: ${error || 'Unknown error'}`, {
          autoClose: 5000,
          position: 'bottom-right'
        });
        console.log('❌ Our evaluation failed, refetching data...');
        if (sessionId) {
          refetchBySession();
        } else if (evaluationId && evaluationId !== 'session') {
          refetchById();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, evaluationId, sessionId, refetchBySession, refetchById]);

  const isLoading = isLoadingById || isLoadingBySession;
  const error = errorById || errorBySession;

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <DashboardLoader message="Loading evaluation report..." />;
  }

  // If not found yet but we have a sessionId or evaluationId, show a waiting state instead of error
  if (!evaluation && (sessionId || (evaluationId && evaluationId !== 'session'))) {
    // If we have an error that isn't a 404, show error state
    // (Assuming 404 means it's not ready yet)
    const isActuallyMissing = error && error.response?.status !== 404;

    if (!isActuallyMissing) {
      return (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Processing Evaluation</h2>
          <p className="text-gray-400 text-center max-w-md">
            We're still analyzing this call. This report will appear automatically once processing is complete.
          </p>
          <button
            onClick={handleBack}
            className="mt-8 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Calls
          </button>
        </div>
      );
    }
  }

  if (error || !evaluation) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-red-400 font-semibold mb-2">Evaluation Not Found</h3>
          <p className="text-gray-400">
            {error?.message || "The requested evaluation report could not be found."}
          </p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    );
  }

  // Transform evaluation for ViewReport component
  const report = transformSessionToReport(evaluation);

  // Construct audio URL if simulationDetails is available
  const transcriptData = getTranscriptData(evaluation, evaluation);
  if (transcriptData && simulationDetails?.metadata?.audio_file) {
    const baseUrl = 'https://storage.googleapis.com/voiceeval-public/';
    const audioPath = simulationDetails.metadata.audio_file;
    transcriptData.audio_url = audioPath.startsWith('http') ? audioPath : `${baseUrl}${audioPath}`;
  }

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <ViewReport
        report={report}
        evaluation={evaluation}
        transcriptData={transcriptData}
        onBack={handleBack}
      />
    </div>
  );
};

export default EvaluationReportPage;

