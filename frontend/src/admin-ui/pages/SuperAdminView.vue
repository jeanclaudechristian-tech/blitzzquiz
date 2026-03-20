<template>
  <div class="super-admin-view">
    <AppHeader />

    <main class="super-main">
      <header class="super-header">
        <span class="super-badge">
          <span class="badge-dot"></span>
          Super admin
        </span>
        <h1>Panneau super administrateur</h1>
        <p class="subtitle">Configuration avancée et gestion globale de la plateforme.</p>
      </header>

      <section class="view-switcher">
        <h2>Changer de vue</h2>
        <div class="switch-grid">
          <button type="button" class="switch-btn" @click="switchToStudent">
            <span class="material-symbols-outlined switch-icon" aria-hidden="true">school</span>
            <span class="switch-label">Vue étudiant</span>
            <span class="switch-desc">Tester le parcours étudiant.</span>
          </button>

          <button type="button" class="switch-btn" @click="switchToTeacher">
            <span class="material-symbols-outlined switch-icon" aria-hidden="true">cast_for_education</span>
            <span class="switch-label">Vue enseignant</span>
            <span class="switch-desc">Tester la création et la gestion des quiz.</span>
          </button>

          <button type="button" class="switch-btn" @click="goToAdminDashboard">
            <span class="material-symbols-outlined switch-icon" aria-hidden="true">dashboard</span>
            <span class="switch-label">Retour admin</span>
            <span class="switch-desc">Revenir au tableau principal.</span>
          </button>
        </div>
      </section>

      <section class="full-access">
        <h2>Portée des droits</h2>
        <div class="access-list">
          <article class="access-item">
            <span class="material-symbols-outlined access-icon">check_circle</span>
            <div class="access-content">
              <h3>Tous les quiz</h3>
              <p>Consultation et modification sur l'ensemble du catalogue.</p>
            </div>
          </article>

          <article class="access-item">
            <span class="material-symbols-outlined access-icon">check_circle</span>
            <div class="access-content">
              <h3>Tous les utilisateurs</h3>
              <p>Gestion complète des comptes, rôles et accès.</p>
            </div>
          </article>

          <article class="access-item">
            <span class="material-symbols-outlined access-icon">check_circle</span>
            <div class="access-content">
              <h3>Tous les groupes</h3>
              <p>Visibilité et contrôle sur les groupes de la plateforme.</p>
            </div>
          </article>
        </div>
      </section>

      <section class="admin-invitation">
        <h2>Inviter un administrateur</h2>
        <p class="subtitle">Promotion d'un compte existant ou création d'un nouveau compte admin.</p>

        <div class="invitation-form">
          <input
            v-model="inviteEmail"
            type="email"
            placeholder="Email du futur administrateur"
            class="invitation-input"
            :disabled="isInviting"
          />

          <button
            type="button"
            class="invitation-btn"
            :disabled="isInviting || !inviteEmail"
            @click="handleInviteAdmin"
          >
            {{ isInviting ? 'Envoi...' : "Envoyer l'invitation" }}
          </button>
        </div>

        <p v-if="inviteMessage" :class="['message', inviteStatus]">{{ inviteMessage }}</p>
      </section>
    </main>
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import { adminService } from '@/api/admin'

export default {
  name: 'SuperAdminView',
  components: { AppHeader },
  data() {
    return {
      inviteEmail: '',
      isInviting: false,
      inviteMessage: '',
      inviteStatus: '',
    }
  },
  methods: {
    switchToStudent() {
      this.$router.push('/etudiant')
    },
    switchToTeacher() {
      this.$router.push('/enseignant')
    },
    goToAdminDashboard() {
      this.$router.push('/admin')
    },
    async handleInviteAdmin() {
      if (!this.inviteEmail || this.isInviting) return
      this.isInviting = true
      this.inviteMessage = ''

      try {
        await adminService.inviteAdmin(this.inviteEmail.trim())
        this.inviteStatus = 'success'
        this.inviteMessage = "Invitation envoyée avec succès."
        this.inviteEmail = ''
      } catch (error) {
        this.inviteStatus = 'error'
        this.inviteMessage = error?.response?.data?.message || "Erreur lors de l'invitation."
      } finally {
        this.isInviting = false
      }
    },
  },
}
</script>

<style scoped>
@import './SuperAdminView.css';
</style>
