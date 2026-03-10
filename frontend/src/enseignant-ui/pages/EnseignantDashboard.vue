<template>
  <div class="enseignant-page">
    <AppHeader />
    <main class="enseignant-main">
      <section class="enseignant-hero">
        <div class="enseignant-hero-text">
          <h1>Bienvenue dans l'espace enseignant</h1>
          <p>Créez vos quiz et suivez vos activités avec vos étudiants.</p>
        </div>
        <div class="enseignant-hero-stats">
          <div class="stat-card">
            <p class="stat-label">Mes quiz</p>
            <p class="stat-value">{{ quizCount }}</p>
          </div>
          <div class="shortcuts">
            <button type="button" class="shortcut-btn" @click="scrollToMesQuiz">Mes quiz</button>
            <button type="button" class="shortcut-btn primary" @click="goToCreateQuiz">Créer</button>
            <button type="button" class="shortcut-btn" @click="goToGroups">Groupes</button>
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

        <!-- Toggle Quiz / Groupes -->
        <div class="toggle-tabs">
          <button
            type="button"
            class="toggle-tab"
            :class="{ active: activeTab === 'quiz' }"
            @click="activeTab = 'quiz'"
          >
            Quiz
          </button>
          <button
            type="button"
            class="toggle-tab"
            :class="{ active: activeTab === 'groupes' }"
            @click="switchToGroupes"
          >
            Groupes
          </button>
        </div>

        <!-- Tab Quiz -->
        <div v-if="activeTab === 'quiz'">
          <div class="mes-quiz-table" v-if="quizzes.length">
            <div class="mes-quiz-row mes-quiz-row--header">
              <span>Titre</span>
              <span>Visibilité</span>
              <span>Questions</span>
              <span>Code</span>
              <span>Actions</span>
            </div>
            <div v-for="quiz in quizzes" :key="quiz.id" class="mes-quiz-row">
              <span class="quiz-title">{{ quiz.titre }}</span>
              <span>
                <span :class="['pill', quiz.isPublic ? 'pill--public' : 'pill--private']">
                  {{ quiz.isPublic ? 'Public' : 'Privé' }}
                </span>
              </span>
              <span>{{ quiz.nbQuestions }}</span>
              <span>{{ quiz.code }}</span>
              <span class="quiz-actions">
                <button type="button" class="action-btn action-btn--edit" @click="editQuiz(quiz)" title="Ajouter des questions">
                  ➕ Ajouter questions
                </button>
                <button type="button" class="action-btn action-btn--preview" @click="previewQuiz(quiz)" title="Voir les questions">
                  👁️ Voir questions
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
        </div>

        <!-- Tab Groupes -->
        <div v-if="activeTab === 'groupes'">
          <div v-if="loadingGroups" class="mes-quiz-empty">Chargement des groupes...</div>
          <div v-else-if="groups.length" class="mes-quiz-table">
            <div class="mes-quiz-row mes-quiz-row--header">
              <span>Nom</span>
              <span>Code</span>
              <span>Membres</span>
              <span>Actions</span>
            </div>
            <div v-for="group in groups" :key="group.id" class="mes-quiz-row">
              <span class="quiz-title">{{ group.nom }}</span>
              <span>{{ group.code }}</span>
              <span>{{ group.nbMembres }}</span>
              <span class="quiz-actions">
                <button type="button" class="action-btn action-btn--edit" @click="goToGroupDetails(group)">
                  Voir détails
                </button>
              </span>
            </div>
          </div>
          <p v-else class="mes-quiz-empty">Vous n'avez pas encore de groupes.</p>
        </div>
      </section>

      <transition name="fade-up">
        <div v-if="showDeleteModal" class="modal-backdrop">
          <div class="modal">
            <p class="modal-title">Supprimer ce quiz ?</p>
            <p class="modal-text">
              Cette action retirera le quiz de votre liste. Vous pourrez toujours en créer un nouveau plus tard.
            </p>
            <div class="modal-actions">
              <button type="button" class="shortcut-btn" @click="cancelDelete">Annuler</button>
              <button type="button" class="shortcut-btn danger" @click="confirmDelete">Supprimer</button>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
import api from '../../api/Axios'
import { groupService } from '../../api/groups'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'EnseignantDashboard',
  components: { AppHeader, CallToActionBtn },
  data() {
    return {
      quizzes: [],
      groups: [],
      activeTab: 'quiz',
      showDeleteModal: false,
      quizToDelete: null,
      loadingQuizzes: false,
      loadingGroups: false,
      errorQuizzes: ''
    }
  },
  computed: {
    quizCount() {
      return this.quizzes.length
    }
  },
  async mounted() {
    await this.loadTeacherQuizzes()
  },
  methods: {
    goToCreateQuiz() {
      this.$router.push('/enseignant/quiz/nouveau')
    },
    scrollToMesQuiz() {
      const el = document.getElementById('mes-quiz-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setTimeout(() => {
          el.classList.remove('section-highlight')
          void el.offsetWidth
          el.classList.add('section-highlight')
          setTimeout(() => el.classList.remove('section-highlight'), 800)
        }, 400)
      }
    },
    goToGroups() {
      this.$router.push('/enseignant/groupes')
    },
    goToGroupDetails(group) {
      this.$router.push(`/enseignant/groupes/${group.id}`)
    },
    editQuiz(quiz) {
      this.$router.push(`/enseignant/quiz/${quiz.id}/questions`)
    },
    previewQuiz(quiz) {
      this.$router.push(`/enseignant/quiz/${quiz.id}/previsualiser`)
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
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        const userId = user?.id ?? null
        const { data } = await api.get('/quizzes')
        this.quizzes = data
          .filter(q => q.owner_id === userId)
          .map(q => ({
            id: q.id,
            titre: q.titre,
            isPublic: q.is_public === true || q.is_public === 1 || q.is_public === '1',
            nbQuestions: q.questions_count ?? 0,
            code: q.code_quiz,
          }))
      } catch (e) {
        console.error('Erreur /quizzes enseignant', e.response?.data || e)
        this.errorQuizzes = 'Impossible de charger vos quiz.'
      } finally {
        this.loadingQuizzes = false
      }
    },
    async switchToGroupes() {
      this.activeTab = 'groupes'
      if (this.groups.length) return
      this.loadingGroups = true
      try {
        const { data } = await groupService.list()
        const raw = Array.isArray(data) ? data : data.data
        this.groups = raw.map(g => ({
          id: g.id,
          nom: g.name ?? g.nom,
          code: g.code,
          nbMembres: g.members_count ?? g.nb_membres ?? (g.members ? g.members.length : 0)
        }))
      } catch (e) {
        console.error('Erreur /groups', e.response?.data || e)
      } finally {
        this.loadingGroups = false
      }
    }
  }
}
</script>

<style scoped>
@import './EnseignantDashboard.css';

.toggle-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.toggle-tab {
  padding: 8px 24px;
  border: 2px solid #e5e7eb;
  border-radius: 99px;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.toggle-tab.active {
  background: #269aff;
  border-color: #269aff;
  color: #fff;
}

.toggle-tab:hover:not(.active) {
  border-color: #269aff;
  color: #269aff;
}
</style>