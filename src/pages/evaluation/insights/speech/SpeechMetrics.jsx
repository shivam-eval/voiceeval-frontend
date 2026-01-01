import React from 'react';
import { Activity, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Speech Metrics Component - Words Per Minute & Talk Ratio
 * 
 * Displays:
 * - Words Per Minute (WPM) with ideal range indicator
 * - Talk Ratio (Agent vs User speaking time)
 * - Turn-by-turn breakdown
 */
const SpeechMetrics = ({ evaluationData }) => {
    // Extract speech metrics from evaluation data
    const wpmMetric = evaluationData?.metric_results?.find(m => m.name === 'words_per_minute');
    const talkRatioMetric = evaluationData?.metric_results?.find(m => m.name === 'talk_ratio');

    const wpmData = wpmMetric?.details || {};
    const talkRatioData = talkRatioMetric?.details || {};

    // WPM thresholds
    const IDEAL_WPM_MIN = 120;
    const IDEAL_WPM_MAX = 150;

    const getWPMStatus = (wpm) => {
        if (!wpm) return { label: 'Unknown', color: 'gray' };
        if (wpm < 100) return { label: 'Too Slow', color: 'red' };
        if (wpm < IDEAL_WPM_MIN) return { label: 'Slightly Slow', color: 'yellow' };
        if (wpm <= IDEAL_WPM_MAX) return { label: 'Ideal', color: 'green' };
        if (wpm <= 180) return { label: 'Slightly Fast', color: 'yellow' };
        return { label: 'Too Fast', color: 'red' };
    };

    const wpmStatus = getWPMStatus(wpmData.overall_wpm);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                    <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Speech Analysis</h2>
                    <p className="text-sm text-slate-600">Speaking rate and conversation balance</p>
                </div>
            </div>

            {/* Words Per Minute */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Words Per Minute (WPM)</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${wpmStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                        wpmStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            wpmStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                        }`}>
                        {wpmStatus.label}
                    </span>
                </div>

                {wpmData.overall_wpm ? (
                    <>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                {Math.round(wpmData.overall_wpm)}
                            </span>
                            <span className="text-xl text-slate-600">WPM</span>
                        </div>

                        {/* WPM Range Indicator */}
                        <div className="relative h-3 bg-slate-200 rounded-full mb-2">
                            <div className="absolute inset-y-0 left-[40%] right-[25%] bg-green-400 rounded-full" />
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-violet-600 rounded-full transition-all"
                                style={{
                                    left: `${Math.min(Math.max((wpmData.overall_wpm / 200) * 100, 0), 100)}%`,
                                    transform: 'translateX(-50%)'
                                }}
                            />
                        </div>

                        <div className="flex justify-between text-xs text-slate-600 mb-6">
                            <span>0</span>
                            <span className="text-green-600 font-semibold">Ideal: {IDEAL_WPM_MIN}-{IDEAL_WPM_MAX}</span>
                            <span>200+</span>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-600 mb-1">Total Words</p>
                                <p className="text-lg font-semibold text-slate-800">{wpmData.total_words || 0}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-600 mb-1">Duration</p>
                                <p className="text-lg font-semibold text-slate-800">
                                    {wpmData.total_duration_ms ? `${(wpmData.total_duration_ms / 1000).toFixed(1)}s` : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-600 mb-1">Turns Analyzed</p>
                                <p className="text-lg font-semibold text-slate-800">{wpmData.turns_analyzed || 0}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-slate-500 text-center py-8">No WPM data available</p>
                )}
            </div>

            {/* Talk Ratio */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Talk Ratio</h3>
                    {talkRatioData.balance_score !== undefined && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${talkRatioData.balance_score >= 0.8 ? 'bg-green-100 text-green-700' :
                            talkRatioData.balance_score >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {talkRatioData.balance_score >= 0.8 ? 'Well Balanced' :
                                talkRatioData.balance_score >= 0.6 ? 'Moderate' : 'Imbalanced'}
                        </span>
                    )}
                </div>

                {talkRatioData.agent_talk_ratio !== undefined ? (
                    <>
                        {/* Ratio Visualization */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-600">Agent</span>
                                    <span className="text-sm font-semibold text-blue-700">
                                        {(talkRatioData.agent_talk_ratio * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                                        style={{ width: `${talkRatioData.agent_talk_ratio * 100}%` }}
                                    />
                                </div>
                            </div>

                            <MessageSquare className="h-8 w-8 text-slate-400" />

                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-purple-600">User</span>
                                    <span className="text-sm font-semibold text-purple-700">
                                        {(talkRatioData.user_talk_ratio * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                                        style={{ width: `${talkRatioData.user_talk_ratio * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ideal Range Indicator */}
                        <div className="bg-slate-50 rounded-lg p-4 mb-4">
                            <p className="text-xs text-slate-600 mb-2">Ideal Agent Talk Ratio: 35%-65%</p>
                            <div className="relative h-2 bg-slate-300 rounded-full">
                                <div className="absolute inset-y-0 left-[35%] right-[35%] bg-green-400 rounded-full" />
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-blue-600 rounded-full"
                                    style={{
                                        left: `${talkRatioData.agent_talk_ratio * 100}%`,
                                        transform: 'translateX(-50%)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Duration Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p className="text-xs text-blue-600 mb-1">Agent Speaking Time</p>
                                <p className="text-xl font-bold text-blue-700">
                                    {talkRatioData.agent_duration_ms ? `${(talkRatioData.agent_duration_ms / 1000).toFixed(1)}s` : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <p className="text-xs text-purple-600 mb-1">User Speaking Time</p>
                                <p className="text-xl font-bold text-purple-700">
                                    {talkRatioData.user_duration_ms ? `${(talkRatioData.user_duration_ms / 1000).toFixed(1)}s` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-slate-500 text-center py-8">No talk ratio data available</p>
                )}
            </div>
        </div>
    );
};

export default SpeechMetrics;
