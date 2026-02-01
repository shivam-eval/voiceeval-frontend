// useKPIs.js - Add this hook to your existing hooks file

import { useQuery } from '@tanstack/react-query';
import api from '../api/index'

/**
 * Hook to fetch aggregated KPI metrics with optional filters
 * @param {string} agentId - Agent ID
 * @param {string|null} startDate - Start date (ISO format)
 * @param {string|null} endDate - End date (ISO format)
 * @param {string[]|null} kpiTypes - Filter by specific KPI types
 * @param {object} filters - Advanced filters (e.g. {'avg_latency': {'gt': 500}})
 * @param {object} options - React Query options
 */
export const useAgentKPIsAggregated = (
  agentId,
  startDate = null,
  endDate = null,
  kpiTypes = null,
  filters = {},
  options = {}
) => {
  return useQuery({
    queryKey: ['agent-kpis-aggregated', agentId, startDate, endDate, kpiTypes, filters],
    queryFn: async () => {
      if (!agentId) {
        throw new Error('Agent ID is required');
      }

      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (kpiTypes && kpiTypes.length > 0) {
        kpiTypes.forEach(type => params.append('kpi_types', type));
      }
      if (filters && Object.keys(filters).length > 0) {
        params.append('filters', JSON.stringify(filters));
      }

      const response = await api.get(
        `/agents/${agentId}/kpis/aggregated?${params.toString()}`
      );

      return response.data;
    },
    enabled: !!agentId && (options.enabled !== false),
    staleTime: 30000, // 30 seconds
    ...options,
  });
};

/**
 * Hook to fetch KPI trend data for visualization
 * @param {string} agentId - Agent ID
 * @param {string} kpiType - KPI type (fcr_rate, conversion_rate, etc.)
 * @param {number} periodDays - Number of days for trend
 * @param {number} intervalDays - Interval between data points
 * @param {object} options - React Query options
 */
export const useAgentKPITrends = (
  agentId,
  kpiType,
  periodDays = 30,
  intervalDays = 1,
  options = {}
) => {
  return useQuery({
    queryKey: ['agent-kpi-trends', agentId, kpiType, periodDays, intervalDays],
    queryFn: async () => {
      if (!agentId || !kpiType) {
        throw new Error('Agent ID and KPI type are required');
      }

      const params = new URLSearchParams({
        kpi_type: kpiType,
        period_days: periodDays.toString(),
        interval_days: intervalDays.toString(),
      });

      const response = await api.get(
        `/agents/${agentId}/kpis/trends?${params.toString()}`
      );

      return response.data;
    },
    enabled: !!agentId && !!kpiType && (options.enabled !== false),
    staleTime: 60000, // 1 minute
    ...options,
  });
};

/**
 * Hook to fetch filtered calls based on KPI criteria
 * @param {string} agentId - Agent ID
 * @param {string|null} startDate - Start date (ISO format)
 * @param {string|null} endDate - End date (ISO format)
 * @param {object} filters - Filters (e.g. {'avg_latency': {'gt': 500}})
 * @param {number} skip - Pagination offset
 * @param {number} limit - Pagination limit
 * @param {object} options - React Query options
 */
export const useAgentKPICalls = (
  agentId,
  startDate = null,
  endDate = null,
  filters = {},
  skip = 0,
  limit = 50,
  options = {}
) => {
  return useQuery({
    queryKey: ['agent-kpi-calls', agentId, startDate, endDate, filters, skip, limit],
    queryFn: async () => {
      if (!agentId) {
        throw new Error('Agent ID is required');
      }

      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (filters && Object.keys(filters).length > 0) {
        params.append('filters', JSON.stringify(filters));
      }

      const response = await api.get(
        `/agents/${agentId}/kpis/calls?${params.toString()}`
      );

      return response.data;
    },
    enabled: !!agentId && (options.enabled !== false),
    staleTime: 10000, // 10 seconds
    ...options,
  });
};

/**
 * Hook to discover dynamic KPIs for an agent
 * @param {string} agentId - Agent ID
 * @param {boolean} forceRefresh - Force re-discovery
 * @param {object} options - React Query options
 */
export const useDiscoverKPIs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, forceRefresh = false }) => {
      const params = new URLSearchParams();
      if (forceRefresh) params.append('force_refresh', 'true');

      const response = await api.post(
        `/agents/${agentId}/kpis/discover?${params.toString()}`
      );

      return response.data;
    },
    onSuccess: (data, { agentId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries(['agent-kpi-schemas', agentId]);
      queryClient.invalidateQueries(['agent-kpis', agentId]);
      queryClient.invalidateQueries(['agent-kpis-aggregated', agentId]);
    },
  });
};

/**
 * Hook to get all KPI schemas for an agent (static + dynamic)
 * @param {string} agentId - Agent ID
 * @param {boolean} includeStatic - Include static KPI schemas
 * @param {object} options - React Query options
 */
export const useAgentKPISchemas = (
  agentId,
  includeStatic = true,
  options = {}
) => {
  return useQuery({
    queryKey: ['agent-kpi-schemas', agentId, includeStatic],
    queryFn: async () => {
      if (!agentId) {
        throw new Error('Agent ID is required');
      }

      const params = new URLSearchParams({
        include_static: includeStatic.toString(),
      });

      const response = await api.get(
        `/agents/${agentId}/kpis/schemas?${params.toString()}`
      );

      return response.data;
    },
    enabled: !!agentId && (options.enabled !== false),
    staleTime: 300000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to clear cached KPI schemas for an agent
 */
export const useClearKPISchemas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId) => {
      const response = await api.delete(`/agents/${agentId}/kpis/schemas`);
      return response.data;
    },
    onSuccess: (data, agentId) => {
      // Invalidate schemas query
      queryClient.invalidateQueries(['agent-kpi-schemas', agentId]);
    },
  });
};