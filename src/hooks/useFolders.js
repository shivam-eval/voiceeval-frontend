/**
 * React Query hooks for Folders (simulation batches) operations.
 */
import { useQuery } from '@tanstack/react-query';
import simulationsService from '../api/services/simulations';

// Query keys
export const folderKeys = {
    all: ['folders'],
    lists: () => [...folderKeys.all, 'list'],
    list: (params) => [...folderKeys.lists(), params],
    details: () => [...folderKeys.all, 'detail'],
    calls: (folderId) => [...folderKeys.details(), folderId, 'calls'],
    callsList: (folderId, params) => [...folderKeys.calls(folderId), params],
};

/**
 * Hook to fetch list of folders for an agent
 */
export const useFolders = (params = {}, options = {}) => {
    return useQuery({
        queryKey: folderKeys.list(params),
        queryFn: () => simulationsService.getFolders(params),
        enabled: !!params?.agentId,
        staleTime: 30000,
        refetchOnWindowFocus: false,
        ...options,
    });
};

/**
 * Hook to fetch calls in a folder
 */
export const useFolderCalls = (folderId, params = {}, options = {}) => {
    return useQuery({
        queryKey: folderKeys.callsList(folderId, params),
        queryFn: () => simulationsService.getFolderCalls(folderId, params),
        enabled: !!folderId,
        staleTime: 30000,
        refetchOnWindowFocus: false,
        ...options,
    });
};
