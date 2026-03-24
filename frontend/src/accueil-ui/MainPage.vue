<template>
  <div class="home-page">
    <AppHeader />
    <ScrollDots />

    <section id="section-hero">
      <div class="container-blitzz">
        <main v-if="!isLoggedIn" class="hero-section">
          <div class="hero-container-box">
            <img src="/images/Black_BlitzzQuiz 1.svg" alt="BlitzzQuiz" class="hero-logo" />
            <p class="hero-subtitle">
              Défiez vos amis, testez vos connaissances et grimpez dans le classement.
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary" @click="$router.push('/catalogue')">Catalogue</button>
              <button class="btn btn-secondary" @click="$router.push('/inscription')">S'inscrire</button>
            </div>
          </div>
        </main>

        <main v-else class="welcome-section">
          <div class="welcome-container welcome-remodel">
            <div class="welcome-avatar" aria-hidden="true">
              <svg
                class="welcome-avatar-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h1 class="welcome-title-remodel">Bonjour, <span>{{ userName }}</span> !</h1>
            <p class="welcome-subtitle-remodel">Prêt à reprendre l'apprentissage là où tu t'es arrêté ?</p>
            <div class="welcome-actions-remodel">
              <button class="btn btn-primary" @click="$router.push('/catalogue')">Explorer les quiz</button>
            </div>
          </div>
        </main>
      </div>
    </section>

    <section id="section-suggestions">
      <div class="container-blitzz">
        <QuizSuggestions />
        <div class="suggestions-footer-text">
          <p>
            L'arène vous attend. Échauffez-vous avec ces recommandations ou choisissez votre propre
            <router-link to="/catalogue" class="text-link-blue">champ de bataille</router-link>
            ci-dessous.
          </p>
        </div>
      </div>
    </section>

    <section id="section-categories">
      <div class="container-blitzz">
        <QuizListSection />
      </div>
    </section>

    <section id="section-cta" v-if="!isLoggedIn">
      <div class="container-blitzz">
        <div class="cta-banner">
          <div class="cta-content">
            <h2 class="cta-title">Faites de vos révisions une compétition !</h2>
            <p class="cta-text">
              Fini les révisions ennuyeuses ! Rejoignez des milliers d'étudiants sur BlitzzQuiz, la
              plateforme éducative où vous affrontez vos camarades.
            </p>
            <button class="btn btn-primary cta-btn" @click="$router.push('/inscription')">
              Créer un compte gratuit
            </button>
          </div>
          <div class="cta-image-wrapper">
            <img src="/images/Albert_Einstein.svg" alt="Albert Einstein" class="cta-einstein-img" />
          </div>
        </div>
      </div>
    </section>

    <section id="section-footer">
      <footer class="main-footer">
        <div class="container-blitzz footer-layout">
          <div class="footer-left">
            <div class="video-container-box">
              <video autoplay muted loop playsinline class="footer-video">
                <source src="/videos/LandingPage.mp4" type="video/mp4" />
              </video>
            </div>
            <div class="footer-links">
              <a href="mailto:contact@blitzz.com" class="footer-pill">contact@blitzz.com</a>
              <a href="#" class="footer-pill">Nous contacter</a>
              <a href="#" class="footer-pill">Signaler un bug</a>
            </div>
          </div>

          <div class="footer-right">
            <h3 class="faq-title">FAQ</h3>
            <div class="faq-accordion">
              <details class="faq-item">
                <summary>
                  C'est quoi BlitzzQuiz ?
                  <span class="material-symbols-outlined faq-icon">expand_more</span>
                </summary>
                <div class="faq-content">Plateforme interactive pour créer et jouer à des quiz.</div>
              </details>
              <details class="faq-item">
                <summary>
                  L'inscription est-elle gratuite ?
                  <span class="material-symbols-outlined faq-icon">expand_more</span>
                </summary>
                <div class="faq-content">Oui, l'accès au catalogue et la création de compte sont 100% gratuits.</div>
              </details>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="copyright-line"></div>
          <p>© 2026 BlitzzQuiz</p>
          <div class="copyright-line"></div>
        </div>
      </footer>
    </section>
  </div>
</template>

