/**
 * React Query hook for fetching scenario configs by agent.
 */
import { useQuery } from "@tanstack/react-query";
import { scenarioConfigsApi } from "../utils/api";

export const scenarioConfigKeys = {
    all: ["scenario-configs"],
    byAgent: (agentId) => [...scenarioConfigKeys.all, "by-agent", agentId],
    detail: (id) => [...scenarioConfigKeys.all, "detail", id],
};

/**
 * Fetch scenario configs for the given agentId.
 * If agentId is falsy, the query will be disabled.
 */
export const useScenarioConfigs = (agentId, params = {}) => {
    return useQuery({
        queryKey: scenarioConfigKeys.byAgent(agentId),
        queryFn: () => scenarioConfigsApi.listByAgent(agentId, params),
        enabled: !!agentId,
        staleTime: 30000,
    });
};

/**
 * Hook to fetch a single scenario config by id.
 */
export const useScenarioConfig = (id) => {
    return useQuery({
        queryKey: scenarioConfigKeys.detail(id),
        queryFn: () => scenarioConfigsApi.get(id),
        enabled: !!id,
    });
};

