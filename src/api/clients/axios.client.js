import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1";

// Create standard API client with default timeout
const createApiClient = (timeout = 60000) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout,
  });

  // Add auth token to requests
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};

export const apiClient = createApiClient();
export const longRunningApiClient = createApiClient(180000); // 3 minute timeout for long-running requests

export default {
  apiClient,
  longRunningApiClient,
  API_BASE_URL,
};
