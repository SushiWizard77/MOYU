import api from "./api";

export const resumeService = {
  get: () => api.get("/resume").then((res) => res.data),
  update: (updates) => api.patch("/resume", updates).then((res) => res.data),
  atsCheck: () => api.get("/resume/ats-check").then((res) => res.data),
  download: async (format = "pdf") => {
    const res = await api.get("/resume/download", {
      params: { format },
      responseType: "blob",
    });
    return { blob: res.data, disposition: res.headers["content-disposition"] || "" };
  },
};
