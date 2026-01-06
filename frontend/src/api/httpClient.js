import axios from "axios";

/**
 * Axios client configured to hit the backend through CRA proxy.
 * - In Docker Compose, proxy points to http://backend:5000
 * - Locally, you can change proxy to http://localhost:5000
 */
export const http = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// Attach demo auth token (if present)
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("demo_auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
