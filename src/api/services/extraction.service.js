import { apiClient } from '../clients/axios.client';

/**
 * Extract agent from URL
 * @param {Object} payload - Extraction parameters
 * @returns {Promise} API response
 */
export const extractAgent = (payload) => 
  apiClient.post('/extract/agent', payload);

/**
 * Get cached extraction results for an agent
 * @param {string} agentId - ID of the agent
 * @returns {Promise} API response
 */
export const getCachedExtraction = (agentId) => 
  apiClient.get(`/extract/cache/${agentId}`);

/**
 * List all cached extractions
 * @returns {Promise} API response
 */
export const listCachedExtractions = () => 
  apiClient.get('/extract/cache');

/**
 * Clear cached extraction for an agent
 * @param {string} agentId - ID of the agent
 * @returns {Promise} API response
 */
export const clearCachedExtraction = (agentId) => 
  apiClient.delete(`/extract/cache/${agentId}`);

/**
 * Clear all cached extractions
 * @returns {Promise} API response
 */
export const clearAllCachedExtractions = () => 
  apiClient.delete('/extract/cache');

const extractionService = {
  extractAgent,
  getCachedExtraction,
  listCachedExtractions,
  clearCachedExtraction,
  clearAllCachedExtractions,
};

export default extractionService;
