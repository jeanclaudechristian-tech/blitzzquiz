<template>
  <div class="desktop-connexion">
    <div class="background-video">
      <video autoplay loop playsinline muted>
        <source src="/videos/LandingPage.mp4" type="video/mp4" />
      </video>
    </div>
    <div class="espace-connexion">
      <div class="form-content">
        <BlackBlitzzQuiz class="logo" />
        <div class="titre">
          <p>Se connecter</p>
          <p> </p>
          <p>à mon</p>
          <p> </p>
          <p>compte</p>
        </div>
        <InputNomUtilisateur v-model="formData.username" />
        <InputMotDePasse v-model="formData.password" placeholder="Mot de passe" />
        <BoutonMdpOublie />
        <BoutonConnexion :disabled="loading" @click="handleConnexion" />
        <Diviseur />
        <BoutonCreerUnCompte />
        <BoutonGoogle />
      </div>
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
import api from '../../api/Axios'

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
  methods: {
    async handleConnexion() {
      if (this.loading) return
      this.loading = true
      this.error = null

      try {
        const data = await authService.login(
            this.formData.username, // 确保这里传的是 Email
            this.formData.password
        )

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        const role = data.user.role
        this.$router.push(role === 'TEACHER' ? '/enseignant' : (role === 'STUDENT' ? '/etudiant' : '/'))

      } catch (error) {
        const status = error.response?.status
        const message = error.response?.data?.message

        if (status === 403 && error.response?.data?.needs_verification) {
          // --- 核心：拦截未验证用户并提示重发 --- [cite: 1, 2026-03-15]
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
        // 调用 authService 里的新接口
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
