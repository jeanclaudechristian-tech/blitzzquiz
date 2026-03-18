<template>
  <div class="play-page">
    <AppHeader />

    <main class="play-main" v-if="quizLoaded && questions.length">
      <section class="play-card">
        <button type="button" class="back-button" @click="goBack">← Abandonner</button>

        <header class="play-header">
          <div class="progress-info">
            <span>Question {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>
          <div class="timer">{{ remainingSeconds }}s</div>
        </header>

        <div style="color: red; font-size: 12px;">DEBUG: Current Type is [{{ currentQuestion.type }}]</div>

        <section class="play-body">
          <template v-if="currentQuestion.type === 'FILL_IN'">
            <div
                class="fill-in-render"
                v-html="formattedFillInText"
                @input="handleFillInInput"
            ></div>
          </template>

          <template v-else>
            <h1 class="question-text">{{ currentQuestion.texte }}</h1>
            <div class="choices-grid">
              <button
                  v-for="opt in ['A','B','C','D']"
                  :key="opt"
                  type="button"
                  :disabled="!choiceText(opt) || lockedChoice || finishing"
                  :class="['choice-btn', getChoiceClass(opt)]"
                  @click="selectChoice(opt)"
              >
                <span class="choice-label">{{ opt }}</span>
                <span class="choice-text">{{ choiceText(opt) }}</span>
              </button>
            </div>
          </template>
        </section>

        <footer class="play-footer">
          <CallToActionBtn
              :text="inReview ? 'Continuer' : 'Valider la réponse'"
              variant="blue"
              :class="{ disabled: !canContinue || finishing }"
              @click="nextQuestion"
          />
        </footer>
      </section>
    </main>

    <main v-else class="play-main">
      <section class="play-card">
        <p v-if="loading">Chargement des questions…</p>
        <p v-else-if="error" class="error">{{ error }}</p>
        <p v-else>Aucune question disponible.</p>
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
  components: { AppHeader, CallToActionBtn },
  data() {
    return {
      quizLoaded: false,
      questions: [],
      currentIndex: 0,
      selectedChoice: '', // 用于 QCM/TF
      fillInValues: {},   // 用于存储当前题目的填空值 {1: "xxx", 2: "yyy"}
      lockedChoice: false,
      showFeedback: false,
      inReview: false,
      remainingSeconds: 60,
      timerId: null,
      allAnswers: [],     // 存储所有题目的答案（混合格式）
      loading: false,
      error: '',
      finishing: false
    }
  },
  computed: {
    currentQuestion() { return this.questions[this.currentIndex] || {} },
    progressPercent() { return (this.currentIndex / this.questions.length) * 100 },

    // 核心：将文本占位符替换为 Input
    formattedFillInText() {
      if (this.currentQuestion.type !== 'FILL_IN') return ''
      return this.currentQuestion.texte.replace(/\[\[(\d+)\]\]/g, (match, num) => {
        const val = this.fillInValues[num] || ''
        const isLocked = this.lockedChoice ? 'readonly' : ''
        // 根据反馈状态添加正确/错误样式
        return `<input type="text" class="play-fill-input" data-idx="${num}" value="${val}" ${isLocked} placeholder="..." />`
      })
    },

    canContinue() {
      if (this.inReview) return true
      if (this.currentQuestion.type === 'FILL_IN') {
        // 填空题至少填了一个空才允许点击提交
        return Object.values(this.fillInValues).some(v => v.trim() !== '')
      }
      return !!this.selectedChoice
    }
  },
  methods: {
    handleFillInInput(e) {
      const idx = e.target.dataset.idx
      if (idx) {
        this.fillInValues[idx] = e.target.value
      }
    },

    selectChoice(opt) {
      if (this.lockedChoice || this.finishing) return
      this.selectedChoice = opt
    },

    choiceText(opt) {
      return this.currentQuestion.metadata?.[`choix${opt}`] || (this.currentQuestion.type === 'TF' ? (opt === 'A' ? 'Vrai' : opt === 'B' ? 'Faux' : '') : '')
    },

    getChoiceClass(opt) {
      if (!this.showFeedback) return { selected: this.selectedChoice === opt }
      const correct = this.currentQuestion.metadata?.bonneReponse
      return {
        correct: opt === correct,
        wrong: this.selectedChoice === opt && opt !== correct
      }
    },

    nextQuestion() {
      if (!this.canContinue || this.finishing) return

      if (!this.inReview) {
        // 保存当前题目的所有输入
        this.allAnswers[this.currentIndex] = this.currentQuestion.type === 'FILL_IN'
            ? { ...this.fillInValues }
            : this.selectedChoice

        this.lockedChoice = true
        this.showFeedback = true
        this.inReview = true
        return
      }

      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
        this.selectedChoice = ''
        this.fillInValues = {}
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

      let totalPoints = 0

      this.questions.forEach((q, idx) => {
        const userAnswer = this.allAnswers[idx]
        if (!userAnswer) return

        if (q.type === 'FILL_IN') {
          // 填空题平分逻辑
          const blanks = q.metadata.blanks || []
          const numBlanks = blanks.length
          if (numBlanks === 0) return

          let correctInThisQuestion = 0
          blanks.forEach((blank, bIdx) => {
            const studentInput = (userAnswer[bIdx + 1] || '').trim().toLowerCase()
            const accepted = (blank.accepted_answers || []).map(a => a.toLowerCase())
            if (accepted.includes(studentInput)) {
              correctInThisQuestion++
            }
          })
          // 平分这一分：正确数 / 总空数
          totalPoints += (correctInThisQuestion / numBlanks)
        } else {
          // QCM/TF 逻辑
          if (userAnswer === q.metadata?.bonneReponse) {
            totalPoints += 1
          }
        }
      })

      const percent = Math.round((totalPoints / this.questions.length) * 100)

      try {
        await api.post(`/quizzes/${this.$route.params.id}/results`, { score: percent })
      } catch (e) {
        console.error(e)
      }

      sessionStorage.setItem(`etudiant_quiz_result_${this.$route.params.id}`, JSON.stringify({
        total: this.questions.length,
        correct: totalPoints.toFixed(1), // 保留一位小数显示
        percent
      }))
      this.$router.push(`/etudiant/quiz/${this.$route.params.id}/loading`)
    },

    async loadQuestions() {
      this.loading = true
      try {
        const { data } = await api.get(`/quizzes/${this.$route.params.id}/questions`)
        this.questions = data
        this.quizLoaded = true
        this.startTimer()
      } catch (e) { this.error = "Erreur chargement" }
      finally { this.loading = false }
    },

    startTimer() {
      this.timerId = setInterval(() => {
        if (this.remainingSeconds > 0) this.remainingSeconds--
        else this.finishQuiz()
      }, 1000)
    },

    stopTimer() { clearInterval(this.timerId) },
    goBack() { this.$router.push('/etudiant') }
  },
  mounted() { this.loadQuestions() },
  beforeUnmount() { this.stopTimer() }
}
</script>

<style scoped>
/* 关键样式：确保填空框融入文本 */
:deep(.play-fill-input) {
  display: inline-block;
  border: none;
  border-bottom: 2px solid #269aff;
  background: #f0f8ff;
  padding: 2px 8px;
  margin: 0 4px;
  border-radius: 4px;
  width: 100px;
  font-weight: bold;
  color: #269aff;
  outline: none;
}

:deep(.play-fill-input[readonly]) {
  background: #f0f0f0;
  border-bottom-color: #ccc;
  cursor: not-allowed;
}
</style>

<style scoped>
@import './EtudiantQuizPlayPage.css';
</style>
