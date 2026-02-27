<template>
  <div class="enter-code-page">
    <AppHeader />
    <main class="enter-code-main">
      <section class="enter-code-card">
        <button type="button" class="back-button" @click="goBack">
          ← Retour au dashboard
        </button>
        <h1>Entrez le Code</h1>
        <p>Indique le code à 6 caractères partagé par ton enseignant.</p>

        <form class="code-form" @submit.prevent="handleSubmit">
          <input
            v-model="code"
            type="text"
            maxlength="6"
            class="code-input"
            placeholder="ABC123"
            @input="onInput"
          />
          <p v-if="error" class="error-msg">{{ error }}</p>
          <CallToActionBtn
            text="Jouer au Quiz"
            variant="dark"
            @click="handleSubmit"
          />
        </form>
      </section>
    </main>
  </div>
</template>

<script>
import api from '../../api/Axios'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'EnterQuizCodePage',
  components: {
    AppHeader,
    CallToActionBtn
  },
  data() {
    return {
      code: '',
      error: '',
      loading: false,
    }
  },
  methods: {
    onInput() {
      this.code = this.code.toUpperCase().replace(/[^A-Z0-9]/g, '')
      this.error = ''
    },
    async handleSubmit() {
      this.error = ''
      const code = this.code.trim().toUpperCase()

      if (code.length !== 6) {
        this.error = 'Code invalide (6 caractères requis).'
        return
      }

      this.loading = true
      try {
        // Appel Laravel : GET /api/quizzes/code/{code}
        const { data } = await api.get(`/quizzes/code/${code}`)
        // data doit contenir au moins { id, ... }
        this.$router.push(`/etudiant/quiz/${data.id}`)
      } catch (e) {
        console.error('Erreur rejoindre quiz par code', e.response?.data || e)
        if (e.response?.status === 404) {
          this.error = 'Aucun quiz trouvé pour ce code.'
        } else if (e.response?.status === 403) {
          this.error = "Vous n’êtes pas autorisé à accéder à ce quiz."
        } else {
          this.error = "Erreur lors de la vérification du code."
        }
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push('/etudiant')
    }
  }
}
</script>

<style scoped>
@import './EnterQuizCodePage.css';
</style>
