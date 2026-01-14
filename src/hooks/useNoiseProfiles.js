import { useQuery } from '@tanstack/react-query';
import { noiseProfilesApi } from '../utils/api';

/**
 * Hook to fetch noise profiles list
 */
export const useNoiseProfiles = (params = {}) => {
    return useQuery({
        queryKey: ['noise-profiles', params],
        queryFn: () => noiseProfilesApi.list(params),
        staleTime: 5 * 60 * 1000, // 5 minutes - noise profiles rarely change
    });
};

/**
 * Hook to fetch a single noise profile
 */
export const useNoiseProfile = (profileId) => {
    return useQuery({
        queryKey: ['noise-profile', profileId],
        queryFn: () => noiseProfilesApi.get(profileId),
        enabled: !!profileId,
        staleTime: 5 * 60 * 1000,
    });
};

export default {
    useNoiseProfiles,
    useNoiseProfile,
};
