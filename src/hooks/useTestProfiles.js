/**
 * React Query hooks for Test Profile operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testProfilesApi } from '../utils/api';

export const testProfileKeys = {
    all: ['test-profiles'],
    lists: () => [...testProfileKeys.all, 'list'],
    list: (filters) => [...testProfileKeys.lists(), filters],
    details: () => [...testProfileKeys.all, 'detail'],
    detail: (id) => [...testProfileKeys.details(), id],
};

export const useTestProfiles = (params = {}) => {
    return useQuery({
        queryKey: testProfileKeys.list(params),
        queryFn: () => testProfilesApi.list(params),
        staleTime: 60000,
    });
};

export const useTestProfile = (id) => {
    return useQuery({
        queryKey: testProfileKeys.detail(id),
        queryFn: () => testProfilesApi.get(id),
        enabled: !!id,
    });
};

export const useCreateTestProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => testProfilesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testProfileKeys.lists() });
        },
    });
};

export const useUpdateTestProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => testProfilesApi.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: testProfileKeys.lists() });
            queryClient.invalidateQueries({ queryKey: testProfileKeys.detail(variables.id) });
        },
    });
};

export const useDeleteTestProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => testProfilesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testProfileKeys.lists() });
        },
    });
};
