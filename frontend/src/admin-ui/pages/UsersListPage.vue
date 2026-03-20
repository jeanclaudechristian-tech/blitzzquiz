<template>
  <div class="users-list-page">
    <AppHeader />

    <main class="users-main">
      <header class="users-header">
        <h1>Gestion des utilisateurs</h1>
        <p class="subtitle">Recherche, filtrage et actions sur les comptes.</p>
      </header>

      <section class="controls-bar" aria-label="Filtres utilisateurs">
        <div class="search-box">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom ou email"
            class="search-input"
          />
        </div>

        <div class="filter-controls">
          <label for="role-filter">Rôle</label>
          <select id="role-filter" v-model="roleFilter">
            <option value="">Tous</option>
            <option value="STUDENT">Étudiant</option>
            <option value="TEACHER">Enseignant</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </section>

      <p v-if="flashMessage" :class="['flash-message', flashType]">{{ flashMessage }}</p>

      <section class="users-table-container">
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
            <tr v-if="isLoading">
              <td colspan="5" class="table-message">Chargement...</td>
            </tr>

            <tr v-else-if="errorMessage">
              <td colspan="5" class="table-message table-error">{{ errorMessage }}</td>
            </tr>

            <tr v-else-if="!filteredUsers.length">
              <td colspan="5" class="table-message">Aucun utilisateur trouvé</td>
            </tr>

            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
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
                  class="action-icon-btn"
                  title="Réinitialiser le mot de passe"
                  :disabled="isMutating"
                  @click="resetPassword(user)"
                >
                  <span class="material-symbols-outlined">key</span>
                </button>

                <button
                  type="button"
                  class="action-icon-btn"
                  :title="user.statut === 'ACTIVE' ? 'Désactiver le compte' : 'Activer le compte'"
                  :disabled="isMutating"
                  @click="toggleStatus(user)"
                >
                  <span class="material-symbols-outlined">
                    {{ user.statut === 'ACTIVE' ? 'lock_person' : 'person_check' }}
                  </span>
                </button>

                <button
                  type="button"
                  class="action-icon-btn action-danger"
                  title="Supprimer"
                  :disabled="isMutating"
                  @click="confirmDelete(user)"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <footer v-if="!isLoading && !errorMessage" class="table-footer">
          <p>{{ filteredUsers.length }} affiché(s) • {{ totalUsers }} au total</p>
          <div class="pagination">
            <button type="button" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
              Précédent
            </button>
            <span>Page {{ currentPage }} / {{ lastPage }}</span>
            <button type="button" :disabled="currentPage >= lastPage" @click="goToPage(currentPage + 1)">
              Suivant
            </button>
          </div>
        </footer>
      </section>

      <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
        <div class="modal-content" @click.stop>
          <h3>Confirmer la suppression</h3>
          <p>Supprimer l'utilisateur <strong>{{ userToDelete?.nom }}</strong> ?</p>
          <p class="warning-text">Cette action est irréversible.</p>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="cancelDelete">Annuler</button>
            <button type="button" class="btn-delete" :disabled="isMutating" @click="deleteUser">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import { adminService } from '@/api/admin'

