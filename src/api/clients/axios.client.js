import axios from "axios";
import { toast } from "react-toastify";

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

  // Add response interceptor to extract data
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      // Handle session expiration
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      // Extract error message
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";

      // Show toast notification
      toast.error(errorMessage);

      return Promise.reject(error);
    }
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
