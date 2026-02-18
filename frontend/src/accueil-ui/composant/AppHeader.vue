<template>
  <header class="app-header">
    <div class="header-content">
      <a href="/" class="header-logo" aria-label="Blitzz Quiz">
        <img
          src="/images/Eclaire.svg"
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
      <!-- Connecté : avatar avec menu déroulant -->
      <div v-if="showUserAvatar" class="header-user-menu">
        <div 
          class="header-user-avatar" 
          aria-label="Menu utilisateur"
          @click.stop="toggleUserMenu"
        >
          <svg class="header-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="8" r="3" />
            <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
          </svg>
        </div>
        <!-- Dropdown menu -->
        <div v-if="showUserDropdown" class="user-dropdown" @click.stop>
          <button type="button" class="logout-button" @click="handleLogout">
            Se déconnecter
          </button>
        </div>
      </div>
      <!-- Non connecté : boutons Connexion/Inscription -->
      <AuthButtons v-else @login="handleLogin" @signup="handleSignup" />
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
      activeSection: 'section-jouer',
      showUserDropdown: false,
      isLoggedIn: false  // True si un token existe dans localStorage
    }
  },
  computed: {
    // Afficher l'avatar si l'utilisateur a un token (connecté)
    showUserAvatar() {
      return this.isLoggedIn
    }
  },
  mounted() {
    // Vérifier si un token existe au démarrage du composant
    this.isLoggedIn = !!localStorage.getItem('token')
    
    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('click', this.closeUserMenu)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('click', this.closeUserMenu)
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
    },
    toggleUserMenu() {
      this.showUserDropdown = !this.showUserDropdown
    },
    closeUserMenu() {
      this.showUserDropdown = false
    },
    handleLogout() {
      // Supprimer le token et les données utilisateur du localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Mettre à jour l'état de connexion
      this.isLoggedIn = false
      this.showUserDropdown = false
      
      // TODO (Laravel) : appeler POST /api/logout pour invalider le token côté serveur
      
      // Rediriger vers la page d'accueil
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
@import './AppHeader.css';
</style>
