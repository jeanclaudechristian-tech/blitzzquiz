<template>
  <div class="groupe-create-page">
    <AppHeader />
    <main class="groupe-create-main">
      <div class="create-card">
        <header class="create-header">
          <h1>Créer un groupe</h1>
          <button type="button" class="back-button" @click="goBack">
            ← Retour
          </button>
        </header>

        <form class="create-form" @submit.prevent="handleSubmit">
          <!-- Nom du groupe -->
          <div class="form-group">
            <label for="nom">Nom du groupe <span class="required">*</span></label>
            <input
              id="nom"
              v-model="formData.nom"
              type="text"
              placeholder="Ex: Groupe Math 2024"
              required
            />
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Brève description du groupe..."
              rows="3"
            ></textarea>
          </div>

          <!-- Visibilité -->
          <div class="form-group">
            <label>Visibilité</label>
            <div class="visibility-toggle">
              <button
                type="button"
                :class="['toggle-option', { active: formData.isPublic }]"
                @click="formData.isPublic = true"
              >
                Public
              </button>
              <button
                type="button"
                :class="['toggle-option', { active: !formData.isPublic }]"
                @click="formData.isPublic = false"
              >
                Privé
              </button>
            </div>
          </div>

          <!-- Code du groupe (généré automatiquement) -->
          <div class="form-group">
            <label>Code du groupe</label>
            <div class="code-display">
              <input
                type="text"
                :value="groupeCode"
                readonly
                class="code-input"
              />
              <button
                type="button"
                class="copy-button"
                @click="copyCode"
                :disabled="!groupeCode"
              >
                {{ codeCopied ? 'Copié !' : 'Copier' }}
              </button>
            </div>
            <p class="help-text">Ce code sera généré automatiquement (6 caractères)</p>
          </div>

          <!-- Message d'erreur -->
          <p v-if="error" class="error-msg">{{ error }}</p>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="goBack">
              Annuler
            </button>
            <button type="submit" class="submit-button">
              Créer le groupe
            </button>
          </div>
        </form>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'GroupeCreatePage',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      formData: {
        nom: '',
        description: '',
        isPublic: true
      },
      groupeCode: '',
      codeCopied: false,
      error: ''
    }
  },
  methods: {
    generateCode() {
      // Génère un code de 6 caractères alphanumériques
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = ''
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    },
    copyCode() {
      navigator.clipboard.writeText(this.groupeCode)
      this.codeCopied = true
      setTimeout(() => {
        this.codeCopied = false
      }, 2000)
    },
    handleSubmit() {
      this.error = ''

      // Validation
      if (!this.formData.nom.trim()) {
        this.error = 'Le nom du groupe est obligatoire'
        return
      }

      // TODO (Laravel) : ENREGISTRER le nouveau groupe dans la base de données
      // Route API : POST /api/groupes
      // Headers : Authorization: Bearer {token}
      // Body à envoyer : { nom, description, isPublic, code }
      // Réponse attendue : { id, nom, description, isPublic, code, nbMembres, created_at, ... }
      // Exemple d'appel :
      // const payload = { nom: this.formData.nom, description: this.formData.description, isPublic: this.formData.isPublic, code: this.groupeCode }
      // axios.post('/api/groupes', payload, { headers: { Authorization: `Bearer ${token}` } })
      //   .then(response => { const groupe = response.data; this.$router.push(`/enseignant/groupes/${groupe.id}`) })
      //   .catch(error => { this.error = error.response?.data?.message || 'Erreur' })
      
      // À ENREGISTRER dans la table `groupes` :
      // - nom (string, required)
      // - description (text, nullable)
      // - is_public (boolean, default true)
      // - code (string 6 chars, unique)
      // - enseignant_id (foreign key -> users.id)
      // - created_at, updated_at (timestamps)
      
      // Code temporaire front-only (à supprimer après Laravel)
      const newGroupe = {
        id: Date.now(), // En Laravel, l'ID sera auto-généré par la DB
        nom: this.formData.nom.trim(),
        description: this.formData.description.trim(),
        isPublic: this.formData.isPublic,
        code: this.groupeCode,
        nbMembres: 0,
        membres: [],
        quizAssignes: []
      }

      const storageKey = 'enseignant_groupes'
      try {
        const saved = localStorage.getItem(storageKey)
        const existing = saved ? JSON.parse(saved) : []
        existing.push(newGroupe)
        localStorage.setItem(storageKey, JSON.stringify(existing))
      } catch {
        this.error = 'Erreur lors de la création du groupe'
        return
      }

      // Redirection vers la liste des groupes
      this.$router.push('/enseignant/groupes')
    },
    goBack() {
      this.$router.push('/enseignant/groupes')
    }
  },
  mounted() {
    // Génère un code au chargement de la page
    this.groupeCode = this.generateCode()
  }
}
</script>

<style scoped>
@import './GroupeCreatePage.css';
</style>
