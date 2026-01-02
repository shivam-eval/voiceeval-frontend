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
export const useEvaluations = (filters = {}) => {
    return useQuery({
        queryKey: evaluationKeys.list(filters),
        queryFn: () => evaluationService.getEvaluations(filters),
        staleTime: 30000,
    });
};

/**
 * Hook to fetch all evaluations for a simulation
 */
export const useSimulationEvaluations = (simulationId, skip = 0, limit = 100) => {
    return useQuery({
        queryKey: [...evaluationKeys.simulation(simulationId), { skip, limit }],
        queryFn: () => evaluationService.getSimulationEvaluations(simulationId, skip, limit),
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
 */
export const useBatchEvaluateSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (simulationId) => evaluationService.batchEvaluateSimulation(simulationId),
        onSuccess: (data, simulationId) => {
            queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: evaluationKeys.simulation(simulationId) });
        },
    });
};
