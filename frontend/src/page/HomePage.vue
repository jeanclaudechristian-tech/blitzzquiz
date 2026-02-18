<template>
  <div class="home-page">
    <AppHeader />
    <HeroSection />
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../accueil-ui/composant/AppHeader.vue'
import HeroSection from '../accueil-ui/composant/HeroSection.vue'
import AppFooter from '../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'HomePage',
  components: {
    AppHeader,
    HeroSection,
    AppFooter
  }
}
</script>

<style scoped>
@import './HomePage.css';
</style>
