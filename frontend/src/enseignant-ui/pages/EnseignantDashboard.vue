<template>
  <div class="enseignant-page">
    <AppHeader />
    <main class="enseignant-main">
      <section class="enseignant-hero">
        <div class="enseignant-hero-text">
          <h1>Bienvenue dans l'espace enseignant</h1>
          <p>
            Créez vos quiz et suivez vos activités avec vos étudiants.
          </p>
          <div class="enseignant-hero-actions">
            <CallToActionBtn
              text="Créer un quiz"
              variant="dark"
              @click="goToCreateQuiz"
            />
            <button type="button" class="link-button" @click="scrollToMesQuiz">
              Voir mes quiz
            </button>
          </div>
        </div>
        <div class="enseignant-hero-stats">
          <div class="stat-card">
            <p class="stat-label">Mes quiz</p>
            <p class="stat-value">{{ quizCount }}</p>
          </div>
          <div class="shortcuts">
            <button type="button" class="shortcut-btn" @click="scrollToMesQuiz">
              Mes quiz
            </button>
            <button type="button" class="shortcut-btn primary" @click="goToCreateQuiz">
              Créer
            </button>
            <button type="button" class="shortcut-btn" @click="goToGroups">
              Groupes
            </button>
          </div>
        </div>
      </section>

      <section id="mes-quiz-section" class="mes-quiz-section">
        <header class="mes-quiz-header">
          <h2>Mes quiz</h2>
          <button type="button" class="shortcut-btn primary" @click="goToCreateQuiz">
            + Nouveau quiz
          </button>
        </header>

        <div class="mes-quiz-table" v-if="quizzes.length">
          <div class="mes-quiz-row mes-quiz-row--header">
            <span>Titre</span>
            <span>Statut</span>
            <span>Visibilité</span>
            <span>Questions</span>
            <span>Actions</span>
          </div>
          <div
            v-for="quiz in quizzes"
            :key="quiz.id"
            class="mes-quiz-row"
          >
            <span class="quiz-title">{{ quiz.titre }}</span>
            <span>
              <span :class="['pill', quiz.statut === 'Publié' ? 'pill--success' : 'pill--draft']">
                {{ quiz.statut }}
              </span>
            </span>
            <span>
              <span :class="['pill', quiz.isPublic ? 'pill--public' : 'pill--private']">
                {{ quiz.isPublic ? 'Public' : 'Privé' }}
              </span>
            </span>
            <span>{{ quiz.nbQuestions }}</span>
            <span class="quiz-actions">
              <button type="button" class="action-link" @click="editQuiz(quiz)">
                Éditer
              </button>
              <button type="button" class="action-link" @click="previewQuiz(quiz)">
                Prévisualiser
              </button>
              <button type="button" class="action-link danger" @click="requestDelete(quiz)">
                Supprimer
              </button>
            </span>
          </div>
        </div>

        <p v-else class="mes-quiz-empty">
          Vous n'avez pas encore de quiz. Cliquez sur « Créer un quiz » pour commencer.
        </p>
      </section>
      <transition name="fade-up">
        <div v-if="showDeleteModal" class="modal-backdrop">
          <div class="modal">
            <p class="modal-title">Supprimer ce quiz ?</p>
            <p class="modal-text">
              Cette action retirera le quiz de votre liste. Vous pourrez toujours en créer un nouveau plus tard.
            </p>
            <div class="modal-actions">
              <button type="button" class="shortcut-btn" @click="cancelDelete">
                Annuler
              </button>
              <button type="button" class="shortcut-btn danger" @click="confirmDelete">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </transition>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'EnseignantDashboard',
  components: {
    AppHeader,
    AppFooter,
    CallToActionBtn
  },
  data() {
    return {
      quizzes: [],
      showDeleteModal: false,
      quizToDelete: null
    }
  },
  computed: {
    quizCount() {
      return this.quizzes.length
    }
  },
  methods: {
    goToCreateQuiz() {
      this.$router.push('/enseignant/quiz/nouveau')
    },
    scrollToMesQuiz() {
      const el = document.getElementById('mes-quiz-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    goToGroups() {
      // Raccourci réservé pour une future fonctionnalité Groupes
      console.log('Navigation vers Groupes (à implémenter)')
    },
    editQuiz(quiz) {
      this.$router.push(`/enseignant/quiz/${quiz.id}/editer`)
    },
    previewQuiz(quiz) {
      this.$router.push(`/enseignant/quiz/${quiz.id}/questions`)
    },
    requestDelete(quiz) {
      this.quizToDelete = quiz
      this.showDeleteModal = true
    },
    confirmDelete() {
      if (!this.quizToDelete) {
        this.showDeleteModal = false
        return
      }
      // TODO (Laravel) : à terme, appeler DELETE /api/quizzes/{id}
      // et supprimer cette logique localStorage.
      const storageKey = 'enseignant_quizzes'
      this.quizzes = this.quizzes.filter(q => q.id !== this.quizToDelete.id)
      localStorage.setItem(storageKey, JSON.stringify(this.quizzes))
      // Supprimer également les questions liées à ce quiz côté front-only.
      const questionsKey = `enseignant_quiz_questions_${this.quizToDelete.id}`
      localStorage.removeItem(questionsKey)
      this.quizToDelete = null
      this.showDeleteModal = false
    },
    cancelDelete() {
      this.quizToDelete = null
      this.showDeleteModal = false
    }
  },
  mounted() {
    // TODO (Laravel) : remplacer cette lecture localStorage
    // par un appel GET /api/quizzes (filtré par enseignant connecté).
    const storageKey = 'enseignant_quizzes'
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          this.quizzes = parsed
        }
      }
    } catch {
      this.quizzes = []
    }
  }
}
</script>

<style scoped>
@import './EnseignantDashboard.css';
</style>

