import { API } from '../clients/axios.client';

export const loginUser = async (payload) => {
  return API.post("/auth/login", payload);
};

export const signupUser = async (payload) => {
  return API.post("/auth/signup", payload);
};
