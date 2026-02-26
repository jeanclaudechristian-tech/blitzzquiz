<template>
  <div class="edit-quiz-page">
    <AppHeader />
    <main class="edit-main">
      <section v-if="quizLoaded" class="edit-card">
        <header class="edit-card-header">
          <h1>✏️ Éditer le quiz</h1>
          <p class="subtitle">Modifiez les informations de base de votre quiz</p>
        </header>

        <form class="edit-form" @submit.prevent="saveQuiz(false)">
          <div class="field-group">
            <label for="titre">Titre du quiz *</label>
            <input
              id="titre"
              v-model="form.titre"
              type="text"
              placeholder="Titre de votre quiz"
              required
            />
          </div>

          <div class="field-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              placeholder="Ajoutez des consignes ou un contexte (optionnel)"
            ></textarea>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label for="categorie">Catégorie</label>
              <select id="categorie" v-model="form.categorie">
                <option value="">Choisir une catégorie</option>
                <option value="Math">Math</option>
                <option value="Français">Français</option>
                <option value="Sciences">Sciences</option>
                <option value="Histoire">Histoire</option>
              </select>
            </div>

            <div class="field-group">
              <label for="niveau">Niveau d'étude</label>
              <select id="niveau" v-model="form.niveau">
                <option value="">Choisir un niveau</option>
                <option value="Primaire">Primaire</option>
                <option value="Secondaire">Secondaire</option>
                <option value="Collégiale">Collégiale</option>
                <option value="Universitaire">Universitaire</option>
              </select>
            </div>
          </div>

          <div class="visibility-section">
            <div class="field-group visibility-group">
              <span class="field-label">Visibilité</span>
              <button
                type="button"
                class="toggle"
                :class="{ active: form.isPublic }"
                @click="form.isPublic = !form.isPublic"
              >
                <span class="toggle-thumb"></span>
                <span class="toggle-label">
                  {{ form.isPublic ? 'Public' : 'Privé' }}
                </span>
              </button>
            </div>

            <div v-if="!form.isPublic" class="code-block">
              <p class="code-label">Code du quiz</p>
              <div class="code-row">
                <span class="code-value">{{ form.code_quiz }}</span>
                <button
                  type="button"
                  class="copy-btn"
                  @click="copyCode"
                  title="Copier le code"
                >
                  📋 Copier
                </button>
              </div>
            </div>
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <p v-if="!hasQuestions" class="form-warning">
            ⚠️ Vous devez créer au moins une question avant d'enregistrer le quiz.
          </p>

          <div class="actions">
            <div class="primary-actions">
              <button
                type="button"
                class="btn-primary"
                @click="saveQuiz(false)"
                :disabled="!hasQuestions || saving"
                :title="!hasQuestions ? 'Ajoutez des questions avant d\'enregistrer' : ''"
              >
                💾 Enregistrer le quiz
              </button>
              <button
                type="button"
                class="btn-publish"
                @click="saveQuiz(true)"
                :disabled="!hasQuestions || saving"
                :title="!hasQuestions ? 'Ajoutez des questions avant de publier' : ''"
              >
                📢 Publier
              </button>
              <button
                type="button"
                class="btn-secondary"
                @click="goToQuestions"
              >
                ➕ Gérer les questions
              </button>
            </div>
            <button type="button" class="btn-cancel" @click="goBack">
              Retour à Mes quiz
            </button>
          </div>
        </form>
      </section>
    </main>
    <AppFooter class="compact-footer" />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'
import api from '../../api/Axios' // même instance que pour le dashboard / questions

export default {
  name: 'EditQuizPage',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      quizLoaded: false,
      form: {
        id: null,
        titre: '',
        description: '',
        categorie: '',
        niveau: '',
        isPublic: false,
        code_quiz: '',
        statut: 'Brouillon'
      },
      questionsCount: 0,
      error: '',
      saving: false
    }
  },
  computed: {
    hasQuestions() {
      return this.questionsCount > 0
    }
  },
  methods: {
    generateCode() {
      return Math.random().toString(36).substring(2, 8).toUpperCase()
    },

    async loadQuiz() {
      const id = this.$route.params.id

      try {
        // 1) charger les infos du quiz
        const { data: quiz } = await api.get(`/quizzes/${id}`)

        this.form = {
          id: quiz.id,
          titre: quiz.titre || '',
          description: quiz.description || '',
          categorie: quiz.categorie || '',
          niveau: quiz.niveau || '',
          isPublic: !!quiz.is_public,
          code_quiz: quiz.code_quiz || this.generateCode(),
          statut: quiz.statut || 'Brouillon'
        }

        // 2) charger le nombre de questions depuis l'API
        const { data: questions } = await api.get(`/quizzes/${id}/questions`)
        this.questionsCount = Array.isArray(questions) ? questions.length : 0

        this.quizLoaded = true
      } catch (e) {
        console.error('Erreur chargement quiz', e.response?.data || e)
        this.$router.push('/enseignant')
      }
    },

    async saveQuiz(publish = false) {
      this.error = ''

      if (!this.form.titre.trim()) {
        this.error = 'Le titre du quiz est obligatoire.'
        return
      }

      if (!this.hasQuestions) {
        this.error = 'Vous devez créer au moins une question avant d\'enregistrer le quiz.'
        return
      }

      this.saving = true

      try {
        const payload = {
          titre: this.form.titre.trim(),
          description: this.form.description.trim(),
          categorie: this.form.categorie || null,
          niveau: this.form.niveau || null,
          is_public: this.form.isPublic,
          code_quiz: this.form.code_quiz,
          statut: publish ? 'Publié' : (this.form.statut || 'Brouillon')
        }

        await api.put(`/quizzes/${this.form.id}`, payload)

        this.$router.push('/enseignant')
      } catch (e) {
        console.error('Erreur mise à jour quiz', e.response?.data || e)
        this.error = 'Erreur lors de la sauvegarde du quiz.'
      } finally {
        this.saving = false
      }
    },

    goToQuestions() {
      this.$router.push(`/enseignant/quiz/${this.form.id}/questions`)
    },

    goBack() {
      this.$router.push('/enseignant')
    },

    copyCode() {
      if (!this.form.code_quiz) return
      navigator.clipboard?.writeText(this.form.code_quiz).catch(() => {})
    }
  },
  mounted() {
    this.loadQuiz()
  }
}
</script>

<style scoped>
@import './EditQuizPage.css';
</style>
