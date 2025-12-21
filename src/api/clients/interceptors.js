import { API, API_LONG } from './axios.client';

const addAuthHeader = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

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

export const setupInterceptors = () => {
  API.interceptors.request.use(addAuthHeader, (error) => Promise.reject(error));
  API_LONG.interceptors.request.use(addAuthHeader, (error) =>
    Promise.reject(error)
  );

  setupResponseInterceptor(API);
  setupResponseInterceptor(API_LONG);
};
