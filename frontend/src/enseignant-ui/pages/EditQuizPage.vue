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
                :disabled="!hasQuestions"
                :title="!hasQuestions ? 'Ajoutez des questions avant d\'enregistrer' : ''"
              >
                💾 Enregistrer le quiz
              </button>
              <button
                type="button"
                class="btn-publish"
                @click="saveQuiz(true)"
                :disabled="!hasQuestions"
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
      error: ''
    }
  },
  computed: {
    hasQuestions() {
      if (!this.form.id) return false
      
      const questionsKey = `enseignant_quiz_questions_${this.form.id}`
      const saved = localStorage.getItem(questionsKey)
      
      if (!saved) return false
      
      try {
        const questions = JSON.parse(saved)
        return Array.isArray(questions) && questions.length > 0
      } catch {
        return false
      }
    }
  },
  methods: {
    generateCode() {
      return Math.random().toString(36).substring(2, 8).toUpperCase()
    },
    loadQuiz() {
      // TODO (Laravel) : GET /api/quizzes/{id}
      const storageKey = 'enseignant_quizzes'
      const id = Number(this.$route.params.id)
      const saved = localStorage.getItem(storageKey)
      if (!saved) {
        this.$router.push('/enseignant')
        return
      }
      let quizzes = []
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) quizzes = parsed
      } catch {
        this.$router.push('/enseignant')
        return
      }
      const quiz = quizzes.find(q => q.id === id)
      if (!quiz) {
        this.$router.push('/enseignant')
        return
      }
      if (!quiz.code_quiz) {
        quiz.code_quiz = this.generateCode()
        localStorage.setItem(storageKey, JSON.stringify(quizzes))
      }
      this.form = {
        id: quiz.id,
        titre: quiz.titre,
        description: quiz.description || '',
        categorie: quiz.categorie || '',
        niveau: quiz.niveau || '',
        isPublic: !!quiz.isPublic,
        code_quiz: quiz.code_quiz,
        statut: quiz.statut || 'Brouillon'
      }
      this.quizLoaded = true
    },
    saveQuiz(publish = false) {
      this.error = ''
      if (!this.form.titre.trim()) {
        this.error = 'Le titre du quiz est obligatoire.'
        return
      }
      
      if (!this.hasQuestions) {
        this.error = 'Vous devez créer au moins une question avant d\'enregistrer le quiz.'
        return
      }
      
      // TODO (Laravel) : PUT /api/quizzes/{id}
      // Enregistrer les informations du quiz ET toutes les questions
      const storageKey = 'enseignant_quizzes'
      let quizzes = []
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) quizzes = parsed
        }
      } catch {
        quizzes = []
      }
      const idx = quizzes.findIndex(q => q.id === this.form.id)
      if (idx === -1) {
        this.$router.push('/enseignant')
        return
      }
      
      // Mettre à jour le nombre de questions
      const questionsKey = `enseignant_quiz_questions_${this.form.id}`
      const questionsData = localStorage.getItem(questionsKey)
      let nbQuestions = 0
      if (questionsData) {
        try {
          const questions = JSON.parse(questionsData)
          nbQuestions = Array.isArray(questions) ? questions.length : 0
        } catch {
          nbQuestions = 0
        }
      }
      
      quizzes[idx] = {
        ...quizzes[idx],
        titre: this.form.titre.trim(),
        description: this.form.description.trim(),
        categorie: this.form.categorie,
        niveau: this.form.niveau,
        isPublic: this.form.isPublic,
        code_quiz: this.form.code_quiz,
        nbQuestions: nbQuestions,
        statut: publish ? 'Publié' : (quizzes[idx].statut || 'Brouillon')
      }
      localStorage.setItem(storageKey, JSON.stringify(quizzes))
      this.$router.push('/enseignant')
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
