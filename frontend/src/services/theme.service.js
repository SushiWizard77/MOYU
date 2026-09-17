import api from "./api";

export const themeService = {
  getTheme: () => api.get("/theme").then((res) => res.data),
  setTheme: (theme) => api.patch("/theme", { theme }).then((res) => res.data),
};