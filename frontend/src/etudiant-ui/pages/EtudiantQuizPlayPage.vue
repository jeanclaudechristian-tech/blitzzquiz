<template>
  <div class="play-page">
    <AppHeader />

    <main class="play-main" v-if="quizLoaded && questions.length">
      <section class="play-card">
        <button type="button" class="back-button" @click="goBack">
          ← Abandonner
        </button>

        <header class="play-header">
          <div class="progress-info">
            <span>Question {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
          </div>
          <div class="timer">
            ⏱️ {{ remainingSeconds }}s
          </div>
        </header>

        <section class="play-body">
          <h1 class="question-text">{{ currentQuestion.texte }}</h1>

          <div class="choices-grid">
<<<<<<< HEAD
            <button v-for="opt in ['A', 'B', 'C', 'D']" :key="opt" type="button" :class="[
              'choice-btn',
              {
                selected: selectedChoice === opt,
                correct: showFeedback && opt === (currentQuestion.metadata?.bonneReponse || currentQuestion.bonneReponse),
              wrong: showFeedback && selectedChoice === opt && opt !== (currentQuestion.metadata?.bonneReponse || currentQuestion.bonneReponse)
                }
            ]" @click="selectChoice(opt)">
=======
            <button
              v-for="opt in ['A','B','C','D']"
              :key="opt"
              type="button"
              :class="[
                'choice-btn',
                {
                  selected: selectedChoice === opt,
                  correct:
                    showFeedback &&
                    opt === (currentQuestion.metadata?.bonneReponse),
                  wrong:
                    showFeedback &&
                    selectedChoice === opt &&
                    opt !== (currentQuestion.metadata?.bonneReponse),
                },
              ]"
              @click="selectChoice(opt)"
            >
>>>>>>> aec8a9cb3c3e6ce3ad8909cc1857fe871dbd663f
              <span class="choice-label">{{ opt }}</span>
              <span class="choice-text">{{ choiceText(opt) }}</span>
            </button>
          </div>
        </section>

        <footer class="play-footer">
          <CallToActionBtn text="Suivant" variant="blue" :class="{ disabled: !selectedChoice }" @click="nextQuestion" />
        </footer>
      </section>
    </main>

    <main v-else class="play-main">
      <section class="play-card">
        <p v-if="loading">Chargement des questions…</p>
        <p v-else-if="error" class="error">{{ error }}</p>
        <p v-else>Aucune question disponible pour ce quiz.</p>
      </section>
    </main>
  </div>
</template>

<script>
import api from '../../api/Axios'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'EtudiantQuizPlayPage',
  components: {
    AppHeader,
    CallToActionBtn,
  },
  data() {
    return {
      quizLoaded: false,
      questions: [],
      currentIndex: 0,
      selectedChoice: '',
      showFeedback: false,
      remainingSeconds: 60,
      timerId: null,
      answers: [],
      loading: false,
      error: '',
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || {}
    },
    progressPercent() {
      if (!this.questions.length) return 0
      return (this.currentIndex / this.questions.length) * 100
    },
  },
  methods: {
    async loadQuestions() {
      this.loading = true
      this.error = ''
      const quizId = this.$route.params.id

      try {
        // GET /api/quizzes/{quiz}/questions
        const { data } = await api.get(`/quizzes/${quizId}/questions`)
        this.questions = Array.isArray(data) ? data : []
      } catch (e) {
        console.error('Erreur chargement questions', e.response?.data || e)
        this.error = 'Erreur lors du chargement des questions.'
        this.questions = []
      } finally {
        this.loading = false
      }

      if (!this.questions.length) {
        this.$router.push('/etudiant')
      } else {
        this.quizLoaded = true
        this.startTimer()
      }
    },
    startTimer() {
      this.remainingSeconds = 60
      this.timerId = setInterval(() => {
        if (this.remainingSeconds > 0) {
          this.remainingSeconds -= 1
        } else {
          this.finishQuiz()
        }
      }, 1000)
    },
    stopTimer() {
      if (this.timerId) {
        clearInterval(this.timerId)
        this.timerId = null
      }
    },
    choiceText(opt) {
      const q = this.currentQuestion
<<<<<<< HEAD
      const meta = q.meta.date || {}
      return meta[`choix${opt}`] || q[`choix${opt}`] || ''
=======
      if (!q || !q.metadata) return ''
      return q.metadata[`choix${opt}`] || ''
>>>>>>> aec8a9cb3c3e6ce3ad8909cc1857fe871dbd663f
    },
    selectChoice(opt) {
      this.selectedChoice = opt
      this.showFeedback = false
    },
    nextQuestion() {
      if (!this.selectedChoice) return

      this.answers[this.currentIndex] = this.selectedChoice
      this.showFeedback = true

      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex += 1
        this.selectedChoice = ''
        this.showFeedback = false
      } else {
        this.finishQuiz()
      }
    },
    async finishQuiz() {
      this.stopTimer()
      const total = this.questions.length
      let correct = 0

      this.questions.forEach((q, idx) => {
        const bonne = q.metadata?.bonneReponse
        if (this.answers[idx] && this.answers[idx] === bonne) {
          correct += 1
        }
      })

      const percent = total ? Math.round((correct / total) * 100) : 0
      const tempsEcoule = 60 - this.remainingSeconds
      const quizId = this.$route.params.id

      const result = {
        total,
        correct,
        percent,
        temps_ecoule: tempsEcoule,
      }

      // TODO Laravel: enregistrer le score dans la DB
      // await api.post(`/quizzes/${quizId}/submit`, result)

      const key = `etudiant_quiz_result_${quizId}`
      sessionStorage.setItem(key, JSON.stringify(result))
      this.$router.push(`/etudiant/quiz/${quizId}/loading`)
    },
    goBack() {
      this.stopTimer()
      this.$router.push('/etudiant')
    },
  },
  mounted() {
    this.loadQuestions()
  },
  beforeUnmount() {
    this.stopTimer()
  },
}
</script>

<style scoped>
@import './EtudiantQuizPlayPage.css';
</style>
