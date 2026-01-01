/**
 * React Query hooks for Persona operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personasApi, personasLibraryApi } from '../utils/api';

export const personaKeys = {
    all: ['personas'],
    lists: () => [...personaKeys.all, 'list'],
    list: (filters) => [...personaKeys.lists(), filters],
    details: () => [...personaKeys.all, 'detail'],
    detail: (id) => [...personaKeys.details(), id],
};

export const usePersonas = (params = {}) => {
    return useQuery({
        queryKey: personaKeys.list(params),
        queryFn: () => personasLibraryApi.list(params),
        staleTime: 60000, // 1 minute
    });
};

export const usePersona = (id) => {
    return useQuery({
        queryKey: personaKeys.detail(id),
        queryFn: () => personasLibraryApi.get(id),
        enabled: !!id,
    });
};

export const useCreatePersona = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => personasApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
        },
    });
};

export const useUpdatePersona = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => personasApi.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: personaKeys.detail(variables.id) });
        },
    });
};

export const useDeletePersona = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => personasApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
        },
    });
};
