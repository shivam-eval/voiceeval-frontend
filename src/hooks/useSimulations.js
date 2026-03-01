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
 * Note: Refetches on mount and after mutations (create, delete, etc.)
 */
export const useSimulations = (filters = {}) => {
    return useQuery({
        queryKey: simulationKeys.list(filters),
        queryFn: () => simulationsApi.getSimulations(filters),
        staleTime: Infinity, // No auto-refresh
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook to fetch single simulation detail
 * Note: Uses SSE for updates via useSimulationWithLiveUpdates, no polling
 */
export const useSimulation = (simulationId) => {
    return useQuery({
        queryKey: simulationKeys.detail(simulationId),
        queryFn: () => simulationsApi.getSimulation(simulationId),
        enabled: !!simulationId,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: Infinity, // No auto-refresh, rely on SSE events to invalidate
        refetchOnWindowFocus: false, // Disable refetch on window focus
    });
};

/**
 * Hook to fetch simulation sessions
 * Note: Sessions are refetched when SSE events invalidate the query
 */
export const useSimulationSessions = (simulationId, filters = {}) => {
    return useQuery({
        queryKey: simulationKeys.sessionsList(simulationId, filters),
        queryFn: () => simulationsApi.getSimulationSessions(simulationId, filters),
        enabled: !!simulationId,
        staleTime: Infinity, // No auto-refresh, rely on SSE events
        refetchOnWindowFocus: false,
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
        mutationFn: ({ test_suite_id, phone_number, agent_id, folder_name, metadata, parallel_execution, max_concurrency }) =>
            simulationsApi.runSimulation({
                test_suite_id,
                phone_number,
                agent_id,
                folder_name,
                metadata,
                parallel_execution,
                max_concurrency
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: simulationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['simulations', 'categories'] });
            if (data.simulation_id) {
                queryClient.invalidateQueries({ queryKey: simulationKeys.detail(data.simulation_id) });
            }
        },
        onError: (error) => {
            console.error('Failed to run simulation:', error);
        }
    });
};

/**
 * Hook to run a new inbound simulation
 */
export const useRunInboundSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => simulationsApi.runInboundSimulation(payload),
        onSuccess: (data) => {
            // Invalidate lists so server state is refreshed
            queryClient.invalidateQueries({ queryKey: simulationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['simulations', 'categories'] });

            // If the API returned the created simulation object, ensure it's marked
            // as inbound in any cached lists so the main sessions page can filter it out
            try {
                if (data?.simulation_id) {
                    const lists = queryClient.getQueriesData(simulationKeys.lists());
                    lists.forEach(([key, cached]) => {
                        if (cached && Array.isArray(cached.simulations)) {
                            const existing = cached.simulations.find(s => s.simulation_id === data.simulation_id);
                            const item = { ...data, call_mode: data.call_mode || 'inbound' };
                            const newSims = existing ? cached.simulations.map(s => s.simulation_id === data.simulation_id ? item : s) : [item, ...cached.simulations];
                            queryClient.setQueryData(key, { ...cached, simulations: newSims });
                        }
                    });
                }
            } catch (err) {
                // swallow cache update errors - invalidate above will refresh data
                console.error('Failed to patch inbound simulation into cache', err);
            }
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
import { useEffect } from 'react';
import { useEvents } from '../context/EventsContext';

/**
 * Hook with auto-refresh for running simulations using SSE
 */
export const useSimulationWithLiveUpdates = (simulationId) => {
    const queryClient = useQueryClient();
    const { subscribe } = useEvents();

    useEffect(() => {
        if (!simulationId) return;

        // Subscribe to simulation updates
        const unsubscribe = subscribe('simulation_update', (data) => {
            if (data.simulation_id === simulationId) {
                console.log(`📡 Simulation Update [${simulationId}]:`, data);

                // Invalidate query to refetch fresh data
                queryClient.invalidateQueries({ queryKey: simulationKeys.detail(simulationId) });

                // Also invalidate sessions list as they might have changed
                queryClient.invalidateQueries({ queryKey: ['simulations', 'detail', simulationId, 'sessions'] });
            }
        });

        return () => unsubscribe();
    }, [simulationId, subscribe, queryClient]);

    return useSimulation(simulationId);
};

/**
 * Hook to fetch simulation categories (agents with simulation counts)
 */
export const useSimulationCategories = () => {
    return useQuery({
        queryKey: ['simulations', 'categories'],
        queryFn: () => simulationsApi.getSimulationCategories(),
        staleTime: 30000,
    });
};

/**
 * Hook to fetch outbound agents (agents with folder counts)
 */
export const useOutboundAgents = () => {
    return useQuery({
        queryKey: ['simulations', 'outbound-agents'],
        queryFn: () => simulationsApi.getOutboundAgents(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};
