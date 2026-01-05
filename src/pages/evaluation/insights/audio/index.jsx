import InsightHeaderCard from "../../../../components/InsightHeaderCard";
import StatCard from "../../../../components/StatCard";
import { Volume2, Mic, Sliders, Sparkles, ArrowLeft } from "lucide-react";

import AudioDetailedMetrics from "./AudioDetailed";
import AudioQualityRadar from "./AirQualityRadar";
import VoiceQualityConsistency from "./VoiceQuality";

/* =========================
   Helpers
========================= */

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
  const map = {
    word_error_rate: "Word Error Rate",
    audio_technical_quality: "Audio Technical Quality",
    tts_naturalness: "TTS Naturalness",
    average_pitch: "Average Pitch",
    voice_quality_index: "Voice Quality Index"
  };
  return map[name] || String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const transformStatCards = (audioMetrics) => {
  if (!audioMetrics || audioMetrics.length === 0) return [];

  return audioMetrics.map((m) => ({
    title: humanizeMetricName(m.name || m.metric_name),
    value: m.score !== null && m.score !== undefined
      ? Math.round(m.score * 100)
      : 100, // Default to 100 if score is null (passed metrics)
    passed: m.status === "passed",
  }));
};

/* =========================
   Extract Audio Category Data
========================= */
const extractAudioData = (response, data) => {
  console.log('AudioOverview received response:', response);
  console.log('AudioOverview received data:', data);

  let metrics = [];
  let score = 0;

  if (response) {
    // Called from ViewReport with single evaluation's category data
    metrics = response?.metrics || [];
    score = response?.score || 0;
  } else if (data) {
    // Called from Dashboard with aggregated data
    const audioCategory = data.category_scores?.find(c => c.category === 'audio_quality');
    if (audioCategory) {
      metrics = audioCategory.metrics || [];
      score = audioCategory.average_score || 0;
    } else {
      // Fallback: aggregate from all evaluations
      const allMetrics = [];
      let totalScore = 0;
      let scoreCount = 0;

      data.evaluations?.forEach(evaluation => {
        const audioCat = evaluation.category_scores?.find(c => c.category === 'audio_quality');
        if (audioCat?.metrics) {
          allMetrics.push(...audioCat.metrics);
          if (typeof audioCat.score === 'number') {
            totalScore += audioCat.score;
            scoreCount++;
          }
        }
      });

      metrics = allMetrics;
      score = scoreCount > 0 ? totalScore / scoreCount : 0;
    }
  }

  console.log('Extracted audio data:', {
    score,
    metrics,
    metricCount: metrics.length
  });

  return {
    score,
    metrics,
    evaluations: data?.evaluations || []
  };
};

/* =========================
   Component
========================= */
const AudioOverview = ({ response, data, onBack }) => {
  const processedResponse = extractAudioData(response, data);

  console.log('Processed response:', processedResponse);

  if (!processedResponse.metrics || processedResponse.metrics.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>
        )}
        <div className="text-gray-400 text-center py-12">
          No audio quality metrics available
        </div>
      </div>
    );
  }

  const score = processedResponse.score > 1
    ? Math.round(processedResponse.score)
    : Math.round(processedResponse.score * 100);
  const passedCount = processedResponse.metrics.filter((m) => m.status === "passed").length;
  const failedCount = processedResponse.metrics.length - passedCount;
  const statCards = transformStatCards(processedResponse.metrics);

  return (
    <div className="flex flex-col gap-8">
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

      {/* ================= Header ================= */}
      <InsightHeaderCard
        icon={Volume2}
        title="Audio Quality"
        description="Evaluates audio clarity, WER, and TTS naturalness"
        score={score}
        passedCount={passedCount}
        failedCount={failedCount}
        theme="teal"
      />

      {/* ================= Stat Cards ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((metric, idx) => (
          <StatCard
            key={idx}
            icon={
              metric.title === "Word Error Rate"
                ? Mic
                : metric.title === "Audio Technical Quality"
                  ? Sliders
                  : metric.title === "Average Pitch"
                    ? Volume2
                    : Sparkles
            }
            title={metric.title}
            value={metric.value}
            subtitle={
              metric.passed ? "Passed" : "Failed"
            }
            highlight={!metric.passed}
          />
        ))}
      </div>

      {/* ================= Charts Grid ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Radar */}
        <AudioQualityRadar response={processedResponse} />

        {/* Voice Quality */}
        <VoiceQualityConsistency response={processedResponse} />
      </div>

      {/* ================= Detailed Metrics ================= */}
      <AudioDetailedMetrics response={processedResponse} />
    </div>
  );
};

export default AudioOverview;