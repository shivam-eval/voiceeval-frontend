import { API_LONG } from '../clients/axios.client';

export const flowGeneration = async (payload) => {
  return API_LONG.post("/generate/flow", payload);
};

export const flowGenerationMermaid = async (payload) => {
  return API_LONG.post("/generate/flow_mermaid", payload);
};

export const testGeneration = async (payload) => {
  return API_LONG.post("/generate/test-suite", payload);
};
