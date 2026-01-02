import { apiClient } from '../../utils/api';

/**
 * Get a single evaluation by ID
 */
export const getEvaluation = (evaluationId) =>
  apiClient.get(`/api/v1/evaluate/${evaluationId}`);

/**
 * List evaluations with filtering
 */
export const getEvaluations = (filters = {}) => {
  const params = {};

  if (filters.sessionId) params.session_id = filters.sessionId;
  if (filters.simulationId) params.simulation_id = filters.simulationId;
  if (filters.minScore !== undefined) params.min_score = filters.minScore;
  if (filters.maxScore !== undefined) params.max_score = filters.maxScore;
  if (filters.passed !== undefined) params.passed = filters.passed;
  if (filters.skip !== undefined) params.skip = filters.skip;
  if (filters.limit !== undefined) params.limit = filters.limit;

  return apiClient.get('/api/v1/evaluate/', params);
};

/**
 * Get evaluations for a specific session
 */
export const getSessionEvaluations = (sessionId) =>
  apiClient.get('/api/v1/evaluate/session', { sessionId });

/**
 * Get all evaluations for a specific simulation
 */
export const getSimulationEvaluations = (simulationId) =>
  apiClient.get('/api/v1/evaluate/simulation', { simulationId });

/**
 * Evaluate a session
 */
export const evaluateSession = (sessionId, configOverrides = {}) =>
  apiClient.post('/api/v1/evaluate', {
    session_id: sessionId,
    config_overrides: configOverrides
  });

/**
 * Batch evaluate all sessions in a simulation
 */
export const batchEvaluateSimulation = (simulationId) =>
  apiClient.post('/api/v1/evaluate/batch', {
    simulation_id: simulationId
  });

/**
 * Evaluate a transcript (existing)
 * @param {Object} payload - Evaluation parameters
 * @returns {Promise} API response
 */
export const evaluateTranscript = (payload) =>
  apiClient.post('/api/v1/evaluate/transcript', payload);

/**
 * Get evaluation results for a simulation (existing)
 * @param {string} simulationId - ID of the simulation
 * @returns {Promise} API response
 */
export const getEvaluationResults = (simulationId) =>
  apiClient.get(`/api/v1/evaluate/results/${simulationId}`);

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
