import { apiClient } from '../../utils/api';

export const paramsApi = {
  list: (agentId) => apiClient.get('/params', { agent_id: agentId }),
  create: (agentId, data) => apiClient.post('/params', { ...data, agent_id: agentId }),
  update: (agentId, paramId, data) => apiClient.put(`/params/${paramId}`, data),
  delete: (agentId, paramId) => apiClient.delete(`/params/${paramId}`),
};

export default paramsApi;
