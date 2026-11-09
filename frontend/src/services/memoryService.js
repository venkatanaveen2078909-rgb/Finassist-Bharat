import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

export const getMemory = async () => {
  const response = await API.get("/chat/memory");
  return response.data.memory;
};

export const clearMemory = async () => {
  const response = await API.delete("/chat/memory");
  return response.data;
};