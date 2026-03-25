<template>
  <div class="etudiant-page">
    <AppHeader />

    <main class="etudiant-main">
      <section class="profil-hero panel-surface">
        <div class="hero-copy">
          <p class="hero-kicker">Mon espace</p>
          <h1>Mon profil</h1>
          <p class="hero-subtitle">
            Gere ton compte, mets a jour tes informations et garde un acces
            propre a ton espace BlitzzQuiz.
          </p>

          <div class="hero-actions">
            <button class="btn-secondary" type="button" @click="goBack">
              Retour
            </button>
          </div>
        </div>

        <aside class="hero-summary">
          <div class="hero-avatar-wrapper">
            <div class="hero-avatar">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="Photo de profil"
                class="hero-avatar-image"
                @error="avatarUrl = ''"
              />
              <span v-else>{{ initials }}</span>
            </div>
            <input
              ref="avatarInput"
              class="avatar-input-hidden"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              @change="handleAvatarPicked"
            />
            <button
              class="btn-secondary btn-avatar"
              type="button"
              :disabled="uploadingAvatar"
              @click="openAvatarPicker"
            >
              {{ uploadingAvatar ? 'Upload...' : 'Changer la photo' }}
            </button>
          </div>

          <div class="hero-summary-copy">
            <span class="summary-overline">Compte actif</span>
            <strong>{{ displayName }}</strong>
            <span>{{ form.email || 'Courriel non renseigne' }}</span>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Niveau</span>
              <strong>{{ educationLevelLabel }}</strong>
            </div>

            <div class="summary-item">
              <span class="summary-label">Securite</span>
              <strong>{{ passwordStatusLabel }}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section v-if="message || error" class="feedback-stack">
        <p v-if="message" class="profil-message">{{ message }}</p>
        <p v-if="error" class="profil-error">{{ error }}</p>
      </section>

      <div class="profil-layout">
        <section class="profil-card panel-surface">
          <header class="card-header">
            <p class="card-kicker">Compte</p>
            <h2>Informations du compte</h2>
            <p class="card-description">
              Modifie ton courriel, ton nom visible et ton niveau d'etude.
            </p>
          </header>

          <div class="profil-fields">
            <div class="field-group">
              <label class="field-label">Courriel</label>
              <InputCourriel
                v-model="form.email"
                :placeholder="form.email || 'Courriel (personnel ou scolaire)'"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Nom d'utilisateur</label>
              <InputNomUtilisateur
                v-model="form.username"
                :placeholder="form.username || 'Nom d\'utilisateur'"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Niveau d'etude</label>
              <DropdownNiveauEtude v-model="form.education_level" />
            </div>
          </div>

          <div class="card-actions">
            <button
              class="btn-primary"
              type="button"
              :disabled="savingProfile"
              @click="updateProfile"
            >
              {{ savingProfile ? 'Sauvegarde...' : 'Mettre a jour le profil' }}
            </button>
          </div>
        </section>

        <section
          class="profil-card panel-surface"
          :class="{ 'is-password-disabled': isPasswordChangeDisabled }"
        >
          <header class="card-header">
            <p class="card-kicker">Securite</p>
            <h2 :class="{ 'is-striked': isPasswordChangeDisabled }">Changer le mot de passe</h2>
            <p class="card-description">
              Utilise un mot de passe unique pour proteger ton compte.
            </p>
            <p v-if="isPasswordChangeDisabled" class="password-lock-note">
              Mot de passe gere par {{ authProviderLabel }}. Modification indisponible.
            </p>
          </header>

          <div class="profil-fields">
            <div class="field-group">
              <label class="field-label">Mot de passe actuel</label>
              <InputMotDePasse
                v-model="passwordForm.current_password"
                placeholder="Mot de passe actuel"
                :disabled="isPasswordChangeDisabled"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Nouveau mot de passe</label>
              <InputMotDePasse
                v-model="passwordForm.new_password"
                placeholder="Nouveau mot de passe"
                :disabled="isPasswordChangeDisabled"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Confirmer le nouveau mot de passe</label>
              <InputConfirmerMotDePasse
                v-model="passwordForm.new_password_confirmation"
                placeholder="Confirmer le nouveau mot de passe"
                :disabled="isPasswordChangeDisabled"
              />
            </div>
          </div>

          <p class="security-note">
            Conseil: evite de reutiliser un mot de passe deja employe sur un
            autre service.
          </p>

          <div class="card-actions">
            <button
              class="btn-primary"
              type="button"
              :class="{ 'btn-locked': isPasswordChangeDisabled }"
              :disabled="savingPassword || isPasswordChangeDisabled"
              @click="updatePassword"
            >
              {{
                savingPassword
                  ? 'Modification...'
                  : 'Mettre a jour le mot de passe'
              }}
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import axios from '@/api/Axios'
import AppHeader from '@/accueil-ui/composant/AppHeader.vue'
import InputCourriel from '@/auth-ui/components/InputCourriel.vue'
import InputNomUtilisateur from '@/auth-ui/components/InputNomUtilisateur.vue'
import DropdownNiveauEtude from '@/auth-ui/components/DropdownNiveauEtude.vue'
import InputMotDePasse from '@/auth-ui/components/InputMotDePasse.vue'
import InputConfirmerMotDePasse from '@/auth-ui/components/InputConfirmerMotDePasse.vue'

const EDUCATION_LEVEL_LABELS = {
  universitaire: 'Universitaire',
  'collégiale': 'Collégial',
  collegiale: 'Collégial',
  secondaire: 'Secondaire',
  primaire: 'Primaire',
}

