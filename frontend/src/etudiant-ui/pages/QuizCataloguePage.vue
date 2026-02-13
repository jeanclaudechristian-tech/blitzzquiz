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
            {{ quiz.categorie }} • {{ quiz.nbQuestions }} questions •
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
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'QuizCataloguePage',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      search: '',
      selectedCategorie: this.$route.query.categorie || '',
      categories: ['Math', 'Français', 'Sciences', 'Histoire'],
      quizzes: []
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
    loadPublicQuizzes() {
      // TODO (Laravel) : remplacer la lecture locale par un appel API :
      // - GET /api/quizzes?visibility=public&search={term}&category={categorie}
      // - supprimer complètement l'utilisation de localStorage côté étudiant.
      const storageKey = 'enseignant_quizzes'
      try {
        const saved = localStorage.getItem(storageKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          this.quizzes = parsed.filter((q) => q.isPublic)
        }
      } catch {
        this.quizzes = []
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

