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
  const map = {
    word_error_rate: "Word Error Rate",
    audio_technical_quality: "Audio Technical Quality",
    tts_naturalness: "TTS Naturalness",
  };
  return map[name] || name;
};

const transformStatCards = (audioMetrics) => {
  if (!audioMetrics || audioMetrics.length === 0) return [];

  return audioMetrics.map((m) => ({
    title: humanizeMetricName(m.metric_name),
    value: Math.round(m.value * 100),
    passed: m.passed,
  }));
};

/* =========================
   Extract Audio Category Data
========================= */
const extractAudioData = (data) => {
  console.log('AudioOverview received data:', data);
  
  if (!data) {
    return { score: 0, metrics: [], evaluations: [] };
  }

  // Get average score for audio_quality category
  const audioCategoryScore = data.category_scores?.find(
    cat => cat.category === 'audio_quality'
  );
  
  const score = audioCategoryScore?.average_score || 0;

  // Extract audio metrics from all evaluations
  const allAudioMetrics = [];
  
  if (data.evaluations && Array.isArray(data.evaluations)) {
    data.evaluations.forEach(evaluation => {
      if (evaluation.metric_results && Array.isArray(evaluation.metric_results)) {
        const audioMetrics = evaluation.metric_results.filter(
          metric => metric.category === 'audio_quality'
        );
        allAudioMetrics.push(...audioMetrics);
      }
    });
  }

  // Calculate average metrics across all evaluations
  const metricMap = {};
  
  allAudioMetrics.forEach(metric => {
    if (!metricMap[metric.metric_name]) {
      metricMap[metric.metric_name] = {
        metric_name: metric.metric_name,
        values: [],
        thresholds: [],
        execution_times: [],
        passed_count: 0,
        total_count: 0
      };
    }
    
    metricMap[metric.metric_name].values.push(metric.value);
    metricMap[metric.metric_name].thresholds.push(metric.threshold);
    metricMap[metric.metric_name].execution_times.push(metric.execution_time_ms || 0);
    metricMap[metric.metric_name].total_count++;
    if (metric.passed) {
      metricMap[metric.metric_name].passed_count++;
    }
  });

  // Convert to array with averages
  const aggregatedMetrics = Object.values(metricMap).map(metric => ({
    metric_name: metric.metric_name,
    value: metric.values.reduce((a, b) => a + b, 0) / metric.values.length,
    threshold: metric.thresholds[0], // Use first threshold (should be consistent)
    execution_time_ms: metric.execution_times.reduce((a, b) => a + b, 0) / metric.execution_times.length,
    passed: metric.passed_count === metric.total_count, // All must pass
    passed_count: metric.passed_count,
    total_count: metric.total_count
  }));

  console.log('Extracted audio data:', {
    score,
    metrics: aggregatedMetrics,
    evaluations: data.evaluations
  });

  return {
    score,
    metrics: aggregatedMetrics,
    evaluations: data.evaluations || []
  };
};

/* =========================
   Component
========================= */
const AudioOverview = ({ data, onBack }) => {
  const response = extractAudioData(data);
  
  console.log('Processed response:', response);

  if (!response.metrics || response.metrics.length === 0) {
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

  const score = Math.round(response.score * 100);
  const passedCount = response.metrics.filter((m) => m.passed).length;
  const failedCount = response.metrics.length - passedCount;
  const statCards = transformStatCards(response.metrics);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((metric, idx) => (
          <StatCard
            key={idx}
            icon={
              metric.title === "Word Error Rate"
                ? Mic
                : metric.title === "Audio Technical Quality"
                ? Sliders
                : Sparkles
            }
            title={metric.title}
            value={metric.value}
            subtitle={
              metric.passed ? "Within threshold" : "Below threshold"
            }
            highlight={!metric.passed}
          />
        ))}
      </div>

      {/* ================= Radar ================= */}
      <AudioQualityRadar response={response} />

      {/* ================= Detailed Metrics ================= */}
      <AudioDetailedMetrics response={response} />

      {/* ================= Voice Quality ================= */}
      <VoiceQualityConsistency response={response} />
    </div>
  );
};

export default AudioOverview;