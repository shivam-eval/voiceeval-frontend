import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

const API_LONG = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
});

// AUTH
const addAuthHeader = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

API.interceptors.request.use(addAuthHeader, (error) => Promise.reject(error));
API_LONG.interceptors.request.use(addAuthHeader, (error) =>
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
  return API.post("/simulation/start", payload);
};

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
  return API.get("/simulation/queue/stats");
};

// EVALUATION API
export const evaluateTranscript = async (payload) => {
  return API_LONG.post("/evaluate", payload);
};

export const getEvaluationResults = async (simulationId) => {
  return API.get(`/evaluate/results/${simulationId}`);
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

export const pollSimulationStatus = async (
  simulationId,
  onStatusUpdate = null,
  interval = null
) => {
  const pollInterval =
    interval || parseInt(import.meta.env.VITE_POLL_INTERVAL) || 2000;
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
