/**
 * BatchEvaluationHandler Component
 * 
 * Handles the async batch evaluation workflow:
 * 1. Triggers batch evaluation
 * 2. Polls task status
 * 3. Shows progress
 * 4. Navigates to results when complete
 */
import React, { useState, useEffect } from 'react';
import { useBatchEvaluateSimulation, useBatchEvaluationStatus } from '../hooks/useEvaluations';

export const BatchEvaluationHandler = ({ 
  simulationId, 
  onComplete, 
  onError,
  autoStart = false,
  children 
}) => {
  const [taskId, setTaskId] = useState(null);
  const [isCached, setIsCached] = useState(false);
  
  const batchEvaluate = useBatchEvaluateSimulation();
  const { data: taskStatus } = useBatchEvaluationStatus(taskId);

  // Start evaluation
  const startEvaluation = async (configOverrides = {}) => {
    try {
      const result = await batchEvaluate.mutateAsync({ 
        simulationId, 
        configOverrides 
      });

      // Check if cached results returned immediately
      if (result.cached) {
        setIsCached(true);
        onComplete?.(result);
        return;
      }

      // Set task ID for polling
      setTaskId(result.task_id);
    } catch (error) {
      onError?.(error);
    }
  };

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && simulationId && !taskId && !isCached) {
      startEvaluation();
    }
  }, [autoStart, simulationId]);

  // Handle task completion
  useEffect(() => {
    if (taskStatus?.status === 'completed') {
      onComplete?.(taskStatus.result);
    } else if (taskStatus?.status === 'failed') {
      onError?.(new Error(taskStatus.error || 'Evaluation failed'));
    }
  }, [taskStatus]);

  // Render props pattern
  if (typeof children === 'function') {
    return children({
      startEvaluation,
      isEvaluating: batchEvaluate.isPending || (taskId && taskStatus?.status === 'running'),
      isCached,
      taskId,
      progress: taskStatus?.progress,
      error: batchEvaluate.error || (taskStatus?.status === 'failed' ? taskStatus.error : null)
    });
  }

  return null;
};

/**
 * BatchEvaluationProgress Component
 * 
 * Displays progress bar and status for batch evaluation
 */
export const BatchEvaluationProgress = ({ progress }) => {
  if (!progress) return null;

  const { total, evaluated, failed, current_session_id } = progress;
  const percentage = total > 0 ? Math.round((evaluated / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Evaluating sessions: {evaluated} / {total}
        </span>
        <span className="text-gray-500">{percentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {failed > 0 && (
        <div className="text-sm text-orange-600">
          ⚠️ {failed} session(s) failed to evaluate
        </div>
      )}

      {current_session_id && (
        <div className="text-xs text-gray-500">
          Current: {current_session_id}
        </div>
      )}
    </div>
  );
};

export default BatchEvaluationHandler;
