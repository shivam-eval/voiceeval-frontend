/**
 * React Query hooks for Agent operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi } from '../utils/api';

// Query keys
export const agentKeys = {
    all: ['agents'],
    lists: () => [...agentKeys.all, 'list'],
    list: (filters) => [...agentKeys.lists(), filters],
    details: () => [...agentKeys.all, 'detail'],
    detail: (id) => [...agentKeys.details(), id],
};

/**
 * Hook to fetch list of agents
 */
export const useAgents = (params = {}) => {
    return useQuery({
        queryKey: agentKeys.list(params),
        queryFn: () => agentsApi.list(params),
        staleTime: 30000, // 30 seconds
    });
};

/**
 * Hook to fetch single agent
 */
export const useAgent = (id) => {
    return useQuery({
        queryKey: agentKeys.detail(id),
        queryFn: () => agentsApi.get(id),
        enabled: !!id,
    });
};

/**
 * Hook to create agent
 */
export const useCreateAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => agentsApi.create(data),
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
        },
    });
};

/**
 * Hook to update agent
 */
export const useUpdateAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => agentsApi.update(id, data),
        onSuccess: (data, variables) => {
            // Invalidate list
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
            // Invalidate detail
            queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.id) });
        },
    });
};

/**
 * Hook to delete agent
 */
export const useDeleteAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => agentsApi.delete(id),
        onSuccess: () => {
            // Invalidate list
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
        },
    });
};

/**
 * Hook to test agent connection
 */
export const useTestAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => agentsApi.test(id),
        onSuccess: (data, id) => {
            // Invalidate detail to refresh status
            queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
        },
    });
};

/**
 * Hook to clone agent
 */
export const useCloneAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => agentsApi.clone(id),
        onSuccess: () => {
            // Invalidate list to show new agent
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
        },
    });
};

/**
 * Hook to re-extract agent configuration
 */
export const useReExtractAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => agentsApi.reExtract(data),
        onSuccess: (data, variables) => {
            // Invalidate both list and detail to refresh agent data
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
            // We don't have the MongoDB ID in the response, so invalidate all details
            queryClient.invalidateQueries({ queryKey: agentKeys.details() });
        },
    });
};

