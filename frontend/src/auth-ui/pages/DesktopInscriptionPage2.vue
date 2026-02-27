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

        <InputCourriel
            v-model="formData.email"
            placeholder="Courriel"
            :disabled="registrationStore.isGoogleFlow"
        />

        <InputNomUtilisateur v-model="formData.username" />

        <template v-if="!registrationStore.isGoogleFlow">
          <InputMotDePasse v-model="formData.password" />
          <InputConfirmerMotDePasse v-model="formData.confirmPassword" />
        </template>

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
        password: this.registrationStore.isGoogleFlow 
          ? 'GoogleAuthSecure!' 
          : (this.registrationStore.password || ''),
        confirmPassword: this.registrationStore.isGoogleFlow 
          ? 'GoogleAuthSecure!' 
          : (this.registrationStore.confirmPassword || ''),
      },
      loading: false,
      error: null,
      isSubmitting: false,
    }
  },
  methods: {
    async goToValidation() {
      if (this.isSubmitting) return

      console.log('API URL =', import.meta.env.VITE_API_URL)

      if (this.registrationStore.isGoogleFlow) {
        if (!this.formData.email || !this.formData.username) {
          alert('Veuillez remplir l\'email et le nom d\'utilisateur')
          return
        }
        if (!this.registrationStore.niveauEtude) {
          alert('Veuillez sélectionner un niveau d\'étude')
          return
        }
      } else {
        if (!this.formData.email || !this.formData.username || 
            !this.formData.password || !this.formData.confirmPassword) {
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
        this.registrationStore.setCredentials(
          this.formData.email,
          this.formData.username,
          this.formData.password,
          this.formData.confirmPassword,
          this.registrationStore.niveauEtude
        )

        console.log("Données complètes d'inscription:", {
          role: this.registrationStore.role,
          niveauEtude: this.registrationStore.niveauEtude,
          email: this.formData.email,
          username: this.formData.username,
          isGoogleFlow: this.registrationStore.isGoogleFlow
        })

        let data
        if (this.registrationStore.isGoogleFlow) {
          const gid = this.registrationStore.googleUser?.googleId;

          if (!gid) {
            console.error("Erreur: google_id est manquant!");
          }

          data = await authService.registerGoogleFinal({
            email: this.formData.email,
            username: this.formData.username,
            google_id: gid, // 传给后端的字段名要对应
            role: this.registrationStore.role,
            education_level: this.registrationStore.niveauEtude,
            avatar: this.registrationStore.googleUser?.avatar
          });
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

        console.log('Inscription réussie:', data.user)

        if (data.user.role === 'TEACHER') {
          this.$router.push('/enseignant')
        } else if (data.user.role === 'STUDENT') {
          this.$router.push('/etudiant')
        } else {
          this.$router.push('/')
        }

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
