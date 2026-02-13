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
      categories: ['Math', 'Français', 'Sciences', 'Histoire']
    }
  },
  methods: {
    goToCatalogue() {
      this.$router.push('/etudiant/catalogue')
    },
    goToEnterCode() {
      this.$router.push('/etudiant/code')
    },
    goToCatalogueWithFilter(cat) {
      // TODO (Laravel) : plus tard, charger les suggestions et les quiz filtrés
      // via GET /api/quizzes?visibility=public&category={cat}
      // et éventuellement GET /api/student/profile pour personnaliser les catégories.
      this.$router.push({ path: '/etudiant/catalogue', query: { categorie: cat } })
    }
  }
}
</script>

<style scoped>
@import './EtudiantDashboard.css';
</style>

