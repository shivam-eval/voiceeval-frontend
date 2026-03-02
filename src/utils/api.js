import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/constants";

class ApiClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Don't set Content-Type if we're sending FormData
        const headers = { ...options.headers };
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        // Add auth token — backend extracts tenant_id directly from the JWT
        const token = localStorage.getItem("authToken");
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized - token expired or invalid
            if (response.status === 401) {
                // Clear auth data
                localStorage.removeItem("authToken");
                localStorage.removeItem("tokenExpiration");
                localStorage.removeItem("tenantId");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userName");

                // Redirect to auth screen (will trigger App.jsx to show AuthScreen)
                window.location.href = '/';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.detail || `HTTP error! status: ${response.status}`;
                // toast.error(message);
                throw new Error(message);
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
    list: (params) => apiClient.get('/agents', params),
    get: (id) => apiClient.get(`/agents/${id}`),
    create: (data) => apiClient.post('/agents', data),
    update: (id, data) => apiClient.put(`/agents/${id}`, data),
    delete: (id) => apiClient.delete(`/agents/${id}`),
    test: (id) => apiClient.post(`/agents/${id}/test`, {}),
    clone: (id) => apiClient.post(`/agents/${id}/clone`, {}),
    reExtract: (data) => apiClient.post('/extract/re-extract', data),
    listBolnaAgents: (data) => apiClient.post('/agents/bolna/list-agents', data),
    bulkDelete: (agentIds) => apiClient.post('/agents/bulk-delete', { agent_ids: agentIds }),
};


// Test Suite API endpoints
export const testSuitesApi = {
    list: (params) => apiClient.get('/test-suites', params),
    get: (id) => apiClient.get(`/test-suites/${id}`),
    create: (data) => apiClient.post('/test-suites', data),
    update: (id, data) => apiClient.put(`/test-suites/${id}`, data),
    delete: (id) => apiClient.delete(`/test-suites/${id}`),
    clone: (id) => apiClient.post(`/test-suites/${id}/clone`, {}),
    addTestCase: (suiteId, testCase) => apiClient.post(`/test-suites/${suiteId}/test-cases`, { test_case: testCase, order: 0 }),

    // New endpoints
    export: (id, format = 'json') => apiClient.get(`/test-suites/${id}/export`, { format }),
    import: (fileContent, name, agentId) => apiClient.post('/test-suites/import', { file_content: fileContent, name, agent_id: agentId }),
    bulkUpdateTestCases: (suiteId, testCaseIds, updates) => apiClient.put(`/test-suites/${suiteId}/test-cases/bulk`, { test_case_ids: testCaseIds, updates }),
    getStatistics: (id) => apiClient.get(`/test-suites/${id}/statistics`),
    getSimulationSummary: (id) => apiClient.get(`/test-suites/${id}/simulation-summary`),
};

// Scenario Configs API endpoints
export const scenarioConfigsApi = {
    // List all scenario configs for a given agent
    listByAgent: (agentId, params = {}) => apiClient.get(`/scenario-configs/agent/${agentId}`, params),
    get: (id) => apiClient.get(`/scenario-configs/${id}`),
    // Generate scenario configs (server-side generation)
    // Always force count = 1 for now regardless of caller input
    generate: (data) => apiClient.post('/scenario-configs/generate', {
        ...data,
        count: 1,
    }),
    createManual: (data) => apiClient.post('/scenario-configs/create-manual', data),
};

// Test Cases (v2) API endpoints
export const testCasesApi = {
    listByAgent: (agentId) => apiClient.get(`/test-cases/agent/${agentId}`),
};

// Outbound simulation API
export const outboundSimApi = {
    run: (data) => apiClient.post('/simulation/outbound', data),
};

// Persona API endpoints
export const personasApi = {
    list: (params) => apiClient.get('/personas', params),
    get: (id) => apiClient.get(`/personas/${id}`),
    create: (data) => apiClient.post('/personas', data),
    update: (id, data) => apiClient.put(`/personas/${id}`, data),
    delete: (id) => apiClient.delete(`/personas/${id}`),
};

