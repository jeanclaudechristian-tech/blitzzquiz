<template>
  <div class="historique-page">
    <AppHeader />
    
    <main class="historique-main">
      <header class="historique-header">
        <h1 class="anton-title">MON HISTORIQUE</h1>
        <p class="count-text">Retrouvez toutes vos tentatives de quiz</p>
      </header>

      <div class="controls-bar">
        <div class="search-box">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un quiz..."
            class="search-input"
          />
        </div>
        
        <div class="sort-controls">
          <label>Trier par :</label>
          <div class="custom-select" @click="toggleDropdown" v-click-outside="closeDropdown">
            <div class="select-trigger" :class="{ 'is-open': isDropdownOpen }">
              <span>{{ selectedSortLabel }}</span>
              <span class="material-symbols-outlined select-arrow">expand_more</span>
            </div>
            
            <transition name="dropdown-fade">
              <ul v-if="isDropdownOpen" class="select-options">
                <li 
                  class="option-item" 
                  :class="{ 'active': sortBy === 'date' }"
                  @click.stop="selectSort('date', 'Date récente')"
                >
                  <span class="material-symbols-outlined option-icon">calendar_today</span>
                  Date récente
                </li>
                <li 
                  class="option-item" 
                  :class="{ 'active': sortBy === 'score' }"
                  @click.stop="selectSort('score', 'Score')"
                >
                  <span class="material-symbols-outlined option-icon">emoji_events</span>
                  Score
                </li>
              </ul>
            </transition>
          </div>
        </div>
      </div>

      <div v-if="isLoadingHistory" class="loading-state">
        <div class="loading-spinner"></div>
        <h2>Chargement en cours...</h2>
        <p>Récupération de votre historique de quiz.</p>
      </div>

      <div v-else-if="loadError" class="empty-state">
        <span class="material-symbols-outlined icon-huge">error</span>
        <h2>Chargement impossible</h2>
        <p>{{ loadError }}</p>
        <button type="button" class="blitzz-btn" @click="loadHistory">
          Réessayer
        </button>
      </div>

      <div v-else-if="filteredHistory.length" class="history-list">
        <div
          v-for="(attempt, index) in filteredHistory"
          :key="attempt.id"
          class="history-card"
        >
          <div class="card-left">
            <h3 class="q-title">{{ attempt.quizTitre }}</h3>
            <div class="q-meta">
              <span class="meta-item">
                <span class="material-symbols-outlined icon-sm">calendar_today</span> 
                {{ formatDate(attempt.date) }}
              </span>
            </div>
          </div>

          <div class="card-right">
            <div class="score-block">
              <span class="score-label">Score</span>
              <span :class="['score-value', getScoreClass(attempt.score)]">
                {{ attempt.score }}%
              </span>
            </div>
            
            <button
              type="button"
              class="replay-btn"
              @click="replayQuiz(attempt)"
            >
              <span class="material-symbols-outlined">replay</span>
              Rejouer
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <span class="material-symbols-outlined icon-huge">history</span>
        <h2>Aucun historique</h2>
        <p>Commencez à jouer à des quiz pour voir vos tentatives ici !</p>
        <button type="button" class="blitzz-btn" @click="goToCatalogue">
          Découvrir les quiz
        </button>
      </div>
      
      <QuizModal 
        v-if="showQuizModal" 
        :quizId="selectedQuizId" 
        @close="showQuizModal = false" 
      />
    </main>

    <button class="fab-retour-accueil" @click="goHome">
      <span class="material-symbols-outlined">west</span>
      Retour à l'accueil
    </button>
  </div>
</template>

<script>
import api from '../../api/Axios'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import QuizModal from '../../quiz-ui/quiz.vue'

const clickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  }
};

