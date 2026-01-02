import React, { useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEvaluation, useEvaluations } from '../../hooks/useEvaluations';
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

  // If we have evaluationId, fetch by ID
  const { 
    data: evaluationById, 
    isLoading: isLoadingById, 
    error: errorById,
    refetch: refetchById
  } = useEvaluation(evaluationId !== 'session' ? evaluationId : null);

  // If we only have sessionId, fetch list and take first
  const { 
    data: evaluationsBySession, 
    isLoading: isLoadingBySession,
    error: errorBySession,
    refetch: refetchBySession
  } = useEvaluations(sessionId ? { sessionId } : {});

  const evaluation = useMemo(() => {
    if (evaluationById) {
      // Handle potential array response for single evaluation
      return Array.isArray(evaluationById) ? evaluationById[0] : evaluationById;
    }
    
    // Handle both { evaluations: [] } and [ ] response formats
    const list = Array.isArray(evaluationsBySession) 
      ? evaluationsBySession 
      : (evaluationsBySession?.evaluations || []);
      
    return list[0];
  }, [evaluationById, evaluationsBySession]);

  // Poll for evaluation if not found yet
  React.useEffect(() => {
    let interval;
    // Poll if:
    // 1. We have a sessionId but no evaluation yet
    // 2. We have an evaluationId but it's not found yet (and no error, or it's a 404)
    const shouldPoll = (!evaluation && (sessionId || evaluationId)) && !isLoading;
    
    if (shouldPoll) {
      interval = setInterval(() => {
        if (sessionId) refetchBySession();
        else if (evaluationId && evaluationId !== 'session') refetchById();
      }, 3000); // Poll every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [evaluation, sessionId, evaluationId, isLoading, refetchBySession, refetchById]);

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
  const transcriptData = getTranscriptData(evaluation, evaluation);

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
