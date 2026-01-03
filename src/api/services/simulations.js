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
 * Trigger a new simulation run
 * @param {string} testSuiteId - ID of the test suite to run
 * @param {string} phoneNumber - Phone number to call
 * @param {Object} options - Optional configuration
 * @param {string} options.agentId - ID of the agent being tested
 * @param {Object} options.metadata - Additional metadata for the simulation
 * @param {boolean} options.parallelExecution - Whether to run test cases in parallel
 * @param {number} options.maxConcurrency - Max concurrent calls (if parallel)
 */
export const runSimulation = async (testSuiteId, phoneNumber, options = {}) => {
    // Validate required parameters
    if (!testSuiteId) {
        throw new Error('Test suite ID is required');
    }
    if (!phoneNumber) {
        throw new Error('Phone number is required');
    }

    // Validate phone number format (basic check)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s-]/g, ''))) {
        console.warn('Phone number may not be in E.164 format:', phoneNumber);
    }

    // Build the request payload
    const payload = {
        test_suite_id: testSuiteId,
        phone_number: phoneNumber,
    };

    // Add optional fields if provided
    if (options.agentId) {
        payload.agent_id = options.agentId;
    }
    if (options.metadata) {
        payload.metadata = options.metadata;
    }
    if (options.parallelExecution !== undefined) {
        payload.parallel_execution = options.parallelExecution;
    }
    if (options.maxConcurrency) {
        payload.max_concurrency = options.maxConcurrency;
    }

    try {
        const response = await apiClient.post(`${BASE_PATH}/run`, payload);

        // Validate response
        if (!response.data || !response.data.simulation_id) {
            throw new Error('Invalid response from server: missing simulation_id');
        }

        return response.data;
    } catch (error) {
        // Enhanced error handling
        if (error.response) {
            // Server responded with error
            const status = error.response.status;
            const detail = error.response.data?.detail || error.response.data?.message;

            if (status === 422) {
                throw new Error(`Validation error: ${detail || 'Invalid request parameters'}`);
            } else if (status === 404) {
                throw new Error(`Test suite not found: ${testSuiteId}`);
            } else if (status === 409) {
                throw new Error(`Simulation already running for this test suite`);
            } else if (status === 503) {
                throw new Error('Simulation service is currently unavailable. Please try again later.');
            } else {
                throw new Error(detail || `Failed to start simulation (${status})`);
            }
        } else if (error.request) {
            // Request made but no response
            throw new Error('No response from server. Please check your connection.');
        } else {
            // Error in request setup
            throw error;
        }
    }
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
