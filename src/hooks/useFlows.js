/**
 * React Query hooks for Flow operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flowsApi } from '../utils/api';

// Query keys
export const flowKeys = {
    all: ['flows'],
    lists: () => [...flowKeys.all, 'list'],
    list: (filters) => [...flowKeys.lists(), filters],
    details: () => [...flowKeys.all, 'detail'],
    detail: (id) => [...flowKeys.details(), id],
    byAgent: (agentId) => [...flowKeys.all, 'agent', agentId],
};

/**
 * Hook to fetch list of flows
 */
export const useFlows = (params = {}) => {
    return useQuery({
        queryKey: flowKeys.list(params),
        queryFn: () => flowsApi.list(params),
        staleTime: 30000, // 30 seconds
    });
};

/**
 * Hook to fetch flows for a specific agent
 */
export const useAgentFlows = (agentId) => {
    return useQuery({
        queryKey: flowKeys.byAgent(agentId),
        queryFn: () => flowsApi.listByAgent(agentId),
        enabled: !!agentId,
        staleTime: 30000,
    });
};

/**
 * Hook to fetch single flow
 */
export const useFlow = (id) => {
    return useQuery({
        queryKey: flowKeys.detail(id),
        queryFn: () => flowsApi.get(id),
        enabled: !!id,
    });
};

/**
 * Hook to delete flow
 */
export const useDeleteFlow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => flowsApi.delete(id),
        onSuccess: () => {
            // Invalidate all flow queries
            queryClient.invalidateQueries({ queryKey: flowKeys.all });
        },
    });
};
