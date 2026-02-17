<template>
  <div class="historique-page">
    <AppHeader />
    <main class="historique-main">
      <!-- Header -->
      <header class="historique-header">
        <h1>📜 Mon Historique</h1>
        <p class="subtitle">Retrouvez toutes vos tentatives de quiz</p>
      </header>

      <!-- Filtres et tri -->
      <div class="controls-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un quiz..."
            class="search-input"
          />
        </div>
        <div class="sort-controls">
          <label for="sort-select">Trier par :</label>
          <select id="sort-select" v-model="sortBy" @change="sortHistory">
            <option value="date">Date récente</option>
            <option value="score">Score</option>
          </select>
        </div>
      </div>

      <!-- Liste des tentatives -->
      <div v-if="filteredHistory.length" class="history-list">
        <div
          v-for="(attempt, index) in filteredHistory"
          :key="attempt.id"
          class="history-card"
          :style="{ animationDelay: `${index * 0.08}s` }"
        >
          <div class="card-header">
            <h3 class="quiz-title">{{ attempt.quizTitre }}</h3>
            <span :class="['score-badge', getScoreClass(attempt.percent)]">
              {{ attempt.score }} / {{ attempt.totalQuestions }}
            </span>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <div class="info-item">
                <span class="info-icon">📊</span>
                <span class="info-label">Score :</span>
                <span class="info-value">{{ attempt.percent }}%</span>
              </div>
              <div class="info-item">
                <span class="info-icon">📅</span>
                <span class="info-label">Date :</span>
                <span class="info-value">{{ formatDate(attempt.date) }}</span>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-item" v-if="attempt.groupe">
                <span class="info-icon">👥</span>
                <span class="info-label">Groupe :</span>
                <span class="info-value">{{ attempt.groupe }}</span>
              </div>
              <div class="info-item" v-else>
                <span class="info-icon">🎯</span>
                <span class="info-label">Mode :</span>
                <span class="info-value">Individuel</span>
              </div>
              <div class="info-item">
                <span class="info-icon">⏱️</span>
                <span class="info-label">Durée :</span>
                <span class="info-value">{{ formatDuration(attempt.duree) }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <button 
              type="button" 
              class="replay-btn"
              @click="replayQuiz(attempt)"
            >
              <span class="btn-icon">🔄</span>
              <span class="btn-text">Rejouer</span>
            </button>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="empty-state">
        <div class="empty-icon">📚</div>
        <p class="empty-title">Aucun historique pour le moment</p>
        <p class="empty-subtitle">Commencez à jouer à des quiz pour voir vos tentatives ici !</p>
        <button type="button" class="start-btn" @click="goToCatalogue">
          Découvrir les quiz
        </button>
      </div>
    </main>
    <AppFooter class="compact-footer" />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'HistoriquePage',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      history: [],
      searchQuery: '',
      sortBy: 'date'
    }
  },
  computed: {
    filteredHistory() {
      let filtered = [...this.history]
      
      // Filtrage par recherche
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter((attempt) =>
          attempt.quizTitre.toLowerCase().includes(query)
        )
      }
      
      return filtered
    }
  },
  methods: {
    loadHistory() {
      // TODO (Laravel) : RÉCUPÉRER l'historique des tentatives de l'utilisateur
      // Route API : GET /api/student/history
      // Headers : Authorization: Bearer {token}
      // Réponse attendue : [
      //   {
      //     id: 1,
      //     quiz_id: 123,
      //     quiz_titre: "Quiz de Math",
      //     score: 8,
      //     total_questions: 10,
      //     percent: 80,
      //     date: "2024-02-15T10:30:00",
      //     groupe: "Groupe A" ou null,
      //     duree: 120 (en secondes)
      //   }
      // ]
      // Exemple d'appel :
      // const token = localStorage.getItem('token')
      // axios.get('/api/student/history', { headers: { Authorization: `Bearer ${token}` } })
      //   .then(response => { this.history = response.data })
      


      // Code temporaire front-only (1 donnée fictive pour la démo)
      this.history = [
        {
          id: 1,
          quizId: 101,
          quizTitre: 'Quiz de Mathématiques - Algèbre',
          score: 8,
          totalQuestions: 10,
          percent: 80,
          date: '2024-02-15T10:30:00',
          groupe: 'Groupe Maths Avancées',
          duree: 245
        }
      ]
      
      this.sortHistory()
    },
    sortHistory() {
      // TODO (Laravel) : Le tri peut être fait côté backend en modifiant la requête SQL
      // Pour trier par date : ORDER BY quiz_attempts.date_tentative DESC
      // Pour trier par score : ORDER BY quiz_attempts.percent DESC, quiz_attempts.date_tentative DESC
      
      if (this.sortBy === 'date') {
        this.history.sort((a, b) => new Date(b.date) - new Date(a.date))
      } else if (this.sortBy === 'score') {
        this.history.sort((a, b) => b.percent - a.percent)
      }
    },
    getScoreClass(percent) {
      if (percent >= 80) return 'excellent'
      if (percent >= 60) return 'good'
      if (percent >= 40) return 'average'
      return 'low'
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const options = { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
      return date.toLocaleDateString('fr-FR', options)
    },
    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}min ${secs}s`
    },
    replayQuiz(attempt) {
      // TODO (Laravel) : Vérifier que le quiz existe toujours et est accessible
      // Route API : GET /api/quizzes/{quizId}/check
      // puis rediriger vers la page lobby du quiz
      
      this.$router.push(`/etudiant/quiz/${attempt.quizId}`)
    },
    goToCatalogue() {
      this.$router.push('/etudiant/catalogue')
    }
  },
  mounted() {
    this.loadHistory()
  }
}
</script>

<style scoped>
@import './HistoriquePage.css';
</style>
