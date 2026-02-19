/**
 * React Query hooks for Call operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callsApi } from '../utils/api';

// Query keys
export const callKeys = {
    all: ['calls'],
    lists: () => [...callKeys.all, 'list'],
    list: (filters) => [...callKeys.lists(), filters],
    categories: () => [...callKeys.all, 'categories'],
    details: () => [...callKeys.all, 'detail'],
    detail: (id) => [...callKeys.details(), id],
};

/**
 * Hook to fetch list of calls
 */
export const useCalls = (params = {}, options = {}) => {
    return useQuery({
        queryKey: callKeys.list(params),
        queryFn: () => callsApi.list(params),
        staleTime: 0, // Ensure we always get fresh data after invalidation
        ...options,
    });
};

/**
 * Hook to fetch unique call categories (directories)
 */
export const useCallCategories = () => {
    return useQuery({
        queryKey: callKeys.categories(),
        queryFn: () => callsApi.categories(),
        staleTime: 60000,
    });
};

/**
 * Hook to fetch single call detail
 */
export const useCall = (id) => {
    return useQuery({
        queryKey: callKeys.detail(id),
        queryFn: () => callsApi.get(id),
        enabled: !!id,
    });
};

/**
 * Hook to evaluate a call
 */
export const useEvaluateCall = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => callsApi.evaluate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: callKeys.lists() });
            queryClient.invalidateQueries({ queryKey: callKeys.categories() });
            queryClient.invalidateQueries({ queryKey: ['evaluations'] });
        },
    });
};

/**
 * Hook to evaluate audio files in a directory
 */
export const useEvaluateAudio = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => callsApi.evaluateAudio(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: callKeys.lists() });
            queryClient.invalidateQueries({ queryKey: callKeys.categories() });
            queryClient.invalidateQueries({ queryKey: ['evaluations'] });
        },
    });
};

/**
 * Hook to upload call recordings
 */
export const useUploadCalls = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ formData, agentId }) => callsApi.upload(formData, agentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: callKeys.lists() });
            queryClient.invalidateQueries({ queryKey: callKeys.categories() });
        },
    });
};

/**
 * Hook to delete a call
 */
export const useDeleteCall = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => callsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: callKeys.lists() });
            queryClient.invalidateQueries({ queryKey: callKeys.categories() });
        },
    });
};

/**
 * Hook to fetch calls from Bolna API
 */
export const useFetchBolnaCalls = () => {
    return useMutation({
        mutationFn: (data) => callsApi.fetchBolnaCalls(data),
    });
};

/**
 * Hook to import selected Bolna calls
 */
export const useImportBolnaCalls = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => callsApi.importBolnaCalls(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: callKeys.lists() });
            queryClient.invalidateQueries({ queryKey: callKeys.categories() });
        },
    });
};

/**
 * Hook to fetch the Langfuse trace for a call recording.
 * Returns null if the call has no associated trace (404).
 */
export const useCallTrace = (callId) => {
    return useQuery({
        queryKey: [...callKeys.detail(callId), 'trace'],
        queryFn: async () => {
            try {
                return await callsApi.getTrace(callId);
            } catch (err) {
                if (err.message && err.message.includes('404')) return null;
                throw err;
            }
        },
        enabled: !!callId,
        staleTime: 60000,
        retry: false,
    });
};

/**
 * Hook to fetch trace-based issues and metric issues for a call recording.
 */
export const useCallIssues = (callId) => {
    return useQuery({
        queryKey: [...callKeys.detail(callId), 'issues'],
        queryFn: async () => {
            try {
                return await callsApi.getIssues(callId);
            } catch (err) {
                if (err.message && err.message.includes('404')) return null;
                throw err;
            }
        },
        enabled: !!callId,
        staleTime: 60000,
        retry: false,
    });
};
