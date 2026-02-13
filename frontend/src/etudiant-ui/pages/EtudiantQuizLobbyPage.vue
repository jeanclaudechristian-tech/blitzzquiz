<template>
  <div class="lobby-page">
    <AppHeader />
    <main class="lobby-main" v-if="quiz">
      <section class="lobby-card">
        <h1>{{ quiz.titre }}</h1>
        <p class="lobby-description">{{ quiz.description || 'Aucune description fournie.' }}</p>

        <ul class="lobby-meta">
          <li><strong>Questions :</strong> {{ quiz.nbQuestions }}</li>
          <li><strong>Durée estimée :</strong> ~{{ estimatedDuration }} min</li>
          <li><strong>Catégorie :</strong> {{ quiz.categorie || 'Non définie' }}</li>
        </ul>

        <div class="lobby-rules">
          <p class="rules-title">Règles rapides</p>
          <ul>
            <li>1 tentative</li>
            <li>Temps limité</li>
            <li>Score calculé automatiquement</li>
          </ul>
        </div>

        <div class="lobby-actions">
          <CallToActionBtn
            text="Commencer"
            variant="dark"
            @click="startQuiz"
          />
        </div>
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
  name: 'EtudiantQuizLobbyPage',
  components: {
    AppHeader,
    AppFooter,
    CallToActionBtn
  },
  data() {
    return {
      quiz: null
    }
  },
  computed: {
    estimatedDuration() {
      // estimation simple : 1 minute par 3 questions
      const q = this.quiz?.nbQuestions || 0
      return Math.max(1, Math.round(q / 3) || 1)
    }
  },
  methods: {
    loadQuiz() {
      // TODO (Laravel) : remplacer cette lecture par GET /api/quizzes/{id}
      const storageKey = 'enseignant_quizzes'
      const id = Number(this.$route.params.id)
      try {
        const saved = localStorage.getItem(storageKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          this.quiz = parsed.find((q) => q.id === id && q.isPublic)
        }
      } catch {
        this.quiz = null
      }
      if (!this.quiz) {
        this.$router.push('/etudiant/catalogue')
      }
    },
    startQuiz() {
      this.$router.push(`/etudiant/quiz/${this.$route.params.id}/jouer`)
    }
  },
  mounted() {
    this.loadQuiz()
  }
}
</script>

<style scoped>
@import './EtudiantQuizLobbyPage.css';
</style>

