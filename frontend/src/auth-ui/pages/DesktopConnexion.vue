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
        <BoutonConnexion @click="handleConnexion" />
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
        username: '', // Sera utilisé comme email
        password: '',
        role: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    async handleConnexion() {
      // Validation basique
      if (!this.formData.username || !this.formData.password) {
        alert('Veuillez remplir tous les champs')
        return
      }

      this.loading = true
      this.error = null

      try {
        // Appel API de connexion
        const data = await authService.login(
          this.formData.username, // email
          this.formData.password,
          this.formData.role
        )

        // Sauvegarde le token et l'utilisateur
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        console.log('Connexion réussie:', data.user)

        const role = data.user.role
        
        if (role === 'TEACHER') {
          this.$router.push('/enseignant')
        } else if (role === 'STUDENT') {
          this.$router.push('/etudiant')
        } else {
          // fallback si jamais
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
