import { apiClient } from '../clients/axios.client';

/**
 * Evaluate a transcript
 * @param {Object} payload - Evaluation parameters
 * @returns {Promise} API response
 */
export const evaluateTranscript = (payload) =>
  apiClient.post('/evaluate/transcript', payload);

/**
 * Get evaluation results for a simulation
 * @param {string} simulationId - ID of the simulation
 * @returns {Promise} API response
 */
export const getEvaluationResults = (simulationId) =>
  apiClient.get(`/evaluate/results/${simulationId}`);

const evaluationService = {
  evaluateTranscript,
  getEvaluationResults,
};

export default evaluationService;
