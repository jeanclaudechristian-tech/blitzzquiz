<template>
  <header class="app-header">
    <div class="header-content">
      <a href="/" class="header-logo" aria-label="Blitzz Quiz">
        <img src="/images/Eclaire.svg" alt="Blitzz Quiz" class="header-logo-img" />
      </a>
      <nav v-if="!isLoggedIn" class="navigation">
        <NavLink text="Jouer" :active="activeSection === 'section-jouer'" @click="scrollToSection('section-jouer')" />
        <NavLink text="Community" :active="activeSection === 'section-community'"
          @click="scrollToSection('section-community')" />
        <NavLink text="Resources" :active="activeSection === 'section-resources'"
          @click="scrollToSection('section-resources')" />
        <NavLink text="Contact" :active="activeSection === 'section-contact'"
          @click="scrollToSection('section-contact')" />
      </nav>

      <!-- ✅ NOUVEAU : Icône recherche pour TEACHER et ADMIN -->
      <div v-if="canSearch" class="header-search-wrapper">
        <button class="search-icon-btn" @click.stop="toggleSearch" aria-label="Rechercher un quiz">
          🔍
        </button>
        <div v-if="showSearch" class="search-dropdown" @click.stop>
          <QuizSearch />
        </div>
      </div>

      <!-- Connecté : avatar avec menu déroulant -->
      <div v-if="showUserAvatar" class="header-user-menu">
        <div class="header-user-avatar" aria-label="Menu utilisateur" @click.stop="toggleUserMenu">
          <svg class="header-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            aria-hidden="true">
            <circle cx="12" cy="8" r="3" />
            <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
          </svg>
        </div>
        <!-- Dropdown menu -->
        <div v-if="showUserDropdown" class="user-dropdown" @click.stop>
          <button type="button" class="logout-button" @click="goToProfile">
            Mon profil
          </button>
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
import QuizSearch from '../../search/QuizSearch.vue' // ✅ NOUVEAU

export default {
  name: 'AppHeader',
  components: {
    NavLink,
    AuthButtons,
    QuizSearch // ✅ NOUVEAU
  },
  data() {
    return {
      activeSection: 'section-jouer',
      showUserDropdown: false,
      showSearch: false,  // ✅ NOUVEAU
      isLoggedIn: false,
      userRole: null,     // ✅ NOUVEAU
    }
  },
  computed: {
    showUserAvatar() {
      return this.isLoggedIn
    },
    canSearch() {
      return this.isLoggedIn && ['TEACHER', 'ADMIN', 'STUDENT'].includes(this.userRole) // ✅ ajoute STUDENT ici
    }
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    this.isLoggedIn = !!localStorage.getItem('token')
    this.userRole   = user?.role ?? null // ✅ NOUVEAU

    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('click', this.closeAll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('click', this.closeAll)
  },
  methods: {
    // ✅ NOUVEAU
    toggleSearch() {
      this.showSearch = !this.showSearch
      this.showUserDropdown = false
    },
    // ✅ NOUVEAU
    closeAll() {
      this.showSearch = false
      this.showUserDropdown = false
    },
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
      this.showSearch = false
    },
    closeUserMenu() {
      this.showUserDropdown = false
    },
    goToProfile() {
      this.$router.push('/etudiant/profil')
      this.showUserDropdown = false
    },
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.isLoggedIn = false
      this.userRole = null // ✅ NOUVEAU
      this.showUserDropdown = false
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
@import './AppHeader.css';

/* ✅ NOUVEAU */
.header-search-wrapper {
  position: relative;
}

.search-icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: background .2s;
}
.search-icon-btn:hover { background: rgba(0,0,0,0.06); }

.search-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 480px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 100;
}
</style>