<template>
  <div class="quiz-questions-page">
    <AppHeader />
    <main class="questions-main" v-if="quizLoaded">
      <header class="questions-header">
        <h1>Questions – {{ quizTitle }}</h1>
        <button type="button" class="link-button" @click="goBack">
          Retour à Mes quiz
        </button>
      </header>

      <section class="questions-layout">
        <aside class="questions-list">
          <div class="questions-list-header">
            <h2>Questions</h2>
          </div>
          <div
            v-for="(q, index) in questions"
            :key="q.id"
            :class="['question-item', { active: index === currentIndex }]"
            @click="loadQuestion(index)"
          >
            <span>Q{{ index + 1 }}</span>
            <button
              type="button"
              class="question-delete"
              @click.stop="deleteQuestion(index)"
            >
              Supprimer
            </button>
          </div>
          <button type="button" class="add-question-btn" @click="newQuestion">
            + Nouvelle question
          </button>
        </aside>

        <section class="question-form">
          <form @submit.prevent="addOrUpdateQuestion">
            <div class="field-group">
              <label for="texte">Texte de la question *</label>
              <textarea
                id="texte"
                v-model="form.texte"
                rows="3"
              ></textarea>
            </div>

            <div class="field-group">
              <label>Choix de réponse *</label>
              <div class="choices-grid">
                <div class="choice-item">
                  <span class="choice-label">A</span>
                  <input v-model="form.choixA" type="text" />
                </div>
                <div class="choice-item">
                  <span class="choice-label">B</span>
                  <input v-model="form.choixB" type="text" />
                </div>
                <div class="choice-item">
                  <span class="choice-label">C</span>
                  <input v-model="form.choixC" type="text" />
                </div>
                <div class="choice-item">
                  <span class="choice-label">D</span>
                  <input v-model="form.choixD" type="text" />
                </div>
              </div>
            </div>

            <div class="field-group">
              <label>Bonne réponse *</label>
              <div class="answer-radios">
                <label v-for="opt in ['A','B','C','D']" :key="opt">
                  <input
                    type="radio"
                    :value="opt"
                    v-model="form.bonneReponse"
                  />
                  <span>{{ opt }}</span>
                </label>
              </div>
            </div>

            <div class="field-group">
              <label for="explication">Explication (optionnel)</label>
              <textarea
                id="explication"
                v-model="form.explication"
                rows="2"
              ></textarea>
            </div>

            <p v-if="error" class="form-error">{{ error }}</p>

            <div class="builder-actions">
              <CallToActionBtn
                text="Ajouter la question"
                variant="dark"
                @click="addOrUpdateQuestion"
              />
              <CallToActionBtn
                text="Enregistrer"
                variant="blue"
                @click="saveAll"
              />
              <button type="button" class="link-button" @click="preview">
                Prévisualiser
              </button>
            </div>
          </form>

          <transition name="fade-up">
            <div v-if="showPreview" class="preview-card">
              <h3>Aperçu</h3>
              <p class="preview-question">{{ form.texte }}</p>
              <ul class="preview-choices">
                <li><strong>A.</strong> {{ form.choixA }}</li>
                <li><strong>B.</strong> {{ form.choixB }}</li>
                <li><strong>C.</strong> {{ form.choixC }}</li>
                <li><strong>D.</strong> {{ form.choixD }}</li>
              </ul>
            </div>
          </transition>
        </section>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'QuizQuestionsPage',
  components: {
    AppHeader,
    AppFooter,
    CallToActionBtn
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
      error: '',
      showPreview: false
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
      // TODO (Laravel) : remplacer cette lecture localStorage
      // par GET /api/quizzes/{id} pour récupérer le titre et les métadonnées.
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
        // TODO (Laravel) : dans une vraie API, l'id de question
        // viendra de la réponse POST /api/quizzes/{id}/questions.
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
      this.showPreview = true
    },
    deleteQuestion(index) {
      if (index < 0 || index >= this.questions.length) return
      this.questions.splice(index, 1)
      if (this.currentIndex === index) {
        this.resetForm()
      } else if (this.currentIndex > index) {
        this.currentIndex -= 1
      }
      this.saveQuestions()
    },
    updateQuizQuestionCount() {
      const quizzesKey = 'enseignant_quizzes'
      const id = Number(this.$route.params.id)
      try {
        const saved = localStorage.getItem(quizzesKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (!Array.isArray(parsed)) return
        const idx = parsed.findIndex(q => q.id === id)
        if (idx === -1) return
        // TODO (Laravel) : à terme, ce compteur viendra
        // du backend (par ex. GET /api/quizzes/{id})
        // après enregistrement des questions.
        parsed[idx].nbQuestions = this.questions.length
        localStorage.setItem(quizzesKey, JSON.stringify(parsed))
      } catch {
        // ignore
      }
    },
    saveAll() {
      this.saveQuestions()
      this.$router.push('/enseignant')
    },
    preview() {
      this.showPreview = true
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

