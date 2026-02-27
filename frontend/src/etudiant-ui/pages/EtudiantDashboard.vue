<template>
  <div class="etudiant-page">
    <AppHeader />
    <main class="etudiant-main">
      <section class="etudiant-hero">
        <div class="etudiant-hero-left">
          <h1>Bienvenue dans l'espace étudiant</h1>
          <p>
            Jouez à des quiz, révisez vos cours et progressez à votre rythme.
          </p>
          <div class="etudiant-hero-actions">
            <CallToActionBtn
              text="Jouer un quiz"
              variant="dark"
              @click="goToCatalogue"
            />
            <CallToActionBtn
              text="Rejoindre un groupe"
              variant="dark"
              @click="goToJoinGroup"
            />
          </div>
        </div>
      </section>

      <section class="etudiant-suggestions">
        <header class="suggestions-header">
          <h2>Suggestions</h2>
        </header>
        <div class="suggestions-grid">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            class="category-pill"
            @click="goToCatalogueWithFilter(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </section>
          
  <section class="etudiant-public-quizzes">
  <header class="suggestions-header">
    <h2>Quiz publics</h2>
  </header>

  <div v-if="loadingQuizzes">Chargement des quiz...</div>
  <div v-else-if="publicQuizzes.length === 0 && !errorQuizzes">
    Aucun quiz public pour le moment.
  </div>
  <div v-else-if="errorQuizzes">
    {{ errorQuizzes }}
  </div>
  <div v-else class="public-quizzes-grid">
    <div
      v-for="quiz in publicQuizzes"
      :key="quiz.id"
      class="public-quiz-card"
    >
      <h3>{{ quiz.titre }}</h3>
      <p>{{ quiz.categorie }}</p>
      <p>{{ quiz.nbQuestions }} questions</p>
      <button @click="openQuizFromDashboard(quiz)">Jouer</button>
    </div>
  </div>
</section>
    </main>
  </div>
</template>
<script>
import api from '../../api/Axios'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'EtudiantDashboard',
  components: {
    AppHeader,
    CallToActionBtn
  },
  data() {
    return {
      categories: ['Math', 'Français', 'Sciences', 'Histoire'],
      publicQuizzes: [],
      loadingQuizzes: false,
      errorQuizzes: ''
    }
  },
  async mounted() {
    await this.loadPublicQuizzes()
  },
  methods: {
    goToCatalogue() {
      this.$router.push('/etudiant/catalogue')
    },
    goToJoinGroup() {
      this.$router.push('/etudiant/code')
    },
    goToCatalogueWithFilter(cat) {
      this.$router.push({ path: '/etudiant/catalogue', query: { categorie: cat } })
    },

    async loadPublicQuizzes() {
      this.loadingQuizzes = true
      this.errorQuizzes = ''
      try {
        const { data } = await api.get('/quizzes')
        console.log('Dashboard /quizzes =>', data)

        this.publicQuizzes = data
          .filter(q => q.is_public == true || q.is_public == 1)
          .map(q => ({
            id: q.id,
            titre: q.titre,
            categorie: q.category,
            nbQuestions: q.questions_count ?? 0,
            isPublic: q.is_public ? true : false,
            code: q.code_quiz
          }))
      } catch (e) {
        console.error('Erreur /quizzes dashboard', e.response?.data || e)
        this.errorQuizzes = 'Impossible de charger les quiz publics.'
      } finally {
        this.loadingQuizzes = false
      }
    },

    async openQuizFromDashboard(quiz) {
  this.$router.push(`/etudiant/quiz/${quiz.id}`)
}

  }
}
</script>

<style scoped>
@import './EtudiantDashboard.css';
</style>

