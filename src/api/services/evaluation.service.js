import { apiClient } from '../clients/axios.client';

/**
 * Get a single evaluation by ID
 */
export const getEvaluation = (evaluationId) =>
  apiClient.get(`/evaluate/${evaluationId}`);

/**
 * List evaluations with filtering
 */
export const getEvaluations = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.sessionId) params.append('session_id', filters.sessionId);
  if (filters.simulationId) params.append('simulation_id', filters.simulationId);
  if (filters.minScore !== undefined) params.append('min_score', filters.minScore);
  if (filters.maxScore !== undefined) params.append('max_score', filters.maxScore);
  if (filters.passed !== undefined) params.append('passed', filters.passed);
  if (filters.skip !== undefined) params.append('skip', filters.skip);
  if (filters.limit !== undefined) params.append('limit', filters.limit);

  return apiClient.get(`/evaluate?${params.toString()}`);
};

/**
 * Get all evaluations for a specific simulation
 */
export const getSimulationEvaluations = (simulationId, skip = 0, limit = 100) =>
  apiClient.get(`/evaluate/simulation/${simulationId}?skip=${skip}&limit=${limit}`);

/**
 * Evaluate a session
 */
export const evaluateSession = (sessionId, configOverrides = {}) =>
  apiClient.post('/evaluate', {
    session_id: sessionId,
    config_overrides: configOverrides
  });

/**
 * Batch evaluate all sessions in a simulation
 */
export const batchEvaluateSimulation = (simulationId) =>
  apiClient.post('/evaluate/batch', {
    simulation_id: simulationId
  });

/**
 * Evaluate a transcript (existing)
 * @param {Object} payload - Evaluation parameters
 * @returns {Promise} API response
 */
export const evaluateTranscript = (payload) =>
  apiClient.post('/evaluate/transcript', payload);

/**
 * Get evaluation results for a simulation (existing)
 * @param {string} simulationId - ID of the simulation
 * @returns {Promise} API response
 */
export const getEvaluationResults = (simulationId) =>
  apiClient.get(`/evaluate/results/${simulationId}`);

const evaluationService = {
  getEvaluation,
  getEvaluations,
  getSimulationEvaluations,
  evaluateSession,
  batchEvaluateSimulation,
  evaluateTranscript,
  getEvaluationResults,
};

export default evaluationService;
