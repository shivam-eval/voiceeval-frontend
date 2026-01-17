import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientService from '../api/services/client.service';

export const clientKeys = {
    all: ['clients'],
    lists: () => [...clientKeys.all, 'list'],
    detail: (id) => [...clientKeys.all, 'detail', id],
};

export const useClients = () => {
    return useQuery({
        queryKey: clientKeys.lists(),
        queryFn: clientService.listClients,
    });
};

export const useClient = (clientId) => {
    return useQuery({
        queryKey: clientKeys.detail(clientId),
        queryFn: () => clientService.getClient(clientId),
        enabled: !!clientId,
    });
};

export const useCreateClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: clientService.createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
        },
    });
};
