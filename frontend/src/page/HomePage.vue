<template>
  <div class="home-page">
    <AppHeader />
    <HeroSection />
    <QuizCardSection />
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../accueil-ui/composant/AppHeader.vue'
import HeroSection from '../accueil-ui/composant/HeroSection.vue'
import QuizCardSection from '../accueil-ui/composant/QuizCardSection.vue'
import AppFooter from '../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'HomePage',
  components: {
    AppHeader,
    HeroSection,
    QuizCardSection,
    AppFooter
  }
}
</script>

<style scoped>
@import './HomePage.css';
</style>
