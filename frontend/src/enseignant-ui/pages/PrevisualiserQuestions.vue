<template>
  <div class="preview-page">
    <AppHeader />
    <main class="preview-main" v-if="quizLoaded">
      <header class="preview-header">
        <button type="button" class="back-button" @click="goBack">
          ← Retour à la création
        </button>
        <h1>{{ quizTitle }}</h1>
      </header>

      <div class="preview-container">
        <div v-if="questions.length === 0" class="no-questions">
          <p>Aucune question n'a encore été créée pour ce quiz.</p>
          <button
            type="button"
            class="btn-primary"
            @click="goToAddQuestions"
          >
            ➕ Ajouter des questions
          </button>
        </div>

        <div v-else class="questions-list">
          <div
            v-for="(q, index) in questions"
            :key="q.id || index"
            class="question-preview-card"
          >
            <div class="question-title-preview">
              APERÇU
            </div>

            <div class="question-text" v-if="q.type !== 'FILL_IN'">
              {{ q.texte }}
            </div>

            <div class="question-text fill-in-text" v-else v-html="renderFillInText(q)"></div>

            <div class="choices-preview">
              <template v-if="q.type === 'QCM'">
                <div
                    v-for="choice in ['A', 'B', 'C', 'D']"
                    :key="choice"
                    class="choice-preview"
                    :class="{ 'correct-choice': q.metadata?.bonneReponse === choice }"
                >
                  <span class="choice-letter">{{ choice }}.</span>
                  <span class="choice-text">{{ q.metadata?.[`choix${choice}`] }}</span>
                </div>
              </template>

              <template v-else-if="q.type === 'TF'">
                <div class="choice-preview" :class="{ 'correct-choice': q.metadata?.bonneReponse === 'A' }">
                  <span class="choice-letter">Vrai</span>
                </div>
                <div class="choice-preview" :class="{ 'correct-choice': q.metadata?.bonneReponse === 'B' }">
                  <span class="choice-letter">Faux</span>
                </div>
              </template>

              <template v-else-if="q.type === 'FILL_IN'">
                <div class="fill-in-answers-list">
                  <div v-for="(blank, bIndex) in q.metadata?.blanks" :key="bIndex" class="fill-in-answer-item">
                    <span class="answer-num">#{{ bIndex + 1 }}</span>
                    <span class="answer-tags">
                      {{ blank.accepted_answers.join(' / ') }}
                    </span>
                  </div>
                </div>
              </template>
            </div>

            <div v-if="q.explanation" class="explanation-preview">
              <strong>💡 Explication :</strong>
              <p>{{ q.explanation }}</p>
            </div>
          </div>
        </div>

        <div v-if="questions.length > 0" class="preview-footer">
          <button
            type="button"
            class="btn-secondary"
            @click="goToAddQuestions"
          >
            ✏️ Modifier les questions
          </button>
          <button type="button" class="btn-primary" @click="goBack">
            Retour à la création
          </button>
        </div>
      </div>
    </main>

    <div v-else class="loading-state">
      <p>Chargement des questions...</p>
    </div>
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import api from '../../api/Axios'

export default {
  name: 'PrevisualiserQuestions',
  components: {
    AppHeader,
  },
  data() {
    return {
      quizLoaded: false,
      quizTitle: '',
      questions: [],
    }
  },
  methods: {
    async loadQuizData() {
      const quizId = this.$route.params.id
      if (!quizId) {
        alert('ID du quiz manquant.')
        this.$router.push('/enseignant')
        return
      }

      try {
        // Titre du quiz
        const { data: quiz } = await api.get(`/quizzes/${quizId}`)
        this.quizTitle = quiz.titre || 'Quiz sans titre'

        // Questions du quiz
        const { data: questions } = await api.get(
          `/quizzes/${quizId}/questions`,
        )
        this.questions = Array.isArray(questions) ? questions : []
      } catch (e) {
        console.error('Erreur chargement prévisualisation', e.response?.data || e)
        this.questions = []
      }

      this.quizLoaded = true
    },
    goBack() {
      this.$router.push('/enseignant')
    },
    goToAddQuestions() {
      this.$router.push(`/enseignant/quiz/${this.$route.params.id}/questions`)
    },
    renderFillInText(q) {
      if (!q.texte) return '';
      // 将 [[1]] 替换为带编号的蓝色小方块占位符
      return q.texte.replace(/\[\[(\d+)\]\]/g, (match, number) => {
        return `<span class="preview-blank-tag">${number}</span>`;
      });
    },
  },
  mounted() {
    this.loadQuizData()
  },
}
</script>

<style scoped>
@import './PrevisualiserQuestions.css';
</style>
