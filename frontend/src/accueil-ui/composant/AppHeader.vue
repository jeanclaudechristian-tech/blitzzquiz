<template>
  <div class="header-container" :class="{ 'header-hidden': isHidden }">
    <div
      class="header-content"
      :class="{
        'desktop-search-active': isSearchOpen && !isMobile,
        'desktop-search-moving': desktopSearchMoving && !isMobile
      }"
    >

      <div class="header-left">
        <div class="logo-wrapper" :class="{ 'hide-on-mobile': (isSearchOpen || isExpanded) && isMobile }"
          @click="$router.push('/')">
          <img src="/images/Black_BlitzzQuiz 1.png" alt="Blitzz Logo" class="logo-img" />
        </div>

        <div class="search-wrapper" :class="{ 'hide-on-mobile': isExpanded && isMobile }">
          <button class="icon-btn search-trigger" @click.stop="toggleSearch">
            <Transition name="icon-swap">
              <i v-if="isSearchOpen" class="mdi mdi-close absolute-icon"></i>
              <i v-else class="mdi mdi-magnify absolute-icon"></i>
            </Transition>
          </button>

          <div class="search-input-container" :class="{ 'is-open': isSearchOpen }">
            <input v-model="searchQuery" type="text" class="search-input" placeholder="Rechercher un quiz..."
              @input="onSearchInput" @click.stop />
            <div class="search-underline"></div>

            <Transition name="fade-slide">
              <div v-if="searchQuery.length >= 2 && isSearchOpen" class="search-results-dropdown">
                <template v-if="searchResults.length > 0">
                  <div v-for="quiz in searchResults" :key="quiz.id" class="search-result-item" @click="goToQuiz(quiz)">
                    <div class="result-text">
                      <span class="result-title">{{ quiz.titre }}</span>
                      <span class="result-category">
                        {{ (quiz.category && typeof quiz.category === 'object') ? (quiz.category.name ||
                          quiz.category.NAME) : (quiz.category || 'Général') }}
                      </span>
                    </div>
                    <span class="material-symbols-outlined result-icon">chevron_right</span>
                  </div>
                </template>
                <div v-else-if="!loadingSearch" class="no-results-msg">
                  Aucun quiz trouvé pour "{{ searchQuery }}"
                </div>
              </div>
            </Transition>
            <div v-if="loadingSearch" class="search-loader">
              <div class="mini-spinner"></div>
            </div>
          </div>
        </div>

        <nav class="nav-links-wrapper" :class="{ 'is-expanded': isExpanded }">
          <div class="nav-links">
            <a class="btn-code" @click.prevent="isCodeModalOpen = true" style="cursor: pointer;">CODE</a>
            <router-link to="/#section-hero" class="nav-link">Accueil</router-link>
            <router-link to="/catalogue" class="nav-link">Explorer</router-link> 
            <router-link v-if="!isLoggedIn" to="/#section-footer" class="nav-link">Aide</router-link>

            <template v-if="isLoggedIn">
              <router-link :to="userRole === 'TEACHER' ? '/enseignant/groupes' : '/etudiant/mes-groupes'"
                class="nav-link">
                Groupe
              </router-link>
              <router-link to="/historique" class="nav-link">Historique</router-link>
              <router-link v-if="userRole === 'TEACHER'" to="/enseignant" class="nav-link link-creer">
                Créer
              </router-link>
            </template>

            <router-link v-if="!isLoggedIn" to="/#section-footer" class="nav-link">FAQ</router-link>

            <template v-if="isLoggedIn">
              <router-link
                  v-if="userRole === 'ADMIN'"
                  to="/admin"
                  class="nav-link link-admin-portal"
              >
                Admin
              </router-link>

              <router-link
                  v-if="isSuper"
                  to="/admin/super"
                  class="nav-link link-super-portal"
              >
                <i class="mdi mdi-crown"></i> Super Admin
              </router-link>

            </template>
          </div>
        </nav>

        <div class="menu-btn-wrapper" :class="{ 'hide-on-mobile': isSearchOpen && isMobile }">
          <button class="icon-btn" @click.stop="toggleMenu">
            <Transition name="icon-swap">
              <i v-if="isExpanded && isMobile" class="mdi mdi-close absolute-icon"></i>
              <div v-else-if="isExpanded" class="vertical-bar absolute-icon"></div>
              <i v-else class="mdi mdi-menu absolute-icon"></i>
            </Transition>
          </button>
        </div>
      </div>

      <div class="header-right auth-container" :class="{ 'hide-on-mobile': (isSearchOpen || isExpanded) && isMobile }">
        <template v-if="!isLoggedIn">
          <button class="auth-link" @click="$router.push('/connexion')">Connexion</button>
          <button class="auth-link" @click="$router.push('/inscription')">S'inscrire</button>
        </template>
        <template v-else>
          <div class="avatar" @click="$router.push('/etudiant/profil')" style="cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <button class="auth-link" @click="handleLogout">Déconnexion</button>
        </template>
      </div>
    </div>

    <GuestModal v-if="showGuestModal" @close="showGuestModal = false" />
    <CodeModal v-if="isCodeModalOpen" @close="isCodeModalOpen = false" @show-guest-modal="showGuestModal = true" />

    <QuizModal 
      v-if="showQuizModal" 
      :quizId="selectedQuizId" 
      @close="showQuizModal = false" 
    />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { authService } from '@/api/auth';
