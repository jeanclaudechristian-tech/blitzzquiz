<template>
  <div class="loading-page">
    <AppHeader />
    <main class="loading-main">
      <section class="loading-card">
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

