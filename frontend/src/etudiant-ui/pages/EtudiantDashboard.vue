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
            <button type="button" class="link-button" @click="goToEnterCode">
              Entrer un code
            </button>
          </div>
        </div>
        <div class="etudiant-hero-right">
          <div class="student-avatar">
            <span class="avatar-initials">ET</span>
          </div>
          <p class="avatar-label">Mon profil</p>
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
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'EtudiantDashboard',
  components: {
    AppHeader,
    AppFooter,
    CallToActionBtn
  },
  data() {
    return {
      categories: ['Math', 'Français', 'Sciences', 'Histoire'],
      publicQuizzes: [],      // utilisés dans le template
      loadingQuizzes: false,
      errorQuizzes: ''
    }
  },
  mounted() {
    this.loadPublicQuizzes()
  },
  methods: {
    goToCatalogue() {
      this.$router.push('/etudiant/catalogue')
    },
    goToEnterCode() {
      this.$router.push('/etudiant/code')
    },
    goToCatalogueWithFilter(cat) {
      this.$router.push({ path: '/etudiant/catalogue', query: { categorie: cat } })
    },

    loadPublicQuizzes() {
      this.loadingQuizzes = true
      this.errorQuizzes = ''
      const storageKey = 'enseignant_quizzes'

      try {
        const saved = localStorage.getItem(storageKey)
        if (!saved) {
          this.publicQuizzes = []
          return
        }

        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          // mêmes données que dans la page catalogue : garder les publics
          this.publicQuizzes = parsed.filter((q) => q.isPublic)
        } else {
          this.publicQuizzes = []
        }
      } catch (e) {
        console.error('Erreur lecture localStorage', e)
        this.publicQuizzes = []
        this.errorQuizzes = 'Impossible de charger les quiz publics.'
      } finally {
        this.loadingQuizzes = false
      }
    },

    openQuizFromDashboard(quiz) {
      this.$router.push(`/etudiant/quiz/${quiz.id}`)
    }
  }
}
</script>

<style scoped>
@import './EtudiantDashboard.css';
</style>

