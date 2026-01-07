import { MessageSquare, ArrowLeft } from "lucide-react";

/* ========================= HELPERS ========================= */
const formatKey = (key) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatValue = (key, value) => {
  if (value === null || value === undefined) return "Not available";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (key.includes("wpm")) return Math.round(value);
    if (key.includes("score") || key.includes("rate"))
      return `${(value * 100).toFixed(1)}%`;
    if (key.includes("count")) return value;
    if (key.includes("duration") && key.includes("ms"))
      return `${Math.round(value / 1000)}s`;
    return value.toFixed(2);
  }
  return String(value);
};

/* ========================= Extract Conversation Category Data ========================= */
const extractConversationData = (response, data) => {
  let metrics = [];
  let score = 0;

  if (response) {
    metrics = response?.metrics || [];
    score = response?.score || 0;
  } else if (data) {
    const simEval = data.simulation_evaluation;
    if (simEval) {
      if (Array.isArray(simEval.average_metric_results)) {
        metrics = simEval.average_metric_results
          .filter((m) => m.category === "conversation_quality")
          .map((m) => ({
            ...m,
            score: m.average_score,
            status: m.average_score >= 0.7 ? "passed" : "failed",
          }));
      }
      if (
        simEval.average_scores?.by_category?.conversation_quality !== undefined
      ) {
        score = simEval.average_scores.by_category.conversation_quality;
      } else if (Array.isArray(simEval.average_category_scores)) {
        const cat = simEval.average_category_scores.find(
          (c) => c.category === "conversation_quality"
        );
        if (cat) score = cat.average_score || 0;
      }
    }

    if (
      metrics.length === 0 &&
      Array.isArray(data.evaluations) &&
      data.evaluations.length > 0
    ) {
      metrics =
        data.evaluations[0].metric_results?.filter(
          (m) => m.category === "conversation_quality"
        ) || [];
      metrics = metrics.map((m) => ({
        ...m,
        status: m.status || (m.score >= 0.7 ? "passed" : "failed"),
      }));
    }

    if (metrics.length === 0 && Array.isArray(data.category_scores)) {
      const convCategory = data.category_scores.find(
        (c) => c.category === "conversation_quality"
      );
      if (convCategory) {
        metrics = convCategory.metrics || [];
        if (score === 0) score = convCategory.average_score || 0;
      }
    }
  }

  return { score, metrics };
};

