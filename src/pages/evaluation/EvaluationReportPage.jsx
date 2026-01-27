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
  const [transcriptData, setTranscriptData] = React.useState(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = React.useState(false);

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

  // Fetch transcript data when evaluation is available
  React.useEffect(() => {
    const fetchTranscript = async () => {
      if (!evaluation?.session_id) return;

      setIsLoadingTranscript(true);

      // Set a timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Transcript fetch timeout - continuing without transcript');
        setIsLoadingTranscript(false);
        toast.warning('Transcript is taking longer than expected. Report will load without it.', {
          autoClose: 5000,
          position: 'bottom-right'
        });
      }, 10000); // 10 second timeout

      try {
        const { getSessionTranscript } = await import('../../api/services/simulation.service');
        const json = await getSessionTranscript(evaluation.session_id);

        clearTimeout(timeoutId); // Clear timeout on success

        const steps = json.transcript_steps || json.transcript || [];

        if (steps.length === 0) {
          console.warn('No transcript steps found in response');
          setTranscriptData(null);
          setIsLoadingTranscript(false);
          return;
        }

        // Map the steps to the format expected by CallTranscriptPanel
        const mappedSteps = steps.map(step => ({
          ...step,
          turn_role: step.role === "agent" ? "agent" : "user",
          speech_start_ms: step.timing?.speech_start_ms,
          speech_end_ms: step.timing?.speech_end_ms,
          duration_ms: step.timing?.duration_ms
        }));

        // Get audio URL - use GCP Storage for audio files
        let audioUrl = null;
        const audioFilePath = simulationDetails?.metadata?.audio_file;
        if (audioFilePath) {
          // If it's already a full URL (http/https), use it as-is
          // Otherwise, construct GCP Storage URL
          const GCP_STORAGE_BASE_URL = import.meta.env.VITE_GCP_STORAGE_BASE_URL || 'https://storage.googleapis.com/voiceeval-public';
          audioUrl = audioFilePath.startsWith('http')
            ? audioFilePath
            : `${GCP_STORAGE_BASE_URL}/${audioFilePath}`;
        }

        const transcript = {
          audio_url: audioUrl,
          steps: mappedSteps,
          metadata: {
            session_id: json.session_id,
            simulation_id: json.simulation_id,
            total_turns: steps.length,
            duration_ms: steps.length > 0 ? steps[steps.length - 1].timing?.speech_end_ms : 0
          }
        };

        setTranscriptData(transcript);
      } catch (error) {
        clearTimeout(timeoutId); // Clear timeout on error
        console.error('Error fetching transcript:', error);

        // Show a user-friendly error message
        if (error.response?.status === 404) {
          console.info('Transcript not found - may not be available yet');
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          toast.error('Transcript request timed out. Please try refreshing the page.', {
            autoClose: 5000,
            position: 'bottom-right'
          });
        } else {
          toast.error('Failed to load transcript. Showing evaluation results only.', {
            autoClose: 5000,
            position: 'bottom-right'
          });
        }

        setTranscriptData(null);
      } finally {
        setIsLoadingTranscript(false);
      }
    };

    fetchTranscript();
  }, [evaluation?.session_id, simulationDetails]);


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

  // Show loading state while fetching evaluation OR initial transcript
  if (isLoading || (evaluation && isLoadingTranscript && !transcriptData)) {
    return <DashboardLoader message={isLoading ? "Loading evaluation report..." : "Loading transcript data..."} />;
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

  // Read isUploaded flag from URL
  const isUploadedFromUrl = searchParams.get('isUploaded') === 'true';
  const report = transformSessionToReport(evaluation);

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <ViewReport
        report={report}
        evaluation={evaluation}
        transcriptData={transcriptData}
        onBack={handleBack}
        isUploaded={isUploadedFromUrl}
      />
    </div>
  );
};

export default EvaluationReportPage;

