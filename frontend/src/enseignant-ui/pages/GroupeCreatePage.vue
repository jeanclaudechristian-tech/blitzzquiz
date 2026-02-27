<template>
  <div class="groupe-create-page">
    <AppHeader />
    <main class="groupe-create-main">
      <div class="create-card">
        <header class="create-header">
          <h1>Créer un groupe</h1>
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
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import { groupService } from '../../api/groups'

export default {
  name: 'GroupeCreatePage',
  components: {
    AppHeader
  },
  data() {
    return {
      formData: {
        nom: '',
        description: '',
        isPublic: true,
      },
      groupeCode: '',
      codeCopied: false,
      error: '',
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
    async handleSubmit() {
      this.error = ''

      // Validation
      if (!this.formData.nom.trim()) {
        this.error = 'Le nom du groupe est obligatoire'
        return
      }

      // VERSION API (remplace tout le bloc localStorage)
      try {
        const payload = {
          nom: this.formData.nom.trim(),
          is_public: this.formData.isPublic,
          // description à ajouter côté BD plus tard si tu veux
        }

        const { data: groupe } = await groupService.create(payload)

        // Redirection vers la page détail du groupe créé
        this.$router.push(`/enseignant/groupes/${groupe.id}`)
      } catch (e) {
        console.error(e)
        this.error =
          e.response?.data?.message || 'Erreur lors de la création du groupe'
      }
    },
    goBack() {
      this.$router.push('/enseignant')
    },
  },
  mounted() {
    // Génère un code au chargement de la page (visuel pour l'instant)
    this.groupeCode = this.generateCode()
  },
}
</script>

<style scoped>
@import './GroupeCreatePage.css';
</style>
