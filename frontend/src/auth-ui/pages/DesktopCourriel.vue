<template>
  <div class="desktop-courriel">
    <div class="background-video">
      <video autoplay loop playsinline muted>
       <source src="/videos/LandingPage.mp4" type="video/mp4" />
      </video>
    </div>
    <div class="espace-reset-courriel">
      <div class="form-content">
        <BlackBlitzzQuiz class="logo" />
        <div class="titre">
          <p>Quel est</p>
          <p> </p>
          <p>votre</p>
          <p> </p>
          <p>courriel ?</p>
        </div>
        <InputCourriel v-model="email" placeholder="Courriel" />
        <BoutonSuivant @click="goToResetPassword" />
      </div>
    </div>
  </div>
</template>

<script>
import { authService } from '@/api/auth'
import BlackBlitzzQuiz from '../components/BlackBlitzzQuiz.vue'
import InputCourriel from '../components/InputCourriel.vue'
import BoutonSuivant from '../components/BoutonSuivant.vue'

export default {
  name: 'DesktopCourriel',
  components: {
    BlackBlitzzQuiz,
    InputCourriel,
    BoutonSuivant
  },
  data() {
    return {
      email: '',
      loading: false
    }
  },
  methods: {
    async goToResetPassword() {
      if (this.loading) return;

      if (!this.email) {
        alert("Veuillez saisir votre courriel.");
        return;
      }

      this.loading = true;
      try {
        // 【关键】调用后端，这行代码会让 Network 产生记录
        await authService.forgotPassword(this.email);

        alert("Un email a été envoyé.");
        // 发送成功后，通常建议回登录页，让用户去点邮件里的链接
        this.$router.push('/connexion');
      } catch (error) {
        // 如果后端报错（比如邮箱不存在），这里就会弹出提示
        console.error(error);
        alert(error.response?.data?.message || "Erreur lors de l'envoi");
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
@import './DesktopCourriel.css';
</style>
