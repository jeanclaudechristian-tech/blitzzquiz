<template>
  <div class="super-admin-view">
    <AppHeader />
    <main class="super-main">
      <!-- Header avec badge -->
      <header class="super-header">
        <div class="badge-container">
          <span class="super-badge">🛡️ Mode Super Admin</span>
        </div>
        <h1>Panneau Super Administrateur</h1>
        <p class="subtitle">Accès complet et vue de tous les rôles</p>
      </header>

      <!-- Switch de vue -->
      <section class="view-switcher">
        <h2>🔄 Changer de vue</h2>
        <div class="switch-grid">
          <button type="button" class="switch-btn student" @click="switchToStudent">
            <span class="switch-icon">🎓</span>
            <span class="switch-label">Vue Étudiant</span>
            <span class="switch-desc">Tester l'expérience étudiant</span>
          </button>
          <button type="button" class="switch-btn teacher" @click="switchToTeacher">
            <span class="switch-icon">👨‍🏫</span>
            <span class="switch-label">Vue Enseignant</span>
            <span class="switch-desc">Tester la création de quiz</span>
          </button>
          <button type="button" class="switch-btn admin" @click="goToAdminDashboard">
            <span class="switch-icon">⚙️</span>
            <span class="switch-label">Dashboard Admin</span>
            <span class="switch-desc">Retour au tableau de bord</span>
          </button>
        </div>
      </section>

      <!-- Accès complet -->
      <section class="full-access">
        <h2>🔓 Accès complet</h2>
        <div class="access-list">
          <div class="access-item">
            <span class="access-icon">✅</span>
            <div class="access-content">
              <h3>Tous les quiz</h3>
              <p>Accès et modification de tous les quiz de la plateforme</p>
            </div>
          </div>
          <div class="access-item">
            <span class="access-icon">✅</span>
            <div class="access-content">
              <h3>Tous les utilisateurs</h3>
              <p>Gestion complète des comptes utilisateurs</p>
            </div>
          </div>
          <div class="access-item">
            <span class="access-icon">✅</span>
            <div class="access-content">
              <h3>Tous les groupes</h3>
              <p>Consultation et modification de tous les groupes</p>
            </div>
          </div>
          <div class="access-item">
            <span class="access-icon">✅</span>
            <div class="access-content">
              <h3>Statistiques globales</h3>
              <p>Rapports détaillés sur toutes les activités</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Test rapide -->
      <section class="quick-test">
        <h2>🧪 Test rapide</h2>
        <p>Testez n'importe quel quiz en un clic</p>
        <button type="button" class="test-btn" @click="testQuiz">
          Choisir un quiz à tester
        </button>
      </section>
    </main>
    <AppFooter class="compact-footer" />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'SuperAdminView',
  components: {
    AppHeader,
    AppFooter
  },
  methods: {
    switchToStudent() {
      // TODO (Laravel) : Activer temporairement la vue étudiant pour le super admin
      // Stocker dans session : { superAdminMode: true, currentView: 'STUDENT' }
      this.$router.push('/etudiant')
    },
    switchToTeacher() {
      // TODO (Laravel) : Activer temporairement la vue enseignant pour le super admin
      // Stocker dans session : { superAdminMode: true, currentView: 'TEACHER' }
      this.$router.push('/enseignant')
    },
    goToAdminDashboard() {
      this.$router.push('/admin')
    },
    testQuiz() {
      // TODO (Laravel) : Afficher une modal avec liste des quiz disponibles
      this.$router.push('/etudiant/catalogue')
    }
  }
}
</script>

<style scoped>
@import './SuperAdminView.css';
</style>
