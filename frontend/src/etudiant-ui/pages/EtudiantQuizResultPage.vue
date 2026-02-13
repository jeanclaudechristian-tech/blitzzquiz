<template>
  <div class="result-page">
    <AppHeader />
    <main class="result-main">
      <section class="result-card" v-if="result">
        <h1>Résultat du quiz</h1>
        <p class="score-main">{{ result.correct }} / {{ result.total }}</p>
        <p class="score-percent">{{ result.percent }} % de réussite</p>

        <p class="ranking-text">
          Classement estimé : top {{ rankingPercent }} %
        </p>

        <div class="result-actions">
          <CallToActionBtn
            text="Rejouer"
            variant="dark"
            @click="replay"
          />
          <CallToActionBtn
            text="Retour accueil"
            variant="blue"
            @click="goHome"
          />
          <button type="button" class="link-button" @click="seeHistory">
            Voir historique
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
  name: 'EtudiantQuizResultPage',
  components: {
    AppHeader,
    AppFooter,
    CallToActionBtn
  },
  data() {
    return {
      result: null
    }
  },
  computed: {
    rankingPercent() {
      // estimation simple pour l'instant ; à remplacer par un vrai classement côté backend.
      return Math.max(1, 100 - (this.result?.percent || 0))
    }
  },
  methods: {
    loadResult() {
      const key = `etudiant_quiz_result_${this.$route.params.id}`
      try {
        const saved = sessionStorage.getItem(key)
        if (saved) {
          this.result = JSON.parse(saved)
        }
      } catch {
        this.result = null
      }
      if (!this.result) {
        this.$router.push('/etudiant')
      }
    },
    replay() {
      this.$router.push(`/etudiant/quiz/${this.$route.params.id}/jouer`)
    },
    goHome() {
      this.$router.push('/etudiant')
    },
    seeHistory() {
      // TODO (Laravel) : GET /api/student/history pour afficher
      // la liste des tentatives et scores passés.
      console.log('Voir historique (à implémenter)')
    }
  },
  mounted() {
    this.loadResult()
  }
}
</script>

<style scoped>
@import './EtudiantQuizResultPage.css';
</style>

