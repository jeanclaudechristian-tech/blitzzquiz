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
import { authService } from '../../api/auth'
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
    BoutonConfirmer,
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
        confirmPassword: this.registrationStore.confirmPassword || '',
      },
      loading: false,
      error: null,
    }
  },
  methods: {
    async goToValidation() {
      // Validation basique
      if (
        !this.formData.email ||
        !this.formData.username ||
        !this.formData.password ||
        !this.formData.confirmPassword
      ) {
        alert('Veuillez remplir tous les champs')
        return
      }

      if (this.formData.password !== this.formData.confirmPassword) {
        alert('Les mots de passe ne correspondent pas')
        return
      }

      if (this.formData.password.length < 8) {
        alert('Le mot de passe doit contenir au moins 8 caractères')
        return
      }

      this.loading = true
      this.error = null

      try {
        // Sauvegarde dans le store avant l'appel API (sans rôle)
        this.registrationStore.setCredentials(
          this.formData.email,
          this.formData.username,
          this.formData.password,
          this.formData.confirmPassword
        )

        console.log("Données complètes d'inscription:", {
          role: this.registrationStore.role,
          niveauEtude: this.registrationStore.niveauEtude,
          email: this.formData.email,
          username: this.formData.username,
        })

        // Appel API d'inscription avec le rôle du store
        const data = await authService.register(
          this.formData.email,
          this.formData.username,
          this.formData.password,
          this.formData.confirmPassword,
          this.registrationStore.role
        )

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        console.log('Inscription réussie:', data.user)

        const userRole = this.registrationStore.role

        this.registrationStore.reset()

        // Redirection vers le bon dashboard
        if (userRole === 'TEACHER') {
          this.$router.push('/enseignant')
        } else if (userRole === 'STUDENT') {
          this.$router.push('/etudiant')
        } else {
          this.$router.push('/')
        }
      } catch (error) {
        console.error("Erreur d'inscription brute:", error)

        if (error && error.response && error.response.status === 422) {
          const errors = error.response.data.errors
          console.log('Validation errors:', errors)

          if (errors.email) {
            this.error = 'Cet email est déjà utilisé'
          } else if (errors.password) {
            this.error = 'Le mot de passe ne respecte pas les critères'
          } else if (errors.role) {
            this.error = 'Le type de compte (rôle) est invalide ou manquant'
          } else {
            this.error = 'Erreur de validation. Vérifiez vos informations.'
          }
        } else {
          this.error = "Erreur d'inscription. Réessayez plus tard."
        }

        alert(this.error)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>



<style scoped>
@import './DesktopInscriptionPage2.css';
</style>
