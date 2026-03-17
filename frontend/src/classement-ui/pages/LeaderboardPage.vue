<template>
  <div class="leaderboard-page">
    <AppHeader />

    <main class="leaderboard-main">
      <section class="leaderboard-hero panel-surface">
        <div class="hero-copy">
          <p class="hero-kicker">Classement de groupe</p>
          <h1>{{ quizTitle || 'Classement' }}</h1>
          <p class="hero-subtitle">
            {{
              groupName
                ? `Scores reels du groupe ${groupName}`
                : 'Consulte les meilleurs scores de ton groupe pour ce quiz.'
            }}
          </p>

          <div class="hero-actions">
            <button type="button" class="btn-secondary" @click="goBack">
              Retour au groupe
            </button>
            <button
              v-if="hasRequiredContext"
              type="button"
              class="btn-primary"
              @click="playQuizAgain"
            >
              Rejouer le quiz
            </button>
          </div>
        </div>

        <aside class="hero-stats">
          <div class="stat-card">
            <span class="stat-label">Participants</span>
            <strong>{{ leaderboard.length }}</strong>
          </div>

          <div class="stat-card">
            <span class="stat-label">Ma place</span>
            <strong>{{ userPosition ? `#${userPosition.rank}` : '--' }}</strong>
          </div>

          <div class="stat-card">
            <span class="stat-label">Mon score</span>
            <strong>{{ userPosition ? `${userPosition.score} pts` : '--' }}</strong>
          </div>
        </aside>
      </section>

      <section v-if="loading" class="state-card panel-surface">
        <div class="state-icon">...</div>
        <h2>Chargement du classement</h2>
        <p>Recuperation des meilleurs scores du groupe.</p>
      </section>

      <section v-else-if="error" class="state-card panel-surface error-state">
        <div class="state-icon">!</div>
        <h2>Classement indisponible</h2>
        <p>{{ error }}</p>
      </section>

      <section v-else-if="!hasRequiredContext" class="state-card panel-surface">
        <div class="state-icon">#</div>
        <h2>Classement de groupe seulement</h2>
        <p>
          Ce classement compare seulement les membres d'un groupe pour ce quiz.
          Il ne montre pas tous les joueurs de la plateforme.
        </p>
      </section>

      <section
        v-else-if="hasRequiredContext && rankedPlayers.length === 0"
        class="state-card panel-surface"
      >
        <div class="state-icon">0</div>
        <h2>Aucun score pour le moment</h2>
        <p>Soyez le premier membre du groupe a enregistrer un resultat.</p>
      </section>

      <template v-else>
        <section class="podium-grid">
          <article
            v-for="player in podiumPlayers"
            :key="player.id"
            :class="['podium-card', `rank-${player.rank}`, { 'is-current-user': isCurrentUser(player) }]"
          >
            <div class="podium-rank">
              <span class="podium-place">#{{ player.rank }}</span>
              <span class="podium-medal">{{ getRankMedal(player.rank) }}</span>
            </div>

            <div class="podium-info">
              <h2>{{ player.nom }}</h2>
              <p>{{ formatDate(player.date) }}</p>
            </div>

            <div class="podium-score">
              <strong>{{ player.score }}</strong>
              <span>pts</span>
            </div>
          </article>
        </section>

        <section class="ranking-panel panel-surface">
          <header class="panel-header">
            <div>
              <p class="panel-kicker">Classement complet</p>
              <h2>{{ rankedPlayers.length }} joueur(s) classes</h2>
            </div>
            <p class="panel-copy">
              Le classement garde le meilleur score de chaque membre du groupe.
            </p>
          </header>

          <div class="ranking-list">
            <article
              v-for="player in rankedPlayers"
              :key="player.id"
              :class="['ranking-row', `rank-tone-${Math.min(player.rank, 4)}`, { 'is-current-user': isCurrentUser(player) }]"
            >
              <div class="ranking-rank">
                <span class="ranking-rank-value">#{{ player.rank }}</span>
              </div>

              <div class="ranking-body">
                <div class="ranking-copy">
                  <h3>
                    {{ player.nom }}
                    <span v-if="isCurrentUser(player)" class="you-badge">Vous</span>
                  </h3>
                  <p>{{ formatDate(player.date) }}</p>
                </div>

                <div class="ranking-score">
                  <strong>{{ player.score }}</strong>
                  <span>pts</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script>
import api from '../../api/Axios'
import { groupService } from '../../api/groups'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

