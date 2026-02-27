<template>
  <div class="catalogue-page">
    <AppHeader />
    <main class="catalogue-main">
      <header class="catalogue-header">
        <div class="catalogue-search">
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher un quiz…"
          />
        </div>
        <div class="catalogue-filters">
          <select v-model="selectedCategorie">
            <option value="">Toutes les catégories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
          <button type="button" class="link-button" @click="goToEnterCode">
            Entrer un code
          </button>
        </div>
      </header>

      <section class="catalogue-grid" v-if="filteredQuizzes.length">
        <article
          v-for="quiz in filteredQuizzes"
          :key="quiz.id"
          class="catalogue-card"
        >
          <h3 class="quiz-title">{{ quiz.titre }}</h3>
          <p class="quiz-meta">
            {{ quiz.categorie || 'Non définie' }} • {{ quiz.nbQuestions }} questions •
            <span :class="['pill', quiz.isPublic ? 'pill--public' : 'pill--private']">
              {{ quiz.isPublic ? 'Public' : 'Privé' }}
            </span>
          </p>
          <button
            type="button"
            class="see-button"
            @click="openQuiz(quiz)"
          >
            Voir
          </button>
        </article>
      </section>

      <p v-else class="catalogue-empty">
        Aucun quiz trouvé pour cette recherche.
      </p>
    </main>
  </div>
</template>

<script>
import api from '../../api/Axios'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

export default {
  name: 'QuizCataloguePage',
  components: {
    AppHeader
  },
  data() {
    return {
      search: '',
      selectedCategorie: this.$route.query.categorie || '',
      categories: ['Math', 'Français', 'Sciences', 'Histoire'],
      quizzes: [],
      error: '',
      loading: false,
    }
  },
  computed: {
    filteredQuizzes() {
      const term = this.search.trim().toLowerCase()
      return this.quizzes.filter((q) => {
        const matchSearch =
          !term ||
          q.titre.toLowerCase().includes(term) ||
          (q.categorie || '').toLowerCase().includes(term)
        const matchCat =
          !this.selectedCategorie || q.categorie === this.selectedCategorie
        return matchSearch && matchCat
      })
    }
  },
  methods: {
    goToEnterCode() {
      this.$router.push('/etudiant/code')
    },
    async loadPublicQuizzes() {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.get('/quizzes')
        // Normalisation des champs venant de l’API Laravel
        this.quizzes = data.map(q => ({
          id: q.id,
          titre: q.titre,
          categorie: q.category,                 // mapping category -> categorie
          nbQuestions: q.questions_count ?? 0,
          isPublic: !!q.is_public,               // mapping is_public -> isPublic
        }))
      } catch (e) {
        console.error('Erreur chargement quiz étudiant', e.response?.data || e)
        this.error = "Erreur lors du chargement des quiz."
        this.quizzes = []
      } finally {
        this.loading = false
      }
    },
    openQuiz(quiz) {
      this.$router.push(`/etudiant/quiz/${quiz.id}`)
    }
  },
  mounted() {
    this.loadPublicQuizzes()
  }
}
</script>

<style scoped>
@import './QuizCataloguePage.css';
</style>
