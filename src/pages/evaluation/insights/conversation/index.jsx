import {
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import ConversationDetailedMetrics from "./ConversationDetailedMetrics";
import ConversationQualityBreakdown from "./ConversationQualityBreakdown";

/* =========================
   HELPERS
========================= */

const StatBlock = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
      {label}
    </span>
    <span className="text-xl font-semibold text-white">
      {value ?? "—"}
    </span>
  </div>
);
const MetricSectionHeader = ({ title, status }) => (
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-white">
      {title}
    </h3>
    {status && (
      <span
        className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${status === "passed"
          ? "bg-green-500/20 text-green-400"
          : "bg-red-500/20 text-red-400"
          }`}
      >
        {status}
      </span>
    )}
  </div>
);

/* =========================
   Extract Conversation Category Data
========================= */
const extractConversationData = (response, data) => {
  let metrics = [];
  let score = 0;

  if (response) {
    // Called from ViewReport with single evaluation's category data
    metrics = response?.metrics || [];
    score = response?.score || 0;
  } else if (data) {
    // Called from Dashboard with aggregated data

    // 1. Try to find in simulation_evaluation (new res.json format)
    const simEval = data.simulation_evaluation;
    if (simEval) {
      // Extract metrics from average_metric_results
      if (Array.isArray(simEval.average_metric_results)) {
        metrics = simEval.average_metric_results
          .filter(m => m.category === 'conversation_quality')
          .map(m => ({
            ...m,
            score: m.average_score,
            status: m.average_score >= 0.7 ? 'passed' : 'failed' // Heuristic status
          }));
      }

      // Extract score - Prioritize by_category over average_category_scores
      if (simEval.average_scores?.by_category?.conversation_quality !== undefined) {
        score = simEval.average_scores.by_category.conversation_quality;
      } else if (Array.isArray(simEval.average_category_scores)) {
        const cat = simEval.average_category_scores.find(c => c.category === 'conversation_quality');
        if (cat) {
          score = cat.average_score || 0;
        }
      }
    }

    // 2. Fallback to evaluations[0].metric_results (new res.json format)
    if (metrics.length === 0 && Array.isArray(data.evaluations) && data.evaluations.length > 0) {
      metrics = data.evaluations[0].metric_results?.filter(m => m.category === 'conversation_quality') || [];
      // Calculate heuristic status for each metric if not present
      metrics = metrics.map(m => ({
        ...m,
        status: m.status || (m.score >= 0.7 ? 'passed' : 'failed')
      }));
    }

    // 3. Fallback to data.category_scores if metrics still empty
    if (metrics.length === 0 && Array.isArray(data.category_scores)) {
      const convCategory = data.category_scores.find(c => c.category === 'conversation_quality');
      if (convCategory) {
        metrics = convCategory.metrics || [];
        if (score === 0) {
          score = convCategory.average_score || 0;
        }
      }
    }

    // 4. Last fallback: aggregate from all evaluations
    if (metrics.length === 0 && Array.isArray(data.evaluations)) {
      const allMetrics = [];
      let totalScore = 0;
      let scoreCount = 0;

      data.evaluations.forEach(evaluation => {
        const convCat = evaluation.category_scores?.find(c => c.category === 'conversation_quality');
        if (convCat?.metrics) {
          allMetrics.push(...convCat.metrics);
          if (typeof convCat.score === 'number') {
            totalScore += convCat.score;
            scoreCount++;
          }
        }
      });

      metrics = allMetrics;
      if (score === 0) {
        score = scoreCount > 0 ? totalScore / scoreCount : 0;
      }
    }
  }

  return {
    score,
    metrics
  };
};

/* =========================
   COMPONENT
========================= */

const ConversationOverview = ({ response, data, onBack }) => {
  const processedResponse = extractConversationData(response, data);
  const metrics = processedResponse.metrics || [];
  const rawScore = processedResponse.score;
  const score = rawScore > 1 ? Math.round(rawScore) : Math.round(rawScore * 100);

  if (!metrics || metrics.length === 0) return null;

  /* -------------------------
     DERIVED VALUES
  ------------------------- */

  const passedCount = metrics.filter((m) => m.status === "passed").length;
  const totalCount = metrics.length;
  const failedCount = totalCount - passedCount;

  const hasTurnByTurn = metrics.some(
    (m) =>
      (m.metric_name === "words_per_minute" &&
        m.details?.turn_breakdown?.length) ||
      (m.metric_name === "text_sentiment" &&
        m.details?.per_turn_sentiment?.length)
  );

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
      )}

      {/* ================= HEADER CARD ================= */}
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 flex items-center justify-between shadow-lg">
        {/* Left */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <MessageSquare size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Conversation Quality
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Assesses grammar, context retention, and coherence
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-4xl font-bold text-teal-400">{score}%</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Overall Score</span>
          </div>
          <div className="h-10 w-px bg-gray-800" />
          {/* Passed / Failed */}
          <div className="flex gap-6 text-sm">
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{passedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Passed</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{failedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONVERSATION ANALYTICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics
          .filter((m) => !m.metric_name?.includes('words_per_minute') && !m.metric_name?.includes('text_sentiment'))
          .map((metric, idx) => {
            const isPassed = metric.status === "passed";
            const mName = metric.name || metric.metric_name;
            const label = mName?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Unknown Metric";
            const score = typeof metric.score === 'number' ? Math.round(metric.score * 100) : 0;

            // Filter and humanize details
            const details = Object.entries(metric.details || {})
              .filter(([key]) => !['passed', 'threshold', 'execution_time_ms', 'llm_usage', 'value', 'error_message'].includes(key));

            return (
              <div key={idx} className={`rounded-xl p-6 border ${isPassed ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-red-950/10 border-red-900/20'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{label}</span>
                    <span className={`text-2xl font-bold ${isPassed ? 'text-teal-400' : 'text-red-400'}`}>
                      {score}%
                    </span>
                  </div>
                  <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {isPassed ? '✓ PASSED' : '✗ FAILED'}
                  </div>
                </div>

                {details.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 pt-6 border-t border-gray-800/50">
                    {details.map(([key, value]) => (
                      <div key={key} className={`flex flex-col gap-1.5 ${key === 'reasoning' ? 'md:col-span-2' : ''}`}>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <div className="text-sm">
                          {value === null ? (
                            <span className="text-gray-600 italic">Not available</span>
                          ) : typeof value === 'object' && !Array.isArray(value) ? (
                            <div className="space-y-1">
                              {Object.entries(value).map(([subKey, subValue]) => (
                                <div key={subKey} className="text-gray-300">
                                  <span className="text-gray-500">{subKey.replace(/_/g, " ")}:</span> {String(subValue)}
                                </div>
                              ))}
                            </div>
                          ) : Array.isArray(value) ? (
                            value.length === 0 ? (
                              <span className="text-gray-500">None</span>
                            ) : (
                              <ul className="space-y-1.5">
                                {value.map((item, i) => (
                                  <li key={i} className="text-gray-300 flex items-start gap-2">
                                    <div className="w-1 h-1 bg-teal-500/40 rounded-full mt-2 flex-shrink-0" />
                                    <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
                                  </li>
                                ))}
                              </ul>
                            )
                          ) : (
                            <span className="text-gray-300 leading-relaxed">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                                typeof value === 'number' ? (
                                  // Format numbers nicely
                                  key.includes('score') || key.includes('rate') ? `${(value * 100).toFixed(1)}%` :
                                    key.includes('count') ? value :
                                      value.toFixed(2)
                                ) : String(value)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* =========================
         TURN-BY-TURN ANALYSIS
      ========================= */}
      {hasTurnByTurn && (
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
          {/* Header (UNCHANGED) */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-teal-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Turn-by-Turn Analysis
            </h2>
          </div>

          <div className="space-y-10">
            {/* WORDS PER MINUTE */}
            {metrics
              .filter((m) => m.metric_name === "words_per_minute")
              .map((metric, idx) => (
                <div key={idx} className="space-y-6">
                  {/* Summary */}
                  <MetricSectionHeader
                    title="Words Per Minute"
                    status={metric.status}
                  />
                  <div className="flex items-center gap-6 p-4 bg-dark-input/30 rounded-xl border border-gray-800/50">
                    <StatBlock
                      label="Overall WPM"
                      value={Math.round(metric.details?.overall_wpm)}
                    />
                    <div className="w-[1px] h-10 bg-gray-800/80" />
                    <StatBlock
                      label="Ideal Range"
                      value={metric.details?.ideal_range}
                    />
                    <div className="w-[1px] h-10 bg-gray-800/80" />
                    <StatBlock
                      label="Turns Analyzed"
                      value={metric.details?.turns_analyzed}
                    />
                  </div>


                  {metric.details?.reasoning && (
                    <div className="flex flex-col gap-1.5 pt-4 border-t border-gray-800/50">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">REASONING</span>
                      <span className="text-gray-300 text-sm leading-relaxed">
                        {metric.details.reasoning}
                      </span>
                    </div>
                  )}

                  {/* Turn Cards */}
                  <div className="space-y-4">
                    {metric.details.turn_breakdown.map((turn, tIdx) => {
                      const isIdeal =
                        turn.wpm >= 120 && turn.wpm <= 150;

                      return (
                        <div
                          key={tIdx}
                          className={`rounded-xl p-5 border ${isIdeal
                            ? "bg-dark-input border-gray-800/50"
                            : "bg-red-950/20 border-red-900/50"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-300">
                              Turn #{tIdx + 1}
                            </span>

                            <span
                              className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${isIdeal
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                                }`}
                            >
                              {Math.round(turn.wpm)} WPM
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-6 text-sm text-gray-400">
                            <div>
                              Words
                              <div className="text-gray-200 font-medium">
                                {turn.word_count}
                              </div>
                            </div>
                            <div>
                              Duration
                              <div className="text-gray-200 font-medium">
                                {Math.round(
                                  turn.duration_ms / 1000
                                )}
                                s
                              </div>
                            </div>
                            <div>
                              Status
                              <div className="text-gray-200 font-medium">
                                {isIdeal ? "Ideal" : "Too Fast"}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* TEXT SENTIMENT */}
            {metrics
              .filter((m) => m.metric_name === "text_sentiment")
              .map((metric, idx) => (
                <div key={idx} className="space-y-6">
                  {/* Summary */}
                  <MetricSectionHeader
                    title="Text Sentiment"
                    status={metric.status}
                  />
                  <div className="flex items-center gap-6 p-4 bg-dark-input/30 rounded-xl border border-gray-800/50">
                    <StatBlock
                      label="Agent Tone"
                      value={metric.details?.agent_tone}
                    />
                    <div className="w-[1px] h-10 bg-gray-800/80" />
                    <StatBlock
                      label="Customer Sentiment"
                      value={metric.details?.customer_sentiment}
                    />
                    <div className="w-[1px] h-10 bg-gray-800/80" />
                    <StatBlock
                      label="Dominant Emotion"
                      value={metric.details?.dominant_emotion}
                    />
                  </div>

                  {metric.details?.reasoning && (
                    <div className="flex flex-col gap-1.5 pt-4 border-t border-gray-800/50">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">REASONING</span>
                      <span className="text-gray-300 text-sm leading-relaxed">
                        {metric.details.reasoning}
                      </span>
                    </div>
                  )}

                  {/* Turn Cards */}
                  <div className="space-y-4">
                    {metric.details.per_turn_sentiment.map(
                      (turn, tIdx) => (
                        <div
                          key={tIdx}
                          className="rounded-xl p-5 bg-dark-input border border-gray-800/50"
                        >
                          <MetricSectionHeader
                            title={`Turn ${turn.turn_index + 1}`}
                            status={turn.status}
                          />
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-300">
                              Turn #{turn.turn_index + 1}
                            </span>

                            <span className="text-[10px] px-2 py-1 rounded font-bold uppercase bg-teal-500/20 text-teal-400">
                              {turn.emotion}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>Sentiment Score</span>
                            <span className="text-gray-200 font-medium">
                              {Math.round(
                                turn.sentiment_score * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Inflection Points */}
                  {metric.details?.inflection_points?.length >
                    0 && (
                      <div className="pt-6 border-t border-gray-800/50">
                        <MetricSectionHeader
                          title="Inflection Points"
                          status={metric.status}
                        />
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">
                          Inflection Points
                        </div>

                        <div className="space-y-3">
                          {metric.details.inflection_points.map(
                            (inf, iIdx) => (
                              <div
                                key={iIdx}
                                className={`flex items-center justify-between p-4 rounded-lg border ${inf.direction === "positive"
                                  ? "bg-green-950/20 border-green-900/40"
                                  : "bg-red-950/20 border-red-900/40"
                                  }`}
                              >
                                <div className="text-sm text-gray-300">
                                  Turn #{inf.turn_index + 1}
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-400">
                                    Δ{" "}
                                    {Math.round(
                                      inf.change_magnitude * 100
                                    )}
                                    %
                                  </span>

                                  <span
                                    className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${inf.direction === "positive"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                                      }`}
                                  >
                                    {inf.direction}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationOverview;
