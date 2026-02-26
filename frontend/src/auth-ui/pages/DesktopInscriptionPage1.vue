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

        <div class="question-role">
          <p>Êtes-vous un Étudiant</p>
          <p>ou un Enseignant ?</p>
        </div>

        <div class="role-buttons">
          <!-- BOUTON ENSEIGNANT -->
          <!-- Si Google : on ne désactive pas le clic, on intercepte le clic pour afficher le message -->
          <button 
            type="button" 
            class="role-card enseignant" 
            :class="{ 'disabled-look': registrationStore.isGoogleFlow }"
            @click="handleTeacherClick"
          >
            <span class="role-label">Enseignant</span>
          </button>

          <!-- BOUTON ÉTUDIANT -->
          <button type="button" class="role-card etudiant" @click="selectRole('STUDENT')">
            <span class="role-label">Étudiant</span>
          </button>
        </div>

        <!-- MESSAGE D'ERREUR ROUGE (Apparaît au clic) -->
        <transition name="fade">
          <div v-if="showTeacherWarning" class="teacher-warning-text">
            Les enseignants doivent créer leur compte manuellement avec l'adresse courriel de leur établissement scolaire.
          </div>
        </transition>

        <transition name="fade-up">
          <div v-if="role === 'STUDENT'" class="niveau-block">
            <div class="titre">
              <span>Quel est votre</span><br />
              <span>niveau d'étude ?</span>
            </div>
            <DropdownNiveauEtude v-model="niveauEtude" />
            <BoutonSuivant @click="goToInscriptionDetails" />
          </div>
        </transition>

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
    BoutonRetour,
  },
  setup() {
    const registrationStore = useRegistrationStore()
    return { registrationStore }
  },
  data() {
    return {
      niveauEtude: this.registrationStore.niveauEtude || '',
      role: this.registrationStore.isGoogleFlow ? 'STUDENT' : '',
      showTeacherWarning: false // Contrôle l'affichage du message
    }
  },
  methods: {
    handleTeacherClick() {
      // Si on vient de Google, on affiche le message d'erreur
      if (this.registrationStore.isGoogleFlow) {
        this.showTeacherWarning = true
        // On le cache après 5 secondes si tu veux, ou on le laisse
        setTimeout(() => { this.showTeacherWarning = false }, 5000)
      } else {
        // Sinon comportement normal
        this.selectRole('TEACHER')
      }
    },

    selectRole(role) {
      this.role = role
      this.registrationStore.setRole(role)
      this.showTeacherWarning = false // On cache le warning si on clique ailleurs

      if (role === 'TEACHER') {
        this.$router.push({
          path: '/inscription/details',
          query: { role: 'TEACHER' },
        })
      }
    },

    goToInscriptionDetails() {
      if (!this.niveauEtude) {
        alert("Veuillez sélectionner un niveau d'étude")
        return
      }

      this.registrationStore.setNiveauEtude(this.niveauEtude)

      this.$router.push({
        path: '/inscription/details',
        query: {
          role: this.registrationStore.role || 'STUDENT',
        },
      })
    },

    goToConnexion() {
      this.registrationStore.reset()
      this.$router.push('/connexion')
    },
  },
}
</script>

<style scoped>
@import './DesktopInscriptionPage1.css';

/* Juste l'aspect visuel grisé/interdit */
.disabled-look {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(100%);
}

/* Le style exact demandé pour le texte */
.teacher-warning-text {
  margin-top: 16px;
  color: #FF0000; /* Rouge pur ou #D32F2F pour plus doux */
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500; /* Un peu de gras pour la lisibilité */
  text-align: center;
  max-width: 300px; /* Pour éviter que ça s'étale trop */
  margin-left: auto;
  margin-right: auto;
  line-height: 1.4;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
