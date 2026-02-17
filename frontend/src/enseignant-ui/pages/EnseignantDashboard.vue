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
              <button type="button" class="action-btn action-btn--edit" @click="editQuiz(quiz)" title="Éditer le quiz">
                ✏️ Éditer
              </button>
              <button type="button" class="action-btn action-btn--preview" @click="previewQuiz(quiz)" title="Prévisualiser et modifier les questions">
                👁️ Prévisualiser
              </button>
              <button type="button" class="action-btn action-btn--delete" @click="requestDelete(quiz)" title="Supprimer le quiz">
                🗑️ Supprimer
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
import api from '../../api/Axios'
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
      quizToDelete: null,
      loadingQuizzes: false,
      errorQuizzes: ''
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
      // Redirige vers la page de gestion des questions où l'enseignant peut voir et modifier toutes les questions
      this.$router.push(`/enseignant/quiz/${quiz.id}/questions`)
    },

    requestDelete(quiz) {
      this.quizToDelete = quiz
      this.showDeleteModal = true
    },
    async confirmDelete() {
      if (!this.quizToDelete) {
        this.showDeleteModal = false
        return
      }

      try {
        await api.delete(`/quizzes/${this.quizToDelete.id}`)

        this.quizzes = this.quizzes.filter(q => q.id !== this.quizToDelete.id)
      } catch (e) {
        console.error('Erreur suppression quiz', e.response?.data || e)
        alert('Impossible de supprimer le quiz.')
      } finally {
        this.quizToDelete = null
        this.showDeleteModal = false
      }
    },
    cancelDelete() {
      this.quizToDelete = null
      this.showDeleteModal = false
    },

    async loadTeacherQuizzes() {
  this.loadingQuizzes = true
  this.errorQuizzes = ''
  try {
    const { data } = await api.get('/quizzes')
    console.log('Enseignant /quizzes =>', data)
    this.quizzes = data.map(q => ({
      id: q.id,
      titre: q.titre,
      statut: 'Publié',
      isPublic: q.is_public ? true : false,
      nbQuestions: q.questions_count ?? 0
    }))
  } catch (e) {
    console.error('Erreur /quizzes enseignant', e.response?.data || e)
    this.errorQuizzes = 'Impossible de charger vos quiz.'
  } finally {
    this.loadingQuizzes = false
  }
}

  },
  async mounted() {
    await this.loadTeacherQuizzes()
  }
}
</script>

<style scoped>
@import './EnseignantDashboard.css';
</style>
