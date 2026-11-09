import axios from "axios";
import { API_BASE } from "../config/api.js";

const API = axios.create({
  baseURL: API_BASE,
});

export const getMemory = async () => {
  const response = await API.get("/chat/memory");
  return response.data.memory;
};

export const clearMemory = async () => {
  const response = await API.delete("/chat/memory");
  return response.data;
};