export default {
  name: 'UsersListPage',
  components: { AppHeader },
  data() {
    return {
      users: [],
      searchQuery: '',
      roleFilter: '',
      isLoading: false,
      isMutating: false,
      errorMessage: '',
      flashMessage: '',
      flashType: 'success',
      currentPage: 1,
      lastPage: 1,
      totalUsers: 0,
      showDeleteModal: false,
      userToDelete: null,
      searchDebounce: null,
      flashTimer: null,
    }
  },
  computed: {
    filteredUsers() {
      if (!this.roleFilter) return this.users
      return this.users.filter((user) => user.role === this.roleFilter)
    },
  },
  watch: {
    searchQuery() {
      clearTimeout(this.searchDebounce)
      this.searchDebounce = setTimeout(() => {
        this.loadUsers(1)
      }, 320)
    },
  },
  methods: {
    setFlash(message, type = 'success') {
      this.flashMessage = message
      this.flashType = type
      clearTimeout(this.flashTimer)
      this.flashTimer = setTimeout(() => {
        this.flashMessage = ''
      }, 2600)
    },
    mapUser(raw) {
      const nom = raw?.nickname || raw?.email?.split('@')?.[0] || 'Utilisateur'
      return {
        id: raw.id,
        nom,
        email: raw.email,
        role: raw.role,
        statut: raw.is_disabled ? 'INACTIVE' : 'ACTIVE',
      }
    },
    async loadUsers(page = 1) {
      this.isLoading = true
      this.errorMessage = ''
      try {
        const response = await adminService.getUsers(page, this.searchQuery.trim())
        const paginator = response?.data?.data
        const rows = Array.isArray(paginator?.data) ? paginator.data : []
        this.users = rows.map(this.mapUser)
        this.currentPage = Number(paginator?.current_page || 1)
        this.lastPage = Number(paginator?.last_page || 1)
        this.totalUsers = Number(paginator?.total || 0)
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error)
        this.errorMessage = error?.response?.data?.message || 'Impossible de charger les utilisateurs.'
      } finally {
        this.isLoading = false
      }
    },
    getRoleLabel(role) {
      if (role === 'STUDENT') return 'Étudiant'
      if (role === 'TEACHER') return 'Enseignant'
      if (role === 'ADMIN') return 'Admin'
      return role
    },
    async resetPassword(user) {
      this.isMutating = true
      try {
        const response = await adminService.resetUserPassword(user.id)
        const pwd = response?.data?.data?.temporary_password
        if (pwd) {
          this.setFlash(`Mot de passe temporaire: ${pwd}`)
        } else {
          this.setFlash('Mot de passe réinitialisé.')
        }
      } catch (error) {
        console.error('Erreur reset password:', error)
        this.setFlash(error?.response?.data?.message || 'Erreur lors de la réinitialisation.', 'error')
      } finally {
        this.isMutating = false
      }
    },
    async toggleStatus(user) {
      this.isMutating = true
      try {
        const response = await adminService.toggleUserStatus(user.id)
        const isDisabled = response?.data?.data?.is_disabled
        if (typeof isDisabled === 'boolean') {
          user.statut = isDisabled ? 'INACTIVE' : 'ACTIVE'
        } else {
          user.statut = user.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        }
        this.setFlash(user.statut === 'ACTIVE' ? 'Compte activé.' : 'Compte désactivé.')
      } catch (error) {
        console.error('Erreur activation/desactivation:', error)
        this.setFlash(error?.response?.data?.message || 'Action refusée.', 'error')
      } finally {
        this.isMutating = false
      }
    },
    confirmDelete(user) {
      this.userToDelete = user
      this.showDeleteModal = true
    },
    cancelDelete() {
      this.showDeleteModal = false
      this.userToDelete = null
    },
    async deleteUser() {
      if (!this.userToDelete) return
      this.isMutating = true
      try {
        await adminService.deleteUser(this.userToDelete.id)
        this.setFlash('Utilisateur supprimé.')
        this.cancelDelete()
        await this.loadUsers(this.currentPage)
      } catch (error) {
        console.error('Erreur suppression utilisateur:', error)
        this.setFlash(error?.response?.data?.message || 'Suppression impossible.', 'error')
      } finally {
        this.isMutating = false
      }
    },
    goToPage(page) {
      if (page < 1 || page > this.lastPage) return
      this.loadUsers(page)
    },
  },
  beforeUnmount() {
    clearTimeout(this.searchDebounce)
    clearTimeout(this.flashTimer)
  },
  mounted() {
    this.loadUsers(1)
  },
}
</script>

<style scoped>
@import './UsersListPage.css';
</style>
