/**
 * React Query hooks for Personas Library (from JSON files).
 */
import { useQuery } from '@tanstack/react-query';
import { personasLibraryApi } from '../utils/api';

export const personasLibraryKeys = {
    all: ['personas-library'],
    lists: () => [...personasLibraryKeys.all, 'list'],
    list: (filters) => [...personasLibraryKeys.lists(), filters],
    details: () => [...personasLibraryKeys.all, 'detail'],
    detail: (id) => [...personasLibraryKeys.details(), id],
};

export const usePersonasLibrary = (params = {}) => {
    return useQuery({
        queryKey: personasLibraryKeys.list(params),
        queryFn: () => personasLibraryApi.list(params),
        staleTime: 300000, // 5 minutes - personas don't change often
    });
};

export const usePersonaLibraryDetail = (personaId) => {
    return useQuery({
        queryKey: personasLibraryKeys.detail(personaId),
        queryFn: () => personasLibraryApi.get(personaId),
        enabled: !!personaId,
        staleTime: 300000,
    });
};
