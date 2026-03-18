import api from "./Axios";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const DEFAULT_QUIZ_IMAGE = "/images/Black_BlitzzQuiz 2.svg";

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

export const resolveQuizImage = (quiz) => {
  const rawImage = quiz?.image || quiz?.image_url || quiz?.thumbnail || null;
  if (rawImage) {
    if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
      return rawImage;
    }

    if (rawImage.startsWith("/images/")) {
      return rawImage;
    }

    if (rawImage.startsWith("/")) {
      return API_ORIGIN ? `${API_ORIGIN}${rawImage}` : rawImage;
    }

    return API_ORIGIN ? `${API_ORIGIN}/storage/${rawImage}` : `/storage/${rawImage}`;
  }

  if (quiz?.image_path) {
    if (quiz.image_path.startsWith("http://") || quiz.image_path.startsWith("https://")) {
      return quiz.image_path;
    }

    return API_ORIGIN
      ? `${API_ORIGIN}/storage/${quiz.image_path}`
      : `/storage/${quiz.image_path}`;
  }

  return DEFAULT_QUIZ_IMAGE;
};

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
  image: resolveQuizImage(quiz),
});

const formatCatalogueQuiz = (quiz) => ({
  id: quiz.id,
  titre: quiz.titre,
  category: normalizeCategory(quiz),
  image: resolveQuizImage(quiz),
  education_level: quiz.education_level || "Tous",
});

export const quizService = {
  async list() {
    return listQuizzes();
  },

  async listPublic() {
    return listPublicQuizzes();
  },

  async uploadImage(quizId, file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post(`/quizzes/${quizId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  async removeImage(quizId) {
    const response = await api.delete(`/quizzes/${quizId}/image`);
    return response.data;
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
