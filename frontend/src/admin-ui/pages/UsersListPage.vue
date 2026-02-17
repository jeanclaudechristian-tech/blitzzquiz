<template>
  <div class="users-list-page">
    <AppHeader />
    <main class="users-main">
      <!-- Header -->
      <header class="users-header">
        <h1>👥 Gestion des utilisateurs</h1>
        <p class="subtitle">Liste complète des utilisateurs de la plateforme</p>
      </header>

      <!-- Recherche et filtres -->
      <div class="controls-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher par nom ou email..."
            class="search-input"
          />
        </div>
        <div class="filter-controls">
          <label for="role-filter">Rôle :</label>
          <select id="role-filter" v-model="roleFilter">
            <option value="">Tous</option>
            <option value="STUDENT">Étudiant</option>
            <option value="TEACHER">Enseignant</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <!-- Tableau utilisateurs -->
      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="user-row"
            >
              <td class="user-name">{{ user.nom }}</td>
              <td class="user-email">{{ user.email }}</td>
              <td>
                <span :class="['role-badge', user.role.toLowerCase()]">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', user.statut.toLowerCase()]">
                  {{ user.statut === 'ACTIVE' ? 'Actif' : 'Désactivé' }}
                </span>
              </td>
              <td class="actions-cell">
                <button
                  type="button"
                  class="action-icon-btn edit"
                  title="Modifier rôle"
                  @click="editRole(user)"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  class="action-icon-btn reset"
                  title="Réinitialiser mot de passe"
                  @click="resetPassword(user)"
                >
                  🔑
                </button>
                <button
                  type="button"
                  class="action-icon-btn toggle"
                  :title="user.statut === 'ACTIVE' ? 'Désactiver' : 'Activer'"
                  @click="toggleStatus(user)"
                >
                  {{ user.statut === 'ACTIVE' ? '🔒' : '🔓' }}
                </button>
                <button
                  type="button"
                  class="action-icon-btn delete"
                  title="Supprimer"
                  @click="confirmDelete(user)"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Message si aucun utilisateur -->
        <div v-if="!filteredUsers.length" class="empty-state">
          <p>Aucun utilisateur trouvé</p>
        </div>
      </div>

      <!-- Modal de confirmation de suppression -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
        <div class="modal-content" @click.stop>
          <h3>⚠️ Confirmer la suppression</h3>
          <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete?.nom }}</strong> ?</p>
          <p class="warning-text">Cette action est irréversible.</p>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="cancelDelete">Annuler</button>
            <button type="button" class="btn-delete" @click="deleteUser">Supprimer</button>
          </div>
        </div>
      </div>
    </main>
    <AppFooter class="compact-footer" />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'UsersListPage',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      users: [],
      searchQuery: '',
      roleFilter: '',
      showDeleteModal: false,
      userToDelete: null
    }
  },
  computed: {
    filteredUsers() {
      let filtered = [...this.users]
      
      // Filtre par recherche
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter((user) =>
          user.nom.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      }
      
      // Filtre par rôle
      if (this.roleFilter) {
        filtered = filtered.filter((user) => user.role === this.roleFilter)
      }
      
      return filtered
    }
  },
  methods: {
    loadUsers() {
      // TODO (Laravel) : RÉCUPÉRER tous les utilisateurs
      // Route API : GET /api/admin/users
      // Headers : Authorization: Bearer {token}
      //
      // À RÉCUPÉRER de la table `users` :
      // SELECT id, name AS nom, email, role, status AS statut, created_at
      // FROM users
      // ORDER BY created_at DESC
      //
      // Réponse attendue : [
      //   { id: 1, nom: "Alice Martin", email: "alice@test.com", role: "STUDENT", statut: "ACTIVE" }
      // ]
      
      // Code temporaire front-only
      this.users = [
        { id: 1, nom: 'Alice Martin', email: 'alice@test.com', role: 'STUDENT', statut: 'ACTIVE' }
      ]
    },
    getRoleLabel(role) {
      if (role === 'STUDENT') return 'Étudiant'
      if (role === 'TEACHER') return 'Enseignant'
      if (role === 'ADMIN') return 'Admin'
      return role
    },
    editRole(user) {
      // TODO (Laravel) : MODIFIER le rôle d'un utilisateur
      // Route API : PATCH /api/admin/users/{id}/role
      // Body : { role: "TEACHER" }
      alert(`Modifier le rôle de ${user.nom}`)
    },
    resetPassword(user) {
      // TODO (Laravel) : RÉINITIALISER le mot de passe
      // Route API : POST /api/admin/users/{id}/reset-password
      // Action : Envoyer un email avec lien de réinitialisation
      alert(`Email de réinitialisation envoyé à ${user.email}`)
    },
    toggleStatus(user) {
      // TODO (Laravel) : ACTIVER/DÉSACTIVER un utilisateur
      // Route API : PATCH /api/admin/users/{id}/status
      // Body : { status: "INACTIVE" ou "ACTIVE" }
      const newStatus = user.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      user.statut = newStatus
    },
    confirmDelete(user) {
      this.userToDelete = user
      this.showDeleteModal = true
    },
    cancelDelete() {
      this.showDeleteModal = false
      this.userToDelete = null
    },
    deleteUser() {
      // TODO (Laravel) : SUPPRIMER un utilisateur (soft delete recommandé)
      // Route API : DELETE /api/admin/users/{id}
      // Ou PATCH /api/admin/users/{id} avec { deleted_at: now() }
      const index = this.users.findIndex((u) => u.id === this.userToDelete.id)
      if (index !== -1) {
        this.users.splice(index, 1)
      }
      this.cancelDelete()
    }
  },
  mounted() {
    this.loadUsers()
  }
}
</script>

<style scoped>
@import './UsersListPage.css';
</style>
