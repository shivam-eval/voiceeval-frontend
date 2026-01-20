import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import kpiService from '../api/services/kpi.service';

/**
 * Hook to fetch agent-level KPIs with aggregation
 * @param {string} agentId - Agent ID
 * @param {number} periodDays - Number of days to aggregate (default: 30)
 * @param {object} options - React Query options
 */
export const useAgentKPIs = (agentId, periodDays = 30, options = {}) => {
    return useQuery({
        queryKey: ['agent-kpis', agentId, periodDays],
        queryFn: () => kpiService.getAgentKPIs(agentId, periodDays),
        enabled: !!agentId, // Only run if agentId is provided
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
};

/**
 * Hook to fetch KPI schemas (static + dynamic)
 * @param {string} agentId - Agent ID
 * @param {boolean} includeStatic - Include static schemas
 * @param {object} options - React Query options
 */
export const useKPISchemas = (agentId, includeStatic = true, options = {}) => {
    return useQuery({
        queryKey: ['kpi-schemas', agentId, includeStatic],
        queryFn: () => kpiService.getKPISchemas(agentId, includeStatic),
        enabled: !!agentId,
        staleTime: 60 * 60 * 1000, // 1 hour (schemas change rarely)
        cacheTime: 2 * 60 * 60 * 1000, // 2 hours
        ...options,
    });
};

/**
 * Hook to fetch KPI trends
 * @param {string} agentId - Agent ID
 * @param {string} kpiType - KPI type (e.g., 'fcr_rate')
 * @param {number} periodDays - Number of days
 * @param {number} intervalDays - Interval between data points
 * @param {object} options - React Query options
 */
export const useKPITrends = (
    agentId,
    kpiType,
    periodDays = 30,
    intervalDays = 1,
    options = {}
) => {
    return useQuery({
        queryKey: ['kpi-trends', agentId, kpiType, periodDays, intervalDays],
        queryFn: () => kpiService.getKPITrends(agentId, kpiType, periodDays, intervalDays),
        enabled: !!agentId && !!kpiType,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

/**
 * Hook to trigger dynamic KPI discovery (mutation)
 */
export const useDiscoverKPIs = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ agentId, forceRefresh = false }) =>
            kpiService.discoverAgentKPIs(agentId, forceRefresh),
        onSuccess: (data, variables) => {
            // Invalidate KPI schemas cache to refetch with new schemas
            queryClient.invalidateQueries({
                queryKey: ['kpi-schemas', variables.agentId],
            });
            // Also invalidate agent KPIs to get updated data
            queryClient.invalidateQueries({
                queryKey: ['agent-kpis', variables.agentId],
            });
        },
    });
};

/**
 * Hook to fetch call with KPIs
 * @param {string} callId - Call ID
 * @param {object} options - React Query options
 */
export const useCallWithKPIs = (callId, options = {}) => {
    return useQuery({
        queryKey: ['call-with-kpis', callId],
        queryFn: () => kpiService.getCallWithKPIs(callId),
        enabled: !!callId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
};

/**
 * Hook to clear KPI schemas (mutation)
 */
export const useClearKPISchemas = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (agentId) => kpiService.clearKPISchemas(agentId),
        onSuccess: (data, agentId) => {
            // Invalidate schemas cache
            queryClient.invalidateQueries({
                queryKey: ['kpi-schemas', agentId],
            });
        },
    });
};
