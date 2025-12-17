import axios from "axios";

// Configure API base URL from environment variables
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1",
  timeout: 60000, // 30 seconds default
});

// Create a separate instance for long-running operations (LLM-based)
const API_LONG = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1",
  timeout: 180000, // 3 minutes for LLM operations
});

// Request interceptor for adding auth tokens or logging
API.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed in the future
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Apply same interceptors to long-running API instance
API_LONG.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retry logic
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 503 Service Unavailable (backend starting up)
    if (error.response?.status === 503 && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryDelay = parseInt(import.meta.env.VITE_RETRY_DELAY) || 1000;
      
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return API(originalRequest);
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error - backend may be unavailable:", error.message);
    }

    return Promise.reject(error);
  }
);

// Apply same response interceptor to long-running API instance
API_LONG.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 503 && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryDelay = parseInt(import.meta.env.VITE_RETRY_DELAY) || 1000;
      
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return API_LONG(originalRequest);
    }

    if (!error.response) {
      console.error("Network error - backend may be unavailable:", error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// EXTRACTION API
// ============================================================================

/**
 * Extract agent configuration from platform (Vapi, Bolna, LiveKit)
 * @param {Object} payload - { platform, agent_id, api_key, use_cache }
 */
export const extractAgent = async (payload) => {
  return API.post("/extract", payload);
};

/**
 * Get cached extraction by agent_id
 * @param {string} agentId - The agent identifier
 */
export const getCachedExtraction = async (agentId) => {
  return API.get(`/extract/cache/${agentId}`);
};

/**
 * List all cached extractions
 */
export const listCachedExtractions = async () => {
  return API.get("/extract/cache/list");
};

/**
 * Clear specific cached extraction
 * @param {string} agentId - The agent identifier
 */
export const clearCachedExtraction = async (agentId) => {
  return API.delete(`/extract/cache/${agentId}`);
};

/**
 * Clear all cached extractions
 */
export const clearAllCachedExtractions = async () => {
  return API.delete("/extract/cache/clear-all");
};

// ============================================================================
// GENERATION API
// ============================================================================

/**
 * Generate conversation flow tree from extracted config
 * @param {Object} payload - { extracted_config, model, provider }
 */
export const flowGeneration = async (payload) => {
  return API_LONG.post("/generate/flow", payload);
};

/**
 * Generate Mermaid diagram from flow tree
 * @param {Object} payload - { flow_tree, direction, provider }
 */
export const flowGenerationMermaid = async (payload) => {
  return API_LONG.post("/generate/flow_mermaid", payload);
};

/**
 * Generate test suite with personas from flow tree
 * @param {Object} payload - { flow_tree, call_type, max_paths, include_edge_cases, region }
 */
export const testGeneration = async (payload) => {
  return API_LONG.post("/generate/test-suite", payload);
};

// ============================================================================
// SIMULATION API
// ============================================================================

/**
 * Start a new simulation
 * @param {Object} payload - { test_suite_path, agent_phone_number, platform, priority, config_overrides }
 */
export const runSimulation = async (payload) => {
  return API.post("/simulation/start", payload);
};

/**
 * Get simulation status by ID
 * @param {string} simulationId - The simulation identifier
 */
export const getSimulationStatus = async (simulationId) => {
  return API.get(`/simulation/status/${simulationId}`);
};

/**
 * Get full simulation result by ID
 * @param {string} simulationId - The simulation identifier
 * @param {boolean} includeAudio - Whether to include audio data (default: false)
 */
export const getSimulationResult = async (simulationId, includeAudio = false) => {
  return API.get(`/simulation/result/${simulationId}`, {
    params: { include_audio: includeAudio },
  });
};

/**
 * Get evaluation-ready transcript for a simulation
 * @param {string} simulationId - The simulation identifier
 */
export const getSimulationTranscript = async (simulationId) => {
  return API.get(`/simulation/transcript/${simulationId}`);
};

/**
 * List all simulations with optional filters
 * @param {string} status - Filter by status: "queued", "running", "completed", "failed"
 * @param {number} limit - Maximum number of results to return
 */
export const listSimulations = async (status = null, limit = 50) => {
  const params = {};
  if (status) params.status = status;
  if (limit) params.limit = limit;
  
  return API.get("/simulation/list", { params });
};

/**
 * Cancel a simulation by ID
 * @param {string} simulationId - The simulation identifier
 */
export const cancelSimulation = async (simulationId) => {
  return API.delete(`/simulation/cancel/${simulationId}`);
};

/**
 * Get queue statistics
 */
export const getQueueStats = async () => {
  return API.get("/simulation/queue/stats");
};

// ============================================================================
// EVALUATION API
// ============================================================================

/**
 * Evaluate simulation results
 * @param {Object} payload - { simulation_id, transcript_steps, test_case, flow_tree, persona, config_overrides }
 */
export const evaluateSimulation = async (payload) => {
  return API_LONG.post("/evaluate", payload);
};

/**
 * Get evaluation results by simulation ID
 * @param {string} simulationId - The simulation identifier
 */
export const getEvaluationResults = async (simulationId) => {
  return API.get(`/evaluate/results/${simulationId}`);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Unified API call wrapper with error handling
 * @param {Promise} apiCall - The API promise to execute
 * @returns {Object} { data, error }
 */
export const apiCallWrapper = async (apiCall) => {
  try {
    const response = await apiCall;
    return { data: response.data, error: null };
  } catch (error) {
    const errorMessage = 
      error.response?.data?.detail || 
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    
    return {
      data: null,
      error: {
        message: errorMessage,
        status: error.response?.status,
        details: error.response?.data,
      },
    };
  }
};

/**
 * Poll simulation status until completion
 * @param {string} simulationId - The simulation identifier
 * @param {Function} onStatusUpdate - Callback for status updates
 * @param {number} interval - Poll interval in milliseconds
 * @returns {Promise} Resolves when simulation completes or fails
 */
export const pollSimulationStatus = async (
  simulationId,
  onStatusUpdate = null,
  interval = null
) => {
  const pollInterval = interval || parseInt(import.meta.env.VITE_POLL_INTERVAL) || 2000;
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const response = await getSimulationStatus(simulationId);
        const status = response.data;
        
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }
        
        if (status.status === "completed") {
          resolve(status);
        } else if (status.status === "failed" || status.status === "cancelled") {
          reject(new Error(status.error_message || `Simulation ${status.status}`));
        } else {
          // Continue polling
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    poll();
  });
};

export default API;

