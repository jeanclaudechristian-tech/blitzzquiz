<template>
  <div class="leaderboard-page">
    <AppHeader />
    <main class="leaderboard-main">
      <!-- Header -->
      <header class="leaderboard-header">
        <h1>🏆 Classement</h1>
        <p class="subtitle">Meilleurs scores du quiz</p>
      </header>

      <!-- Sélection du quiz -->
      <div class="quiz-selector">
        <label for="quiz-select">Choisir un quiz :</label>
        <select id="quiz-select" v-model="selectedQuizId" @change="loadLeaderboard">
          <option value="">-- Sélectionner un quiz --</option>
          <option
            v-for="quiz in availableQuizzes"
            :key="quiz.id"
            :value="quiz.id"
          >
            {{ quiz.titre }}
          </option>
        </select>
      </div>

      <!-- Leaderboard Content -->
      <div v-if="selectedQuizId && leaderboard.length" class="leaderboard-content">
        <!-- Top 5 joueurs -->
        <section class="top-players-section">
          <h2>🥇 Top 5 Joueurs</h2>
          <div class="players-list">
            <div
              v-for="(player, index) in topPlayers"
              :key="player.id"
              :class="['player-card', `rank-${index + 1}`]"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="player-rank">
                <span class="rank-badge">{{ index + 1 }}</span>
                <span class="rank-medal">{{ getRankMedal(index + 1) }}</span>
              </div>
              <div class="player-info">
                <h3 class="player-name">{{ player.nom }}</h3>
                <p class="player-date">{{ formatDate(player.date) }}</p>
              </div>
              <div class="player-score">
                <span class="score-value">{{ player.score }}</span>
                <span class="score-label">pts</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Position de l'utilisateur -->
        <section v-if="userPosition" class="user-position-section">
          <h2>📍 Ma Position</h2>
          <div class="user-position-card" :class="{ 'in-top5': userPosition.rank <= 5 }">
            <div class="user-rank">
              <span class="rank-badge">{{ userPosition.rank }}</span>
            </div>
            <div class="user-info">
              <h3 class="user-name">{{ userPosition.nom }} <span class="you-badge">(Vous)</span></h3>
              <p class="user-date">{{ formatDate(userPosition.date) }}</p>
            </div>
            <div class="user-score">
              <span class="score-value">{{ userPosition.score }}</span>
              <span class="score-label">pts</span>
            </div>
          </div>
          <p v-if="userPosition.rank > 5" class="rank-message">
            💪 Plus que {{ userPosition.rank - 5 }} place(s) pour atteindre le top 5 !
          </p>
          <p v-else class="rank-message celebration">
            🎉 Félicitations ! Vous êtes dans le top 5 !
          </p>
        </section>

        <!-- Si l'utilisateur n'a pas joué -->
        <section v-else class="no-user-score">
          <div class="empty-icon">🎯</div>
          <p>Vous n'avez pas encore joué à ce quiz.</p>
          <button type="button" class="play-now-btn" @click="goToQuizCatalogue">
            Jouer maintenant
          </button>
        </section>
      </div>

      <!-- États vides -->
      <div v-else-if="selectedQuizId && !leaderboard.length" class="empty-state">
        <div class="empty-icon">📊</div>
        <p>Aucun score enregistré pour ce quiz.</p>
        <p class="empty-subtitle">Soyez le premier à relever le défi !</p>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🎮</div>
        <p>Sélectionnez un quiz pour voir le classement</p>
      </div>
    </main>
    <AppFooter class="compact-footer" />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'LeaderboardPage',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      availableQuizzes: [],
      selectedQuizId: '',
      leaderboard: [],
      userPosition: null
    }
  },
  computed: {
    topPlayers() {
      return this.leaderboard.slice(0, 5)
    }
  },
  methods: {
    loadAvailableQuizzes() {
      // TODO (Laravel) : GET /api/quizzes?visibility=public
      const storageKey = 'enseignant_quizzes'
      try {
        const saved = localStorage.getItem(storageKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          this.availableQuizzes = parsed.filter((q) => q.isPublic)
        }
      } catch {
        this.availableQuizzes = []
      }
    },
    loadLeaderboard() {
      if (!this.selectedQuizId) return

      // TODO (Laravel) : GET /api/leaderboard/{quizId}
      // Retour attendu : { leaderboard: [...], userPosition: {...} }
      
      // Données fictives pour la démo
      const fakeLeaderboard = [
        { id: 1, nom: 'Alice Martin', score: 95, date: '2024-02-15T10:30:00' },
        { id: 2, nom: 'Bob Dupont', score: 88, date: '2024-02-14T14:20:00' },
        { id: 3, nom: 'Clara Bernard', score: 85, date: '2024-02-13T09:15:00' },
        { id: 4, nom: 'David Moreau', score: 82, date: '2024-02-12T16:45:00' },
        { id: 5, nom: 'Emma Petit', score: 78, date: '2024-02-11T11:00:00' },
        { id: 6, nom: 'François Roux', score: 75, date: '2024-02-10T13:30:00' },
        { id: 7, nom: 'Vous', score: 70, date: '2024-02-09T15:00:00' }
      ]
      
      this.leaderboard = fakeLeaderboard
      
      const userIndex = this.leaderboard.findIndex((p) => p.nom === 'Vous')
      if (userIndex !== -1) {
        this.userPosition = {
          ...this.leaderboard[userIndex],
          rank: userIndex + 1
        }
      } else {
        this.userPosition = null
      }
    },
    getRankMedal(rank) {
      if (rank === 1) return '🥇'
      if (rank === 2) return '🥈'
      if (rank === 3) return '🥉'
      return '🏅'
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const options = { day: '2-digit', month: 'short', year: 'numeric' }
      return date.toLocaleDateString('fr-FR', options)
    },
    goToQuizCatalogue() {
      this.$router.push('/etudiant/catalogue')
    }
  },
  mounted() {
    this.loadAvailableQuizzes()
    
    const quizId = this.$route.query.quiz
    if (quizId) {
      this.selectedQuizId = Number(quizId)
      this.loadLeaderboard()
    }
  }
}
</script>

<style scoped>
@import './LeaderboardPage.css';
</style>
