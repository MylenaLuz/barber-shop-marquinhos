import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

// Anexa o token JWT (se existir) em toda requisição.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Se o token expirar/for inválido, joga o admin de volta pro login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && window.location.pathname.startsWith("/admin")) {
      localStorage.removeItem("mb_token");
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
