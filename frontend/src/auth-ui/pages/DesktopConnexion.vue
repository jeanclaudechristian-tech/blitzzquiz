<template>
  <div class="desktop-connexion">
    <div class="background-video">
      <video autoplay loop playsinline muted>
        <source src="/videos/LandingPage.mp4" type="video/mp4" />
      </video>
    </div>
    <div class="espace-connexion">
        <form class="form-content" @submit.prevent="handleConnexion">
        <BlackBlitzzQuiz class="logo" />
        <div class="titre">
          <p>Se connecter</p>
          <p> </p>
          <p>à mon</p>
          <p> </p>
          <p>compte</p>
        </div>
        <InputNomUtilisateur v-model="formData.username" @submit="handleConnexion" />
        <InputMotDePasse v-model="formData.password" placeholder="Mot de passe" @submit="handleConnexion" />
        <BoutonMdpOublie />
        <BoutonConnexion :disabled="loading" @click="handleConnexion" />
        <Diviseur />
        <BoutonCreerUnCompte />
        <BoutonGoogle />
      </form>
    </div>
  </div>
</template>

<script>
import BlackBlitzzQuiz from '../components/BlackBlitzzQuiz.vue'
import InputNomUtilisateur from '../components//InputCourriel.vue'
import InputMotDePasse from '../components/InputMotDePasse.vue'
import BoutonMdpOublie from '../components/BoutonMdpOublie.vue'
import BoutonConnexion from '../components/BoutonConnexion.vue'
import Diviseur from '../components/Diviseur.vue'
import BoutonCreerUnCompte from '../components/BoutonCreerUnCompte.vue'
import BoutonGoogle from '../components/BoutonGoogle.vue'
import { authService } from '../../api/auth'

export default {
  name: 'DesktopConnexion',
  components: {
    BlackBlitzzQuiz,
    InputNomUtilisateur,
    InputMotDePasse,
    BoutonMdpOublie,
    BoutonConnexion,
    Diviseur,
    BoutonCreerUnCompte,
    BoutonGoogle
  },
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      loading: false,
      error: null
    }
  },
  mounted() {
    document.addEventListener('keydown', this.onEnterKey)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onEnterKey)
  },
  methods: {
    onEnterKey(e) {
      if (e.key === 'Enter') {
        this.handleConnexion()
      }
    },
    async handleConnexion() {
      if (this.loading) return
      this.loading = true
      this.error = null

      try {
        const data = await authService.login(this.formData.username, this.formData.password);

        // 1. 正常存储 Token
        localStorage.setItem('token', data.token);

        // 2. 🎯 缝合逻辑：把外层的 is_super 塞进 user 对象里再存
        // 这样 AppHeader.vue 里的 userObj.is_super 就能读到了
        const userToSave = {
          ...data.user,
          is_super: data.is_super
        };
        localStorage.setItem('user', JSON.stringify(userToSave));

        this.$router.push('/');

      } catch (error) {
        const status = error.response?.status
        const message = error.response?.data?.message

        if (status === 403 && error.response?.data?.needs_verification) {
          const confirmResend = confirm("Votre compte n'est pas activé. Voulez-vous renvoyer l'email de vérification ?")
          if (confirmResend) {
            await this.handleResendEmail()
          }
        } else if (status === 422 || status === 401) {
          alert('Email ou mot de passe incorrect.')
        } else {
          alert(message || 'Erreur de connexion. Réessayez plus tard.')
        }
      } finally {
        this.loading = false
      }
    },
    async handleResendEmail() {
      try {
        await authService.resendVerification(this.formData.username)
        alert("Un nouveau lien a été envoyé à votre adresse courriel.")
      } catch (e) {
        alert("Erreur lors de l'envoi du lien de vérification.")
      }
    }
  }
}
</script>

<style scoped>
@import './DesktopConnexion.css';
</style>