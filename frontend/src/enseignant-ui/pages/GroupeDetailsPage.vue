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
        <h2>Informations du groupe</h2>
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
          <h2>Membres ({{ groupe.membres.length }})</h2>
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
        <h2>Quiz assignés au groupe</h2>

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
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import { groupService } from '../../api/groups'

export default {
  name: 'GroupeDetailsPage',
  components: {
    AppHeader
  },
  data() {
    return {
      groupe: null,
      allQuizzes: [],
      selectedQuizId: '',
      codeCopied: false,
      showDeleteModal: false,
      showInviteModal: false,
      inviteEmail: '',
    }
  },
  computed: {
    availableQuizzes() {
      const assignedIds = this.groupe?.quizAssignes?.map((qa) => qa.quizId) ?? []
      return this.allQuizzes.filter((q) => !assignedIds.includes(q.id))
    },
  },
  methods: {
    async loadGroupe() {
      // VERSION API : plus de localStorage
      try {
        const id = this.$route.params.id
        const { data } = await groupService.show(id)

        this.groupe = {
          id: data.id,
          nom: data.nom,
          description: data.description ?? '',
          isPublic: !!data.is_public,
          code: data.code_invitation,
          membres: data.members ?? [],
          nbMembres: data.nb_membres ?? (data.members ? data.members.length : 0),
          quizAssignes: data.assignments ?? [],
        }
      } catch (e) {
        console.error(e)
        this.$router.push('/enseignant/groupes')
      }
    },
    loadQuizzes() {
      // tu gardes ton mock ou tu brancheras plus tard sur /api/quizzes
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
    async toggleVisibility() {
      const newValue = !this.groupe.isPublic
      try {
        const { data } = await groupService.update(this.groupe.id, {
          is_public: newValue,
        })
        this.groupe.isPublic = !!data.is_public
        this.groupe.code = data.code_invitation
      } catch (e) {
        console.error(e)
      }
    },
    assignQuiz() {
      // inchangé (mock), tu brancheras ensuite sur l’API
      if (!this.selectedQuizId) return
      const newAssignment = {
        quizId: this.selectedQuizId,
        statut: 'actif',
        dateAssignation: new Date().toISOString(),
      }
      this.groupe.quizAssignes.push(newAssignment)
      this.selectedQuizId = ''
    },
    removeQuizAssignment(quizId) {
      this.groupe.quizAssignes = this.groupe.quizAssignes.filter(
        (qa) => qa.quizId !== quizId,
      )
    },
    inviteMembre() {
      // pour l’instant mock; tu brancheras plus tard
      if (!this.inviteEmail) return
      const newMembre = {
        id: Date.now(),
        nom: this.inviteEmail.split('@')[0],
        email: this.inviteEmail,
      }
      this.groupe.membres.push(newMembre)
      this.groupe.nbMembres = this.groupe.membres.length
      this.inviteEmail = ''
      this.showInviteModal = false
    },
    requestDelete() {
      this.showDeleteModal = true
    },
    closeDeleteModal() {
      this.showDeleteModal = false
    },
    async confirmDelete() {
      try {
        await groupService.destroy(this.groupe.id)
      } catch (e) {
        console.error(e)
      }
      this.$router.push('/enseignant/groupes')
    },
    goBack() {
      this.$router.push('/enseignant/groupes')
    },
  },
  mounted() {
    this.loadGroupe()
    this.loadQuizzes()
  },
}
</script>

<style scoped>
@import './GroupeDetailsPage.css';
</style>
