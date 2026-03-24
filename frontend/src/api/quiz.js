import api from "./Axios";

const RAW_API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_ORIGIN = RAW_API_URL.endsWith("/api")
  ? RAW_API_URL.slice(0, -4)
  : RAW_API_URL;

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

const resolveAssetUrl = (value) => {
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    // If backend returns /storage URL with a wrong host/port, re-anchor to API origin.
    try {
      const parsed = new URL(value);
      if (API_ORIGIN && parsed.pathname.startsWith("/storage/")) {
        return `${API_ORIGIN}${parsed.pathname}`;
      }
    } catch (_error) {
      return value;
    }
    return value;
  }

  if (value.startsWith("/images/")) {
    return value;
  }

  if (value.startsWith("/storage/")) {
    return API_ORIGIN ? `${API_ORIGIN}${value}` : value;
  }

  if (value.startsWith("storage/")) {
    return API_ORIGIN ? `${API_ORIGIN}/${value}` : `/${value}`;
  }

  if (value.startsWith("/")) {
    return API_ORIGIN ? `${API_ORIGIN}${value}` : value;
  }

  return API_ORIGIN ? `${API_ORIGIN}/storage/${value}` : `/storage/${value}`;
};

export const resolveQuizImage = (quiz) => {
  const rawImage = quiz?.image || quiz?.image_url || quiz?.thumbnail || null;
  if (rawImage) {
    return resolveAssetUrl(rawImage) || null;
  }

  if (quiz?.image_path) {
    return resolveAssetUrl(quiz.image_path) || null;
  }

  return null;
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
  async create(payload) {
    const response = await api.post("/quizzes", payload);
    return response.data;
  },

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

  async setImageUrl(quizId, imageUrl) {
    const response = await api.post(`/quizzes/${quizId}/image-url`, {
      image_url: imageUrl,
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