<script>
import AppHeader from './composant/AppHeader.vue'
import ScrollDots from './composant/ScrollDots.vue'
import QuizSuggestions from './sections/QuizSuggestions.vue'
import QuizListSection from './sections/CategoryListSection.vue'

export default {
  name: 'MainPage',
  components: { AppHeader, ScrollDots, QuizSuggestions, QuizListSection },
  data() {
    return {
      isLoggedIn: false,
      userName: '',
    }
  },
  methods: {
    checkUserAuth() {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (token && token !== 'null' && token !== 'undefined') {
        this.isLoggedIn = true
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr)
            this.userName = userObj.username || userObj.email?.split('@')[0] || 'Étudiant'
          } catch (e) {
            this.userName = 'Étudiant'
          }
        }
      } else {
        this.isLoggedIn = false
        this.userName = ''
      }
    },
  },
  mounted() {
    this.checkUserAuth()
  },
  // Met à jour "Bonjour X" quand tu reviens de la page de connexion.
  watch: {
    $route() {
      this.checkUserAuth()
    },
  },
}
</script>

<style>
@import './accueil-ui.css';

.home-page {
  width: 100%;
}

/* Ajustements de layout sur la section bienvenue. */
.home-page .welcome-section {
  padding-bottom: 84px;
}

.home-page .suggestion-section {
  margin-top: -24px;
}

/* Uniformisation des liens (bleu, gras, underline au hover). */
.text-link-blue {
  color: var(--color-blue) !important;
  font-weight: 700 !important;
  text-decoration: none !important;
  transition: all 0.2s ease;
  font-family: var(--font-base);
}

.text-link-blue:hover {
  text-decoration: underline !important;
  text-underline-offset: 4px;
}

.section-header-link {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.welcome-remodel {
  max-width: 860px;
  margin: 0 auto;
  padding: 30px 28px;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.welcome-avatar {
  width: 236px;
  height: 236px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #1f2937;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: none;
}

.welcome-avatar-icon {
  width: 128px;
  height: 128px;
}

.welcome-title-remodel {
  margin: 8px 0 4px;
  font-family: 'Anton', sans-serif;
  font-size: clamp(1.65rem, 3.7vw, 2.9rem);
  line-height: 1.06;
  color: #121212;
  letter-spacing: 0.35px;
}

.welcome-title-remodel span {
  color: var(--color-blue);
}

.welcome-subtitle-remodel {
  margin: 0;
  font-family: var(--font-base);
  font-size: clamp(1rem, 1.8vw, 1.16rem);
  font-weight: 500;
  color: #4b5563;
  max-width: 700px;
}

.welcome-actions-remodel {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.welcome-actions-remodel .btn-primary {
  background: #f5a623;
  color: #1a1a1a;
}

.welcome-actions-remodel .btn-primary:hover {
  background: #e29614;
}

/* FAQ style (flèches Material Design). */
.faq-item summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  list-style: none;
  cursor: pointer;
  padding: 14px 18px;
  font-family: var(--font-base);
  font-weight: 600;
  color: var(--color-dark);
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::after {
  display: none !important;
}

.faq-icon {
  color: var(--color-blue);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 24px;
}

.faq-item[open] .faq-icon {
  transform: rotate(180deg);
}

/* CTA Einstein */
.cta-image-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 300px;
}

.cta-einstein-img {
  width: 100%;
  max-width: 400px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
}

@media (max-width: 768px) {
  .home-page .welcome-section {
    padding-bottom: 54px;
  }

  .welcome-remodel {
    padding: 20px 16px;
    border-radius: 16px;
  }

  .welcome-avatar {
    width: 204px;
    height: 204px;
  }

  .welcome-avatar-icon {
    width: 112px;
    height: 112px;
  }

  .welcome-actions-remodel {
    width: 100%;
  }

  .welcome-actions-remodel .btn-primary {
    width: 100%;
    max-width: 280px;
    padding: 12px 18px;
  }

  .cta-image-wrapper {
    margin-top: 20px;
    min-width: 0;
    width: min(100%, 360px);
    height: 320px;
    min-height: 320px;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
  }

  .cta-einstein-img {
    width: 100% !important;
    height: 100% !important;
    max-width: none;
    object-fit: cover;
    object-position: center 38%;
    transform: scale(1.2);
    transform-origin: center center;
  }
}
</style>