// Personas Library API (from JSON files)
export const personasLibraryApi = {
    list: (params) => apiClient.get('/personas/library', params),
    get: (id) => apiClient.get(`/personas/library/${id}`),
};

// Noise Profiles API endpoints
export const noiseProfilesApi = {
    list: (params) => apiClient.get('/noise-profiles', params),
    get: (id) => apiClient.get(`/noise-profiles/${id}`),
};

// Test Profile API endpoints
export const testProfilesApi = {
    list: (params) => apiClient.get('/test-profiles', params),
    get: (id) => apiClient.get(`/test-profiles/${id}`),
    create: (data) => apiClient.post('/test-profiles', data),
    update: (id, data) => apiClient.put(`/test-profiles/${id}`, data),
    delete: (id) => apiClient.delete(`/test-profiles/${id}`),
};

// Generation API endpoints
export const generationApi = {
    generateFlow: (data) => apiClient.post('/generate/flow', data),
    generateTestSuite: (data) => apiClient.post('/generate/test-suite', data),
    generateFromAudio: (data) => apiClient.post('/generate/audio', data),
    generateMermaid: (data) => apiClient.post('/generate/flow_mermaid', data),
};

// Flow API endpoints
export const flowsApi = {
    list: (params) => apiClient.get('/flows', params),
    get: (id) => apiClient.get(`/flows/${id}`),
    listByAgent: (agentId) => apiClient.get(`/flows/agent/${agentId}`),
    getMermaid: (id) => apiClient.get(`/flows/${id}/mermaid`),
    delete: (id) => apiClient.delete(`/flows/${id}`),
};

// Evaluations API endpoints
export const evaluationsApi = {
    list: (params) => apiClient.get('/evaluate', params),
    get: (id) => apiClient.get(`/evaluate/${id}`),
    getBySession: (sessionId) => apiClient.get('/evaluate/session', { sessionId }),
    getBySimulation: (simulationId) => apiClient.get('/evaluate/simulation', { simulationId }),
};

// Calls API endpoints
export const callsApi = {
    list: (params) => apiClient.get('/calls/', params),
    get: (id) => apiClient.get(`/calls/${id}`),
    delete: (id) => {
        console.log('🗑️ API: Deleting call with ID:', id);
        console.log('🗑️ API: DELETE URL:', `/calls/${id}`);
        return apiClient.delete(`/calls/${id}`);
    },
    evaluate: (id) => apiClient.post(`/calls/${id}/evaluate`, {}),
    evaluateAudio: (data) => apiClient.post('/evaluation/audio', data),
    upload: (formData, agentId) => {
        // Use /calls/bulk-upload endpoint with agent_id in form data
        return apiClient.request('/calls/bulk-upload', {
            method: 'POST',
            body: formData,
        });
    },
    categories: () => apiClient.get('/calls/categories'),
    fetchBolnaCalls: (data) => apiClient.post('/calls/bolna/fetch-calls', data),
    importBolnaCalls: (data) => apiClient.post('/calls/bolna/import-calls', data),
    getTrace: (id) => apiClient.get(`/calls/${id}/trace`),
    getIssues: (id) => apiClient.get(`/calls/${id}/issues`),
};

// V2 Folders API endpoints
export const v2FoldersApi = {
    listByAgent: (agentId) => apiClient.get(`/v2-folders/agent/${agentId}`),
};

// V2 Calls API endpoints
export const v2CallsApi = {
    listByFolder: (folderId) => apiClient.get(`/v2-calls/folder/${folderId}`),
    get: (callId) => apiClient.get(`/v2-calls/${callId}`),
};

// V2 Evaluations API endpoints
export const v2EvalsApi = {
    listByFolder: (folderId) => apiClient.get(`/v2-evals/folder/${folderId}`),
    get: (evalId) => apiClient.get(`/v2-evals/${evalId}`),
    getByCall: (callId) => apiClient.get(`/v2-evals/call/${callId}`),
};

export default apiClient;
