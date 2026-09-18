import axios from "axios";

// On Vercel the frontend + backend are same-origin, so use a relative
// base URL when VITE_API_URL is not set (e.g. "/api/v1").
// Locally it falls back to http://localhost:5000/api/v1.
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("moyuToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: "Unable to connect to the MOYU server. Make sure the backend is running.",
        offline: true,
      });
    }

    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    if (status === 401) {
      localStorage.removeItem("moyuToken");
      localStorage.removeItem("moyuUser");
      return Promise.reject({
        message: serverMessage || "Your session has expired. Please sign in again.",
        status,
        unauthorized: true,
      });
    }

    if (status === 403) {
      return Promise.reject({ message: serverMessage || "You do not have permission to do that.", status });
    }

    if (status === 404) {
      return Promise.reject({ message: serverMessage || "The requested resource was not found.", status });
    }

    if (status === 400 || status === 409) {
      return Promise.reject({ message: serverMessage || "Please check your input and try again.", status });
    }

    return Promise.reject({ message: serverMessage || "Something went wrong. Please try again.", status });
  }
);

export default api;