/* ========================= COMPONENT ========================= */
const ConversationOverview = ({ response, data, onBack }) => {
  const processedResponse = extractConversationData(response, data);
  const metrics = processedResponse.metrics || [];
  const rawScore = processedResponse.score;
  const score =
    rawScore > 1 ? Math.round(rawScore) : Math.round(rawScore * 100);

  if (!metrics || metrics.length === 0) return null;

  const passedCount = metrics.filter((m) => m.status === "passed").length;
  const failedCount = metrics.length - passedCount;

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

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-4xl font-bold text-teal-400">{score}%</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Overall Score
            </span>
          </div>
          <div className="h-10 w-px bg-gray-800" />
          <div className="flex gap-6 text-sm">
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{passedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Passed
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{failedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Failed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TOP ROW: 2-COLUMN LAYOUT ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics
          .filter((m) => {
            const mName = m.name || m.metric_name;
            return (
              mName === "not_early_termination" ||
              mName === "talk_ratio" ||
              mName === "hallucination"
            );
          })
          .map((metric, idx) => {
            const isPassed = metric.status === "passed";
            const mName = metric.name || metric.metric_name;
            const label =
              mName
                ?.replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown Metric";
            const metricScore =
              typeof metric.score === "number"
                ? Math.round(metric.score * 100)
                : 0;

            const details = Object.entries(metric.details || {}).filter(
              ([key]) =>
                ![
                  "passed",
                  "threshold",
                  "execution_time_ms",
                  "llm_usage",
                  "value",
                  "error_message",
                ].includes(key)
            );

            return (
              <div
                key={idx}
                className={`rounded-xl p-6 border ${isPassed
                  ? "bg-white/[0.02] border-white/[0.05]"
                  : "bg-red-950/10 border-red-900/20"
                  }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      {label}
                    </span>
                    <span
                      className={`text-2xl font-bold ${isPassed ? "text-teal-400" : "text-red-400"
                        }`}
                    >
                      {metricScore}%
                    </span>
                  </div>
                  <div
                    className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                  >
                    {isPassed ? "✓ PASSED" : "✗ FAILED"}
                  </div>
                </div>

                {/* Hallucinations List (Custom Rendering for Top Grid) */}
                {metric.details?.hallucinations &&
                  Array.isArray(metric.details.hallucinations) &&
                  metric.details.hallucinations.length > 0 && (
                    <div className="mb-6 pt-6 border-t border-gray-800/50 space-y-4">
                      <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                        Hallucinations Detected
                      </div>
                      <div className="space-y-4">
                        {metric.details.hallucinations.map((hallucination, i) => (
                          <div
                            key={i}
                            className="rounded-xl p-5 border bg-red-950/20 border-red-900/40"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm text-red-300 font-medium">
                                Issue #{i + 1}
                              </span>
                            </div>
                            <div className="text-sm text-gray-300 leading-relaxed">
                              {typeof hallucination === "object"
                                ? hallucination.text ||
                                hallucination.description ||
                                JSON.stringify(hallucination)
                                : String(hallucination)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {details.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 pt-6 border-t border-gray-800/50">
                    {details.map(([key, value]) => (
                      <div key={key} className={`flex flex-col gap-1.5 ${key === 'reasoning' ? 'md:col-span-2' : ''}`}>
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                          {formatKey(key)}
                        </span>
                        <div className="text-sm">
                          {value === null ? (
                            <span className="text-gray-600 italic">
                              Not available
                            </span>
                          ) : typeof value === "object" &&
                            !Array.isArray(value) ? (
                            <div className="space-y-1">
                              {Object.entries(value).map(
                                ([subKey, subValue]) => (
                                  <div key={subKey} className="text-gray-300">
                                    <span className="text-gray-500">
                                      {formatKey(subKey)}:
                                    </span>{" "}
                                    {String(subValue)}
                                  </div>
                                )
                              )}
                            </div>
                          ) : Array.isArray(value) ? (
                            value.length === 0 ? (
                              <span className="text-gray-500">None</span>
                            ) : (
                              <ul className="space-y-1.5">
                                {value.map((item, i) => (
                                  <li
                                    key={i}
                                    className="text-gray-300 flex items-start gap-2"
                                  >
                                    <div className="w-1 h-1 bg-teal-500/40 rounded-full mt-2 flex-shrink-0" />
                                    <span>
                                      {typeof item === "object"
                                        ? JSON.stringify(item)
                                        : String(item)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )
                          ) : (
                            <span className="text-gray-300 leading-relaxed">
                              {formatValue(key, value)}
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

      {/* ================= OTHER METRICS: FULL-WIDTH CARDS ================= */}
      <div className="grid grid-cols-1 gap-6">
        {metrics
          .filter((m) => {
            const mName = m.name || m.metric_name;
            return (
              mName !== "not_early_termination" &&
              mName !== "talk_ratio" &&
              mName !== "hallucination"
            );
          })
          .map((metric, idx) => {
            const isPassed = metric.status === "passed";
            const mName = metric.name || metric.metric_name;
            const label =
              mName?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
              "Unknown Metric";
            const metricScore =
              typeof metric.score === "number"
                ? Math.round(metric.score * 100)
                : 0;

            const turnData =
              metric.details?.turn_data ||
              metric.details?.turn_breakdown ||
              metric.details?.per_turn_sentiment ||
              null;

            const details = Object.entries(metric.details || {}).filter(
              ([key]) =>
                ![
                  "passed",
                  "threshold",
                  "execution_time_ms",
                  "llm_usage",
                  "value",
                  "error_message",
                  "turn_data",
                  "turn_breakdown",
                  "per_turn_sentiment",
                  "inflection_points",
                  "agent_sentences",
                ].includes(key)
            );

            const hasAgentSentences =
              metric.details?.agent_sentences &&
              Array.isArray(metric.details.agent_sentences);
            const hasInflectionPoints =
              metric.details?.inflection_points &&
              Array.isArray(metric.details.inflection_points);

            return (
              <div
                key={idx}
                className={`rounded-xl p-6 border ${isPassed
                  ? "bg-white/[0.02] border-white/[0.05]"
                  : "bg-red-950/10 border-red-900/20"
                  }`}
              >
                {/* Metric Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      {label}
                    </span>
                    <span
                      className={`text-2xl font-bold ${isPassed ? "text-teal-400" : "text-red-400"
                        }`}
                    >
                      {metricScore}%
                    </span>
                  </div>
                  <div
                    className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                  >
                    {isPassed ? "✓ PASSED" : "✗ FAILED"}
                  </div>
                </div>

                {/* Summary Statistics */}
                {details.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 pt-6 border-t border-gray-800/50">
                    {details.map(([key, value]) => (
                      <div key={key} className={`flex flex-col gap-1.5 ${key === 'reasoning' ? 'md:col-span-2' : ''}`}>
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                          {formatKey(key)}
                        </span>
                        <div className="text-sm">
                          {value === null ? (
                            <span className="text-gray-600 italic">
                              Not available
                            </span>
                          ) : typeof value === "object" &&
                            !Array.isArray(value) ? (
                            <div className="space-y-1">
                              {Object.entries(value).map(([subKey, subValue]) => (
                                <div key={subKey} className="text-gray-300">
                                  <span className="text-gray-500">
                                    {formatKey(subKey)}:
                                  </span>{" "}
                                  {String(subValue)}
                                </div>
                              ))}
                            </div>
                          ) : Array.isArray(value) ? (
                            value.length === 0 ? (
                              <span className="text-gray-500">None</span>
                            ) : (
                              <ul className="space-y-1.5">
                                {value.map((item, i) => (
                                  <li
                                    key={i}
                                    className="text-gray-300 flex items-start gap-2"
                                  >
                                    <div className="w-1 h-1 bg-teal-500/40 rounded-full mt-2 flex-shrink-0" />
                                    <span>
                                      {typeof item === "object"
                                        ? JSON.stringify(item)
                                        : String(item)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )
                          ) : (
                            <span className="text-gray-300 leading-relaxed">
                              {formatValue(key, value)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Agent Sentences (for repetition_count) */}
                {hasAgentSentences && (
                  <div className="pt-6 border-t border-gray-800/50 space-y-4">
                    <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                      Repeated Sentences
                    </div>
                    {metric.details.agent_sentences.length === 0 ? (
                      <span className="text-gray-500">None</span>
                    ) : (
                      <div className="space-y-4">
                        {metric.details.agent_sentences.map((sentence, i) => (
                          <div
                            key={i}
                            className="rounded-xl p-5 border bg-dark-input border-gray-800/50"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm text-gray-300">
                                Turn #{i + 1}
                              </span>
                            </div>
                            <div className="text-sm text-gray-200 leading-relaxed">
                              {typeof sentence === "object"
                                ? sentence.text || JSON.stringify(sentence)
                                : String(sentence)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Turn-by-Turn Analysis */}
                {turnData && Array.isArray(turnData) && turnData.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-gray-800/50">
                    <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-4">
                      Turn-by-Turn Analysis
                    </div>
                    <div className="space-y-4">
                      {turnData.map((turn, tIdx) => {
                        const turnNumber =
                          turn.step_number || turn.turn_index + 1 || tIdx + 1;
                        const turnStatus = turn.status;

                        let isIdeal = false;
                        let displayValue = null;

                        if (mName === "words_per_minute") {
                          isIdeal = turn.wpm >= 120 && turn.wpm <= 150;
                          displayValue = `WPM: ${Math.round(turn.wpm)}`;
                        } else if (mName === "text_sentiment") {
                          displayValue = turn.emotion || "Unknown";
                        }

                        return (
                          <div
                            key={tIdx}
                            className="rounded-xl p-5 border bg-dark-input border-gray-800/50"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm text-gray-300">
                                Turn #{turnNumber}
                              </span>
                              {displayValue && (
                                <span
                                  className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${isIdeal || turnStatus === "passed"
                                    ? "bg-green-500/20 text-green-400"
                                    : mName === "text_sentiment"
                                      ? "bg-teal-500/20 text-teal-400"
                                      : "bg-red-500/20 text-red-400"
                                    }`}
                                >
                                  {displayValue}
                                </span>
                              )}
                            </div>

                            {/* Turn Statistics */}
                            <div className="grid grid-cols-3 gap-6 text-sm">
                              {Object.entries(turn)
                                .filter(
                                  ([key]) =>
                                    ![
                                      "step_number",
                                      "turn_index",
                                      "status",
                                      "text",
                                      "transcript",
                                      "emotion",
                                      "wpm",
                                    ].includes(key)
                                )
                                .map(([key, value]) => (
                                  <div key={key}>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                                      {formatKey(key)}
                                    </div>
                                    <div className="text-gray-200 font-medium">
                                      {formatValue(key, value)}
                                    </div>
                                  </div>
                                ))}
                            </div>

                            {/* Turn Text/Transcript */}
                            {(turn.text || turn.transcript) && (
                              <div className="mt-4 pt-4 border-t border-gray-800/50">
                                <div className="text-sm text-gray-200 leading-relaxed italic">
                                  "{turn.text || turn.transcript}"
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Inflection Points (for sentiment metrics) */}
                {hasInflectionPoints && (
                  <div className="pt-6 border-t border-gray-800/50">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">
                      Sentiment Inflection Points
                    </div>
                    <div className="space-y-3">
                      {metric.details.inflection_points.map((inf, iIdx) => (
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
                              Δ {Math.round(inf.change_magnitude * 100)}%
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
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ConversationOverview;