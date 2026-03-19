<template>
  <div class="admin-dashboard">
    <AppHeader />

    <main class="admin-main">
      <header class="admin-hero">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Super Admin Mode
        </div>
        <h1 class="hero-title">Cockpit Administrateur</h1>
        <p class="hero-subtitle">Vue d'ensemble de la plateforme BlitzzQuiz</p>
      </header>

      <section class="stats-grid" aria-label="Statistiques globales">
        <article class="stat-card users" :style="{ animationDelay: '0s' }">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p class="stat-label">Utilisateurs</p>
          <p class="stat-value">{{ stats.totalUsers }}</p>
        </article>

        <article class="stat-card teachers" :style="{ animationDelay: '0.08s' }">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <p class="stat-label">Enseignants</p>
          <p class="stat-value">{{ stats.totalTeachers }}</p>
        </article>

        <article class="stat-card students" :style="{ animationDelay: '0.16s' }">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z" />
            </svg>
          </div>
          <p class="stat-label">Etudiants</p>
          <p class="stat-value">{{ stats.totalStudents }}</p>
        </article>

        <article class="stat-card quizzes" :style="{ animationDelay: '0.24s' }">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <p class="stat-label">Quiz crees</p>
          <p class="stat-value">{{ stats.totalQuizzes }}</p>
        </article>
      </section>

      <section class="quick-actions">
        <div class="section-head">
          <h2>Actions rapides</h2>
          <p>Gestion immediate des zones admin principales.</p>
        </div>

        <div class="actions-grid">
          <button type="button" class="action-card" @click="goToUsers">
            <span class="action-kicker">Utilisateurs</span>
            <strong>Gerer les comptes</strong>
            <span class="action-link">Ouvrir</span>
          </button>

          <button type="button" class="action-card" @click="goToSuperView">
            <span class="action-kicker">Super Admin</span>
            <strong>Vue complete</strong>
            <span class="action-link">Ouvrir</span>
          </button>

          <button type="button" class="action-card" @click="viewReports">
            <span class="action-kicker">Reporting</span>
            <strong>Rapports detailles</strong>
            <span class="action-link">Bientot</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import { adminService } from '../../api/admin'
import { quizService } from '../../api/quiz'

export default {
  name: 'AdminDashboard',
  components: {
    AppHeader
  },
  data() {
    return {
      stats: {
        totalUsers: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalQuizzes: 0
      },
      isLoadingStats: false
    }
  },
  methods: {
    async loadStats() {
      this.isLoadingStats = true

      try {
        let page = 1
        let lastPage = 1
        let totalUsers = 0
        let totalTeachers = 0
        let totalStudents = 0

        do {
          const response = await adminService.getUsers(page)
          const paginator = response?.data?.data
          const rows = Array.isArray(paginator?.data) ? paginator.data : []

          if (page === 1) {
            totalUsers = Number(paginator?.total || 0)
          }

          rows.forEach((user) => {
            if (user?.role === 'TEACHER') totalTeachers += 1
            if (user?.role === 'STUDENT') totalStudents += 1
          })

          lastPage = Number(paginator?.last_page || page)
          page += 1
        } while (page <= lastPage)

        const quizResults = await Promise.allSettled([
          quizService.listPublic(),
          quizService.list()
        ])

        const quizIds = new Set()
        quizResults.forEach((result) => {
          if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            result.value.forEach((quiz) => {
              if (quiz?.id != null) {
                quizIds.add(quiz.id)
              }
            })
          }
        })

        this.stats = {
          totalUsers,
          totalTeachers,
          totalStudents,
          totalQuizzes: quizIds.size
        }
      } catch (error) {
        console.error('Erreur chargement stats admin:', error)
      } finally {
        this.isLoadingStats = false
      }
    },
    goToUsers() {
      this.$router.push('/admin/users')
    },
    goToSuperView() {
      this.$router.push('/admin/super')
    },
    viewReports() {
      alert('Rapports detailles en construction')
    }
  },
  mounted() {
    this.loadStats()
  }
}
</script>

<style scoped>
@import './AdminDashboard.css';
</style>
