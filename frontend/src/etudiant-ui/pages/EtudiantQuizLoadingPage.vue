<template>
  <div class="loading-page">
    <AppHeader />
    <main class="loading-main">
      <section class="loading-card">
        <button type="button" class="back-button" @click="goBack">
          ← Retour
        </button>
        <div class="spinner"></div>
        <p>Calcul du score…</p>
      </section>
    </main>
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

export default {
  name: 'EtudiantQuizLoadingPage',
  components: {
    AppHeader
  },
  methods: {
    goBack() {
      this.$router.push('/etudiant')
    }
  },
  mounted() {
    // Simule un calcul de score avant d'afficher le résultat.
    setTimeout(() => {
      this.$router.push(`/etudiant/quiz/${this.$route.params.id}/resultat`)
    }, 1500)
  }
}
</script>

<style scoped>
@import './EtudiantQuizLoadingPage.css';
</style>

