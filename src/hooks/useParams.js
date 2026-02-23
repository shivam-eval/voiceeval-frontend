import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paramsApi } from '../api/services/params.service';

export const paramKeys = {
    all: ['params'],
    lists: () => [...paramKeys.all, 'list'],
    list: (agentId) => [...paramKeys.lists(), agentId],
};

export const useAgentParams = (agentId) => {
    return useQuery({
        queryKey: paramKeys.list(agentId),
        queryFn: () => paramsApi.list(agentId),
        enabled: !!agentId,
        staleTime: 30000,
    });
};

export const useCreateParam = (agentId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => paramsApi.create(agentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paramKeys.list(agentId) });
        },
    });
};

export const useUpdateParam = (agentId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ paramId, data }) => paramsApi.update(agentId, paramId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paramKeys.list(agentId) });
        },
    });
};

export const useDeleteParam = (agentId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (paramId) => paramsApi.delete(agentId, paramId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paramKeys.list(agentId) });
        },
    });
};
