import { apiClient } from '../../utils/api';

export const paramsApi = {
  list: (agentId, params) => apiClient.get(`/agents/${agentId}/params`, params),
  create: (agentId, data) => apiClient.post(`/agents/${agentId}/params`, data),
  update: (agentId, paramId, data) => apiClient.put(`/agents/${agentId}/params/${paramId}`, data),
  delete: (agentId, paramId) => apiClient.delete(`/agents/${agentId}/params/${paramId}`),
  generateScenario: (agentId, data) => apiClient.post(`/agents/${agentId}/generate-scenario`, data),
};

export default paramsApi;
