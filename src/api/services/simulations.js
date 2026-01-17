/**
 * Simulations API Service
 * 
 * Handles all simulation-related API calls including:
 * - List simulations with filters
 * - Get simulation details
 * - Get simulation sessions
 * - Trigger simulations
 * - Cancel, rerun, and delete simulations
 */

import { apiClient } from '../clients/axios.client';

// Base simulation API path
const BASE_PATH = '/simulation';

/**
 * Get list of simulations with filtering and pagination
 */
export const getSimulations = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.agentId) params.append('agent_id', filters.agentId);
    if (filters.testSuiteId) params.append('test_suite_id', filters.testSuiteId);
    if (filters.status) params.append('status', filters.status);
    if (filters.startedAfter) params.append('started_after', filters.startedAfter);
    if (filters.startedBefore) params.append('started_before', filters.startedBefore);
    if (filters.minScore !== undefined) params.append('min_score', filters.minScore);
    if (filters.maxScore !== undefined) params.append('max_score', filters.maxScore);
    if (filters.skip !== undefined) params.append('skip', filters.skip);
    if (filters.limit !== undefined) params.append('limit', filters.limit);

    return apiClient.get(`${BASE_PATH}?${params.toString()}`);
};

/**
 * Get detailed information about a specific simulation
 */
export const getSimulation = async (simulationId) => {
    return apiClient.get(`${BASE_PATH}/${simulationId}`);
};

/**
 * Get all sessions for a specific simulation
 */
export const getSimulationSessions = async (simulationId, filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.skip !== undefined) params.append('skip', filters.skip);
    if (filters.limit !== undefined) params.append('limit', filters.limit);

    return apiClient.get(`${BASE_PATH}/${simulationId}/sessions?${params.toString()}`);
};

/**
 * Get simulation summary statistics
 */
export const getSimulationSummary = async (simulationId) => {
    return apiClient.get(`${BASE_PATH}/${simulationId}/summary`);
};

/**
 * Trigger a new simulation
 */
export const runSimulation = async (payload) => {
    return apiClient.post(`${BASE_PATH}/run`, payload);
};

/**
 * Start an inbound simulation
 */
export const runInboundSimulation = async (payload) => {
    return apiClient.post(`${BASE_PATH}/run-inbound`, payload);
};

/**
 * Cancel a running simulation
 */
export const cancelSimulation = async (simulationId) => {
    return apiClient.post(`${BASE_PATH}/${simulationId}/cancel`);
};

/**
 * Re-run an existing simulation
 */
export const rerunSimulation = async (simulationId) => {
    return apiClient.post(`${BASE_PATH}/${simulationId}/rerun`);
};

/**
 * Delete a simulation record
 */
export const deleteSimulation = async (simulationId) => {
    return apiClient.delete(`${BASE_PATH}/${simulationId}`);
};

/**
 * Export simulation results
 * TODO: Implement backend endpoint for exporting
 */
export const exportSimulationResults = async (simulationId) => {
    // This would download a file
    return apiClient.get(`${BASE_PATH}/${simulationId}/export`, {
        responseType: 'blob'
    });
};

/**
 * Get simulation status (existing endpoint for queue status)
 */
export const getSimulationStatus = async () => {
    return apiClient.get(`${BASE_PATH}/status`);
};

/**
 * Get simulation progress
 */
export const getSimulationProgress = async (simulationId) => {
    return apiClient.get(`${BASE_PATH}/${simulationId}/progress`);
};

const simulationsService = {
    getSimulations,
    getSimulation,
    getSimulationSessions,
    getSimulationSummary,
    runSimulation,
    cancelSimulation,
    rerunSimulation,
    deleteSimulation,
    exportSimulationResults,
    getSimulationStatus,
    runInboundSimulation,
    getSimulationProgress
};

export default simulationsService;
