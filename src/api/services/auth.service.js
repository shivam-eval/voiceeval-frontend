import { apiClient } from '../clients/axios.client';

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @returns {Promise} API response
 */
export const login = (credentials) =>
  apiClient.post('/auth/login', credentials);

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise} API response
 */
export const register = (userData) =>
  apiClient.post('/auth/register', userData);

/**
 * Get current user profile
 * @returns {Promise} API response
 */
export const getProfile = () =>
  apiClient.get('/auth/me');

const authService = {
  login,
  register,
  getProfile,
};

export default authService;
