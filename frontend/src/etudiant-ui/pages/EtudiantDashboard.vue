<template>
  <div class="etudiant-page">
    <AppHeader />
    <main class="etudiant-main">

      <section class="etudiant-hero">
        <div class="etudiant-hero-left">
          <h1>Bienvenue {{ currentUser?.nickname ?? 'étudiant' }} !</h1>
          <p>Jouez à des quiz, révisez vos cours et progressez à votre rythme.</p>
          <div class="etudiant-hero-actions">
            <CallToActionBtn
              text="Jouer un quiz"
              variant="dark"
              @click="goToCatalogue"
            />
            <CallToActionBtn
              text="Rejoindre Quiz Privé"
              variant="dark"
              @click="goToPrivateQuiz"
            />
            <CallToActionBtn
              text="Rejoindre groupe"
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
        <div v-if="loadingQuizzes">Chargement...</div>
        <div v-else-if="suggestedQuizzes.length === 0">
          Aucune suggestion pour ton niveau pour le moment.
        </div>
        <div v-else class="public-quizzes-grid">
          <div
            v-for="quiz in suggestedQuizzes"
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

      <section class="etudiant-public-quizzes">
        <header class="suggestions-header">
          <h2>Quiz publics</h2>
        </header>

        <div class="suggestions-grid">
          <button
            type="button"
            class="category-pill"
            :class="{ active: selectedCategory === null }"
            @click="selectedCategory = null"
          >
            Tout afficher
          </button>
          <button
            v-for="cat in availableCategories"
            :key="cat"
            type="button"
            class="category-pill"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <div v-if="loadingQuizzes">Chargement des quiz...</div>
        <div v-else-if="errorQuizzes">{{ errorQuizzes }}</div>
        <div v-else-if="filteredPublicQuizzes.length === 0">
          Aucun quiz pour cette catégorie.
        </div>
        <div v-else class="public-quizzes-grid">
          <div
            v-for="quiz in filteredPublicQuizzes"
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
  components: { AppHeader, CallToActionBtn },
  data() {
    return {
      currentUser: null,  // ← ajoute ça
      publicQuizzes: [],
      suggestedQuizzes: [],
      selectedCategory: null,
      loadingQuizzes: false,
      errorQuizzes: ''
    }
  },
  computed: {
    availableCategories() {
      const cats = this.publicQuizzes
        .map(q => q.categorie)
        .filter(c => c && c.trim() !== '')
      return [...new Set(cats)]
    },
    filteredPublicQuizzes() {
      if (!this.selectedCategory) return this.publicQuizzes
      return this.publicQuizzes.filter(q => q.categorie === this.selectedCategory)
    }
  },
  async mounted() {
    try {
        const { data } = await api.get('/user')
        this.currentUser = data
    } catch (e) {
        console.error('Erreur user', e)
    }
    await this.loadPublicQuizzes()
  },
  methods: {
    goToCatalogue() {
      this.$router.push('/etudiant/catalogue')
    },
    goToPrivateQuiz() {
      this.$router.push('/etudiant/code')
    },
    goToJoinGroup() {
      this.$router.push('/etudiant/rejoindre-groupe')
    },
    goToCatalogueWithFilter(cat) {
      this.$router.push({ path: '/etudiant/catalogue', query: { categorie: cat } })
    },

    async loadPublicQuizzes() {
      this.loadingQuizzes = true
      this.errorQuizzes = ''
      try {
        const mapQuiz = q => ({
        id: q.id,
        titre: q.titre,
        categorie: q.category?.name ?? null,  // ← extrait juste le nom
        nbQuestions: q.questions_count ?? 0,
        isPublic: true,
        code: q.code_quiz,
        education_level: q.education_level ?? null
    })

        // Tous les quiz publics sans filtre niveau
        const { data: allData } = await api.get('/quizzes/public')
        this.publicQuizzes = allData.map(mapQuiz)

        // Suggestions : filtrées par niveau via index() existant
        const { data: suggestedData } = await api.get('/quizzes')
        this.suggestedQuizzes = suggestedData
          .filter(q => q.is_public == true || q.is_public == 1)
          .map(mapQuiz)

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