import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import observabilityService from '../api/services/observability.service';

/**
 * Query Keys
 */
const QUERY_KEYS = {
  TRACES: 'observability_traces',
  TRACE: 'observability_trace',
  TRACE_EVALUATION: 'observability_trace_evaluation',
  SESSION: 'observability_session',
  SESSION_TRACES: 'observability_session_traces',
  KPIS: 'observability_kpis',
  TRENDS: 'observability_trends',
};

/**
 * Hook to fetch KPIs
 */
export const useKPIs = (agentId = null, timeRange = '7d') => {
  return useQuery({
    queryKey: [QUERY_KEYS.KPIS, agentId, timeRange],
    queryFn: () => observabilityService.getKPIs(agentId, timeRange),
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  });
};

/**
 * Hook to fetch trends data
 */
export const useTrends = (agentId = null, timeRange = '7d') => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRENDS, agentId, timeRange],
    queryFn: () => observabilityService.getTrends(agentId, timeRange),
    staleTime: 60000,
    refetchInterval: 120000,
  });
};

/**
 * Hook to fetch traces list
 */
export const useTraces = (filters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRACES, filters],
    queryFn: () => observabilityService.getTraces(filters),
    staleTime: 30000,
    keepPreviousData: true, // Keep previous page while loading next
  });
};

/**
 * Hook to fetch single trace
 */
export const useTrace = (traceId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRACE, traceId],
    queryFn: () => observabilityService.getTrace(traceId),
    enabled: !!traceId,
    staleTime: 60000,
  });
};

/**
 * Hook to fetch trace evaluation
 */
export const useTraceEvaluation = (traceId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRACE_EVALUATION, traceId],
    queryFn: () => observabilityService.getTraceEvaluation(traceId),
    enabled: !!traceId,
    staleTime: 60000,
  });
};

/**
 * Hook to fetch session
 */
export const useSession = (sessionId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SESSION, sessionId],
    queryFn: () => observabilityService.getSession(sessionId),
    enabled: !!sessionId,
    staleTime: 60000,
  });
};

/**
 * Hook to fetch session traces
 */
export const useSessionTraces = (sessionId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SESSION_TRACES, sessionId],
    queryFn: () => observabilityService.getSessionTraces(sessionId),
    enabled: !!sessionId,
    staleTime: 30000,
  });
};

/**
 * Hook to ingest trace
 */
export const useIngestTrace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ traceId, agentId }) => 
      observabilityService.ingestTrace(traceId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.TRACES]);
      queryClient.invalidateQueries([QUERY_KEYS.KPIS]);
      toast.success('Trace ingested successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to ingest trace');
    },
  });
};

/**
 * Hook to evaluate single trace
 */
export const useEvaluateTrace = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ traceId, options }) => 
      observabilityService.evaluateTrace(traceId, options),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([QUERY_KEYS.TRACES]);
      queryClient.invalidateQueries([QUERY_KEYS.TRACE, variables.traceId]);
      queryClient.invalidateQueries([QUERY_KEYS.TRACE_EVALUATION, variables.traceId]);
      queryClient.invalidateQueries([QUERY_KEYS.KPIS]);
      toast.success('Trace evaluation started');
      
      // Navigate to results if evaluation ID available
      if (data.evaluation_id) {
        navigate(`/evaluations/${data.evaluation_id}`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to evaluate trace');
    },
  });
};

/**
 * Hook to evaluate session
 */
export const useEvaluateSession = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ sessionId, options }) => 
      observabilityService.evaluateSession(sessionId, options),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([QUERY_KEYS.SESSION, variables.sessionId]);
      queryClient.invalidateQueries([QUERY_KEYS.SESSION_TRACES, variables.sessionId]);
      queryClient.invalidateQueries([QUERY_KEYS.TRACES]);
      queryClient.invalidateQueries([QUERY_KEYS.KPIS]);
      toast.success(`Session evaluation started (${data.total_traces} traces)`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to evaluate session');
    },
  });
};

/**
 * Hook to evaluate batch of traces
 */
export const useEvaluateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ traceIds, options }) => 
      observabilityService.evaluateBatch(traceIds, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries([QUERY_KEYS.TRACES]);
      queryClient.invalidateQueries([QUERY_KEYS.KPIS]);
      toast.success(`Batch evaluation started (${data.total_traces} traces)`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to evaluate batch');
    },
  });
};

/**
 * Hook to evaluate time range
 */
export const useEvaluateTimeRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startTime, endTime, options }) => 
      observabilityService.evaluateTimeRange(startTime, endTime, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries([QUERY_KEYS.TRACES]);
      queryClient.invalidateQueries([QUERY_KEYS.KPIS]);
      toast.success(`Time range evaluation started (${data.total_traces} traces)`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to evaluate time range');
    },
  });
};

/**
 * Hook to sync traces from LangFuse
 */
export const useSyncTraces = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (force = false) => observabilityService.syncNow(force),
    onSuccess: (data) => {
      queryClient.invalidateQueries([QUERY_KEYS.TRACES]);
      queryClient.invalidateQueries([QUERY_KEYS.KPIS]);
      queryClient.invalidateQueries([QUERY_KEYS.TRENDS]);
      
      const { summary } = data;
      if (summary.traces_processed > 0) {
        toast.success(`Synced ${summary.traces_processed} traces from LangFuse`);
      } else {
        toast.info('No new traces found');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to sync traces');
    },
  });
};

/**
 * Hook to get sync status
 */
export const useSyncStatus = () => {
  return useQuery({
    queryKey: ['sync_status'],
    queryFn: () => observabilityService.getSyncStatus(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};
