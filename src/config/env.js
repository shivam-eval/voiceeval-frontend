const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeout: 60000,
    longTimeout: 180000,
  },
  app: {
    name: 'VoiceEval',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  features: {
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  },
  polling: {
    interval: parseInt(process.env.REACT_APP_POLL_INTERVAL) || 2000,
    maxRetries: parseInt(process.env.REACT_APP_MAX_RETRIES) || 5,
    retryDelay: parseInt(process.env.REACT_APP_RETRY_DELAY) || 1000,
  },
};

export default config;
