/**
 * React Query hooks for Simulation operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import simulationsService from '../api/services/simulations';

const simulationsApi = simulationsService;

// Query keys
export const simulationKeys = {
    all: ['simulations'],
    lists: () => [...simulationKeys.all, 'list'],
    list: (filters) => [...simulationKeys.lists(), filters],
    details: () => [...simulationKeys.all, 'detail'],
    detail: (id) => [...simulationKeys.details(), id],
    sessions: (id) => [...simulationKeys.detail(id), 'sessions'],
    sessionsList: (id, filters) => [...simulationKeys.sessions(id), filters],
    summary: (id) => [...simulationKeys.detail(id), 'summary'],
};

/**
 * Hook to fetch list of simulations with filters
 */
export const useSimulations = (filters = {}) => {
    return useQuery({
        queryKey: simulationKeys.list(filters),
        queryFn: () => simulationsApi.getSimulations(filters),
        staleTime: 10000, // Refresh every 10 seconds for live updates
    });
};

/**
 * Hook to fetch single simulation detail
 */
export const useSimulation = (simulationId) => {
    return useQuery({
        queryKey: simulationKeys.detail(simulationId),
        queryFn: () => simulationsApi.getSimulation(simulationId),
        enabled: !!simulationId,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5000, //  Refresh faster for running simulations
    });
};

/**
 * Hook to fetch simulation sessions
 */
export const useSimulationSessions = (simulationId, filters = {}) => {
    return useQuery({
        queryKey: simulationKeys.sessionsList(simulationId, filters),
        queryFn: () => simulationsApi.getSimulationSessions(simulationId, filters),
        enabled: !!simulationId,
        staleTime: 5000,
    });
};

/**
 * Hook to fetch simulation summary
 */
export const useSimulationSummary = (simulationId) => {
    return useQuery({
        queryKey: simulationKeys.summary(simulationId),
        queryFn: () => simulationsApi.getSimulationSummary(simulationId),
        enabled: !!simulationId,
    });
};

/**
 * Hook to run a new simulation
 */
export const useRunSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ testSuiteId, phoneNumber }) =>
            simulationsApi.runSimulation(testSuiteId, phoneNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: simulationKeys.lists() });
        },
    });
};

/**
 * Hook to cancel a running simulation
 */
export const useCancelSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (simulationId) => simulationsApi.cancelSimulation(simulationId),
        onSuccess: (data, simulationId) => {
            queryClient.invalidateQueries({ queryKey: simulationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: simulationKeys.detail(simulationId) });
        },
    });
};

/**
 * Hook to rerun a simulation
 */
export const useRerunSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (simulationId) => simulationsApi.rerunSimulation(simulationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: simulationKeys.lists() });
        },
    });
};

/**
 * Hook to delete a simulation
 */
export const useDeleteSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (simulationId) => simulationsApi.deleteSimulation(simulationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: simulationKeys.lists() });
        },
    });
};

/**
 * Hook with auto-refresh for running simulations
 * Polls every 5 seconds if simulation is running
 */
export const useSimulationWithLiveUpdates = (simulationId) => {
    const queryResult = useSimulation(simulationId);

    // Enable auto-refresh if simulation is running
    const isRunning = queryResult.data?.status === 'running';

    return useQuery({
        queryKey: simulationKeys.detail(simulationId),
        queryFn: () => simulationsApi.getSimulation(simulationId),
        enabled: !!simulationId,
        refetchInterval: isRunning ? 5000 : false, // Poll every 5s if running
        refetchIntervalInBackground: false,
    });
};
