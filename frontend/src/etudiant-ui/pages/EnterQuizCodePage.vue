<template>
  <div class="enter-code-page">
    <AppHeader />
    <main class="enter-code-main">
      <section class="enter-code-card">
        <h1>Entrer un code de quiz</h1>
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
          <CallToActionBtn text="Rejoindre" variant="dark" @click="handleSubmit" />
        </form>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'EnterQuizCodePage',
  components: {
    AppHeader,
    AppFooter,
    CallToActionBtn
  },
  data() {
    return {
      code: '',
      error: ''
    }
  },
  methods: {
    onInput() {
      this.code = this.code.toUpperCase().replace(/[^A-Z0-9]/g, '')
      this.error = ''
    },
    handleSubmit() {
      this.error = ''
      if (this.code.length !== 6) {
        this.error = 'Code invalide'
        return
      }
      // TODO (Laravel) : appeler GET /api/quizzes/code/{code}
      // et gérer les erreurs “Code invalide” / “Quiz expiré”.
      console.log('Rejoindre quiz avec code :', this.code)
    }
  }
}
</script>

<style scoped>
@import './EnterQuizCodePage.css';
</style>

