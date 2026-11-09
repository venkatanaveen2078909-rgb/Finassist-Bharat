/**
 * Centralized API configuration for FinAssist Bharat.
 * In production (Vercel / cloud), defaults to relative root ("") so all API requests
 * route to the same domain without CORS issues, or uses VITE_BACKEND_URL if provided.
 * In development, defaults to local Express backend on http://localhost:5001.
 */
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5001");

export const API_BASE = `${BACKEND_URL}/api`;
