import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/constants";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

const API_LONG = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
});

// AUTH & TENANT
const addHeaders = (config) => {
  const token = localStorage.getItem("authToken");
  const tenantId = localStorage.getItem("tenantId");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    config.headers["X-Tenant-ID"] = tenantId;
  }
  return config;
};

API.interceptors.request.use(addHeaders, (error) => Promise.reject(error));
API_LONG.interceptors.request.use(addHeaders, (error) =>
  Promise.reject(error)
);

/**
 * Login existing user
 */
export const loginUser = async (payload) => {
  return API.post("/auth/login", payload);
};

/**
 * Signup new user
 */
export const signupUser = async (payload) => {
  return API.post("/auth/signup", payload);
};

// Response interceptor for error handling and retry logic
const setupResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 503 Service Unavailable (backend starting up)
      if (error.response?.status === 503 && !originalRequest._retry) {
        originalRequest._retry = true;
        const retryDelay = parseInt(import.meta.env.VITE_RETRY_DELAY) || 1000;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return instance(originalRequest);
      }

      if (!error.response) {
        console.error(
          "Network error - backend may be unavailable:",
          error.message
        );
        toast.error("Network error: Backend may be unavailable");
      } else {
        const message = error.response.data?.detail || error.message || "An error occurred";
        toast.error(message);
      }

      return Promise.reject(error);
    }
  );
};

setupResponseInterceptor(API);
setupResponseInterceptor(API_LONG);

// EXTRACTION API
export const extractAgent = async (payload) => {
  return API.post("/extract", payload);
};

export const getCachedExtraction = async (agentId) => {
  return API.get(`/extract/cache/${agentId}`);
};

export const listCachedExtractions = async () => {
  return API.get("/extract/cache/list");
};

export const clearCachedExtraction = async (agentId) => {
  return API.delete(`/extract/cache/${agentId}`);
};

export const clearAllCachedExtractions = async () => {
  return API.delete("/extract/cache/clear-all");
};

// GENERATION API
export const flowGeneration = async (payload) => {
  return API_LONG.post("/generate/flow", payload);
};

export const flowGenerationMermaid = async (payload) => {
  return API_LONG.post("/generate/flow_mermaid", payload);
};

export const testGeneration = async (payload) => {
  return API_LONG.post("/generate/test-suite", payload);
};

// SIMULATION API (QUEUE PARTS)
export const runSimulation = async (payload) => {
  // Support both old format (object with all fields) and new format (separate params)
  const requestPayload = payload.test_suite_id ? payload : {
    test_suite_id: payload.testSuiteId,
    phone_number: payload.phoneNumber,
    agent_id: payload.agentId,
    metadata: payload.metadata,
    parallel_execution: payload.parallelExecution,
    max_concurrency: payload.maxConcurrency
  };

  return API.post("/simulation/run", requestPayload);
};

export const getSimulation = async () => {
  return API.get('/simulation/status')
}

export const getSimulationStatus = async (simulationId) => {
  return API.get(`/simulation/status/${simulationId}`);
};

export const getSimulationResult = async (
  simulationId,
  includeAudio = false
) => {
  return API.get(`/simulation/result/${simulationId}`, {
    params: { include_audio: includeAudio },
  });
};

export const getSimulationTranscript = async (simulationId) => {
  return API.get(`/simulation/transcript/${simulationId}`);
};

export const listSimulations = async (status = null, limit = 50) => {
  const params = {};
  if (status) params.status = status;
  if (limit) params.limit = limit;
  return API.get("/simulation/list", { params });
};

export const cancelSimulation = async (simulationId) => {
  return API.delete(`/simulation/cancel/${simulationId}`);
};

export const getQueueStats = async () => {
  return API.get("/simulation/status");
};

// EVALUATION API
export const evaluateTranscript = async (payload) => {
  return API_LONG.post("/evaluate", payload);
};

export const batchEvaluate = async (simulationId) => {
  return API_LONG.post("/evaluate/batch", { simulation_id: simulationId });
};

export const getEvaluationResults = async (simulationId) => {
  return API.get(`/evaluate/simulation/${simulationId}`);
};

/**
 * Batch evaluate all passed sessions from a simulation
 */
export const evaluateBatch = async (simulationId) => {
  return API_LONG.post("/evaluate/batch", { simulation_id: simulationId });
};

/**
 * Get simulation summary with session status
 */
export const getSimulationSummary = async (simulationId) => {
  return API.get(`/simulation/${simulationId}/summary`);
};

// UTILITY FUNCTIONS
export const apiCallWrapper = async (apiCall) => {
  try {
    const response = await apiCall;
    return { data: response.data, error: null };
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";
    return {
      data: null,
      error: { message: errorMessage, status: error.response?.status },
    };
  }
};

/**
 * @deprecated Use useEvents subscription instead
 */
export const pollSimulationStatus = async (
  simulationId,
  onStatusUpdate = null,
  interval = null
) => {
  const pollInterval =
    2000;
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const response = await getSimulationStatus(simulationId);
        const status = response.data;
        if (onStatusUpdate) onStatusUpdate(status);
        if (status.status === "completed") resolve(status);
        else if (status.status === "failed" || status.status === "cancelled")
          reject(new Error(status.error_message));
        else setTimeout(poll, pollInterval);
      } catch (error) {
        reject(error);
      }
    };
    poll();
  });
};

export default API;
