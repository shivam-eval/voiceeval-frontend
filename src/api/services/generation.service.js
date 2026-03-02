import { apiClient, longRunningApiClient } from '../clients/axios.client';

/**
 * Generate flow from text
 * @param {Object} payload - Generation parameters
 * @returns {Promise} API response
 */
export const generateFlow = (payload) =>
  longRunningApiClient.post('/generate/flow', payload);

/**
 * Generate flow in Mermaid format
 * @param {Object} payload - Generation parameters
 * @returns {Promise} API response
 */
export const generateFlowMermaid = (payload) =>
  longRunningApiClient.post('/generate/flow/mermaid', payload);

/**
 * Generate test cases
 * @param {Object} payload - Test case generation parameters
 * @returns {Promise} API response
 */
export const generateTestCases = (payload) =>
  apiClient.post('/generate/tests', payload);

const generationService = {
  generateFlow,
  generateFlowMermaid,
  generateTestCases,
};

export default generationService;
