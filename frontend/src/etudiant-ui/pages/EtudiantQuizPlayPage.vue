<template>
  <div class="play-page">
    <AppHeader />
    <main class="play-main" v-if="quizLoaded && questions.length">
      <section class="play-card">
        <header class="play-header">
          <div class="progress-info">
            <span>Question {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>
          <div class="timer">
            ⏱️ {{ remainingSeconds }}s
          </div>
        </header>

        <section class="play-body">
          <h1 class="question-text">{{ currentQuestion.texte }}</h1>

          <div class="choices-grid">
            <button
              v-for="opt in ['A','B','C','D']"
              :key="opt"
              type="button"
              :class="[
                'choice-btn',
                { selected: selectedChoice === opt, correct: showFeedback && opt === currentQuestion.bonneReponse,
                  wrong: showFeedback && selectedChoice === opt && opt !== currentQuestion.bonneReponse }
              ]"
              @click="selectChoice(opt)"
            >
              <span class="choice-label">{{ opt }}</span>
              <span class="choice-text">{{ choiceText(opt) }}</span>
            </button>
          </div>
        </section>

        <footer class="play-footer">
          <CallToActionBtn
            text="Suivant"
            variant="blue"
            :class="{ disabled: !selectedChoice }"
            @click="nextQuestion"
          />
        </footer>
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
  name: 'EtudiantQuizPlayPage',
  components: {
    AppHeader,
    AppFooter,
    CallToActionBtn
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
      answers: []
    }
  },
  computed: {
    storageKey() {
      const id = this.$route.params.id
      return `enseignant_quiz_questions_${id}`
    },
    currentQuestion() {
      return this.questions[this.currentIndex] || {}
    },
    progressPercent() {
      if (!this.questions.length) return 0
      return ((this.currentIndex) / this.questions.length) * 100
    }
  },
  methods: {
    loadQuestions() {
      try {
        const saved = localStorage.getItem(this.storageKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) this.questions = parsed
      } catch {
        this.questions = []
      }
      if (!this.questions.length) {
        this.$router.push('/etudiant')
      } else {
        this.quizLoaded = true
      }
    },
    startTimer() {
      // TODO (Laravel) : durée réelle du quiz à récupérer côté backend.
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
      return q[`choix${opt}`] || ''
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
    finishQuiz() {
      this.stopTimer()
      const total = this.questions.length
      let correct = 0
      this.questions.forEach((q, idx) => {
        if (this.answers[idx] && this.answers[idx] === q.bonneReponse) correct += 1
      })
      const result = {
        total,
        correct,
        percent: total ? Math.round((correct / total) * 100) : 0
      }
      const key = `etudiant_quiz_result_${this.$route.params.id}`
      sessionStorage.setItem(key, JSON.stringify(result))
      this.$router.push(`/etudiant/quiz/${this.$route.params.id}/loading`)
    },
    goBack() {
      this.stopTimer()
      this.$router.push('/etudiant')
    }
  },
  mounted() {
    this.loadQuestions()
    if (this.questions.length) {
      this.startTimer()
    }
  },
  beforeUnmount() {
    this.stopTimer()
  }
}
</script>

<style scoped>
@import './EtudiantQuizPlayPage.css';
</style>

