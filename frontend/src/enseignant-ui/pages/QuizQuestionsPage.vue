<template>
  <div class="quiz-questions-page">
    <AppHeader />
    <main class="questions-main" v-if="quizLoaded">
      <header class="questions-header">
        <h1>✏️ Créer des questions</h1>
        <p class="subtitle">{{ quizTitle }}</p>
      </header>

      <div class="questions-container">
        <!-- Sidebar avec liste des questions -->
        <aside class="questions-sidebar">
          <div class="sidebar-header">
            <h2>Questions ({{ questions.length }})</h2>
          </div>
          <div class="questions-list">
            <div
              v-for="(q, index) in questions"
              :key="q.id"
              :class="['question-card', { active: index === currentIndex }]"
              @click="loadQuestion(index)"
            >
              <div class="question-number">Q{{ index + 1 }}</div>
              <div class="question-preview">{{ truncate(q.texte, 30) }}</div>
              <button
                type="button"
                class="delete-icon-btn"
                @click.stop="deleteQuestion(index)"
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          </div>
          <button type="button" class="add-question-btn" @click="newQuestion">
            + Nouvelle question
          </button>
        </aside>

        <!-- Formulaire -->
        <section class="question-form-section">
          <form class="question-form" @submit.prevent="addOrUpdateQuestion">
            <div class="form-group">
              <label for="texte">Texte de la question *</label>
              <textarea
                id="texte"
                v-model="form.texte"
                placeholder="Ex: Quelle est la capitale de la France ?"
                rows="3"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label>Choix de réponse (4 choix obligatoires) *</label>
              <div class="choices-grid">
                <div class="choice-field">
                  <span class="choice-letter">A</span>
                  <input
                    v-model="form.choixA"
                    type="text"
                    placeholder="Réponse A"
                    required
                  />
                </div>
                <div class="choice-field">
                  <span class="choice-letter">B</span>
                  <input
                    v-model="form.choixB"
                    type="text"
                    placeholder="Réponse B"
                    required
                  />
                </div>
                <div class="choice-field">
                  <span class="choice-letter">C</span>
                  <input
                    v-model="form.choixC"
                    type="text"
                    placeholder="Réponse C"
                    required
                  />
                </div>
                <div class="choice-field">
                  <span class="choice-letter">D</span>
                  <input
                    v-model="form.choixD"
                    type="text"
                    placeholder="Réponse D"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Bonne réponse *</label>
              <div class="answer-radios">
                <label v-for="opt in ['A','B','C','D']" :key="opt" class="radio-label">
                  <input
                    type="radio"
                    :value="opt"
                    v-model="form.bonneReponse"
                    required
                  />
                  <span class="radio-text">{{ opt }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="explication">Explication (optionnel)</label>
              <textarea
                id="explication"
                v-model="form.explication"
                placeholder="Ajoutez une explication pour cette question..."
                rows="2"
              ></textarea>
            </div>

            <p v-if="error" class="form-error">{{ error }}</p>

            <div class="form-actions">
              <button
                type="submit"
                class="btn-primary"
              >
                {{ currentIndex !== null ? '✓ Mettre à jour' : '➕ Ajouter la question' }}
              </button>
              <button
                type="button"
                class="btn-secondary"
                @click="saveAndContinue"
              >
                💾 Enregistrer les questions
              </button>
              <button
                type="button"
                class="btn-cancel"
                @click="goBack"
              >
                Annuler
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
    <AppFooter class="compact-footer" />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'QuizQuestionsPage',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      quizLoaded: false,
      quizTitle: '',
      questions: [],
      currentIndex: null,
      form: {
        texte: '',
        choixA: '',
        choixB: '',
        choixC: '',
        choixD: '',
        bonneReponse: 'A',
        explication: ''
      },
      error: ''
    }
  },
  computed: {
    storageKey() {
      const id = this.$route.params.id
      return `enseignant_quiz_questions_${id}`
    }
  },
  methods: {
    loadQuizMeta() {
      // TODO (Laravel) : GET /api/quizzes/{id}
      const quizzesKey = 'enseignant_quizzes'
      const id = Number(this.$route.params.id)
      try {
        const saved = localStorage.getItem(quizzesKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const quiz = parsed.find(q => q.id === id)
          if (quiz) {
            this.quizTitle = quiz.titre
            this.quizLoaded = true
          }
        }
      } catch {
        // ignore
      }
      if (!this.quizLoaded) {
        this.$router.push('/enseignant')
      }
    },
    loadQuestions() {
      // TODO (Laravel) : GET /api/quizzes/{id}/questions
      try {
        const saved = localStorage.getItem(this.storageKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) this.questions = parsed
      } catch {
        this.questions = []
      }
    },
    saveQuestions() {
      // TODO (Laravel) : POST /api/quizzes/{id}/questions
      localStorage.setItem(this.storageKey, JSON.stringify(this.questions))
      this.updateQuizQuestionCount()
    },
    resetForm() {
      this.form = {
        texte: '',
        choixA: '',
        choixB: '',
        choixC: '',
        choixD: '',
        bonneReponse: 'A',
        explication: ''
      }
      this.currentIndex = null
      this.error = ''
    },
    loadQuestion(index) {
      const q = this.questions[index]
      if (!q) return
      this.currentIndex = index
      this.form = {
        texte: q.texte || '',
        choixA: q.choixA || '',
        choixB: q.choixB || '',
        choixC: q.choixC || '',
        choixD: q.choixD || '',
        bonneReponse: q.bonneReponse || 'A',
        explication: q.explication || ''
      }
    },
    newQuestion() {
      this.resetForm()
    },
    addOrUpdateQuestion() {
      this.error = ''
      const { texte, choixA, choixB, choixC, choixD, bonneReponse } = this.form
      if (!texte.trim() || !choixA.trim() || !choixB.trim() || !choixC.trim() || !choixD.trim()) {
        this.error = 'Veuillez remplir le texte de la question et les 4 choix.'
        return
      }
      
      const question = {
        // TODO (Laravel) : remplacer Date.now() par l'id renvoyé par l'API
        id: this.currentIndex != null && this.questions[this.currentIndex]
          ? this.questions[this.currentIndex].id
          : Date.now(),
        ...this.form
      }
      
      if (this.currentIndex == null) {
        this.questions.push(question)
        this.currentIndex = this.questions.length - 1
      } else {
        this.questions.splice(this.currentIndex, 1, question)
      }
      
      this.saveQuestions()
      this.resetForm()
    },
    deleteQuestion(index) {
      if (index < 0 || index >= this.questions.length) return
      // TODO (Laravel) : DELETE /api/questions/{questionId}
      this.questions.splice(index, 1)
      if (this.currentIndex === index) {
        this.resetForm()
      } else if (this.currentIndex > index) {
        this.currentIndex -= 1
      }
      this.saveQuestions()
    },
    updateQuizQuestionCount() {
      // TODO (Laravel) : Ce compteur sera automatiquement mis à jour côté backend
      const quizzesKey = 'enseignant_quizzes'
      const id = Number(this.$route.params.id)
      try {
        const saved = localStorage.getItem(quizzesKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (!Array.isArray(parsed)) return
        const idx = parsed.findIndex(q => q.id === id)
        if (idx === -1) return
        parsed[idx].nbQuestions = this.questions.length
        localStorage.setItem(quizzesKey, JSON.stringify(parsed))
      } catch {
        // ignore
      }
    },
    truncate(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    saveAndContinue() {
      // Sauvegarder les questions actuelles
      this.saveQuestions()
      // Rediriger vers la page d'édition du quiz pour finaliser
      this.$router.push(`/enseignant/quiz/${this.$route.params.id}/editer`)
    },
    goBack() {
      this.$router.push('/enseignant')
    }
  },
  mounted() {
    this.loadQuizMeta()
    this.loadQuestions()
  }
}
</script>

<style scoped>
@import './QuizQuestionsPage.css';
</style>
