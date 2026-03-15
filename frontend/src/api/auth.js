import api from "./Axios";

export const authService = {
  async login(email, password) {
    const response = await api.post("/login", { email, password });
    return response.data;
  },

  async register(email, username, password, password_confirmation, role, educationLevel) {
    console.log("register payload", {
      email,
      username,
      password,
      password_confirmation,
      role,
      education_level: educationLevel,
    });

    const response = await api.post("/register", {
      email,
      username,
      nickname: username,
      password,
      password_confirmation,
      role,     
      education_level: educationLevel,
    });
    return response.data;
  },

  // --- AJOUTS GOOGLE ---

  // 1. Vérifie si le user Google existe (Appelé par AuthCallback)
  async checkGoogleUser(email) {
    const response = await api.post("/auth/check-google", { email });
    return response.data;
  },

  // 2. Finalise l'inscription Google (Appelé par Page 2)
  async registerGoogleFinal(data) {
    // data contient: email, username, google_id, avatar, role, niveau
    const response = await api.post("/auth/google-register", data);
    return response.data;
  },
  
  // ---------------------

  async logout() {
    const response = await api.post("/logout");
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get("/user");
    return response.data;
  },

  async forgotPassword(email) {
    // 这里的路径要对应 api.php 里的 Route::post('/forgot-password', ...)
    const response = await api.post("/forgot-password", { email });
    return response.data;
  },

  // 顺便修正一下之前的 resetPassword 路径，确保与 api.php 对齐
  async resetPassword(data) {
    // 你的 api.php 定义的是 /reset-password
    const response = await api.post("/reset-password", data);
    return response.data;
  },

  async verifyEmail(verifyUrl) {
    // 关键：使用 decodeURIComponent 确保 URL 里的签名哈希不被二次编码破坏
    // 即使 verifyUrl 是完整的绝对路径（https://...），Axios 也会优先处理它而忽略 baseURL
    const response = await api.get(decodeURIComponent(verifyUrl));
    return response.data;
  },

};
