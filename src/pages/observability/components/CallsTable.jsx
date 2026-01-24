import React from 'react';
import { Upload, Plus, AlertCircle, Brain, Download, Trash2 } from 'lucide-react';
import Badge from '../../../components/Badge';
import { extractNoiseFromSessionId, getNoiseProfileBadgeVariant } from '../../../utils/noiseUtils';

const CallsTable = ({
    calls,
    isCallsLoading,
    error,
    callsPage,
    callsPerPage,
    onRowClick,
    onEvaluate,
    onDeleteCall,
    onDownload,
    onAddCalls,
    formatDate,
    getMetricValue,
    isEvaluating,
    isDeleting
}) => {
    const startIdx = (callsPage - 1) * callsPerPage;
    const endIdx = startIdx + callsPerPage;
    const paginatedCalls = calls.slice(startIdx, endIdx);

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                    <th className="px-4 py-3">Call ID</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                    <th className="px-4 py-3 text-center">Noise</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3 text-center">Overall Score</th>
                    <th className="px-4 py-3 text-center">Issues</th>
                </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
                {isCallsLoading ? (
                    <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                Loading calls...
                            </div>
                        </td>
                    </tr>
                ) : error ? (
                    <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-red-400">
                            <div className="flex flex-col items-center gap-3">
                                <AlertCircle className="w-8 h-8" />
                                Error loading calls: {error.message}
                            </div>
                        </td>
                    </tr>
                ) : calls.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                                    <Upload className="w-8 h-8 text-gray-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-400 text-lg font-medium">No calls found in this directory</p>
                                    <p className="text-gray-500 text-sm">Upload recordings to start evaluating your voice flows</p>
                                </div>
                                <button
                                    onClick={onAddCalls}
                                    className="mt-2 flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Calls
                                </button>
                            </div>
                        </td>
                    </tr>
                ) : (
                    paginatedCalls.map((call, index) => (
                        <tr
                            key={call.call_id || index}
                            onClick={() => onRowClick(call)}
                            className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors group cursor-pointer"
                        >
                            <td className="px-4 py-3">
                                <div className="flex flex-col">
                                    <span className="text-white font-semibold font-mono text-xs truncate max-w-[180px]" title={call.call_id}>
                                        {call.call_id || 'N/A'}
                                    </span>
                                    <span className="text-gray-500 text-xs truncate max-w-[180px]">
                                        {call.filename || call.agent_id || call.directory || 'No filename'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1.5">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEvaluate(call.call_id); }}
                                        disabled={isEvaluating}
                                        className="p-1.5 bg-teal-500/10 text-teal-400 rounded hover:bg-teal-500/20 transition-colors disabled:opacity-50"
                                        title="Evaluate"
                                    >
                                        <Brain className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDownload && onDownload(call); }}
                                        className="p-1.5 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteCall(call.call_id); }}
                                        disabled={isDeleting}
                                        className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                                {(() => {
                                    const noise = extractNoiseFromSessionId(call.session_id || call.call_id);
                                    return noise ? (
                                        <Badge variant={getNoiseProfileBadgeVariant(noise.profile_id)} size="sm">
                                            {noise.displayName}
                                        </Badge>
                                    ) : (
                                        <span className="text-gray-500 text-xs">-</span>
                                    );
                                })()}
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-gray-300 text-xs whitespace-nowrap">
                                    {formatDate(call.created_at)}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    {(() => {
                                        const evalStatus = (call.evaluation?.status || call.evaluation_status || '').toLowerCase();
                                        const callStatus = (call.status || '').toLowerCase();
                                        const processingStage = (call.processing_stage || '').toLowerCase();

                                        // Check if evaluation is actively in progress
                                        const isEvaluating = ['processing', 'evaluating', 'in_progress', 'running'].includes(evalStatus);
                                        const isProcessing = callStatus === 'processing' || processingStage === 'transcribing' || processingStage === 'evaluating';

                                        const isStillProcessing = !['evaluated', 'completed', 'done', 'finished'].includes(processingStage);
                                        const hasEvalIdButNoData = call.evaluation_id && !call.evaluation && isStillProcessing;

                                        if (isEvaluating || isProcessing || hasEvalIdButNoData) {
                                            const stageText = processingStage === 'transcribing' ? 'Transcribing...' :
                                                processingStage === 'evaluating' ? 'Evaluating...' :
                                                    'Processing...';
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-purple-400 text-xs font-medium">{stageText}</span>
                                                </div>
                                            );
                                        }

                                        // Check if evaluation failed
                                        if (callStatus === 'failed' || evalStatus === 'failed') {
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                    <span className="text-red-400 text-xs font-medium">Failed</span>
                                                </div>
                                            );
                                        }

                                        const val = getMetricValue(call, 'overall_score');
                                        if (val !== '--') {
                                            return (
                                                <>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${parseFloat(val) >= 80 ? 'bg-green-500' :
                                                        parseFloat(val) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}></div>
                                                    <span className="text-white font-semibold text-sm">{val}</span>
                                                </>
                                            );
                                        }

                                        return (
                                            <>
                                                <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                                                <span className="text-white font-semibold text-sm">--</span>
                                            </>
                                        );
                                    })()}
                                </div>
                            </td>

                            <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${(parseInt(getMetricValue(call, 'issues_found')) || 0) > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    }`}>
                                    {getMetricValue(call, 'issues_found')} issues
                                </span>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default CallsTable;
