import api from "./Axios";

export const groupService = {
  list() {
    return api.get("/groups"); // GET /api/groups
  },

  create(payload) {
    return api.post("/groups", payload); // POST /api/groups
  },

  show(id) {
    return api.get(`/groups/${id}`); // GET /api/groups/{id}
  },

  update(id, payload) {
    return api.patch(`/groups/${id}`, payload); // PATCH /api/groups/{id}
  },

  destroy(id) {
    return api.delete(`/groups/${id}/destroy`); // DELETE /api/groups/{id}
  },
};
