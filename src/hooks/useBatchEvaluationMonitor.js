import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { toast } from 'react-toastify';

/**
 * Hook to monitor batch evaluation progress via SSE and redirect on completion
 * @param {string} taskId - The task ID to monitor
 * @param {string} simulationId - The simulation ID for redirection
 * @param {object} options - Configuration options
 * @returns {object} - Status, progress, result, and error information
 */
export const useBatchEvaluationMonitor = (taskId, simulationId, options = {}) => {
    const navigate = useNavigate();
    const { subscribe } = useEvents();

    const [status, setStatus] = useState('idle'); // idle, running, completed, failed
    const [progress, setProgress] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const hasRedirectedRef = useRef(false);
    const {
        autoRedirect = true,
        onComplete,
        onError: onErrorCallback,
        onProgress,
        showToasts = true
    } = options;

    useEffect(() => {
        if (!taskId) {
            setStatus('idle');
            return;
        }

        console.log(`🔍 Starting to monitor evaluation task: ${taskId}`);
        setStatus('running');

        // Subscribe to task_update events
        const unsubscribe = subscribe('task_update', (data) => {
            // Only process events for our specific task
            if (data.task_id !== taskId) return;

            console.log(`📡 Task Update [${taskId}]:`, data);

            switch (data.status) {
                case 'running':
                    setStatus('running');
                    if (data.progress) {
                        setProgress(data.progress);
                        if (onProgress) {
                            onProgress(data.progress);
                        }
                        if (showToasts) {
                            const { evaluated, total, failed } = data.progress;
                            console.log(`⏳ Progress: ${evaluated}/${total} sessions evaluated${failed > 0 ? `, ${failed} failed` : ''}`);
                        }
                    }
                    break;

                case 'completed':
                    setStatus('completed');
                    setResult(data.result);
                    console.log('🎉 Evaluation Completed!', data.result);

                    if (showToasts) {
                        const score = data.result?.overall_score;
                        const scorePercent = score ? (score * 100).toFixed(1) : 'N/A';
                        toast.success(
                            `Evaluation completed! Overall score: ${scorePercent}%`,
                            { autoClose: 5000 }
                        );
                    }

                    // Call custom completion handler
                    if (onComplete) {
                        onComplete(data.result);
                    }

                    // Auto-redirect to evaluation results page
                    if (autoRedirect && simulationId && !hasRedirectedRef.current) {
                        hasRedirectedRef.current = true;
                        const redirectUrl = `/evaluations/results/${simulationId}`;
                        console.log(`🔄 Redirecting to: ${redirectUrl}`);

                        // Small delay to ensure toast is visible
                        setTimeout(() => {
                            navigate(redirectUrl);
                        }, 1500);
                    }
                    break;

                case 'failed':
                    setStatus('failed');
                    setError(data.error || 'Evaluation failed');
                    console.error('❌ Evaluation Failed:', data.error);

                    if (showToasts) {
                        toast.error(
                            `Evaluation failed: ${data.error || 'Unknown error'}`,
                            { autoClose: 7000 }
                        );
                    }

                    // Call custom error handler
                    if (onErrorCallback) {
                        onErrorCallback(data.error);
                    }
                    break;

                default:
                    console.warn(`Unknown task status: ${data.status}`);
            }
        });

        // Cleanup subscription on unmount or when taskId changes
        return () => {
            console.log(`🔌 Unsubscribing from task: ${taskId}`);
            unsubscribe();
        };
    }, [taskId, simulationId, subscribe, navigate, autoRedirect, onComplete, onErrorCallback, onProgress, showToasts]);

    return {
        status,
        progress,
        result,
        error,
        isRunning: status === 'running',
        isCompleted: status === 'completed',
        isFailed: status === 'failed',
        isIdle: status === 'idle'
    };
};

export default useBatchEvaluationMonitor;
