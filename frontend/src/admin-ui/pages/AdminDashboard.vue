<template>
  <div class="admin-dashboard">
    <AppHeader />

    <main class="admin-main">
      <header class="admin-hero">
        <div class="hero-top">
          <span class="hero-badge">
            <span class="badge-dot"></span>
            Administration
          </span>
          <button type="button" class="refresh-btn" :disabled="isLoadingStats" @click="loadStats">
            {{ isLoadingStats ? 'Actualisation...' : 'Actualiser' }}
          </button>
        </div>

        <h1 class="hero-title">Tableau de bord admin</h1>
        <p class="hero-subtitle">Suivi rapide des utilisateurs et des quiz.</p>
      </header>

      <div class="admin-layout">
        <aside class="admin-sidebar">
          <h2 class="sidebar-title">Paramètres</h2>
          <p class="sidebar-subtitle">Accès direct aux zones de gestion.</p>

          <button type="button" class="sidebar-link" @click="goToUsers">
            Gestion des utilisateurs
          </button>

          <button
            type="button"
            class="sidebar-link"
            :disabled="!isSuperAdmin"
            @click="goToSuperView"
          >
            Panneau super admin
          </button>

          <button type="button" class="sidebar-link" @click="loadStats">
            Recharger les statistiques
          </button>
        </aside>

        <section class="admin-content">
          <section class="stats-grid" aria-label="Statistiques globales">
            <article class="stat-card users">
              <p class="stat-label">Utilisateurs</p>
              <p class="stat-value">{{ displayValue(stats.totalUsers) }}</p>
            </article>

            <article class="stat-card teachers">
              <p class="stat-label">Enseignants</p>
              <p class="stat-value">{{ displayValue(stats.totalTeachers) }}</p>
            </article>

            <article class="stat-card students">
              <p class="stat-label">Étudiants</p>
              <p class="stat-value">{{ displayValue(stats.totalStudents) }}</p>
            </article>

            <article class="stat-card quizzes">
              <p class="stat-label">Quiz créés</p>
              <p class="stat-value">{{ displayValue(stats.totalQuizzes) }}</p>
            </article>
          </section>

          <section class="quick-actions">
            <h2>Actions rapides</h2>
            <div class="actions-grid">
              <button type="button" class="action-card" @click="goToUsers">
                <span class="action-kicker">Utilisateurs</span>
                <strong>Gérer les comptes</strong>
                <span class="action-link">Ouvrir</span>
              </button>

              <button
                type="button"
                class="action-card"
                :disabled="!isSuperAdmin"
                @click="goToSuperView"
              >
                <span class="action-kicker">Super admin</span>
                <strong>Vue complète</strong>
                <span class="action-link">{{ isSuperAdmin ? 'Ouvrir' : 'Accès requis' }}</span>
              </button>

              <button type="button" class="action-card" :disabled="isLoadingStats" @click="loadStats">
                <span class="action-kicker">Données</span>
                <strong>Mettre à jour les chiffres</strong>
                <span class="action-link">{{ isLoadingStats ? 'En cours' : 'Actualiser' }}</span>
              </button>
            </div>
          </section>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import { adminService } from '../../api/admin'
import { quizService } from '../../api/quiz'

export default {
  name: 'AdminDashboard',
  components: { AppHeader },
  data() {
    return {
      stats: {
        totalUsers: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalQuizzes: 0,
      },
      isLoadingStats: false,
      isSuperAdmin: false,
    }
  },
  methods: {
    displayValue(value) {
      if (this.isLoadingStats) return '—'
      return Number.isFinite(value) ? value : 0
    },
    resolveRole() {
      try {
        const raw = localStorage.getItem('user')
        if (!raw) {
          this.isSuperAdmin = false
          return
        }
        const user = JSON.parse(raw)
        this.isSuperAdmin = Boolean(user?.is_super)
      } catch (_error) {
        this.isSuperAdmin = false
      }
    },
    async loadStats() {
      if (this.isLoadingStats) return
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

        const quizResults = await Promise.allSettled([quizService.listPublic(), quizService.list()])
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
          totalQuizzes: quizIds.size,
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
      if (!this.isSuperAdmin) return
      this.$router.push('/admin/super')
    },
  },
  mounted() {
    this.resolveRole()
    this.loadStats()
  },
}
</script>

<style scoped>
@import './AdminDashboard.css';
</style>