export default {
  name: 'HistoriquePage',
  components: {
    AppHeader,
    QuizModal
  },
  directives: {
    clickOutside
  },
  data() {
    return {
      history: [],
      searchQuery: '',
      sortBy: 'date',
      selectedSortLabel: 'Date récente', 
      isDropdownOpen: false, 
      showQuizModal: false,
      selectedQuizId: null,
      isLoadingHistory: false,
      loadError: '',
    }
  },
  computed: {
    filteredHistory() {
      let filtered = [...this.history]
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter((attempt) =>
          attempt.quizTitre.toLowerCase().includes(query),
        )
      }
      return filtered
    },
  },
  methods: {
    goHome() {
      this.$router.push('/')
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
    selectSort(value, label) {
      this.sortBy = value;
      this.selectedSortLabel = label;
      this.isDropdownOpen = false;
      this.sortHistory();
    },
    async loadHistory() {
      this.isLoadingHistory = true
      this.loadError = ''
      try {
        const { data } = await api.get('/me/results')
        this.history = (Array.isArray(data) ? data : []).map((item) => ({
          id: item.id,
          quizId: item.quiz_id,
          quizTitre: item.quiz?.titre || 'Quiz',
          score: item.score,
          date: item.date_tentative || item.created_at,
        }))
      } catch (e) {
        console.error('Erreur chargement historique', e.response?.data || e)
        this.history = []
        this.loadError = "Impossible de charger l'historique pour le moment."
      } finally {
        this.isLoadingHistory = false
      }
      this.sortHistory()
    },
    sortHistory() {
      if (this.sortBy === 'date') {
        this.history.sort((a, b) => new Date(b.date) - new Date(a.date))
      } else if (this.sortBy === 'score') {
        this.history.sort((a, b) => b.score - a.score)
      }
    },
    getScoreClass(score) {
      if (score >= 80) return 'excellent'
      if (score >= 60) return 'good'
      if (score >= 40) return 'average'
      return 'low'
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      return date.toLocaleDateString('fr-FR', options)
    },
    replayQuiz(attempt) {
      this.selectedQuizId = attempt.quizId;
      this.showQuizModal = true;
    },
    goToCatalogue() {
      this.$router.push('/catalogue')
    },
  },
  mounted() {
    this.loadHistory()
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800;900&display=swap');

.historique-page {
  background: #fff;
  min-height: 100vh;
  padding-top: 140px;
  font-family: 'Inter', sans-serif;
  position: relative;
}

.historique-main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px 100px;
}

/* 🎯 STYLE RECTANGULAIRE (PHOTO 2) */
.fab-retour-accueil {
  position: fixed;
  bottom: 40px;
  left: 40px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #111111;
  color: #ffffff;
  border: none;
  /* 🎯 Changé de 50px à 8px pour le look rectangulaire */
  border-radius: 8px; 
  padding: 14px 24px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.fab-retour-accueil:hover {
  background: #00A3FF;
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 163, 255, 0.3);
}

.fab-retour-accueil .material-symbols-outlined {
  font-size: 20px;
}

.historique-header { margin-bottom: 40px; border-bottom: 1px solid #f0f0f0; padding-bottom: 20px; }
.anton-title { font-family: 'Anton', sans-serif; font-size: 3.5rem; text-transform: uppercase; color: #1a1a1a; margin: 0; line-height: 1; }
.count-text { font-size: 0.95rem; color: #888; font-weight: 600; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.5px; }

.controls-bar { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
.search-box { position: relative; flex: 1; min-width: 250px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #999; font-size: 20px; }
.search-input { width: 100%; padding: 12px 16px 12px 42px; border: 2px solid #f0f0f0; border-radius: 12px; font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 500; outline: none; background: #fff; color: #111; transition: all 0.2s; }
.search-input:focus { border-color: #00A3FF; }
.sort-controls { display: flex; align-items: center; gap: 10px; }
.sort-controls label { font-weight: 700; font-size: 0.9rem; color: #1a1a1a; }

.custom-select { position: relative; width: 180px; }
.select-trigger { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border: 2px solid #f0f0f0; border-radius: 10px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.9rem; color: #1a1a1a; cursor: pointer; background: #fff; transition: all 0.2s ease; }
.select-trigger:hover { border-color: #00A3FF; }
.select-trigger.is-open { border-color: #00A3FF; }
.select-arrow { font-size: 20px; color: #666; transition: transform 0.2s ease; }
.select-trigger.is-open .select-arrow { transform: rotate(180deg); }
.select-options { position: absolute; top: calc(100% + 8px); left: 0; width: 100%; background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); list-style: none; padding: 8px; margin: 0; z-index: 100; }
.option-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-family: 'Inter', sans-serif; font-weight: 500; font-size: 0.9rem; color: #1a1a1a; cursor: pointer; transition: all 0.15s ease; }
.option-icon { font-size: 18px; color: #666; }
.option-item:hover { background: #e6f6ff; color: #00A3FF; }
.option-item:hover .option-icon { color: #00A3FF; }
.option-item.active { background: #f8f9fa; font-weight: 700; }

.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-10px); }

.history-list { display: flex; flex-direction: column; gap: 16px; }
.history-card { display: flex; justify-content: space-between; align-items: center; background: #fcfcfc; border: 2px solid #f0f0f0; border-radius: 16px; padding: 20px 24px; transition: all 0.2s ease; }
.history-card:hover { border-color: #00A3FF; background: #fff; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 163, 255, 0.1); }
.card-left { display: flex; flex-direction: column; gap: 8px; }
.q-title { font-size: 1.25rem; font-weight: 800; color: #111; margin: 0; }
.q-meta { display: flex; gap: 15px; color: #666; font-size: 0.85rem; font-weight: 500; }
.meta-item { display: flex; align-items: center; gap: 5px; }
.icon-sm { font-size: 16px; color: #999; }
.card-right { display: flex; align-items: center; gap: 30px; }
.score-block { text-align: right; display: flex; flex-direction: column; }
.score-label { font-size: 0.75rem; font-weight: 700; color: #999; text-transform: uppercase; }
.score-value { font-size: 1.5rem; font-weight: 900; font-family: 'Anton', sans-serif; }
.excellent { color: #10B981; } 
.good { color: #00A3FF; } 
.average { color: #F59E0B; } 
.low { color: #EF4444; } 
.replay-btn { background: #111; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-family: 'Inter', sans-serif; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
.replay-btn:hover { background: #00A3FF; }

.empty-state { text-align: center; padding: 80px 20px; }
.icon-huge { font-size: 64px; color: #d1d5db; margin-bottom: 20px; }
.empty-state h2 { font-size: 1.8rem; font-weight: 800; color: #111; margin: 0 0 10px 0; }
.empty-state p { color: #666; margin: 0 0 24px 0; }
.blitzz-btn { background: #00A3FF; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
.blitzz-btn:hover { background: #0082cc; }

.loading-state { text-align: center; padding: 80px 20px; }
.loading-state h2 { font-size: 1.8rem; font-weight: 800; color: #111; margin: 0 0 10px 0; }
.loading-state p { color: #666; margin: 0; }
.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e5e7eb;
  border-top-color: #00A3FF;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: history-spin 0.9s linear infinite;
}
@keyframes history-spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .controls-bar { flex-direction: column; align-items: stretch; }
  .history-card { flex-direction: column; align-items: flex-start; gap: 20px; }
  .card-right { width: 100%; justify-content: space-between; }
  .anton-title { font-size: 2.5rem; }
  .custom-select { width: 100%; }
  .fab-retour-accueil { bottom: 20px; left: 20px; padding: 12px 20px; font-size: 0.85rem; border-radius: 8px; }
}
</style>
