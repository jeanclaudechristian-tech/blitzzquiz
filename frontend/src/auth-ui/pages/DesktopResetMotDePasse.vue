<template>
  <div class="desktop-reset-mot-de-passe">
    <div class="background-video">
      <video autoplay loop playsinline muted>
        <source src="/videos/LandingPage.mp4" type="video/mp4" />
      </video>
    </div>

    <div class="espace-reset-password">
      <div class="form-content">
        <BlackBlitzzQuiz class="logo" />

        <div class="titre">
          <p>Nouveau</p>
          <p>mot de passe</p>
        </div>

        <InputMotDePasse
            v-model="newPassword"
            placeholder="Nouveau mot de passe"
        />

        <InputConfirmerMotDePasse
            v-model="confirmPassword"
            placeholder="Confirmer le mot de passe"
        />

        <BoutonConfirmer
            :disabled="loading"
            @click="goToSucces"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { authService } from '@/api/auth'
import BlackBlitzzQuiz from '../components/BlackBlitzzQuiz.vue'
import InputMotDePasse from '../components/InputMotDePasse.vue'
import InputConfirmerMotDePasse from '../components/InputConfirmerMotDePasse.vue'
import BoutonConfirmer from '../components/BoutonConfirmer.vue'

export default {
  name: 'DesktopResetMotDePasse',
  components: {
    BlackBlitzzQuiz,
    InputMotDePasse,
    InputConfirmerMotDePasse,
    BoutonConfirmer
  },
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      loading: false
    }
  },
  methods: {
    async goToSucces() {
      if (this.loading) return;

      // 1. 基本校验
      if (!this.newPassword || this.newPassword !== this.confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }

      this.loading = true;
      try {
        // 2. 从当前 URL 获取参数
        const urlParams = new URLSearchParams(window.location.search);

        await authService.resetPassword({
          email: urlParams.get('email'),
          token: urlParams.get('token'),
          password: this.newPassword,
          password_confirmation: this.confirmPassword
        });

        // 3. 成功后跳转
        this.$router.push('/connexion');
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Erreur lors de la réinitialisation");
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
@import './DesktopResetMotDePasse.css';
</style>