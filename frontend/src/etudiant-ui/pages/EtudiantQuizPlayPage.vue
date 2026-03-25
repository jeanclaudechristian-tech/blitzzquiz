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

          <div v-if="showFeedback" class="answer-explanation">
            <p class="answer-explanation-title">Explication</p>
            <p class="answer-explanation-text">{{ explanationText(currentQuestion) }}</p>
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
      answers: [],
      startedAtMs: null,
      loading: false,
      error: '',
      finishing: false,
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
        this.startedAtMs = Date.now()
      }
    },
    choiceText(opt) {
      const q = this.currentQuestion
      if (!q || !q.metadata) return ''
      return q.metadata[`choix${opt}`] || ''
    },
    explanationText(question) {
      return (
        question?.explanation ||
        question?.explication ||
        question?.metadata?.explication ||
        question?.metadata?.explanation ||
        'Aucune explication fournie.'
      )
    },
    selectChoice(opt) {
      if (!this.choiceText(opt)) return
      if (this.lockedChoice || this.finishing) return
      this.selectedChoice = opt
    },
    nextQuestion() {
      if (this.finishing) return

      if (!this.selectedChoice && !this.inReview) return

      if (!this.inReview) {
        this.answers[this.currentIndex] = this.selectedChoice
        this.lockedChoice = true
        this.showFeedback = true
        this.inReview = true
        return
      }

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

      const total = this.questions.length
      let correct = 0

      this.questions.forEach((q, idx) => {
        const bonne = q.metadata?.bonneReponse
        if (this.answers[idx] && this.answers[idx] === bonne) {
          correct += 1
        }
      })

      const percent = total ? Math.round((correct / total) * 100) : 0
      const durationSeconds = Number.isFinite(this.startedAtMs)
        ? Math.max(0, Math.round((Date.now() - this.startedAtMs) / 1000))
        : null
      const quizId = this.$route.params.id

      const result = {
        total,
        correct,
        percent,
        durationSeconds,
      }

      try {
        const payload = { score: percent }
        if (durationSeconds !== null) payload.duration_seconds = durationSeconds
        await api.post(`/quizzes/${quizId}/results`, payload)
      } catch (e) {
        console.error('Erreur enregistrement résultat', e.response?.data || e)
      }

      const key = `etudiant_quiz_result_${quizId}`
      sessionStorage.setItem(key, JSON.stringify(result))

      this.$router.push(`/etudiant/quiz/${quizId}/loading`)
    },
    goBack() {
      this.$router.push('/etudiant')
    },
  },
  mounted() {
    this.loadQuestions()
  },
}
</script>

<style scoped>
@import './EtudiantQuizPlayPage.css';
</style>
