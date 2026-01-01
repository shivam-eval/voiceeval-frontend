/**
 * API client for making HTTP requests to the backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

class ApiClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `HTTP error! status: ${response.status}`);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    get(endpoint, params = {}) {
        // Filter out null, undefined, and empty string values
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined && value !== '' && value !== 'undefined' && value !== 'null') {
                // Handle arrays
                if (Array.isArray(value) && value.length > 0) {
                    acc[key] = value;
                } else if (!Array.isArray(value)) {
                    acc[key] = value;
                }
            }
            return acc;
        }, {});

        const queryString = new URLSearchParams(cleanParams).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
}

export const apiClient = new ApiClient();

// Agent API endpoints
export const agentsApi = {
    list: (params) => apiClient.get('/api/v1/agents', params),
    get: (id) => apiClient.get(`/api/v1/agents/${id}`),
    create: (data) => apiClient.post('/api/v1/agents', data),
    update: (id, data) => apiClient.put(`/api/v1/agents/${id}`, data),
    delete: (id) => apiClient.delete(`/api/v1/agents/${id}`),
    test: (id) => apiClient.post(`/api/v1/agents/${id}/test`, {}),
    clone: (id) => apiClient.post(`/api/v1/agents/${id}/clone`, {}),
};

// Test Suite API endpoints
export const testSuitesApi = {
    list: (params) => apiClient.get('/api/v1/test-suites', params),
    get: (id) => apiClient.get(`/api/v1/test-suites/${id}`),
    create: (data) => apiClient.post('/api/v1/test-suites', data),
    update: (id, data) => apiClient.put(`/api/v1/test-suites/${id}`, data),
    delete: (id) => apiClient.delete(`/api/v1/test-suites/${id}`),
    clone: (id) => apiClient.post(`/api/v1/test-suites/${id}/clone`, {}),
    addTestCase: (suiteId, testCase) => apiClient.post(`/api/v1/test-suites/${suiteId}/test-cases`, { test_case: testCase }),
};

// Persona API endpoints
export const personasApi = {
    list: (params) => apiClient.get('/api/v1/personas', params),
    get: (id) => apiClient.get(`/api/v1/personas/${id}`),
    create: (data) => apiClient.post('/api/v1/personas', data),
    update: (id, data) => apiClient.put(`/api/v1/personas/${id}`, data),
    delete: (id) => apiClient.delete(`/api/v1/personas/${id}`),
};

// Test Profile API endpoints
export const testProfilesApi = {
    list: (params) => apiClient.get('/api/v1/test-profiles', params),
    get: (id) => apiClient.get(`/api/v1/test-profiles/${id}`),
    create: (data) => apiClient.post('/api/v1/test-profiles', data),
    update: (id, data) => apiClient.put(`/api/v1/test-profiles/${id}`, data),
    delete: (id) => apiClient.delete(`/api/v1/test-profiles/${id}`),
};

// Personas Library API (from JSON files)
export const personasLibraryApi = {
    list: (params) => apiClient.get('/api/v1/personas/library', params),
    get: (personaId) => apiClient.get(`/api/v1/personas/library/${personaId}`),
};

// Generation API endpoints
export const generationApi = {
    generateFlow: (data) => apiClient.post('/api/v1/generate/flow', data),
    generateTestSuite: (data) => apiClient.post('/api/v1/generate/test-suite', data),
    generateFromAudio: (data) => apiClient.post('/api/v1/generate/audio', data),
    generateMermaid: (data) => apiClient.post('/api/v1/generate/flow_mermaid', data),
};

export default apiClient;
