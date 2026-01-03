/**
 * React Query hooks for Evaluation operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import evaluationService from '../api/services/evaluation.service';

// Query keys
export const evaluationKeys = {
    all: ['evaluations'],
    lists: () => [...evaluationKeys.all, 'list'],
    list: (filters) => [...evaluationKeys.lists(), filters],
    details: () => [...evaluationKeys.all, 'detail'],
    detail: (id) => [...evaluationKeys.details(), id],
    simulation: (simulationId) => [...evaluationKeys.all, 'simulation', simulationId],
};

/**
 * Hook to fetch single evaluation by ID
 */
export const useEvaluation = (evaluationId) => {
    return useQuery({
        queryKey: evaluationKeys.detail(evaluationId),
        queryFn: () => evaluationService.getEvaluation(evaluationId),
        enabled: !!evaluationId,
    });
};

/**
 * Hook to fetch list of evaluations with filters
 */
export const useEvaluations = (filters = null) => {
    return useQuery({
        queryKey: evaluationKeys.list(filters || {}),
        queryFn: () => evaluationService.getEvaluations(filters || {}),
        enabled: !!filters,
        staleTime: 30000,
    });
};

/**
 * Hook to fetch evaluations for a session
 */
export const useSessionEvaluations = (sessionId) => {
    return useQuery({
        queryKey: ['evaluations', 'session', sessionId],
        queryFn: () => evaluationService.getSessionEvaluations(sessionId),
        enabled: !!sessionId,
        staleTime: 30000,
    });
};

/**
 * Hook to fetch all evaluations for a simulation
 */
export const useSimulationEvaluations = (simulationId) => {
    return useQuery({
        queryKey: evaluationKeys.simulation(simulationId),
        queryFn: () => evaluationService.getSimulationEvaluations(simulationId),
        enabled: !!simulationId,
        staleTime: 30000,
    });
};

/**
 * Hook to evaluate a session
 */
export const useEvaluateSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, configOverrides }) =>
            evaluationService.evaluateSession(sessionId, configOverrides),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
            // Also invalidate simulation-specific evaluations if we know the simulation
            if (variables.simulationId) {
                queryClient.invalidateQueries({
                    queryKey: evaluationKeys.simulation(variables.simulationId)
                });
            }
        },
    });
};

/**
 * Hook to batch evaluate all sessions in a simulation
 * Supports async task polling workflow
 */
export const useBatchEvaluateSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ simulationId, configOverrides }) => 
            evaluationService.batchEvaluateSimulation(simulationId, configOverrides),
        onSuccess: (data, variables) => {
            const { simulationId } = variables;
            queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: evaluationKeys.simulation(simulationId) });
        },
    });
};

/**
 * Hook to poll batch evaluation task status
 */
export const useBatchEvaluationStatus = (taskId, options = {}) => {
    return useQuery({
        queryKey: ['evaluation', 'batch', 'status', taskId],
        queryFn: () => evaluationService.getBatchEvaluationStatus(taskId),
        enabled: !!taskId && options.enabled !== false,
        refetchInterval: (data) => {
            // Stop polling if completed or failed
            if (!data || data.status === 'completed' || data.status === 'failed') {
                return false;
            }
            // Poll every 2 seconds while running
            return 2000;
        },
        staleTime: 0, // Always fetch fresh data
    });
};

/**
 * Hook to get simulation evaluation report
 */
export const useSimulationReport = (simulationId, format = 'json') => {
    return useQuery({
        queryKey: ['evaluation', 'report', simulationId, format],
        queryFn: () => evaluationService.getSimulationReport(simulationId, format),
        enabled: !!simulationId,
        staleTime: 60000, // Cache for 1 minute
    });
};