export default {
  name: 'EtudiantProfil',
  components: {
    AppHeader,
    InputCourriel,
    InputNomUtilisateur,
    DropdownNiveauEtude,
    InputMotDePasse,
    InputConfirmerMotDePasse,
  },
  data() {
    return {
      form: {
        email: '',
        username: '',
        education_level: '',
      },
      passwordForm: {
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      },
      avatarUrl: '',
      uploadingAvatar: false,
      hasGoogleAuth: false,
      hasAppleAuth: false,
      savingProfile: false,
      savingPassword: false,
      message: '',
      error: '',
    }
  },
  computed: {
    initials() {
      if (!this.displayName) return '?'

      return this.displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    },
    displayName() {
      if (this.form.username) return this.form.username
      if (this.form.email) return this.form.email.split('@')[0]
      return 'Etudiant'
    },
    educationLevelLabel() {
      return EDUCATION_LEVEL_LABELS[this.form.education_level] || 'A definir'
    },
    isPasswordChangeDisabled() {
      return this.hasGoogleAuth || this.hasAppleAuth
    },
    authProviderLabel() {
      if (this.hasGoogleAuth && this.hasAppleAuth) return 'Google/Apple'
      if (this.hasGoogleAuth) return 'Google'
      if (this.hasAppleAuth) return 'Apple'
      return 'OAuth'
    },
    passwordStatusLabel() {
      if (this.isPasswordChangeDisabled) return `Gere par ${this.authProviderLabel}`
      if (this.savingPassword) return 'Mise a jour'
      return 'Active'
    },
  },
  async mounted() {
    try {
      const { data } = await axios.get('/me')
      const user = data.user ?? data

      this.form.email = user.email || ''
      this.form.username = user.nickname || user.username || ''
      this.form.education_level = this.normalizeEducationLevel(
        user.education_level || ''
      )
      this.avatarUrl = user.avatar || ''
      this.hasGoogleAuth = Boolean(user.google_id)
      this.hasAppleAuth = Boolean(user.apple_id)
    } catch (error) {
      this.error = 'Impossible de charger le profil'
      console.error(error)
    }
  },
  methods: {
    openAvatarPicker() {
      this.$refs.avatarInput?.click()
    },
    mergeUserInStorage(updatedUser) {
      if (!updatedUser) return

      let currentUser = {}
      try {
        const rawUser = localStorage.getItem('user')
        currentUser = rawUser ? JSON.parse(rawUser) : {}
      } catch {
        currentUser = {}
      }

      const mergedUser = {
        ...currentUser,
        ...updatedUser,
      }
      localStorage.setItem('user', JSON.stringify(mergedUser))
      window.dispatchEvent(new Event('user-updated'))
    },
    async handleAvatarPicked(event) {
      const input = event?.target
      const file = input?.files?.[0]
      if (!file) return

      const maxBytes = 5 * 1024 * 1024
      if (file.size > maxBytes) {
        this.error = 'Image trop lourde (max 5 MB).'
        this.message = ''
        if (input) input.value = ''
        return
      }

      this.uploadingAvatar = true
      this.message = ''
      this.error = ''

      try {
        const formData = new FormData()
        formData.append('avatar', file)

        const { data } = await axios.post('/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        const updatedUser = data?.user
        if (updatedUser) {
          this.avatarUrl = updatedUser.avatar || ''
          this.form.email = updatedUser.email || this.form.email
          this.form.username = updatedUser.nickname || updatedUser.username || this.form.username
          this.form.education_level = this.normalizeEducationLevel(
            updatedUser.education_level || this.form.education_level
          )
          this.mergeUserInStorage(updatedUser)
        }

        this.message = data?.message || 'Photo de profil mise a jour'
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Erreur lors du televersement de la photo de profil'
      } finally {
        this.uploadingAvatar = false
        if (input) input.value = ''
      }
    },
    async updateProfile() {
      this.savingProfile = true
      this.message = ''
      this.error = ''

      try {
        const payload = {
          email: this.form.email,
          nickname: this.form.username,
          education_level: this.form.education_level,
        }

        const { data } = await axios.patch('/me', payload)
        const updatedUser = data?.user
        if (updatedUser) {
          this.avatarUrl = updatedUser.avatar || this.avatarUrl
          this.mergeUserInStorage(updatedUser)
        }
        this.message = data.message || 'Profil mis a jour'
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Erreur lors de la mise a jour du profil'
      } finally {
        this.savingProfile = false
      }
    },
    async updatePassword() {
      if (this.isPasswordChangeDisabled) {
        this.message = ''
        this.error = `Ce compte utilise ${this.authProviderLabel}. Le mot de passe se gere chez ${this.authProviderLabel}.`
        return
      }

      this.savingPassword = true
      this.message = ''
      this.error = ''

      try {
        const { data } = await axios.patch('/me/password', this.passwordForm)
        this.message = data.message || 'Mot de passe modifie'
        this.passwordForm.current_password = ''
        this.passwordForm.new_password = ''
        this.passwordForm.new_password_confirmation = ''
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Erreur lors du changement de mot de passe'
      } finally {
        this.savingPassword = false
      }
    },
    normalizeEducationLevel(value) {
      const normalized = String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      const mapping = {
        universitaire: 'universitaire',
        collegiale: 'collégiale',
        secondaire: 'secondaire',
        primaire: 'primaire',
      }

      return mapping[normalized] || value || ''
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
        return
      }

      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
@import './EtudiantProfil.css';
</style>
