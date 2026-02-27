<template>
  <div class="lobby-page">
    <AppHeader />

    <!-- Quand le quiz est chargé -->
    <main class="lobby-main" v-if="quiz">
      <section class="lobby-card">
        <button type="button" class="back-button" @click="goBack">
          ← Retour
        </button>
        <h1>{{ quiz.titre }}</h1>
        <p class="lobby-description">
          {{ quiz.description || 'Aucune description fournie.' }}
        </p>

        <ul class="lobby-meta">
          <li>
            <strong>Questions :</strong>
            {{ quiz.questions_count ?? quiz.nbQuestions }}
          </li>
          <li>
            <strong>Durée estimée :</strong>
            ~{{ estimatedDuration }} min
          </li>
          <li>
            <strong>Catégorie :</strong>
            {{ quiz.category || 'Non définie' }}
          </li>
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

    <!-- États chargement / erreur / introuvable -->
    <main class="lobby-main" v-else>
      <section class="lobby-card">
        <p v-if="loading">Chargement du quiz…</p>
        <p v-else-if="error" class="error">{{ error }}</p>
        <p v-else>Quiz introuvable.</p>
      </section>
    </main>
  </div>
</template>

<script>
import api from '../../api/Axios'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'EtudiantQuizLobbyPage',
  components: {
    AppHeader,
    CallToActionBtn,
  },
  data() {
    return {
      quiz: null,
      loading: false,
      error: '',
    }
  },
  computed: {
    estimatedDuration() {
      // estimation simple : 1 minute par 3 questions
      const q = this.quiz?.questions_count ?? this.quiz?.nbQuestions ?? 0
      return Math.max(1, Math.round(q / 3) || 1)
    },
  },
  methods: {
   async loadQuiz() {
  this.loading = true
  this.error = ''
  const id = this.$route.params.id

  try {
    const { data } = await api.get(`/quizzes/${id}`)
    this.quiz = data
  } catch (e) {
    console.error('Erreur chargement quiz', e.response?.data || e)
    this.error = e.response?.data?.error || "Erreur lors du chargement du quiz."
    this.quiz = null
  } finally {
    this.loading = false
  }

  if (!this.quiz) {
    this.$router.push('/etudiant/catalogue')
  }
},
startQuiz() {
  this.$router.push(`/etudiant/quiz/${this.$route.params.id}/jouer`)
},
goBack() {
  this.$router.push('/etudiant/catalogue')
}

  },
  mounted() {
    this.loadQuiz()
  },
}
</script>

<style scoped>
@import './EtudiantQuizLobbyPage.css';
</style>
