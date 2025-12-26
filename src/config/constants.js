// Simulation statuses
export const SIMULATION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Evaluation metrics
export const EVALUATION_METRICS = {
  ACCURACY: 'accuracy',
  COMPLETENESS: 'completeness',
  RESPONSE_TIME: 'response_time',
  USER_SATISFACTION: 'user_satisfaction',
};

// User roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
};

// Application routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CONNECTION: '/connection',
  WORKSPACE: '/workspace',
  EVALUATION: '/evaluation',
  LOGIN: '/login',
  SIGNUP: '/signup',
  NOT_FOUND: '/404',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/me',
  },
  EXTRACTION: {
    AGENT: '/extract/agent',
    CACHE: '/extract/cache',
  },
  GENERATION: {
    FLOW: '/generate/flow',
    FLOW_MERMAID: '/generate/flow/mermaid',
    TESTS: '/generate/tests',
  },
  SIMULATION: {
    RUN: '/simulate/run',
    STATUS: '/simulate/status',
    RESULT: '/simulate/result',
    TRANSCRIPT: '/simulate/transcript',
    LIST: '/simulate/list',
    CANCEL: '/simulate/cancel',
    QUEUE_STATS: '/simulate/queue-stats',
  },
  EVALUATION: {
    TRANSCRIPT: '/evaluate/transcript',
    RESULTS: '/evaluate/results',
  },
};

// Default values
export const DEFAULTS = {
  PAGINATION: {
    PAGE_SIZE: 10,
    PAGE: 1,
  },
  TIMEOUTS: {
    SHORT: 3000,
    MEDIUM: 10000,
    LONG: 30000,
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER: 'user',
  SETTINGS: 'app_settings',
  RECENT_ITEMS: 'recent_items',
};

export default {
  SIMULATION_STATUS,
  EVALUATION_METRICS,
  ROLES,
  ROUTES,
  API_ENDPOINTS,
  DEFAULTS,
  STORAGE_KEYS,
};
