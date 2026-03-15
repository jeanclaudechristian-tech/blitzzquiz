<template>
  <div class="email-verify-page">
    <div class="background-video">
      <video autoplay loop playsinline muted>
        <source src="/videos/LandingPage.mp4" type="video/mp4" />
      </video>
    </div>

    <div class="espace-verification">
      <div class="content-box">
        <BlackBlitzzQuiz class="logo" />

        <div v-if="status === 'verifying'" class="status-block">
          <div class="loader"></div>
          <h2>Vérification en cours...</h2>
          <p>Nous communiquons avec l'Empereur pour valider votre compte.</p>
        </div>

        <div v-if="status === 'success'" class="status-block success">
          <div class="icon">✅</div>
          <h2>Compte Activé !</h2>
          <p>Votre adresse email a été vérifiée avec succès.</p>
          <p class="redirect-hint">Redirection vers la page de connexion dans {{ countdown }}s...</p>
          <button @click="goToLogin" class="btn-primary">Se connecter maintenant</button>
        </div>

        <div v-if="status === 'error'" class="status-block error">
          <div class="icon">❌</div>
          <h2>Échec de la vérification</h2>
          <p>{{ errorMessage }}</p>
          <button @click="goToLogin" class="btn-secondary">Retour à la connexion</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import BlackBlitzzQuiz from '../components/BlackBlitzzQuiz.vue';

export default {
  name: 'DesktopEmailVerify',
  components: { BlackBlitzzQuiz },
  data() {
    return {
      status: 'verifying', // 'verifying', 'success', 'error'
      errorMessage: 'Le lien est invalide ou a expiré.',
      countdown: 3,
      timer: null
    };
  },
  async mounted() {
    await this.processVerification();
  },
  methods: {
    async processVerification() {
      // 1. 从 URL 参数中提取后端生成的 Signed URL
      const queryURL = this.$route.query.queryURL;

      if (!queryURL) {
        this.status = 'error';
        this.errorMessage = "Aucun lien de vérification n'a été trouvé.";
        return;
      }

      try {
        // 2. 向后端发起验证请求
        // 注意：由于 queryURL 已经是完整的带签名后端地址，直接请求即可
        const response = await axios.get(decodeURIComponent(queryURL));

        if (response.status === 200) {
          this.status = 'success';
          this.startCountdown();
        }
      } catch (error) {
        console.error('Erreur de vérification:', error);
        this.status = 'error';
        // 如果后端返回了具体的错误原因（如签名过期）
        this.errorMessage = error.response?.data?.message || "Le lien est invalide ou a déjà été utilisé.";
      }
    },

    startCountdown() {
      this.timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.goToLogin();
        }
      }, 1000);
    },

    goToLogin() {
      if (this.timer) clearInterval(this.timer);
      this.$router.push('/connexion');
    }
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  }
};
</script>

<style scoped>
/* 这里复用你的基础布局样式 */
.email-verify-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
}

.content-box {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 1;
  max-width: 400px;
}

.status-block h2 {
  margin: 20px 0 10px;
  color: #333;
}

.success h2 { color: #2ecc71; }
.error h2 { color: #e74c3c; }

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.redirect-hint {
  font-size: 0.9em;
  color: #666;
  margin-top: 15px;
}

.btn-primary {
  margin-top: 20px;
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>