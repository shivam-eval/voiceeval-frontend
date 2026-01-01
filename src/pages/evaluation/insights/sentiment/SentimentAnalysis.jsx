import React from 'react';
import { Heart, Smile, Meh, Frown, ThumbsUp, Sparkles } from 'lucide-react';

/**
 * Sentiment Analysis Component
 * 
 * Displays:
 * - Overall sentiment score
 * - Agent tone quality
 * - Customer sentiment
 * - Resolution quality
 * - Dominant emotion
 */
const SentimentAnalysis = ({ evaluationData }) => {
    // Extract sentiment metric
    const sentimentMetric = evaluationData?.metric_results?.find(m => m.name === 'text_sentiment');
    const sentimentData = sentimentMetric?.details || {};

    const overallScore = sentimentMetric?.score || 0;
    const agentTone = sentimentData.agent_tone || 0;
    const customerSentiment = sentimentData.customer_sentiment || 0;
    const resolutionQuality = sentimentData.resolution_quality || 0;
    const dominantEmotion = sentimentData.dominant_emotion || 'neutral';

    // Get emotion icon and color
    const getEmotionDisplay = (emotion) => {
        const emotionMap = {
            positive: { icon: Smile, color: 'green', label: 'Positive', bg: 'bg-green-100', text: 'text-green-700' },
            satisfied: { icon: ThumbsUp, color: 'blue', label: 'Satisfied', bg: 'bg-blue-100', text: 'text-blue-700' },
            neutral: { icon: Meh, color: 'gray', label: 'Neutral', bg: 'bg-gray-100', text: 'text-gray-700' },
            frustrated: { icon: Frown, color: 'orange', label: 'Frustrated', bg: 'bg-orange-100', text: 'text-orange-700' },
            negative: { icon: Frown, color: 'red', label: 'Negative', bg: 'bg-red-100', text: 'text-red-700' },
            confused: { icon: Meh, color: 'yellow', label: 'Confused', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        };
        return emotionMap[emotion] || emotionMap.neutral;
    };

    const emotionDisplay = getEmotionDisplay(dominantEmotion);
    const EmotionIcon = emotionDisplay.icon;

    // Score to percentage
    const scoreToPercent = (score) => Math.round(score * 100);

    // Get score color
    const getScoreColor = (score) => {
        if (score >= 0.8) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' };
        if (score >= 0.6) return { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-100' };
        return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' };
    };

    const overallColor = getScoreColor(overallScore);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
                    <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Sentiment Analysis</h2>
                    <p className="text-sm text-slate-600">Conversation tone and customer satisfaction</p>
                </div>
            </div>

            {/* Overall Sentiment Score */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">Overall Sentiment</h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${overallColor.light} ${overallColor.text}`}>
                        {scoreToPercent(overallScore)}%
                    </span>
                </div>

                {/* Circular Progress */}
                <div className="flex items-center justify-center mb-6">
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                className="text-slate-200"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={`${overallScore * 552.64} 552.64`}
                                className={overallColor.text.replace('text-', 'text-').replace('-700', '-500')}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Sparkles className={`h-12 w-12 mb-2 ${overallColor.text}`} />
                            <span className="text-3xl font-bold text-slate-800">{scoreToPercent(overallScore)}%</span>
                            <span className="text-sm text-slate-600">Sentiment Score</span>
                        </div>
                    </div>
                </div>

                {/* Dominant Emotion */}
                <div className={`${emotionDisplay.bg} rounded-lg p-4 flex items-center gap-3`}>
                    <EmotionIcon className={`h-8 w-8 ${emotionDisplay.text}`} />
                    <div>
                        <p className="text-xs text-slate-600">Dominant Emotion</p>
                        <p className={`text-lg font-semibold ${emotionDisplay.text}`}>{emotionDisplay.label}</p>
                    </div>
                </div>
            </div>

            {/* Component Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Agent Tone */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 ${getScoreColor(agentTone).light} rounded-lg`}>
                            <Smile className={`h-5 w-5 ${getScoreColor(agentTone).text}`} />
                        </div>
                        <h4 className="font-semibold text-slate-800">Agent Tone</h4>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-bold text-slate-800">{scoreToPercent(agentTone)}%</span>
                            <span className="text-xs text-slate-600">Professional & Helpful</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getScoreColor(agentTone).bg} transition-all`}
                                style={{ width: `${scoreToPercent(agentTone)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Customer Sentiment */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 ${getScoreColor(customerSentiment).light} rounded-lg`}>
                            <ThumbsUp className={`h-5 w-5 ${getScoreColor(customerSentiment).text}`} />
                        </div>
                        <h4 className="font-semibold text-slate-800">Customer Sentiment</h4>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-bold text-slate-800">{scoreToPercent(customerSentiment)}%</span>
                            <span className="text-xs text-slate-600">Satisfaction Level</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getScoreColor(customerSentiment).bg} transition-all`}
                                style={{ width: `${scoreToPercent(customerSentiment)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Resolution Quality */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 ${getScoreColor(resolutionQuality).light} rounded-lg`}>
                            <Sparkles className={`h-5 w-5 ${getScoreColor(resolutionQuality).text}`} />
                        </div>
                        <h4 className="font-semibold text-slate-800">Resolution Quality</h4>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-bold text-slate-800">{scoreToPercent(resolutionQuality)}%</span>
                            <span className="text-xs text-slate-600">Positive Outcome</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getScoreColor(resolutionQuality).bg} transition-all`}
                                style={{ width: `${scoreToPercent(resolutionQuality)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversation Details */}
            {sentimentData.conversation_turns && (
                <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-4">Conversation Details</h4>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                            <span className="text-sm text-slate-600">
                                {sentimentData.conversation_turns} turns analyzed
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SentimentAnalysis;