import { quizService } from '@/api/quiz';
import './AppHeader.css';
import GuestModal from '../composant/GuestModal.vue';
import CodeModal from './CodeModal.vue';
import QuizModal from '../../quiz-ui/quiz.vue'; // Importation de la modale

const route = useRoute();

const isExpanded = ref(false);
const isSearchOpen = ref(false);
const desktopSearchMoving = ref(false);
const isHidden = ref(false);
const isMobile = ref(false);
const isLoggedIn = ref(false);
const userRole = ref('');
const showGuestModal = ref(false);
const isCodeModalOpen = ref(false);
const isSuper = ref(false);

const showQuizModal = ref(false);
const selectedQuizId = ref(null);

const searchQuery = ref('');
const searchResults = ref([]);
const loadingSearch = ref(false);
let debounceTimer = null;
const searchCache = new Map();
let abortController = null;
let desktopSearchTimer = null;
const DESKTOP_SEARCH_MOVE_MS = 1200;

const clearDesktopSearchTimer = () => {
  if (desktopSearchTimer) {
    clearTimeout(desktopSearchTimer);
    desktopSearchTimer = null;
  }
};

const onSearchInput = () => {
  clearTimeout(debounceTimer);
  const trimmedQuery = searchQuery.value.trim().toLowerCase();
  if (trimmedQuery.length < 2) {
    searchResults.value = [];
    return;
  }
  if (searchCache.has(trimmedQuery)) {
    searchResults.value = searchCache.get(trimmedQuery);
    return;
  }
  debounceTimer = setTimeout(fetchQuizzes, 300);
};

const fetchQuizzes = async () => {
  const trimmedQuery = searchQuery.value.trim().toLowerCase();
  if (abortController) abortController.abort();
  abortController = new AbortController();
  loadingSearch.value = true;
  try {
    const data = await quizService.search(trimmedQuery, {
      signal: abortController.signal
    });
    searchCache.set(trimmedQuery, data);
    searchResults.value = data;
  } catch (error) {
    if (error?.code === 'ERR_CANCELED') return;
    console.error("Erreur recherche:", error);
  } finally {
    loadingSearch.value = false;
  }
};

const goToQuiz = (quiz) => {
  isSearchOpen.value = false;
  searchQuery.value = '';
  searchResults.value = [];
  if (!isLoggedIn.value) {
    showGuestModal.value = true;
    return;
  }

  selectedQuizId.value = quiz.id;
  showQuizModal.value = true;
};

const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  isLoggedIn.value = !!token;
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      userRole.value = userObj.role;
      isSuper.value = userObj.is_super === true;
    } catch (e) {
      userRole.value = '';
      isSuper.value = false;
    }
  } else {
    userRole.value = '';
    isSuper.value = false;
  }
};

