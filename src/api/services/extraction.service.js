import { API } from '../clients/axios.client';

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
