<template>
  <section class="hero-section">
    <div class="hero-video-background">
      <video autoplay loop playsinline muted>
        <source src="/videos/LandingPage.mp4" type="video/mp4" />
      </video>
    </div>
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title">
          <span class="hero-title-line1">Bat la</span>
          <span class="hero-title-line2">compétition,</span>
          <span class="hero-title-line3">passe en mode</span>
        </h1>
        <div class="hero-app-name">
          <img
            src="/images/White_BlitzzQuiz%201.svg"
            alt="Blitzz Quiz"
            class="hero-logo-img"
          />
        </div>
        <div class="hero-cta">
          <CallToActionBtn text="S'inscrire" variant="dark" @click="handleSignup" />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import CallToActionBtn from './CallToActionBtn.vue'

export default {
  name: 'HeroSection',
  components: {
    CallToActionBtn
  },
  methods: {
    handleSignup() {
      this.$router.push('/inscription')
    }
  }
}
</script>

<style scoped>
@import './HeroSection.css';
</style>
