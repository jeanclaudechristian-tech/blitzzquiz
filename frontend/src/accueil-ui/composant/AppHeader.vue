<template>
  <header class="app-header">
    <div class="header-content">

      <a :href="logoHref" class="header-logo" aria-label="Blitzz Quiz">
        <img src="/images/Eclaire.svg" alt="Blitzz Quiz" class="header-logo-img" />
      </a>

      <!-- Nav normale (non connecté) -->
      <nav v-if="!isLoggedIn && !showSearch" class="navigation">
        <NavLink text="Jouer" :active="activeSection === 'section-jouer'" @click="scrollToSection('section-jouer')" />
        <NavLink text="Community" :active="activeSection === 'section-community'" @click="scrollToSection('section-community')" />
        <NavLink text="Resources" :active="activeSection === 'section-resources'" @click="scrollToSection('section-resources')" />
        <NavLink text="Contact" :active="activeSection === 'section-contact'" @click="scrollToSection('section-contact')" />
      </nav>

      <!-- Barre de recherche étendue dans le header -->
      <transition name="search-expand">
        <div v-if="showSearch" class="header-search-bar" @click.stop>
          <span class="material-icons search-bar-icon">search</span>
          <input
            ref="searchInput"
            v-model="searchQuery"
            class="search-bar-input"
            type="text"
            placeholder="Rechercher un quiz..."
            @input="onSearchInput"
          />
          <button class="search-bar-close" @click="closeSearch">
            <span class="material-icons">close</span>
          </button>

          <!-- Résultats inline sous la barre -->
          <div v-if="searchResults.length || searchNoResults" class="search-bar-results" @click.stop>
            <p v-if="searchNoResults" class="search-no-results">
              Aucun quiz trouvé pour <strong>{{ searchQuery }}</strong>
            </p>
            <ul v-else class="search-results-list">
              <li
                v-for="quiz in searchResults"
                :key="quiz.id"
                class="search-result-item"
                @click="goToQuiz(quiz)"
              >
                <div class="result-header">
                  <span class="result-titre">{{ quiz.titre }}</span>
                  <span class="result-category">{{ quiz.category }}</span>
                </div>
                <p class="result-description" v-html="quiz.description_highlight"></p>
              </li>
            </ul>
          </div>
        </div>
      </transition>

      <!-- Icône loupe (connecté, barre fermée) -->
      <button v-if="canSearch && !showSearch" class="search-icon-btn" @click.stop="toggleSearch" aria-label="Rechercher un quiz">
        <span class="material-icons">search</span>
      </button>

      <!-- Avatar connecté -->
      <div v-if="showUserAvatar" class="header-user-menu">
        <div class="header-user-avatar" aria-label="Menu utilisateur" @click.stop="toggleUserMenu">
          <svg class="header-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="8" r="3" />
            <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
          </svg>
        </div>
        <div v-if="showUserDropdown" class="user-dropdown" @click.stop>
          <button type="button" class="logout-button" @click="goToProfile">Mon profil</button>
          <button type="button" class="logout-button" @click="handleLogout">Se déconnecter</button>
        </div>
      </div>

      <AuthButtons v-else-if="!isLoggedIn" @login="handleLogin" @signup="handleSignup" />
    </div>
  </header>
</template>

<script>
import NavLink from './NavLink.vue'
import AuthButtons from './AuthButtons.vue'
import axios from 'axios'

export default {
  name: 'AppHeader',
  components: { NavLink, AuthButtons },
  data() {
    return {
      activeSection: 'section-jouer',
      showUserDropdown: false,
      showSearch: false,
      isLoggedIn: false,
      userRole: null,
      searchQuery: '',
      searchResults: [],
      searchNoResults: false,
      debounceTimer: null,
    }
  },
  computed: {
    showUserAvatar() {
      return this.isLoggedIn
    },
    canSearch() {
      return this.isLoggedIn && ['TEACHER', 'ADMIN', 'STUDENT'].includes(this.userRole)
    },
    logoHref() {
      if (!this.isLoggedIn) return '/'
      if (this.userRole === 'STUDENT') return '/etudiant'
      if (this.userRole === 'TEACHER') return '/enseignant'
      if (this.userRole === 'ADMIN') return '/admin'
      return '/'
    }
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    this.isLoggedIn = !!localStorage.getItem('token')
    this.userRole = user?.role ?? null
    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('click', this.closeAll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('click', this.closeAll)
  },
  methods: {
    toggleSearch() {
      this.showSearch = true
      this.showUserDropdown = false
      this.$nextTick(() => this.$refs.searchInput?.focus())
    },
    closeSearch() {
      this.showSearch = false
      this.searchQuery = ''
      this.searchResults = []
      this.searchNoResults = false
    },
    closeAll() {
      this.closeSearch()
      this.showUserDropdown = false
    },
    onSearchInput() {
      this.searchNoResults = false
      clearTimeout(this.debounceTimer)
      if (this.searchQuery.length < 2) {
        this.searchResults = []
        return
      }
      this.debounceTimer = setTimeout(this.fetchResults, 350)
    },
    async fetchResults() {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get('/api/quizzes/search', {
          params: { q: this.searchQuery },
          headers: { Authorization: `Bearer ${token}` }
        })
        this.searchResults = data
        this.searchNoResults = data.length === 0
      } catch (err) {
        console.error('Erreur recherche:', err)
      }
    },
    goToQuiz(quiz) {
      const role = this.userRole
      if (role === 'STUDENT') {
        this.$router.push(`/etudiant/quiz/${quiz.id}`)
      } else if (role === 'TEACHER' || role === 'ADMIN') {
        this.$router.push(`/enseignant/quiz/${quiz.id}/editer`)
      }
      this.closeSearch()
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
        if (rect.top <= headerHeight + 50) current = id
      }
      if (current) this.activeSection = current
    },
    handleLogin()  { this.$router.push('/connexion') },
    handleSignup() { this.$router.push('/inscription') },
    toggleUserMenu() {
      this.showUserDropdown = !this.showUserDropdown
      this.showSearch = false
    },
    goToProfile() {
      this.$router.push('/etudiant/profil')
      this.showUserDropdown = false
    },
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.isLoggedIn = false
      this.userRole = null
      this.showUserDropdown = false
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
@import './AppHeader.css';
</style>