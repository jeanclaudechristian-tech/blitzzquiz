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
        <InputMotDePasse
          v-model="formData.password"
          placeholder="Mot de passe"
        />
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
import InputNomUtilisateur from '../components/InputNomUtilisateur.vue'
import InputMotDePasse from '../components/InputMotDePasse.vue'
import BoutonMdpOublie from '../components/BoutonMdpOublie.vue'
import BoutonConnexion from '../components/BoutonConnexion.vue'
import Diviseur from '../components/Diviseur.vue'
import BoutonCreerUnCompte from '../components/BoutonCreerUnCompte.vue'
import BoutonGoogle from '../components/BoutonGoogle.vue'
import { authService } from '../../api/auth'
import axios from 'axios'

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
        username: '', // email
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

      if (!this.formData.username || !this.formData.password) {
        this.error = 'Veuillez remplir votre email et votre mot de passe.'
        alert(this.error)
        this.loading = false
        return
      }

      try {
        const data = await authService.login(
          this.formData.username,
          this.formData.password
        )

        // sauvegarde token + user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        // config axios globale pour les prochains appels
        axios.defaults.baseURL = 'http://localhost:8000/api'
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

        console.log('Connexion réussie:', data.user)

        const role = data.user.role
        if (role === 'TEACHER') {
          this.$router.push('/enseignant')
        } else if (role === 'STUDENT') {
          this.$router.push('/etudiant')
        } else {
          this.$router.push('/')
        }
      } catch (error) {
        console.error('Erreur de connexion:', error)
        if (error.response?.status === 422) {
          this.error = 'Email ou mot de passe incorrect'
        } else {
          this.error = 'Erreur de connexion. Réessayez plus tard.'
        }
        alert(this.error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
@import './DesktopConnexion.css';
</style>
