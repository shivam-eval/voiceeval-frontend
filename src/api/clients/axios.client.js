import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/constants";

// Create standard API client with default timeout
const createApiClient = (timeout = 60000) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout,
  });

  // Add auth token and tenant ID to requests
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken");
      const tokenExpiration = localStorage.getItem("tokenExpiration");
      const rawTenantId = localStorage.getItem("tenantId");

      // Normalize tenant ID - use 'default' if not set or invalid
      let tenantId = rawTenantId?.trim();
      if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
        tenantId = 'default';
      }

      // Check if token has expired
      if (token && tokenExpiration) {
        const now = Date.now();
        const expiration = parseInt(tokenExpiration, 10);

        if (now >= expiration) {
          // Token has expired, clear auth data and redirect
          localStorage.removeItem("authToken");
          localStorage.removeItem("tokenExpiration");
          localStorage.removeItem("tenantId");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userName");

          toast.error("Your session has expired. Please login again.");
          window.location.href = "/";
          return Promise.reject(new Error("Token expired"));
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Always send tenant ID header (default to 'default')
      config.headers["X-Tenant-ID"] = tenantId;

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to extract data and handle errors
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      // Handle session expiration
      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenExpiration");
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth')) {
          toast.error("Session expired. Please login again.");
          window.location.href = "/";
        }
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (error.response?.status === 404) {
        // Don't show toast for 404, let the component handle it
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (error.response?.status >= 400 && error.response?.status < 500) {
        // Show backend error message for client errors (4xx)
        // const message = error.response?.data?.detail || error.response?.data?.message || "An error occurred.";
        // toast.error(message);
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please check your connection and try again.");
      } else if (!error.response) {
        // toast.error("Network error. Please check your internet connection.");
      }
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
