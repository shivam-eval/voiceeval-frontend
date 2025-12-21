import { API } from '../clients/axios.client';

export const runSimulation = async (payload) => {
  return API.post("/simulation/start", payload);
};

export const getSimulationStatus = async (simulationId) => {
  return API.get(`/simulation/status/${simulationId}`);
};

export const getSimulationResult = async (
  simulationId,
  includeAudio = false
) => {
  return API.get(`/simulation/result/${simulationId}`, {
    params: { include_audio: includeAudio },
  });
};

export const getSimulationTranscript = async (simulationId) => {
  return API.get(`/simulation/transcript/${simulationId}`);
};

export const listSimulations = async (status = null, limit = 50) => {
  const params = {};
  if (status) params.status = status;
  if (limit) params.limit = limit;
  return API.get("/simulation/list", { params });
};

export const cancelSimulation = async (simulationId) => {
  return API.delete(`/simulation/cancel/${simulationId}`);
};

export const getQueueStats = async () => {
  return API.get("/simulation/queue/stats");
};

export const pollSimulationStatus = async (
  simulationId,
  onStatusUpdate = null,
  interval = null
) => {
  const pollInterval =
    interval || parseInt(import.meta.env.VITE_POLL_INTERVAL) || 2000;
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const response = await getSimulationStatus(simulationId);
        const status = response.data;
        if (onStatusUpdate) onStatusUpdate(status);
        if (status.status === "completed") resolve(status);
        else if (status.status === "failed" || status.status === "cancelled")
          reject(new Error(status.error_message));
        else setTimeout(poll, pollInterval);
      } catch (error) {
        reject(error);
      }
    };
    poll();
  });
};
