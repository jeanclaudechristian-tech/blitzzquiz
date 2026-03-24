<template>
  <div class="preview-page">
    <AppHeader />
    <main class="preview-main" v-if="quizLoaded">
      <header class="preview-header">
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
               Ajouter des questions
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

            <div class="question-text fill-in-text" v-else>
              <template v-for="(part, pIndex) in getFillInParts(q)" :key="`${q.id || index}-part-${pIndex}`">
                <span v-if="part.type === 'text'">{{ part.value }}</span>
                <span v-else class="preview-blank-tag">{{ part.value }}</span>
              </template>
            </div>

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
                      {{ Array.isArray(blank?.accepted_answers) ? blank.accepted_answers.join(' / ') : '-' }}
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
               Modifier les questions
          </button>
          <button type="button" class="btn-primary" @click="goBack">
            Retour à la création
          </button>
        </div>
      </div>
    </main>

    <div v-else-if="loadError" class="loading-state">
      <div class="load-error-card">
        <h2>Chargement impossible</h2>
        <p>{{ loadError }}</p>
        <button type="button" class="btn-primary" @click="retryLoad">
          Réessayer
        </button>
      </div>
    </div>

    <div v-else class="loading-state">
      <div class="loading-skeleton" aria-busy="true" aria-live="polite">
        <div class="skeleton-header">
          <div class="skeleton-pill"></div>
          <div class="skeleton-title"></div>
        </div>
        <div class="skeleton-container">
          <div class="skeleton-card" v-for="n in 3" :key="n">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line"></div>
          </div>
        </div>
        <p>Chargement des questions...</p>
      </div>
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
      loadError: '',
      quizTitle: '',
      questions: [],
    }
  },
  methods: {
    normalizeQuestions(rawQuestions) {
      const list = Array.isArray(rawQuestions) ? rawQuestions.slice() : []
      return list.sort((a, b) => {
        const aPos = Number(a?.position ?? a?.order ?? a?.id ?? 0)
        const bPos = Number(b?.position ?? b?.order ?? b?.id ?? 0)
        return aPos - bPos
      })
    },
    async loadQuizData() {
      const quizId = this.$route.params.id
      if (!quizId) {
        alert('ID du quiz manquant.')
        this.$router.push('/enseignant')
        return
      }

      this.quizLoaded = false
      this.loadError = ''

      try {
        // Chargement parallèle pour réduire le temps d'attente
        const [{ data: quiz }, { data: questions }] = await Promise.all([
          api.get(`/quizzes/${quizId}`),
          api.get(`/quizzes/${quizId}/questions`),
        ])
        this.quizTitle = quiz?.titre || 'Quiz sans titre'
        this.questions = this.normalizeQuestions(questions)
        this.quizLoaded = true
      } catch (e) {
        console.error('Erreur chargement prévisualisation', e.response?.data || e)
        this.loadError = "Impossible de charger la prévisualisation pour le moment."
      }
    },
    retryLoad() {
      this.loadQuizData()
    },
    goBack() {
      this.$router.push('/enseignant')
    },
    goToAddQuestions() {
      this.$router.push(`/enseignant/quiz/${this.$route.params.id}/questions`)
    },
    getFillInParts(q) {
      const text = typeof q?.texte === 'string' ? q.texte : ''
      if (!text) return [{ type: 'text', value: '' }]

      const parts = []
      const regex = /\[\[(\d+)\]\]/g
      let lastIndex = 0
      let match = regex.exec(text)

      while (match) {
        if (match.index > lastIndex) {
          parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
        }
        parts.push({ type: 'blank', value: match[1] })
        lastIndex = regex.lastIndex
        match = regex.exec(text)
      }

      if (lastIndex < text.length) {
        parts.push({ type: 'text', value: text.slice(lastIndex) })
      }

      return parts
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
