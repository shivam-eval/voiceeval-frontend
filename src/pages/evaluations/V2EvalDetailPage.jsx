import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useV2EvalByCall, useV2TranscriptByCall } from '../../hooks/useV2Evaluations';
import ViewReport from '../evaluation/viewreport/ViewReport';
import DashboardLoader from '../../components/DashboardLoader';

const V2EvalDetailPage = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const { data: evalData, isLoading: isLoadingEval, error: evalError } = useV2EvalByCall(callId);
  const { data: transcriptResponse, isLoading: isLoadingTranscript } = useV2TranscriptByCall(callId);

  const handleBack = () => navigate(-1);

  // Transform v2 eval data into the report object ViewReport expects
  const report = useMemo(() => {
    if (!evalData) return null;
    const score = evalData.overall_score || 0;
    const normalizedScore = score <= 1 ? Math.round(score * 100) : Math.round(score);
    return {
      transcript_result_id: evalData.eval_id,
      session_id: evalData.call_id,
      path_id: evalData.test_case_id,
      test_id: evalData.test_case_id || 'Test Case',
      status: evalData.passed ? 'completed' : 'failed',
      overall_score: normalizedScore,
    };
  }, [evalData]);

  // Transform v2 transcript into the format CallTranscriptPanel expects
  const transcriptData = useMemo(() => {
    if (!transcriptResponse?.transcript) return null;
    const steps = transcriptResponse.transcript;

    // Convert recording URL to browser-playable HTTPS URL
    // Stored as gs://bucket/path — convert to https://storage.googleapis.com/bucket/path
    let audioUrl = null;
    if (evalData?.recording?.recording_url) {
      const url = evalData.recording.recording_url;
      if (url.startsWith('http')) {
        audioUrl = url;
      } else if (url.startsWith('gs://')) {
        audioUrl = url.replace('gs://', 'https://storage.googleapis.com/');
      }
    }

    return {
      audio_url: audioUrl,
      steps: steps.map(step => ({
        ...step,
        turn_role: step.turn_role || (step.role === 'agent' ? 'agent' : 'user'),
        speech_start_ms: step.speech_start_ms,
        speech_end_ms: step.speech_end_ms,
        duration_ms: step.speech_start_ms != null && step.speech_end_ms != null
          ? step.speech_end_ms - step.speech_start_ms
          : undefined,
      })),
      metadata: {
        total_turns: steps.length,
        duration_ms: steps.length > 0
          ? steps[steps.length - 1]?.speech_end_ms || 0
          : 0,
      },
    };
  }, [transcriptResponse, evalData]);

  // Loading state
  if (isLoadingEval || (evalData && isLoadingTranscript && !transcriptData)) {
    return <DashboardLoader message={isLoadingEval ? "Loading evaluation report..." : "Loading transcript data..."} />;
  }

  // Error state
  if (evalError) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-red-400 font-semibold mb-2">Evaluation Not Found</h3>
          <p className="text-gray-400">
            {evalError?.message || "The requested evaluation report could not be found."}
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

  // No data state
  if (!evalData) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen text-white">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="bg-dark-panel rounded-xl p-8 border border-gray-800/50 text-center">
          <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
          <p className="text-gray-400">No evaluation found for this call.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-0 px-8 pb-8">
      <ViewReport
        report={report}
        evaluation={evalData}
        transcriptData={transcriptData}
        onBack={handleBack}
        isUploaded={false}
        callId={null}
      />
    </div>
  );
};

export default V2EvalDetailPage;
