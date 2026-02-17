<template>
  <div class="admin-dashboard">
    <AppHeader />
    <main class="admin-main">
      <!-- Header avec badge admin -->
      <header class="admin-header">
        <span class="super-admin-badge">🛡️ Super Admin Mode</span>
        <h1>Dashboard Administrateur</h1>
        <p class="subtitle">Vue d'ensemble de la plateforme BlitzzQuiz</p>
      </header>

      <!-- Statistiques globales -->
      <section class="stats-grid">
        <div class="stat-card" :style="{ animationDelay: '0s' }">
          <div class="stat-icon users">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.totalUsers }}</h3>
            <p class="stat-label">Utilisateurs totaux</p>
          </div>
        </div>

        <div class="stat-card" :style="{ animationDelay: '0.1s' }">
          <div class="stat-icon teachers">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.totalTeachers }}</h3>
            <p class="stat-label">Enseignants</p>
          </div>
        </div>

        <div class="stat-card" :style="{ animationDelay: '0.2s' }">
          <div class="stat-icon students">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.totalStudents }}</h3>
            <p class="stat-label">Étudiants</p>
          </div>
        </div>

        <div class="stat-card" :style="{ animationDelay: '0.3s' }">
          <div class="stat-icon quizzes">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.totalQuizzes }}</h3>
            <p class="stat-label">Quiz créés</p>
          </div>
        </div>
      </section>

      <!-- Actions rapides -->
      <section class="quick-actions">
        <h2>⚡ Actions rapides</h2>
        <div class="actions-grid">
          <button type="button" class="action-btn" @click="goToUsers">
            <span class="action-icon">👥</span>
            <span class="action-text">Gérer les utilisateurs</span>
          </button>
          <button type="button" class="action-btn" @click="goToSuperView">
            <span class="action-icon">🔄</span>
            <span class="action-text">Vue Super Admin</span>
          </button>
          <button type="button" class="action-btn" @click="viewReports">
            <span class="action-icon">📈</span>
            <span class="action-text">Rapports détaillés</span>
          </button>
        </div>
      </section>
    </main>
    <AppFooter class="compact-footer" />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'AdminDashboard',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      stats: {
        totalUsers: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalQuizzes: 0
      }
    }
  },
  methods: {
    loadStats() {
      // TODO (Laravel) : RÉCUPÉRER les statistiques globales
      // Route API : GET /api/admin/stats
      // Headers : Authorization: Bearer {token} + vérifier role = 'admin'
      //
      // À RÉCUPÉRER :
      // SELECT 
      //   COUNT(*) AS totalUsers FROM users,
      //   COUNT(*) AS totalTeachers FROM users WHERE role = 'TEACHER',
      //   COUNT(*) AS totalStudents FROM users WHERE role = 'STUDENT',
      //   COUNT(*) AS totalQuizzes FROM quizzes
      //
      // Réponse attendue : {
      //   totalUsers: 150,
      //   totalTeachers: 25,
      //   totalStudents: 125,
      //   totalQuizzes: 85
      // }
      
      // Code temporaire front-only
      this.stats = {
        totalUsers: 150,
        totalTeachers: 25,
        totalStudents: 125,
        totalQuizzes: 85
      }
    },
    goToUsers() {
      this.$router.push('/admin/users')
    },
    goToSuperView() {
      this.$router.push('/admin/super')
    },
    viewReports() {
      alert('Rapports détaillés en construction')
    }
  },
  mounted() {
    // TODO (Laravel) : Vérifier que l'utilisateur est admin
    // Si non admin, rediriger vers la page d'accueil
    this.loadStats()
  }
}
</script>

<style scoped>
@import './AdminDashboard.css';
</style>
