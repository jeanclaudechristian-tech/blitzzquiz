<template>
  <div class="result-page">
    <AppHeader />
    <main class="result-main">
      <section class="result-card" v-if="result">
        <div class="result-icon">🎉</div>
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
          
          <div class="secondary-actions">
            <button type="button" class="secondary-btn" @click="seeHistory">
              <span class="btn-icon">📜</span>
              <span class="btn-text">Historique</span>
            </button>
            <button type="button" class="secondary-btn" @click="seeLeaderboard">
              <span class="btn-icon">🏆</span>
              <span class="btn-text">Classement</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'EtudiantQuizResultPage',
  components: {
    AppHeader,
    CallToActionBtn
  },
  data() {
    return {
      result: null
    }
  },
  computed: {
    rankingPercent() {
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
      this.$router.push('/historique')
    },
    seeLeaderboard() {
      this.$router.push(`/classement?quiz=${this.$route.params.id}`)
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
