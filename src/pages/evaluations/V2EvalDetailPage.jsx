import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { useV2EvalByCall } from '../../hooks/useV2Evaluations';

const V2EvalDetailPage = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const { data: evalData, isLoading, error } = useV2EvalByCall(callId);

  const overallScore = evalData?.overall_score;
  const passed = evalData?.passed;
  const categoryScores = evalData?.category_scores || [];
  const metricResults = evalData?.metric_results || [];
  const issues = evalData?.issues || [];
  const recommendations = evalData?.recommendations || [];

  const formatScore = (score) => {
    if (score === undefined || score === null) return '--';
    const num = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(num)) return '--';
    const pct = num > 1 ? num : num * 100;
    return `${pct.toFixed(1)}%`;
  };

  const getScoreColor = (score) => {
    if (score === undefined || score === null) return 'text-gray-500';
    const num = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(num)) return 'text-gray-500';
    const pct = num > 1 ? num : num * 100;
    if (pct >= 80) return 'text-green-400';
    if (pct >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score) => {
    if (score === undefined || score === null) return 'bg-gray-600';
    const num = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(num)) return 'bg-gray-600';
    const pct = num > 1 ? num : num * 100;
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreWidth = (score) => {
    if (score === undefined || score === null) return 0;
    const num = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(num)) return 0;
    return num > 1 ? num : num * 100;
  };

  const getSeverityColor = (severity) => {
    switch ((severity || '').toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading evaluation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen text-white">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="bg-dark-panel rounded-xl p-8 border border-gray-800/50 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-400">Failed to load evaluation data.</p>
          <p className="text-gray-500 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!evalData) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen text-white">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="bg-dark-panel rounded-xl p-8 border border-gray-800/50 text-center">
          <p className="text-gray-400">No evaluation found for this call.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen text-white">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Evaluations
      </button>

      {/* Header */}
      <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Call ID</p>
            <p className="font-mono text-sm text-gray-300">{callId}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Overall Score</p>
              <p className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {formatScore(overallScore)}
              </p>
            </div>
            {passed === true ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/30">
                <CheckCircle className="w-4 h-4" /> Passed
              </span>
            ) : passed === false ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                <XCircle className="w-4 h-4" /> Failed
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Category Scores */}
      {categoryScores.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Category Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryScores.map((cat, i) => {
              const catName = cat.category || cat.name || `Category ${i + 1}`;
              const score = cat.score;
              return (
                <div
                  key={i}
                  className="bg-dark-panel rounded-xl p-4 border border-gray-800/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-300">{catName}</p>
                    <p className={`text-sm font-bold ${getScoreColor(score)}`}>
                      {formatScore(score)}
                    </p>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getScoreBarColor(score)}`}
                      style={{ width: `${Math.min(getScoreWidth(score), 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metric Results */}
      {metricResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Metric Results</h2>
          <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-300">
                {metricResults.map((metric, i) => {
                  const name = metric.metric_name || metric.name || `Metric ${i + 1}`;
                  const score = metric.score;
                  const details = metric.details || metric.reason || metric.explanation;
                  return (
                    <tr key={i} className="border-b border-gray-800/30">
                      <td className="px-4 py-3 font-medium text-gray-200">{name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold ${getScoreColor(score)}`}>
                          {formatScore(score)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-md truncate">
                        {typeof details === 'string' ? details : details ? JSON.stringify(details) : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" /> Issues ({issues.length})
          </h2>
          <div className="space-y-3">
            {issues.map((issue, i) => {
              const severity = issue.severity || 'medium';
              const description = issue.description || issue.message || issue.text || JSON.stringify(issue);
              return (
                <div
                  key={i}
                  className="bg-dark-panel rounded-lg p-4 border border-gray-800/50 flex items-start gap-3"
                >
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(severity)}`}>
                    {severity}
                  </span>
                  <p className="text-gray-300 text-sm">{typeof description === 'string' ? description : JSON.stringify(description)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-teal-400" /> Recommendations
          </h2>
          <div className="bg-dark-panel rounded-xl p-4 border border-gray-800/50">
            <ul className="space-y-2">
              {recommendations.map((rec, i) => {
                const text = typeof rec === 'string' ? rec : rec.text || rec.description || rec.message || JSON.stringify(rec);
                return (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-teal-400 mt-0.5">-</span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default V2EvalDetailPage;
