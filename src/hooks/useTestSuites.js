/**
 * React Query hooks for Test Suite operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testSuitesApi } from '../utils/api';

// Query keys
export const testSuiteKeys = {
    all: ['test-suites'],
    lists: () => [...testSuiteKeys.all, 'list'],
    list: (filters) => [...testSuiteKeys.lists(), filters],
    details: () => [...testSuiteKeys.all, 'detail'],
    detail: (id) => [...testSuiteKeys.details(), id],
};

/**
 * Hook to fetch list of test suites
 */
export const useTestSuites = (params = {}) => {
    return useQuery({
        queryKey: testSuiteKeys.list(params),
        queryFn: () => testSuitesApi.list(params),
        staleTime: 30000,
    });
};

/**
 * Hook to fetch single test suite
 */
export const useTestSuite = (id) => {
    return useQuery({
        queryKey: testSuiteKeys.detail(id),
        queryFn: () => testSuitesApi.get(id),
        enabled: !!id,
    });
};

/**
 * Hook to create test suite
 */
export const useCreateTestSuite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => testSuitesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.lists() });
        },
    });
};

/**
 * Hook to update test suite
 */
export const useUpdateTestSuite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => testSuitesApi.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.lists() });
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.detail(variables.id) });
        },
    });
};

/**
 * Hook to delete test suite
 */
export const useDeleteTestSuite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => testSuitesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.lists() });
        },
    });
};

/**
 * Hook to clone test suite
 */
export const useCloneTestSuite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => testSuitesApi.clone(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.lists() });
        },
    });
};

/**
 * Hook to add test case to suite
 */
export const useAddTestCase = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ suiteId, testCase }) => testSuitesApi.addTestCase(suiteId, testCase),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.detail(variables.suiteId) });
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.lists() });
        },
    });
};

/**
 * Hook to import test suite
 */
export const useImportTestSuite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ fileContent, name, agentId }) => testSuitesApi.import(fileContent, name, agentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.lists() });
        },
    });
};

/**
 * Hook to bulk update test cases
 */
export const useBulkUpdateTestCases = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ suiteId, testCaseIds, updates }) =>
            testSuitesApi.bulkUpdateTestCases(suiteId, testCaseIds, updates),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.detail(variables.suiteId) });
        },
    });
};

/**
 * Hook to get test suite statistics
 */
export const useTestSuiteStatistics = (id) => {
    return useQuery({
        queryKey: [...testSuiteKeys.detail(id), 'statistics'],
        queryFn: () => testSuitesApi.getStatistics(id),
        enabled: !!id,
    });
};

/**
 * Hook to update test suite status
 */
export const useUpdateTestSuiteStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => testSuitesApi.updateStatus(id, status),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.lists() });
            queryClient.invalidateQueries({ queryKey: testSuiteKeys.detail(variables.id) });
        },
    });
};
