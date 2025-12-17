import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

// Extract agent config
export const extractAgent = async (payload) => {
  return API.post("/extract", payload);
};

// Flow generation
export const flowGeneration=async(payload)=>{
  return API.post("/generate/flow", payload);
}

export const flowGenerationMermaid = async (payload) => {
  return API.post("/generate/flow_mermaid", payload);
};

export const testGeneration = async (payload) => {
  return API.post("/generate/test-suite", payload);
};

export const runSimulation = async(payload)=>{
  return API.post("/simulation/start",payload);
}


export default API;
