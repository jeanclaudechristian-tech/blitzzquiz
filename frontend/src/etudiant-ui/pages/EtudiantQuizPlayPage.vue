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
            {{ remainingSeconds }}s
          </div>
        </header>

        <section class="play-body">
          <h1 class="question-text">
            {{ currentQuestion.texte || 'Question introuvable' }}
          </h1>

          <div class="choices-grid">
            <button
              v-for="opt in ['A','B','C','D']"
              :key="opt"
              type="button"
              :disabled="!choiceText(opt) || lockedChoice || finishing"
              :class="[
                'choice-btn',
                {
                  selected: selectedChoice === opt,
                  correct:
                    showFeedback &&
                    currentQuestion.metadata &&
                    opt === currentQuestion.metadata.bonneReponse,
                  wrong:
                    showFeedback &&
                    currentQuestion.metadata &&
                    selectedChoice === opt &&
                    opt !== currentQuestion.metadata.bonneReponse,
                },
              ]"
              @click="selectChoice(opt)"
            >
              <span class="choice-label">{{ opt }}</span>
              <span class="choice-text">
                {{ choiceText(opt) || '(aucun texte)' }}
              </span>
            </button>
          </div>
        </section>

        <footer class="play-footer">
          <CallToActionBtn
            :text="inReview ? 'Continuer' : 'Valider la réponse'"
            variant="blue"
            :class="{
              disabled: (!selectedChoice && !inReview) || finishing,
            }"
            @click="nextQuestion"
          />
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
      lockedChoice: false,
      showFeedback: false,
      inReview: false,
      remainingSeconds: 60,
      timerId: null,
      answers: [],
      loading: false,
      error: '',
      finishing: false, // <--- nouveau flag
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
      if (!q || !q.metadata) return ''
      return q.metadata[`choix${opt}`] || ''
    },
    selectChoice(opt) {
      if (!this.choiceText(opt)) return
      if (this.lockedChoice || this.finishing) return
      this.selectedChoice = opt
    },
    nextQuestion() {
      if (this.finishing) return

      // rien choisi et pas en review → on ne fait rien
      if (!this.selectedChoice && !this.inReview) return

      // 1er clic après le choix → verrouiller la réponse + montrer le feedback
      if (!this.inReview) {
        this.answers[this.currentIndex] = this.selectedChoice
        this.lockedChoice = true
        this.showFeedback = true
        this.inReview = true
        return
      }

      // 2e clic → question suivante ou fin
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex += 1
        this.selectedChoice = ''
        this.lockedChoice = false
        this.showFeedback = false
        this.inReview = false
      } else {
        this.finishQuiz()
      }
    },
    async finishQuiz() {
      if (this.finishing) return
      this.finishing = true

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

      try {
        await api.post(`/quizzes/${quizId}/results`, {
          score: percent,
        })
      } catch (e) {
        console.error('Erreur enregistrement résultat', e.response?.data || e)
      }

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
