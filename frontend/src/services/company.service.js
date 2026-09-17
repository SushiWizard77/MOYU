import api from "./api";

export const companyService = {
  list: () => api.get("/companies").then((res) => res.data),
  get: (id) => api.get(`/companies/${id}`).then((res) => res.data),
};
