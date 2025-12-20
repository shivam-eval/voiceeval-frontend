import { apiClient, longRunningApiClient } from '../clients/axios.client';

/**
 * Run a simulation
 * @param {Object} payload - Simulation parameters
 * @returns {Promise} API response
 */
export const runSimulation = (payload) =>
  longRunningApiClient.post('/simulate/run', payload);

/**
 * Get simulation status
 * @param {string} simulationId - ID of the simulation
 * @returns {Promise} API response
 */
export const getSimulationStatus = (simulationId) =>
  apiClient.get(`/simulate/status/${simulationId}`);

/**
 * Get simulation results
 * @param {string} simulationId - ID of the simulation
 * @param {boolean} includeAudio - Whether to include audio in the response
 * @returns {Promise} API response
 */
export const getSimulationResult = (simulationId, includeAudio = false) => {
  const params = new URLSearchParams();
  if (includeAudio) {
    params.append('include_audio', 'true');
  }
  return apiClient.get(`/simulate/result/${simulationId}`, { params });
};

/**
 * Get simulation transcript
 * @param {string} simulationId - ID of the simulation
 * @returns {Promise} API response
 */
export const getSimulationTranscript = (simulationId) =>
  apiClient.get(`/simulate/transcript/${simulationId}`);

/**
 * List simulations with optional status filter
 * @param {string|null} status - Status to filter by (optional)
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise} API response
 */
export const listSimulations = (status = null, limit = 50) => {
  const params = new URLSearchParams({ limit });
  if (status) {
    params.append('status', status);
  }
  return apiClient.get('/simulate/list', { params });
};

/**
 * Cancel a running simulation
 * @param {string} simulationId - ID of the simulation to cancel
 * @returns {Promise} API response
 */
export const cancelSimulation = (simulationId) =>
  apiClient.post(`/simulate/cancel/${simulationId}`);

/**
 * Get queue statistics
 * @returns {Promise} API response
 */
export const getQueueStats = () =>
  apiClient.get('/simulate/queue-stats');

/**
 * Poll simulation status until completion or timeout
 * @param {string} simulationId - ID of the simulation
 * @param {Function} onStatusUpdate - Callback for status updates
 * @param {number} interval - Polling interval in milliseconds
 * @returns {Promise} Resolves with final status or rejects on error
 */
export const pollSimulationStatus = (
  simulationId,
  onStatusUpdate = null,
  interval = 2000
) => {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const response = await getSimulationStatus(simulationId);
        const { status } = response.data;
        
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }

        if (['completed', 'failed', 'cancelled'].includes(status)) {
          resolve(status);
        } else {
          setTimeout(checkStatus, interval);
        }
      } catch (error) {
        reject(error);
      }
    };

    checkStatus().catch(reject);
  });
};

const simulationService = {
  runSimulation,
  getSimulationStatus,
  getSimulationResult,
  getSimulationTranscript,
  listSimulations,
  cancelSimulation,
  getQueueStats,
  pollSimulationStatus,
};

export default simulationService;
