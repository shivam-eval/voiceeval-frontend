import React from 'react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';

const BatchEvaluationProgressModal = ({
    isOpen,
    onClose,
    status,
    progress,
    result,
    error,
    simulationId
}) => {
    if (!isOpen) return null;

    const canClose = status === 'completed' || status === 'failed';

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-white">
                        {status === 'running' && '⏳ Evaluating Sessions...'}
                        {status === 'completed' && '✅ Evaluation Complete!'}
                        {status === 'failed' && '❌ Evaluation Failed'}
                    </h2>
                    {canClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Running State */}
                    {status === 'running' && (
                        <div className="space-y-6">
                            {/* Spinner */}
                            <div className="flex justify-center">
                                <Loader2 className="w-16 h-16 text-teal-400 animate-spin" />
                            </div>

                            {/* Progress Info */}
                            {progress && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Progress</span>
                                        <span className="text-white font-semibold">
                                            {progress.evaluated} / {progress.total} sessions
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-teal-400 to-teal-500 h-full transition-all duration-500 ease-out"
                                            style={{
                                                width: `${(progress.evaluated / progress.total) * 100}%`
                                            }}
                                        />
                                    </div>

                                    {/* Failed Count */}
                                    {progress.failed > 0 && (
                                        <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                            <XCircle className="w-4 h-4" />
                                            <span>{progress.failed} session(s) failed</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="text-gray-400 text-center text-sm">
                                Please wait while we evaluate all sessions...
                            </p>
                        </div>
                    )}

                    {/* Completed State */}
                    {status === 'completed' && result && (
                        <div className="space-y-6">
                            {/* Success Icon */}
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-12 h-12 text-green-400" />
                                </div>
                            </div>

                            {/* Results Summary */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                        <div className="text-gray-400 text-sm mb-1">Total Sessions</div>
                                        <div className="text-2xl font-bold text-white">
                                            {result.total_sessions || 0}
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                        <div className="text-gray-400 text-sm mb-1">Evaluated</div>
                                        <div className="text-2xl font-bold text-teal-400">
                                            {result.evaluated || 0}
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                        <div className="text-gray-400 text-sm mb-1">Overall Score</div>
                                        <div className="text-2xl font-bold text-white">
                                            {result.overall_score
                                                ? `${(result.overall_score * 100).toFixed(1)}%`
                                                : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                        <div className="text-gray-400 text-sm mb-1">Pass Rate</div>
                                        <div className="text-2xl font-bold text-green-400">
                                            {result.pass_rate
                                                ? `${(result.pass_rate * 100).toFixed(1)}%`
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {result.failed > 0 && (
                                    <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3 text-center">
                                        <span className="text-yellow-400 text-sm">
                                            {result.failed} session(s) failed to evaluate
                                        </span>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-400 text-center text-sm">
                                Redirecting to evaluation results...
                            </p>
                        </div>
                    )}

                    {/* Failed State */}
                    {status === 'failed' && (
                        <div className="space-y-6">
                            {/* Error Icon */}
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <XCircle className="w-12 h-12 text-red-400" />
                                </div>
                            </div>

                            {/* Error Message */}
                            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                                <p className="text-red-400 text-sm text-center">
                                    {error || 'An unknown error occurred during evaluation'}
                                </p>
                            </div>

                            {/* Close Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BatchEvaluationProgressModal;
