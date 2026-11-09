import axios from "axios";
import { API_BASE } from "../config/api.js";

const API = axios.create({
  baseURL: API_BASE,
});

export const sendMessage = async (message) => {
  const response = await API.post("/chat", {
    message,
  });

  return response.data;
};
