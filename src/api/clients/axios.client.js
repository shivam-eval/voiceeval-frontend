import axios from "axios";

// Ideally move this to constants/env
const API_BASE_URL = "http://localhost:8000/api/v1";

export const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const API_LONG = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
});
