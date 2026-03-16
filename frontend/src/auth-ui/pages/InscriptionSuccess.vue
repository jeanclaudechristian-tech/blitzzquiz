<template>
  <div class="desktop-inscription-page-1">
    <div class="background-video">
      <video autoplay loop playsinline muted>
        <source src="/videos/LandingPage.mp4" type="video/mp4" />
      </video>
    </div>

    <div class="espace-inscription">
      <div class="form-content">
        <BlackBlitzzQuiz class="logo" />

        <div class="success-icon-wrapper">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#50caff" stroke-width="2">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10 10-4.477 10-10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        <div class="titre">
          <p>Presque fini !</p>
        </div>

        <div class="custom-message">
          <p>Un courriel de confirmation a été envoyé à :</p>
          <p class="email-highlight">{{ $route.query.email }}</p>
          <p>Veuillez cliquer sur le lien dans le courriel pour activer votre compte.</p>
        </div>

        <BoutonRetour text="Retour à la connexion" @click="$router.push('/connexion')" />
      </div>
    </div>
  </div>
</template>

<script>
import BlackBlitzzQuiz from '../components/BlackBlitzzQuiz.vue'
import BoutonRetour from '../components/BoutonRetour.vue'

export default {
  name: 'InscriptionSuccess',
  components: { BlackBlitzzQuiz, BoutonRetour },
  methods: {
    goToLogin() {
      this.$router.push('/connexion')
    }
  }
}
</script>

<style scoped>
/* 直接引用 Page 1 的 CSS [cite: 1, 2026-03-15] */
@import './DesktopInscriptionPage1.css';

.success-icon-wrapper {
  margin: 40px 0 20px;
}

.custom-message {
  font-family: 'Inter', sans-serif;
  color: #24201d;
  line-height: 1.6;
  text-align: left;
  width: 100%;
  margin-bottom: 32px;
}

.email-highlight {
  font-weight: 700;
  color: #50caff;
  margin: 8px 0;
  word-break: break-all;
}
</style>