const handleLogout = async () => {
  const token = localStorage.getItem('token');
  try {
    if (token) {
      await authService.logout(token);
    }
  } catch (error) {
    console.error("Erreur logout:", error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    isLoggedIn.value = false;
    userRole.value = '';
    window.location.href = '/';
  }
};

// Le header se met a jour quand la page change (apres un login, par exemple)
watch(() => route.path, () => {
  checkAuthStatus();
  isSearchOpen.value = false;
  desktopSearchMoving.value = false;
  clearDesktopSearchTimer();
  showGuestModal.value = false;
});

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    isExpanded.value = false;
  } else {
    desktopSearchMoving.value = false;
    clearDesktopSearchTimer();
  }
};
const toggleMenu = () => {
  if (!isMobile.value) return;
  if (isSearchOpen.value) isSearchOpen.value = false;
  isExpanded.value = !isExpanded.value;
};
const toggleSearch = () => {
  if (isExpanded.value) isExpanded.value = false;

  if (!isMobile.value && !isSearchOpen.value && !desktopSearchMoving.value) {
    desktopSearchMoving.value = true;
    clearDesktopSearchTimer();
    desktopSearchTimer = setTimeout(() => {
      isSearchOpen.value = true;
      desktopSearchMoving.value = false;
      desktopSearchTimer = null;
    }, DESKTOP_SEARCH_MOVE_MS);
    return;
  }

  if (desktopSearchMoving.value) {
    desktopSearchMoving.value = false;
    clearDesktopSearchTimer();
    return;
  }

  if (isSearchOpen.value) {
    desktopSearchMoving.value = false;
    clearDesktopSearchTimer();
    isSearchOpen.value = false;
    return;
  }

  isSearchOpen.value = true;
};
const closeAll = () => {
  isExpanded.value = false;
  isSearchOpen.value = false;
  desktopSearchMoving.value = false;
  clearDesktopSearchTimer();
  searchResults.value = [];
};

let lastScrollY = 0;
let isScrollingDown = false;

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  isScrollingDown = currentScrollY > lastScrollY;
  if (currentScrollY < 20) {
    isHidden.value = false;
  } else {
    if (isMobile.value) {
      if (currentScrollY > lastScrollY) { isHidden.value = true; closeAll(); }
      else { isHidden.value = false; }
    } else {
      if (currentScrollY > lastScrollY && !isSearchOpen.value && !isExpanded.value) {
        isHidden.value = true;
      } else if (currentScrollY < lastScrollY) {
        isHidden.value = false;
      }
    }
  }
  lastScrollY = currentScrollY;
};

const handleMouseMove = (event) => {
  if (event.clientY <= 80) {
    isHidden.value = false;
  } else if (isScrollingDown && window.scrollY > 20 && !isSearchOpen.value && !isExpanded.value) {
    isHidden.value = true;
  }
};

onMounted(() => {
  checkAuthStatus();
  checkMobile();
  window.addEventListener('resize', checkMobile);
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('click', closeAll);
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  clearDesktopSearchTimer();
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('click', closeAll);
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.link-creer { color: #00A3FF !important; font-weight: 700 !important; text-decoration: underline !important; text-underline-offset: 4px; }
.link-creer:hover { color: #0082cc !important; }
.search-results-dropdown { position: absolute; top: calc(100% + 15px); left: 0; width: 100%; min-width: 300px; background: rgba(0, 163, 255, 0.95); backdrop-filter: blur(15px); border-radius: 12px; box-shadow: 0 15px 35px rgba(0, 163, 255, 0.3); z-index: 99999; max-height: 400px; overflow-y: auto; }
@media (max-width: 768px) { .search-results-dropdown { left: 50% !important; transform: translateX(-50%) !important; width: 92%; } }
.search-result-item { padding: 16px 20px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.15); transition: background 0.2s ease; }
.search-result-item:hover { background: rgba(255, 255, 255, 0.15); }
.result-text { display: flex; flex-direction: column; gap: 4px; }
.result-title { font-family: var(--font-base, 'Inter', sans-serif); font-weight: 600; color: #ffffff; font-size: 1rem; }
.result-category { font-family: var(--font-base, 'Inter', sans-serif); font-weight: 800; font-size: 0.75rem; color: rgba(255, 255, 255, 0.8); text-transform: uppercase; letter-spacing: 0.5px; }
.result-icon { color: rgba(255, 255, 255, 0.8); font-size: 20px; }
.no-results-msg { padding: 20px; text-align: center; color: #ffffff; font-family: var(--font-base, 'Inter', sans-serif); font-size: 0.95rem; font-weight: 500; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }
.search-loader { position: absolute; right: 0; top: 10px; }
.mini-spinner { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.5); border-top-color: #00A3FF; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
