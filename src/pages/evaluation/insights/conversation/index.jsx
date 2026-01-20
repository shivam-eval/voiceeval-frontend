import { MessageSquare, ArrowLeft } from "lucide-react";

/* ========================= HELPERS ========================= */
const formatKey = (key) => {
  if (!key || typeof key !== 'string') return "Unknown";
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatValue = (key, value) => {
  if (value === null || value === undefined) return "None";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (key.includes("wpm")) return Math.round(value);
    if (key.includes("score") || key.includes("rate"))
      return `${(value * 100).toFixed(1)}%`;
    if (key.includes("count")) return value;
    if (key.includes("duration") && key.includes("ms"))
      return `${Math.round(value / 1000)}s`;
    if (key.includes("turns") || key.includes("files") || key.includes("analyzed") || key.includes("sampled")) return Math.round(value);
    return value.toFixed(2);
  }
  return String(value);
};

const aggregateTurnData = (metrics, transcriptData) => {
  const turnsMap = new Map();

  // 1. First populate from transcriptData if available (source of truth for text)
  if (transcriptData && Array.isArray(transcriptData.steps)) {
    transcriptData.steps.forEach((step, idx) => {
      // step_number is usually 1-indexed, or fall back to idx
      const turnIndex = step.step_number ? step.step_number - 1 : idx;
      
      const text = step.text || step.content || step.transcript || "";
      // Calculate estimated WPM if duration is available
      let estimatedWpm = null;
      if (text && (step.duration_ms > 0 || step.duration > 0)) {
        const durationMs = step.duration_ms || (step.duration * 1000);
        const wordCount = text.toString().trim().split(/\s+/).length;
        const durationMin = durationMs / 60000;
        estimatedWpm = Math.round(wordCount / durationMin);
      }

      turnsMap.set(turnIndex, {
        index: turnIndex,
        title: `Turn #${turnIndex + 1}`,
        role: step.turn_role || (turnIndex % 2 === 0 ? 'agent' : 'user'),
        text: String(text),
        intent: step.intent || step.user_intent || null,
        metrics: [],
        estimatedWpm: estimatedWpm
      });
    });
  }

  // 2. Merge in metric data
  metrics.forEach(metric => {
    // Check for turn-based data in various structures
    const turnData = metric.details?.turn_data || 
                    metric.details?.turn_breakdown || 
                    metric.details?.per_turn_sentiment || 
                    [];

    if (Array.isArray(turnData)) {
      turnData.forEach((turn, idx) => {
        const turnIndex = turn.turn_index !== undefined ? turn.turn_index : 
                         turn.step_number !== undefined ? turn.step_number - 1 : idx;
        
        if (!turnsMap.has(turnIndex)) {
          turnsMap.set(turnIndex, {
            index: turnIndex,
            title: `Turn #${turnIndex + 1}`,
            text: "",
            intent: null,
            metrics: []
          });
        }

        const existingTurn = turnsMap.get(turnIndex);
        
        // Update text if we found a better source and existing is empty or shorter
        const candidateText = turn.text || turn.transcript || turn.input || turn.sentence || turn.message || "";
        // Always allowed to overwrite if existing is empty
        if (!existingTurn.text && candidateText) {
          existingTurn.text = String(candidateText);
        } else if (existingTurn.text && candidateText && candidateText.length > existingTurn.text.length) {
           // If we found a longer text, prefer it (even if we had some transcript data, it might have been truncated/empty)
           existingTurn.text = String(candidateText);
        }

        // Update intent if found in turn data
        const candidateIntent = turn.intent || turn.user_intent || turn.predicted_intent || turn.expected_intent;
        if (!existingTurn.intent && candidateIntent) {
          existingTurn.intent = String(candidateIntent);
        }

        // Add metric value for this turn
        const mName = metric.name || metric.metric_name || "";
        let value = null;
        let pValue = null; // Secondary value (e.g., sentiment score)
        let status = turn.status;

        // Helper for safe emotion processing
        const safeEmotion = typeof turn.emotion === 'string' ? turn.emotion.toLowerCase() : '';

        if (mName === 'words_per_minute') {
          value = `${Math.round(turn.wpm)} WPM`;
        } else if (mName === 'text_sentiment') {
          // Label
          value = String(turn.emotion || "Unknown");
          // Score
          const sentimentScore = turn.sentiment_score !== undefined ? turn.sentiment_score : turn.score;
          if (sentimentScore !== undefined) {
             pValue = `${(Number(sentimentScore) * 100).toFixed(1)}%`;
          }
        } else if (mName === 'toxicity') {
          value = turn.toxicity_score ? `Score: ${(turn.toxicity_score * 100).toFixed(1)}%` : null;
        }

        if (value || status) {
          existingTurn.metrics.push({
            name: formatKey(mName),
            value: value,
            pValue: pValue,
            status: status,
            // Helper for styling
            isPositive: status === 'passed' || (mName === 'text_sentiment' && ['joy', 'positive', 'neutral'].includes(safeEmotion)),
            isNegative: status === 'failed' || (mName === 'text_sentiment' && ['anger', 'sadness', 'negative'].includes(safeEmotion))
          });
        }
      });
    }
  });

  // 3. Post-process: Add fallback WPM if missing
  for (const turn of turnsMap.values()) {
     const hasWpm = turn.metrics.some(m => m.name.includes("Words Per Minute") || m.name.includes("Wpm"));
     if (!hasWpm && turn.estimatedWpm) {
        turn.metrics.push({
            name: "Words Per Minute", // Consistent naming
            value: `${turn.estimatedWpm} WPM`,
            isPositive: true // Neutral/Positive style
        });
     }
  }

  return Array.from(turnsMap.values()).sort((a, b) => a.index - b.index);
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
const ConversationOverview = ({ response, data, transcriptData, onBack }) => {
  const processedResponse = extractConversationData(response, data);
  const metrics = processedResponse.metrics || [];
  const rawScore = processedResponse.score;
  const score =
    rawScore > 1 ? Math.round(rawScore) : Math.round(rawScore * 100);

  if (!metrics || metrics.length === 0) return null;

  const passedCount = metrics.filter((m) => m.status === "passed").length;
  const failedCount = metrics.length - passedCount;

  let aggregatedturns = [];
  try {
    aggregatedturns = aggregateTurnData(metrics, transcriptData);
  } catch (error) {
    console.error("Error aggregating turns:", error);
  }

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


      {/* ================= TOP ROW: TALK RATIO & NOT EARLY TERMINATION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics
          .filter((m) => {
            const mName = m.name || m.metric_name;
            return (
              mName === "not_early_termination" ||
              mName === "talk_ratio"
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
                              None
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

      {/* ================= HALLUCINATION METRIC (FULL WIDTH) ================= */}
      {metrics
        .filter((m) => {
          const mName = m.name || m.metric_name;
          return mName === "hallucination";
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
                "hallucinations",
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
                            None
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
                    {(metric.name || metric.metric_name) !== 'repetition_count' && (
                      <span
                        className={`text-2xl font-bold ${isPassed ? "text-teal-400" : "text-red-400"
                          }`}
                      >
                        {metricScore}%
                      </span>
                    )}
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
                              None
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
      {/* ================= UNIFIED CONVERSATION TURNS ================= */}
      {aggregatedturns.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Conversation Turns
              </h3>
              <p className="text-gray-400 text-sm mt-0.5">
                Turn-by-turn breakdown with aggregated metric insights
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {aggregatedturns.map((turn) => {
              // Extract specific metrics for left column
              const wpmMetric = turn.metrics.find(m => m.name.includes("Words Per Minute") || m.name.includes("Wpm") || m.name === "WPM");
              const sentimentMetric = turn.metrics.find(m => m.name.includes("Sentiment"));
              const otherMetrics = turn.metrics.filter(m => ![wpmMetric, sentimentMetric].includes(m));

              return (
              <div
                key={turn.index}
                className="rounded-xl border border-gray-800/50 bg-dark-input overflow-hidden"
              >
                {/* Turn Header */}
                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-800/50">
                  <span className="text-sm font-semibold text-gray-300">
                    {turn.title}
                  </span>
                </div>

                {/* Body Side-by-Side */}
                <div className="p-6 flex flex-col md:flex-row gap-8">
                  {/* Left Column: Metrics */}
                  <div className="w-full md:w-1/4 flex flex-col gap-6 border-r border-gray-800/50 pr-8">
                    {/* WPM */}
                    {wpmMetric && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Words Per Minute</span>
                        <div className="text-sm font-bold text-teal-400">{wpmMetric.value}</div>
                      </div>
                    )}

                    {/* Sentiment */}
                    {sentimentMetric && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sentiment Score</span>
                        <div className="flex flex-wrap gap-2">
                           <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase border ${sentimentMetric.isPositive ? 'bg-green-500/10 text-green-400 border-green-500/20' : sentimentMetric.isNegative ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'}`}>
                              {sentimentMetric.value}
                           </span>
                           {sentimentMetric.pValue && (
                             <span className="text-[10px] px-2 py-1 rounded font-bold uppercase border bg-teal-500/10 text-teal-400 border-teal-500/20">
                               {sentimentMetric.pValue}
                             </span>
                           )}
                        </div>
                      </div>
                    )}

                    {/* Intent */}
                    {turn.intent && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">User Intent</span>
                        <div className="text-sm font-medium text-gray-300 leading-tight">
                          {turn.intent}
                        </div>
                      </div>
                    )}

                    {/* Other small badges for minor metrics */}
                    {otherMetrics.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Other Insights</span>
                         <div className="flex flex-wrap gap-2">
                           {otherMetrics.map((m, mi) => (
                             <span key={mi} className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${m.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                {m.name}
                             </span>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Transcript */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-3">Transcript</span>
                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                      {turn.text || <span className="text-gray-600 italic">No transcript recorded for this turn.</span>}
                    </p>
                  </div>
                </div>
              </div>
            );})}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationOverview;