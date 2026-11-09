import axios from "axios";

const API_URL = "http://localhost:5001/api/chat";

export const sendMessage = async (message, sessionId) => {
  try {
    const sid = sessionId || localStorage.getItem("finassist_session_id") || "default";
    const response = await axios.post(API_URL, {
      message,
      sessionId: sid,
    });

    return response.data;
  } catch (error) {
    console.error("Chat API Error:", error);
    throw error;
  }
};

export const getChatMemory = async (sessionId) => {
  try {
    const sid = sessionId || localStorage.getItem("finassist_session_id") || "default";
    const response = await axios.get(`${API_URL}/memory?sessionId=${encodeURIComponent(sid)}`);
    return response.data;
  } catch (error) {
    console.error("Get Memory Error:", error);
    return { success: false, memory: null };
  }
};

export const resetChatMemory = async (sessionId) => {
  try {
    const sid = sessionId || localStorage.getItem("finassist_session_id") || "default";
    const response = await axios.delete(`${API_URL}/memory?sessionId=${encodeURIComponent(sid)}`);
    return response.data;
  } catch (error) {
    console.error("Reset Memory Error:", error);
    return { success: false };
  }
};
