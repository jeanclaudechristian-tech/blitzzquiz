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
    return api.put(`/groups/${id}`, payload); // PUT /api/groups/{id}
  },

  destroy(id) {
    return api.delete(`/groups/${id}`); // DELETE /api/groups/{id}
  },

  /**
   * Rejoindre un groupe par code (étudiant).
   * POST /api/groups/join avec { code_invitation }
   * Retourne { id, nom } du groupe si succès.
   */
  joinByCode(code) {
    return api.post("/groups/join", { code_invitation: code });
  },

  /**
   * Liste des quiz assignés au groupe (étudiant membre ou enseignant owner).
   * GET /api/groups/{id}/quizzes
   */
  getQuizzes(groupId) {
    return api.get(`/groups/${groupId}/getQuizzes`);
  },

  /**
   * Associer un quiz à un groupe (enseignant).
   * POST /api/groups/{group}/assignments avec { quiz_id }
   */
  assignQuizToGroup(groupId, quizId) {
    return api.post(`/groups/${groupId}/assignments`, {
      quiz_id: quizId,
    });
  },

  /**
   * Retirer un quiz associé d'un groupe (enseignant).
   * DELETE /api/groups/{group}/assignments/{quiz}
   */
  removeQuizFromGroup(groupId, quizId) {
    return api.delete(`/groups/${groupId}/assignments/${quizId}`);
  },

  /**
   * Classement reel d'un quiz assigne a un groupe.
   * GET /api/groups/{group}/quizzes/{quiz}/ranking
   */
  getQuizRanking(groupId, quizId) {
    return api.get(`/groups/${groupId}/quizzes/${quizId}/ranking`);
  },

  /**
   * Inviter un membre par email (enseignant owner).
   * POST /api/groups/{id}/members/invite avec { email }
   */
  inviteMemberByEmail(groupId, email) {
    return api.post(`/groups/${groupId}/members/invite`, { email });
  },

  removeMember(groupId, memberId) {
    return api.delete(`/groups/${groupId}/members/${memberId}`);
  },

  /**
   * Quitter un groupe (étudiant membre).
   * DELETE /api/groups/{id}/leave
   */
  leave(groupId) {
    return api.delete(`/groups/${groupId}/leave`);
  },
};
