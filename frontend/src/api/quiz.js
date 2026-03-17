import api from "./Axios";

const hasValidToken = () => {
  const token = localStorage.getItem("token");
  return Boolean(token && token !== "null" && token !== "undefined");
};

const isPublicQuiz = (quiz) =>
  quiz.is_public === true || quiz.is_public === 1 || quiz.is_public === "t";

const normalizeCategory = (quiz) =>
  quiz.category && typeof quiz.category === "object"
    ? quiz.category.name || quiz.category.NAME || "General"
    : quiz.category || "General";

const listQuizzes = async () => {
  const response = await api.get("/quizzes");
  return response.data || [];
};

const listPublicQuizzes = async () => {
  const response = await api.get("/quizzes/public");
  return response.data || [];
};

const formatQuizSummary = (quiz) => ({
  id: quiz.id,
  title: quiz.titre,
  category: normalizeCategory(quiz),
  image: quiz.image || "/images/default-quiz.jpg",
});

const formatCatalogueQuiz = (quiz) => ({
  id: quiz.id,
  titre: quiz.titre,
  category: normalizeCategory(quiz),
  image: quiz.image || "/images/default-quiz.jpg",
  education_level: quiz.education_level || "Tous",
});

export const quizService = {
  async list() {
    return listQuizzes();
  },

  async listPublic() {
    return listPublicQuizzes();
  },

  async getSuggestionQuizzes(limit = 8) {
    const isLoggedIn = hasValidToken();

    try {
      const rawData = isLoggedIn ? await listQuizzes() : await listPublicQuizzes();
      const visibleQuizzes = isLoggedIn ? rawData.filter(isPublicQuiz) : rawData;

      return {
        isLoggedIn,
        quizzes: visibleQuizzes.slice(0, limit).map(formatQuizSummary),
      };
    } catch (error) {
      const fallbackData = await listPublicQuizzes();

      return {
        isLoggedIn,
        quizzes: fallbackData.slice(0, limit).map(formatQuizSummary),
      };
    }
  },

  async getCatalogueQuizzes() {
    const data = hasValidToken()
      ? await listQuizzes()
      : await listPublicQuizzes();

    return data.map(formatCatalogueQuiz);
  },

  async search(query, options = {}) {
    const response = await api.get("/quizzes/search", {
      params: { q: query },
      signal: options.signal,
    });

    return response.data || [];
  },
};
