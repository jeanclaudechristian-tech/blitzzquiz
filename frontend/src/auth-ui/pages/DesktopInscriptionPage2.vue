<template>
  <div class="desktop-inscription-page-2">
    <div class="background-video">
      <video autoplay loop playsinline muted>
         <source src="/videos/LandingPage.mp4" type="video/mp4" />

      </video>
    </div>
    <div class="espace-inscription">
      <div class="form-content">
        <BlackBlitzzQuiz class="logo" />
        <div class="titre">
          <p>Création</p>
          <p> </p>
          <p>du</p>
          <p> </p>
          <p>compte</p>
        </div>
        <InputCourriel v-model="formData.email" placeholder="Courriel (personnel ou scolaire)" />
        <InputNomUtilisateur v-model="formData.username" />
        <InputMotDePasse v-model="formData.password" placeholder="Mot de passe" />
        <InputConfirmerMotDePasse v-model="formData.confirmPassword" />
        <BoutonRetour class="bouton-retour-position" @click="$router.back()" />
        <BoutonConfirmer class="bouton-confirmer-position" @click="goToValidation" />
      </div>
    </div>
  </div>
</template>

<script>
import BlackBlitzzQuiz from '../components/BlackBlitzzQuiz.vue'
import InputCourriel from '../components/InputCourriel.vue'
import InputNomUtilisateur from '../components/InputNomUtilisateur.vue'
import InputMotDePasse from '../components/InputMotDePasse.vue'
import InputConfirmerMotDePasse from '../components/InputConfirmerMotDePasse.vue'
import BoutonRetour from '../components/BoutonRetour.vue'
import BoutonConfirmer from '../components/BoutonConfirmer.vue'
import { authService } from '../../API/auth'
import { useRegistrationStore } from '../../stores/registration'

export default {
  name: 'DesktopInscriptionPage2',
  components: {
    BlackBlitzzQuiz,
    InputCourriel,
    InputNomUtilisateur,
    InputMotDePasse,
    InputConfirmerMotDePasse,
    BoutonRetour,
    BoutonConfirmer
  },
  setup() {
    const registrationStore = useRegistrationStore()
    return { registrationStore }
  },
  data() {
    return {
      formData: {
        email: this.registrationStore.email || '',
        username: this.registrationStore.username || '',
        password: this.registrationStore.password || '',
        confirmPassword: this.registrationStore.confirmPassword || ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    async goToValidation() {
      // Validation basique
      if (!this.formData.email || !this.formData.username || !this.formData.password || !this.formData.confirmPassword) {
        alert('Veuillez remplir tous les champs')
        return
      }

      // Vérifie que les mots de passe correspondent
      if (this.formData.password !== this.formData.confirmPassword) {
        alert('Les mots de passe ne correspondent pas')
        return
      }

      // Vérifie la longueur du mot de passe (min 8 caractères)
      if (this.formData.password.length < 8) {
        alert('Le mot de passe doit contenir au moins 8 caractères')
        return
      }

      this.loading = true
      this.error = null

      try {
        // Sauvegarde dans le store avant l'appel API
        this.registrationStore.setCredentials(
          this.formData.email,
          this.formData.username,
          this.formData.password,
          this.formData.confirmPassword
        )

        console.log(' Données complètes d\'inscription:', {
          niveauEtude: this.registrationStore.niveauEtude,
          email: this.formData.email,
          username: this.formData.username
        })

        // Appel API d'inscription
        const data = await authService.register(
          this.formData.email,
          this.formData.username,
          this.formData.password,
          this.formData.confirmPassword
        )

        // Sauvegarde le token et l'utilisateur
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        console.log(' Inscription réussie:', data.user)

        // Reset le store après succès
        this.registrationStore.reset()

        // Redirection vers validation ou dashboard
        this.$router.push('/validation')

      } catch (error) {
        console.error(' Erreur d\'inscription:', error)

        if (error.response?.status === 422) {
          const errors = error.response.data.errors
          if (errors.email) {
            this.error = 'Cet email est déjà utilisé'
          } else if (errors.password) {
            this.error = 'Le mot de passe ne respecte pas les critères'
          } else {
            this.error = 'Erreur de validation. Vérifiez vos informations.'
          }
        } else {
          this.error = 'Erreur d\'inscription. Réessayez plus tard.'
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
@import './DesktopInscriptionPage2.css';
</style>
