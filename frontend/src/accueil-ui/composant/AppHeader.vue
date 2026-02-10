<template>
  <header class="app-header">
    <div class="header-content">
      <a href="/" class="header-logo" aria-label="Blitzz Quiz">
        <img
          src="/images/Black_BlitzzQuiz%202.svg"
          alt="Blitzz Quiz"
          class="header-logo-img"
        />
      </a>
      <nav class="navigation">
        <NavLink
          text="Jouer"
          :active="activeSection === 'section-jouer'"
          @click="scrollToSection('section-jouer')"
        />
        <NavLink
          text="Community"
          :active="activeSection === 'section-community'"
          @click="scrollToSection('section-community')"
        />
        <NavLink
          text="Resources"
          :active="activeSection === 'section-resources'"
          @click="scrollToSection('section-resources')"
        />
        <NavLink
          text="Contact"
          :active="activeSection === 'section-contact'"
          @click="scrollToSection('section-contact')"
        />
      </nav>
      <AuthButtons @login="handleLogin" @signup="handleSignup" />
    </div>
  </header>
</template>

<script>
import NavLink from './NavLink.vue'
import AuthButtons from './AuthButtons.vue'

export default {
  name: 'AppHeader',
  components: {
    NavLink,
    AuthButtons
  },
  data() {
    return {
      activeSection: 'section-jouer'
    }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    scrollToSection(sectionId) {
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        this.activeSection = sectionId
      }
    },
    onScroll() {
      const sections = ['section-jouer', 'section-community', 'section-contact', 'section-resources']
      const headerHeight = 80
      let current = ''
      for (const id of sections) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= headerHeight + 50) {
          current = id
        }
      }
      if (current) this.activeSection = current
    },
    handleLogin() {
      this.$router.push('/connexion')
    },
    handleSignup() {
      this.$router.push('/inscription')
    }
  }
}
</script>

<style scoped>
@import './AppHeader.css';
</style>
