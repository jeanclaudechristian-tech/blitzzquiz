<template>
  <div class="bouton-google" @click="loginWithGoogle" :class="{ 'disabled': isLoading }">
    <div class="button-background"></div>
    <div class="button-text">
      <p>{{ isLoading ? 'Connexion en cours...' : 'Se connecter avec Google' }}</p>
    </div>
    <div class="google-icon">
      <img src="../../assets/googleIcon1.svg" alt="Google icon" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BoutonGoogle',
  data() {
    return {
      isLoading: false
    }
  },
  methods: {
    loginWithGoogle() {
      const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirect_uri = `${window.location.origin}/auth/callback`; // 确保是 3000 端口
      const scope = "openid profile email";

      // 构造 Google 官方登录 URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${client_id}&` +
          `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
          `response_type=id_token&` + // 我们要 ID Token，后端好验
          `scope=${encodeURIComponent(scope)}&` +
          `nonce=${Math.random().toString(36).substring(2)}`;

      window.location.href = authUrl;
    }
  }
}
</script>

<style scoped>
@import './BoutonGoogle.css';

.bouton-google {
  cursor: pointer;
  transition: opacity 0.2s;
}

.bouton-google.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
