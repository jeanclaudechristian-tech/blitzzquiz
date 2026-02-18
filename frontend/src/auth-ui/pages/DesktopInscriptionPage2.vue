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
        
        <!-- DIRECTEMENT LA PROP DISABLED, PAS DE DIV AUTOUR -->
        <InputCourriel 
            v-model="formData.email" 
            placeholder="Courriel (personnel ou scolaire)"
            :disabled="registrationStore.isGoogleFlow" 
        />

        <InputNomUtilisateur v-model="formData.username" />

        <InputMotDePasse 
            v-model="formData.password" 
            placeholder="Mot de passe"
            :disabled="registrationStore.isGoogleFlow" 
        />
        
        <InputConfirmerMotDePasse 
            v-model="formData.confirmPassword"
            :disabled="registrationStore.isGoogleFlow" 
        />

        <BoutonRetour class="bouton-retour-position" @click="$router.back()" />
        <BoutonConfirmer class="bouton-confirmer-position" @click="goToValidation" :disabled="loading" />
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
        password: this.registrationStore.isGoogleFlow ? 'GoogleAuthSecure!' : (this.registrationStore.password || ''),
        confirmPassword: this.registrationStore.isGoogleFlow ? 'GoogleAuthSecure!' : (this.registrationStore.confirmPassword || ''),
      },
      loading: false,
      error: null,
      isSubmitting: false,
    }
  },
  methods: {
    async goToValidation() {
      if (this.isSubmitting) return
      
      if (!this.formData.username) {
        alert('Veuillez choisir un nom d\'utilisateur')
        return
      }
      
      if (!this.registrationStore.isGoogleFlow) {
          if (!this.formData.email || !this.formData.password) {
            alert('Veuillez remplir tous les champs')
            return
          }
          if (this.formData.password !== this.formData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas')
            return
          }
      }

      this.loading = true
      this.isSubmitting = true
      this.error = null

      try {
        let data;
        
        if (this.registrationStore.isGoogleFlow) {
            data = await authService.registerGoogleFinal({
                email: this.formData.email,
                username: this.formData.username,
                google_id: this.registrationStore.googleUser.googleId,
                avatar: this.registrationStore.googleUser.avatar,
                role: 'STUDENT',
                niveau: this.registrationStore.niveauEtude
            })
        } else {
            data = await authService.register(
                this.formData.email,
                this.formData.username,
                this.formData.password,
                this.formData.confirmPassword,
                this.registrationStore.role,
                this.registrationStore.niveauEtude
            )
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        this.registrationStore.reset()
        
        if (data.user.role === 'TEACHER') this.$router.push('/enseignant')
        else this.$router.push('/etudiant')

      } catch (error) {
        console.error("Erreur inscription:", error)
        alert(error.response?.data?.message || "Erreur lors de l'inscription")
      } finally {
        this.loading = false
        this.isSubmitting = false
      }
    },
  },
}
</script>

<style scoped>
@import './DesktopInscriptionPage2.css';
</style>
