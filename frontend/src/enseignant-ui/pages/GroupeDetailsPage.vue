<template>
  <div class="groupe-details-page">
    <AppHeader />
    <main class="groupe-details-main" v-if="groupe">
      <!-- Header avec actions -->
      <header class="details-header">
        <div>
          <button type="button" class="back-button" @click="goBack">
            ← Retour
          </button>
          <h1>{{ groupe.nom }}</h1>
        </div>
        <button type="button" class="delete-button" @click="requestDelete">
          Supprimer le groupe
        </button>
      </header>

      <!-- Section 1 : Infos groupe -->
      <section class="details-section">
        <h2>📋 Informations du groupe</h2>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Nom :</span>
            <span class="info-value">{{ groupe.nom }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Description :</span>
            <span class="info-value">{{ groupe.description || 'Aucune description' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Visibilité :</span>
            <div class="visibility-controls">
              <span :class="['pill', groupe.isPublic ? 'pill--public' : 'pill--private']">
                {{ groupe.isPublic ? 'Public' : 'Privé' }}
              </span>
              <button type="button" class="toggle-visibility-btn" @click="toggleVisibility">
                Modifier
              </button>
            </div>
          </div>
          <div class="info-row" v-if="!groupe.isPublic">
            <span class="info-label">Code du groupe :</span>
            <div class="code-display">
              <span class="code-value">{{ groupe.code }}</span>
              <button type="button" class="copy-button" @click="copyCode">
                {{ codeCopied ? 'Copié !' : 'Copier' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2 : Liste membres -->
      <section class="details-section">
        <div class="section-header">
          <h2>👥 Membres ({{ groupe.membres.length }})</h2>
          <button type="button" class="action-button" @click="showInviteModal = true">
            + Inviter un membre
          </button>
        </div>
        <div v-if="groupe.membres.length" class="membres-list">
          <div
            v-for="membre in groupe.membres"
            :key="membre.id"
            class="membre-item"
          >
            <span class="membre-name">{{ membre.nom }}</span>
            <span class="membre-email">{{ membre.email }}</span>
          </div>
        </div>
        <p v-else class="empty-message">Aucun membre pour l'instant.</p>
      </section>

      <!-- Section 3 : Quiz assignés -->
      <section class="details-section">
        <h2>📝 Quiz assignés au groupe</h2>
        
        <!-- Formulaire d'assignation -->
        <div class="assign-form">
          <select v-model="selectedQuizId" class="quiz-select">
            <option value="">Sélectionner un quiz</option>
            <option
              v-for="quiz in availableQuizzes"
              :key="quiz.id"
              :value="quiz.id"
            >
              {{ quiz.titre }} ({{ quiz.nbQuestions }} questions)
            </option>
          </select>
          <button
            type="button"
            class="action-button"
            @click="assignQuiz"
            :disabled="!selectedQuizId"
          >
            Associer
          </button>
        </div>

        <!-- Liste des quiz assignés -->
        <div v-if="groupe.quizAssignes.length" class="quiz-list">
          <div
            v-for="quizAssigne in groupe.quizAssignes"
            :key="quizAssigne.quizId"
            class="quiz-item"
          >
            <div class="quiz-info">
              <span class="quiz-name">{{ getQuizName(quizAssigne.quizId) }}</span>
              <span :class="['badge', quizAssigne.statut === 'actif' ? 'badge--actif' : 'badge--termine']">
                {{ quizAssigne.statut === 'actif' ? 'Actif' : 'Terminé' }}
              </span>
            </div>
            <button
              type="button"
              class="remove-button"
              @click="removeQuizAssignment(quizAssigne.quizId)"
            >
              Retirer
            </button>
          </div>
        </div>
        <p v-else class="empty-message">Aucun quiz assigné.</p>
      </section>

      <!-- Modal Supprimer -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal-content" @click.stop>
          <h3>Supprimer ce groupe ?</h3>
          <p>Cette action est irréversible.</p>
          <div class="modal-actions">
            <button type="button" class="cancel-button" @click="closeDeleteModal">
              Annuler
            </button>
            <button type="button" class="delete-button" @click="confirmDelete">
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Inviter membre -->
      <div v-if="showInviteModal" class="modal-overlay" @click="showInviteModal = false">
        <div class="modal-content" @click.stop>
          <h3>Inviter un membre</h3>
          <p class="help-text">Entrez l'email de l'étudiant à inviter</p>
          <input
            v-model="inviteEmail"
            type="email"
            placeholder="exemple@email.com"
            class="modal-input"
          />
          <div class="modal-actions">
            <button type="button" class="cancel-button" @click="showInviteModal = false">
              Annuler
            </button>
            <button type="button" class="action-button" @click="inviteMembre">
              Envoyer l'invitation
            </button>
          </div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'GroupeDetailsPage',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      groupe: null,
      allQuizzes: [],
      selectedQuizId: '',
      codeCopied: false,
      showDeleteModal: false,
      showInviteModal: false,
      inviteEmail: ''
    }
  },
  computed: {
    availableQuizzes() {
      // Quizz qui ne sont pas déjà assignés
      const assignedIds = this.groupe.quizAssignes.map((qa) => qa.quizId)
      return this.allQuizzes.filter((q) => !assignedIds.includes(q.id))
    }
  },
  methods: {
    loadGroupe() {
      // TODO (Laravel) : RÉCUPÉRER les détails d'un groupe spécifique
      // Route API : GET /api/groupes/{id}
      // Headers : Authorization: Bearer {token}
      // Réponse attendue : { id, nom, description, isPublic, code, nbMembres, membres: [...], quizAssignes: [...] }
      // Exemple d'appel :
      // const id = this.$route.params.id
      // axios.get(`/api/groupes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      //   .then(response => { this.groupe = response.data })
      //   .catch(() => { this.$router.push('/enseignant/groupes') })
      
      // Code temporaire front-only (à supprimer après Laravel)
      const storageKey = 'enseignant_groupes'
      const id = Number(this.$route.params.id)
      try {
        const saved = localStorage.getItem(storageKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          this.groupe = parsed.find((g) => g.id === id)
        }
      } catch {
        this.groupe = null
      }
      if (!this.groupe) {
        this.$router.push('/enseignant/groupes')
      }
    },
    loadQuizzes() {
      // TODO (Laravel) : RÉCUPÉRER tous les quiz de l'enseignant
      // Route API : GET /api/quizzes
      // Headers : Authorization: Bearer {token}
      // Réponse attendue : [{ id, titre, nbQuestions, ... }]
      
      // Code temporaire front-only (à supprimer après Laravel)
      const storageKey = 'enseignant_quizzes'
      try {
        const saved = localStorage.getItem(storageKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          this.allQuizzes = parsed
        }
      } catch {
        this.allQuizzes = []
      }
    },
    getQuizName(quizId) {
      const quiz = this.allQuizzes.find((q) => q.id === quizId)
      return quiz ? quiz.titre : 'Quiz inconnu'
    },
    copyCode() {
      navigator.clipboard.writeText(this.groupe.code)
      this.codeCopied = true
      setTimeout(() => {
        this.codeCopied = false
      }, 2000)
    },
    toggleVisibility() {
      this.groupe.isPublic = !this.groupe.isPublic
      this.saveGroupe()
      
      // TODO (Laravel) : METTRE À JOUR la visibilité du groupe dans la DB
      // Route API : PATCH /api/groupes/{id}
      // Headers : Authorization: Bearer {token}
      // Body à envoyer : { isPublic: this.groupe.isPublic }
      // Exemple d'appel :
      // axios.patch(`/api/groupes/${this.groupe.id}`, { isPublic: this.groupe.isPublic }, { headers: { Authorization: `Bearer ${token}` } })
      
      // À METTRE À JOUR dans la table `groupes` :
      // - is_public (boolean)
      // - updated_at (timestamp)
    },
    assignQuiz() {
      if (!this.selectedQuizId) return
      
      const newAssignment = {
        quizId: this.selectedQuizId,
        statut: 'actif',
        dateAssignation: new Date().toISOString()
      }
      
      this.groupe.quizAssignes.push(newAssignment)
      this.selectedQuizId = ''
      this.saveGroupe()
      
      // TODO (Laravel) : ASSIGNER un quiz à un groupe (créer relation)
      // Route API : POST /api/groupes/{id}/quizzes
      // Headers : Authorization: Bearer {token}
      // Body à envoyer : { quiz_id: this.selectedQuizId }
      // Réponse attendue : { success: true, message: "Quiz assigné" }
      // Exemple d'appel :
      // axios.post(`/api/groupes/${this.groupe.id}/quizzes`, { quiz_id: this.selectedQuizId }, { headers: { Authorization: `Bearer ${token}` } })
      
      // À ENREGISTRER dans la table pivot `groupe_quiz` :
      // - groupe_id (foreign key -> groupes.id)
      // - quiz_id (foreign key -> quizzes.id)
      // - statut (enum: 'actif', 'termine')
      // - date_assignation (timestamp)
      // - created_at, updated_at
    },
    removeQuizAssignment(quizId) {
      this.groupe.quizAssignes = this.groupe.quizAssignes.filter(
        (qa) => qa.quizId !== quizId
      )
      this.saveGroupe()
      
      // TODO (Laravel) : RETIRER l'assignation d'un quiz (supprimer relation)
      // Route API : DELETE /api/groupes/{id}/quizzes/{quizId}
      // Headers : Authorization: Bearer {token}
      // Réponse attendue : { success: true, message: "Quiz retiré" }
      // Exemple d'appel :
      // axios.delete(`/api/groupes/${this.groupe.id}/quizzes/${quizId}`, { headers: { Authorization: `Bearer ${token}` } })
      
      // À SUPPRIMER de la table pivot `groupe_quiz` :
      // WHERE groupe_id = {id} AND quiz_id = {quizId}
    },
    inviteMembre() {
      if (!this.inviteEmail) return
      
      // Simulation simple d'ajout de membre
      const newMembre = {
        id: Date.now(),
        nom: this.inviteEmail.split('@')[0],
        email: this.inviteEmail
      }
      
      this.groupe.membres.push(newMembre)
      this.groupe.nbMembres = this.groupe.membres.length
      this.saveGroupe()
      this.inviteEmail = ''
      this.showInviteModal = false
      
      // TODO (Laravel) : INVITER un membre au groupe (ajouter relation)
      // Route API : POST /api/groupes/{id}/membres
      // Headers : Authorization: Bearer {token}
      // Body à envoyer : { email: this.inviteEmail }
      // Réponse attendue : { success: true, membre: { id, nom, email }, message: "Invitation envoyée" }
      // Exemple d'appel :
      // axios.post(`/api/groupes/${this.groupe.id}/membres`, { email: this.inviteEmail }, { headers: { Authorization: `Bearer ${token}` } })
      //   .then(response => { this.groupe.membres.push(response.data.membre); this.groupe.nbMembres++ })
      
      // À ENREGISTRER dans la table pivot `groupe_user` (ou `groupe_etudiant`) :
      // - groupe_id (foreign key -> groupes.id)
      // - user_id (foreign key -> users.id, trouvé via email)
      // - role (enum: 'membre', 'admin', default 'membre')
      // - date_ajout (timestamp)
      // - created_at, updated_at
      
      // ALTERNATIVE : envoyer une notification/email d'invitation
      // - Créer une entrée dans `invitations` avec un token unique
      // - L'étudiant confirme via un lien pour rejoindre le groupe
    },
    saveGroupe() {
      // TODO (Laravel) : METTRE À JOUR le groupe dans la DB (méthode générique)
      // Route API : PATCH /api/groupes/{id}
      // Headers : Authorization: Bearer {token}
      // Body à envoyer : { nom, description, isPublic, ... } (tous les champs modifiés)
      // Cette méthode est utilisée par toggleVisibility(), assignQuiz(), etc.
      
      // Code temporaire front-only (à supprimer après Laravel)
      const storageKey = 'enseignant_groupes'
      try {
        const saved = localStorage.getItem(storageKey)
        const groupes = saved ? JSON.parse(saved) : []
        const index = groupes.findIndex((g) => g.id === this.groupe.id)
        if (index !== -1) {
          groupes[index] = this.groupe
          localStorage.setItem(storageKey, JSON.stringify(groupes))
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde', error)
      }
    },
    requestDelete() {
      this.showDeleteModal = true
    },
    closeDeleteModal() {
      this.showDeleteModal = false
    },
    confirmDelete() {
      // TODO (Laravel) : SUPPRIMER le groupe de la base de données
      // Route API : DELETE /api/groupes/{id}
      // Headers : Authorization: Bearer {token}
      // Réponse attendue : { success: true, message: "Groupe supprimé" }
      // Exemple d'appel :
      // axios.delete(`/api/groupes/${this.groupe.id}`, { headers: { Authorization: `Bearer ${token}` } })
      //   .then(() => { this.$router.push('/enseignant/groupes') })
      //   .catch(error => { console.error('Erreur suppression', error) })
      
      // À SUPPRIMER de la DB :
      // 1. Entrée dans la table `groupes` WHERE id = {id}
      // 2. Toutes les relations dans `groupe_quiz` WHERE groupe_id = {id}
      // 3. Toutes les relations dans `groupe_user` WHERE groupe_id = {id}
      // (utiliser les cascades ON DELETE ou le faire manuellement)
      
      // Code temporaire front-only (à supprimer après Laravel)
      const storageKey = 'enseignant_groupes'
      try {
        const saved = localStorage.getItem(storageKey)
        const groupes = saved ? JSON.parse(saved) : []
        const filtered = groupes.filter((g) => g.id !== this.groupe.id)
        localStorage.setItem(storageKey, JSON.stringify(filtered))
      } catch (error) {
        console.error('Erreur lors de la suppression', error)
      }
      this.$router.push('/enseignant/groupes')
    },
    goBack() {
      this.$router.push('/enseignant/groupes')
    }
  },
  mounted() {
    this.loadGroupe()
    this.loadQuizzes()
  }
}
</script>

<style scoped>
@import './GroupeDetailsPage.css';
</style>
