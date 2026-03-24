import api from "./Axios";

export const categoryService = {
  async list() {
    const response = await api.get("/categories");
    return Array.isArray(response.data) ? response.data : [];
  },
};
