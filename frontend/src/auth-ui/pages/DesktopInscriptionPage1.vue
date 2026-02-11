<template>
  <div class="desktop-inscription-page-1">
    <div class="background-video">
      <video autoplay loop playsinline muted>
        <source src="/videos/LandingPage.mp4" type="video/mp4" />
      </video>
    </div>

    <div class="espace-inscription">
      <div class="form-content">
        <BlackBlitzzQuiz class="logo" />

        <div class="titre">
          <span>Quel est votre</span><br />
          <span>niveau d'étude ?</span>
        </div>

        <DropdownNiveauEtude v-model="niveauEtude" />

        <BoutonSuivant @click="goToInscriptionDetails" />
        <BoutonRetour text="Page de connexion" @click="goToConnexion" />
      </div>
    </div>
  </div>
</template>

<script>
import BlackBlitzzQuiz from '../components/BlackBlitzzQuiz.vue'
import DropdownNiveauEtude from '../components/DropdownNiveauEtude.vue'
import BoutonSuivant from '../components/BoutonSuivant.vue'
import BoutonRetour from '../components/BoutonRetour.vue'
import { useRegistrationStore } from '../../stores/registration'

export default {
  name: 'DesktopInscriptionPage1',
  components: {
    BlackBlitzzQuiz,
    DropdownNiveauEtude,
    BoutonSuivant,
    BoutonRetour
  },
  setup() {
    const registrationStore = useRegistrationStore()
    return { registrationStore }
  },
  data() {
    return {
      niveauEtude: this.registrationStore.niveauEtude || ''
    }
  },
  methods: {
    goToInscriptionDetails() {
      if (!this.niveauEtude) {
        alert('Veuillez sélectionner un niveau d\'étude')
        return
      }
      this.registrationStore.setNiveauEtude(this.niveauEtude)
      this.$router.push({
        path: '/inscription/details',
        query: {
          role: this.registrationStore.role || 'STUDENT'
        }
      })
    },
    goToConnexion() {
      this.$router.push('/connexion')
    }
  }
}
</script>

<style scoped>
@import './DesktopInscriptionPage1.css';
</style>