export default {
  name: 'LeaderboardPage',
  components: {
    AppHeader,
  },
  data() {
    return {
      loading: false,
      error: '',
      leaderboard: [],
      quizTitle: '',
      groupName: '',
      currentUserId: null,
    }
  },
  computed: {
    quizId() {
      const value = Number(this.$route.query.quiz)
      return Number.isFinite(value) && value > 0 ? value : null
    },
    groupId() {
      const value = Number(this.$route.query.group)
      return Number.isFinite(value) && value > 0 ? value : null
    },
    hasRequiredContext() {
      return Boolean(this.quizId && this.groupId)
    },
    rankedPlayers() {
      let lastScore = null
      let lastRank = 0

      return this.leaderboard.map((player, index) => {
        const rank = player.score === lastScore ? lastRank : index + 1
        lastScore = player.score
        lastRank = rank

        return {
          ...player,
          rank,
        }
      })
    },
    podiumPlayers() {
      return this.rankedPlayers.slice(0, 3)
    },
    userPosition() {
      if (!this.currentUserId) return null

      return (
        this.rankedPlayers.find(
          (player) => Number(player.userId) === Number(this.currentUserId)
        ) || null
      )
    },
  },
  methods: {
    async bootstrapPage() {
      this.readCurrentUser()

      if (!this.hasRequiredContext) {
        this.leaderboard = []
        this.quizTitle = ''
        this.groupName = ''
        this.error = ''
        return
      }

      this.loading = true
      this.error = ''

      try {
        const [rankingResponse, groupResponse, quizResponse] = await Promise.all([
          groupService.getQuizRanking(this.groupId, this.quizId),
          groupService.show(this.groupId).catch(() => ({ data: null })),
          api.get(`/quizzes/${this.quizId}`).catch(() => ({ data: null })),
        ])

        this.leaderboard = Array.isArray(rankingResponse.data)
          ? rankingResponse.data
              .map(this.mapRankingPlayer)
              .sort((a, b) => b.score - a.score)
          : []

        this.groupName = groupResponse.data?.nom || `Groupe ${this.groupId}`
        this.quizTitle =
          quizResponse.data?.titre ||
          quizResponse.data?.title ||
          'Classement du quiz'
      } catch (error) {
        console.error('Erreur chargement classement', error)
        this.error =
          error.response?.data?.message ||
          'Impossible de charger le classement du groupe.'
        this.leaderboard = []
      } finally {
        this.loading = false
      }
    },
    mapRankingPlayer(player) {
      return {
        id: player.id || `${player.user_id}-${player.quiz_id}-${player.score}`,
        userId: player.user_id || player.user?.id || null,
        nom:
          player.user?.nickname ||
          player.user?.name ||
          player.nom ||
          `Participant ${player.user_id || ''}`.trim(),
        score: Number(player.score || 0),
        date: player.date_tentative || player.created_at || null,
      }
    },
    readCurrentUser() {
      try {
        const rawUser = localStorage.getItem('user')
        if (!rawUser) {
          this.currentUserId = null
          return
        }

        const parsedUser = JSON.parse(rawUser)
        this.currentUserId = parsedUser?.id ?? null
      } catch {
        this.currentUserId = null
      }
    },
    formatDate(dateValue) {
      if (!dateValue) return 'Tentative non datee'

      const date = new Date(dateValue)
      if (Number.isNaN(date.getTime())) return 'Tentative non datee'

      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    },
    getRankMedal(rank) {
      if (rank === 1) return '1'
      if (rank === 2) return '2'
      if (rank === 3) return '3'
      return '*'
    },
    isCurrentUser(player) {
      return Number(player.userId) === Number(this.currentUserId)
    },
    goBack() {
      if (this.groupId) {
        this.$router.push(`/etudiant/groupes/${this.groupId}/quiz`)
        return
      }

      if (window.history.length > 1) {
        this.$router.back()
        return
      }

      this.$router.push('/etudiant')
    },
    playQuizAgain() {
      if (!this.quizId) return

      this.$router.push({
        path: `/etudiant/quiz/${this.quizId}/jouer`,
        query: this.groupId ? { group: this.groupId } : {},
      })
    },
  },
  mounted() {
    this.bootstrapPage()
  },
  watch: {
    '$route.fullPath'() {
      this.bootstrapPage()
    },
  },
}
</script>

<style scoped>
@import './LeaderboardPage.css';
</style>
