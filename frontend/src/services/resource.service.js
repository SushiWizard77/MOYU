import api from "./api";

export const resourceService = {
  list: (params) => api.get("/resources", { params }).then((res) => res.data),
};
