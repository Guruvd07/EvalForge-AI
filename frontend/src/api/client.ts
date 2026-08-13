import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    const cleanToken = token
      .replace(/^"|"$/g, "")
      .replace(/^Bearer\s+/i, "")
      .trim();

    config.headers.Authorization = `Bearer ${cleanToken}`;
  }

  return config;
});

export default apiClient;