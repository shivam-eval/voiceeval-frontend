/**
 * React Query hook for fetching v2 test cases by agent.
 */
import { useQuery } from "@tanstack/react-query";
import { testCasesApi } from "../utils/api";

export const testCaseKeys = {
    all: ["test-cases"],
    byAgent: (agentId) => [...testCaseKeys.all, "by-agent", agentId],
};

/**
 * Fetch test cases (with embedded scenario configs) for the given agentId.
 * Disabled when agentId is falsy.
 */
export const useTestCases = (agentId) => {
    return useQuery({
        queryKey: testCaseKeys.byAgent(agentId),
        queryFn: () => testCasesApi.listByAgent(agentId),
        enabled: !!agentId,
        staleTime: 30000,
    });
};
