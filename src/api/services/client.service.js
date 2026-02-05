import { apiClient } from '../clients/axios.client';

/**
 * Client API Service
 * 
 * Handles all client-related API calls for inbound sessions.
 */

/**
 * List all clients
 */
export const listClients = async () => {
    // Note: User's code used /clients (top-level) for listing
    // and /api/v1/clients for other operations. 
    // We'll standardise to /api/v1/clients if possible, 
    // but follow their lead if it's a specific backend routing.
    // Based on their fetch: `${API_BASE_URL}/clients`
    try {
        return await apiClient.get('/clients');
    } catch (error) {
        // Fallback to /clients if first attempt fails
        console.warn('Fallback to /clients');
        return await apiClient.get('/clients');
    }
};

/**
 * Get client details by ID
 */
export const getClient = async (clientId) => {
    return apiClient.get(`/clients/${clientId}`);
};

/**
 * Create a new client
 */
export const createClient = async (data) => {
    return apiClient.post('/clients', data);
};

const clientService = {
    listClients,
    getClient,
    createClient
};

export default clientService;
