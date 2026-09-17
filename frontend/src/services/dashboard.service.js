import api from "./api";

export const dashboardService = {
  getDashboard: () => api.get("/dashboard").then((res) => res.data),
};
