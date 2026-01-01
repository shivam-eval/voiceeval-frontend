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

    const response = await apiClient.get(`${BASE_PATH}?${params.toString()}`);
    return response.data;
};

/**
 * Get detailed information about a specific simulation
 */
export const getSimulation = async (simulationId) => {
    const response = await apiClient.get(`${BASE_PATH}/${simulationId}`);
    return response.data;
};

/**
 * Get all sessions for a specific simulation
 */
export const getSimulationSessions = async (simulationId, filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.skip !== undefined) params.append('skip', filters.skip);
    if (filters.limit !== undefined) params.append('limit', filters.limit);

    const response = await apiClient.get(
        `${BASE_PATH}/${simulationId}/sessions?${params.toString()}`
    );
    return response.data;
};

/**
 * Get simulation summary (existing endpoint)
 */
export const getSimulationSummary = async (simulationId) => {
    const response = await apiClient.get(`${BASE_PATH}/${simulationId}/summary`);
    return response.data;
};

/**
 * Trigger a new simulation run
 */
export const runSimulation = async (testSuiteId, phoneNumber) => {
    const response = await apiClient.post(`${BASE_PATH}/run`, {
        test_suite_id: testSuiteId,
        phone_number: phoneNumber
    });
    return response.data;
};

/**
 * Cancel a running simulation
 */
export const cancelSimulation = async (simulationId) => {
    const response = await apiClient.post(`${BASE_PATH}/${simulationId}/cancel`);
    return response.data;
};

/**
 * Rerun a completed simulation
 */
export const rerunSimulation = async (simulationId) => {
    const response = await apiClient.post(`${BASE_PATH}/${simulationId}/rerun`);
    return response.data;
};

/**
 * Delete a simulation and all associated data
 */
export const deleteSimulation = async (simulationId) => {
    const response = await apiClient.delete(`${BASE_PATH}/${simulationId}`);
    return response.data;
};

/**
 * Export simulation results
 * TODO: Implement backend endpoint for exporting
 */
export const exportSimulationResults = async (simulationId) => {
    // This would download a file
    const response = await apiClient.get(`${BASE_PATH}/${simulationId}/export`, {
        responseType: 'blob'
    });
    return response.data;
};

/**
 * Get simulation status (existing endpoint for queue status)
 */
export const getSimulationStatus = async () => {
    const response = await apiClient.get(`${BASE_PATH}/status`);
    return response.data;
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
    getSimulationStatus
};

export default simulationsService;
