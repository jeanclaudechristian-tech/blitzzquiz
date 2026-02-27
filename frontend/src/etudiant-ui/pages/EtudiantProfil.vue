<template>
  <div class="etudiant-page">
    <AppHeader />

    <main class="etudiant-main">
      <!-- Hero -->
      <section class="etudiant-hero">
        <div class="etudiant-hero-left">
          <h1>Profil étudiant</h1>
          <p>Consulte et mets à jour les informations de ton compte Blitzz Quiz.</p>

          <div class="etudiant-hero-actions">
            <button class="btn-primary" @click="goBackToDashboard">
              Retour au tableau de bord
            </button>
          </div>
        </div>

      </section>

      <!-- Carte profil -->
      <section class="profil-card">
        <h2>Informations du compte</h2>

        <div class="profil-fields">
          <label class="field-label">Courriel</label>
          <InputCourriel v-model="form.email" />

          <label class="field-label">Nom d’utilisateur</label>
          <InputNomUtilisateur v-model="form.username" />

          <label class="field-label">Niveau d’étude</label>
          <DropdownNiveauEtude v-model="form.education_level" />
        </div>

        <button
          class="btn-primary"
          :disabled="savingProfile"
          @click="updateProfile"
        >
          {{ savingProfile ? 'Sauvegarde...' : 'Mettre à jour le profil' }}
        </button>
      </section>

      <!-- Carte mot de passe -->
      <section class="profil-card">
        <h2>Changer le mot de passe</h2>

        <div class="profil-fields">
          <label class="field-label">Mot de passe actuel</label>
          <InputMotDePasse
            v-model="passwordForm.current_password"
            placeholder="Mot de passe actuel"
          />

          <label class="field-label">Nouveau mot de passe</label>
          <InputMotDePasse
            v-model="passwordForm.new_password"
            placeholder="Nouveau mot de passe"
          />

          <label class="field-label">Confirmer le nouveau mot de passe</label>
          <InputConfirmerMotDePasse
            v-model="passwordForm.new_password_confirmation"
          />
        </div>

        <button
          class="btn-primary"
          :disabled="savingPassword"
          @click="updatePassword"
        >
          {{ savingPassword ? 'Modification...' : 'Mettre à jour le mot de passe' }}
        </button>
      </section>

      <p v-if="message" class="profil-message">{{ message }}</p>
      <p v-if="error" class="profil-error">{{ error }}</p>
    </main>
  </div>
</template>

<script>
import axios from '@/api/axios'
import AppHeader from '@/accueil-ui/composant/AppHeader.vue'
import InputCourriel from '@/auth-ui/components/InputCourriel.vue'
import InputNomUtilisateur from '@/auth-ui/components/InputNomUtilisateur.vue'
import DropdownNiveauEtude from '@/auth-ui/components/DropdownNiveauEtude.vue'
import InputMotDePasse from '@/auth-ui/components/InputMotDePasse.vue'
import InputConfirmerMotDePasse from '@/auth-ui/components/InputConfirmerMotDePasse.vue'

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
      savingProfile: false,
      savingPassword: false,
      message: '',
      error: '',
    }
  },
  computed: {
    initials() {
      if (!this.form.username) return '?'
      return this.form.username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    },
  },
  async mounted() {
    try {
      // API: GET /api/me   (si baseURL = https://.../api)
      const { data } = await axios.get('/me')
      this.form.email = data.email
      this.form.username = data.nickname || data.username || ''
      this.form.education_level = data.education_level || ''
    } catch (e) {
      this.error = 'Impossible de charger le profil'
      console.error(e)
    }
  },
  methods: {
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

        // API: PATCH /api/me
        const { data } = await axios.patch('/me', payload)
        this.message = data.message || 'Profil mis à jour'
      } catch (e) {
        this.error =
          e.response?.data?.message ||
          "Erreur lors de la mise à jour du profil"
      } finally {
        this.savingProfile = false
      }
    },
    async updatePassword() {
      this.savingPassword = true
      this.message = ''
      this.error = ''
      try {
        // API: PATCH /api/me/password
        const { data } = await axios.patch('/me/password', this.passwordForm)
        this.message = data.message || 'Mot de passe modifié'
        this.passwordForm.current_password = ''
        this.passwordForm.new_password = ''
        this.passwordForm.new_password_confirmation = ''
      } catch (e) {
        this.error =
          e.response?.data?.message ||
          'Erreur lors du changement de mot de passe'
      } finally {
        this.savingPassword = false
      }
    },
    goBackToDashboard() {
      this.$router.push('/etudiant')
    },
  },
}
</script>

<style scoped>
@import './EtudiantProfil.css';
</style>
