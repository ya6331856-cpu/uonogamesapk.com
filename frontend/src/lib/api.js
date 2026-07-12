import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const BACKEND = BACKEND_URL;

const api = axios.create({ baseURL: API });

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("uono_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (expired/invalid token) clear it and send admin back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const path = window.location.pathname;
    // Ignore the login request itself (wrong password shows inline error)
    if (status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem("uono_token");
      if (path.startsWith("/admin") && !path.includes("/admin/login")) {
        window.location.href = "/admin/login?expired=1";
      }
    }
    return Promise.reject(error);
  }
);

// Resolve a stored file url (relative /api/uploads/...) to an absolute URL
export const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
};

export default api;
