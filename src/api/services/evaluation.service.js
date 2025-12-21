import { API, API_LONG } from '../clients/axios.client';

export const evaluateTranscript = async (payload) => {
  return API_LONG.post("/evaluate", payload);
};

export const getEvaluationResults = async (simulationId) => {
  return API.get(`/evaluate/results/${simulationId}`);
};
