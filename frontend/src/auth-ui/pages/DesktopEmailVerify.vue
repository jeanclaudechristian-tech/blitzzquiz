<template>
  <div class="desktop-inscription-page-1">
    <div class="background-video">
      <video autoplay loop playsinline muted>
        <source src="/videos/LandingPage.mp4" type="video/mp4" />
      </video>
    </div>

    <div class="espace-inscription">
      <div class="form-content">
        <BlackBlitzzQuiz class="logo" />

        <div class="verify-status-container">

          <div v-if="status === 'verifying'" class="status-inner">
            <div class="titre"><p>Vérification...</p></div>
            <div class="custom-loader"></div>
          </div>

          <div v-if="status === 'success'" class="status-inner">
            <div class="titre"><p>Compte activé !</p></div>
            <p class="custom-message">Votre courriel est validé. Redirection vers la connexion...</p>
          </div>

          <div v-if="status === 'error'" class="status-inner">
            <div class="titre" style="color: #ff4d4d;"><p>Lien invalide</p></div>
            <p class="custom-message">Le lien a expiré ou a déjà été utilisé.</p>
            <BoutonRetour text="Réessayer" @click="$router.push('/connexion')" />
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BlackBlitzzQuiz from '../components/BlackBlitzzQuiz.vue'
import BoutonRetour from '../components/BoutonRetour.vue'
import { authService } from '../../api/auth'

export default {
  name: 'DesktopEmailVerify',
  components: { BlackBlitzzQuiz, BoutonRetour },
  data() {
    return { status: 'verifying' }
  },
  async mounted() {
    const queryURL = this.$route.query.queryURL;
    if (!queryURL) {
      this.status = 'error';
      return;
    }

    try {
      // 解码并请求后端签名 URL
      await authService.verifyEmail(decodeURIComponent(queryURL));
      this.status = 'success';
      // 3秒后自动跳登录
      setTimeout(() => this.$router.push('/connexion'), 3000);
    } catch (e) {
      this.status = 'error';
    }
  }
}
</script>

<style scoped>
@import './DesktopInscriptionPage1.css';

.verify-status-container {
  width: 100%;
  margin-top: 60px;
}

.status-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.custom-message {
  font-family: 'Inter', sans-serif;
  color: #24201d;
  font-size: 16px;
  line-height: 1.5;
}

.custom-loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f6feff;
  border-top: 4px solid #50caff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>