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
          <div class="welcome-container">
            <h1 class="welcome-title">BONJOUR, <span class="text-blue">{{ userName }}</span></h1>
            <p class="welcome-subtitle">Prêt à reprendre l'apprentissage là où tu t'es arrêté ?</p>
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
                <div class="faq-content">Plateforme interactive pour créer et jouer à des quiz en temps réel.</div>
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
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && token !== 'null' && token !== 'undefined') {
        this.isLoggedIn = true;
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            this.userName = userObj.username || userObj.email?.split('@')[0] || 'Étudiant';
          } catch (e) { 
            this.userName = 'Étudiant'; 
          }
        }
      } else {
        this.isLoggedIn = false;
        this.userName = '';
      }
    }
  },
  mounted() {
    this.checkUserAuth();
  },
  // 🎯 L'UNIQUE AJOUT : Met à jour "Bonjour X" dès que tu reviens de la page de connexion
  watch: {
    '$route'() {
      this.checkUserAuth();
    }
  }
}
</script>

<style>
@import './accueil-ui.css';

.home-page {
  width: 100%;
}

/* === 🎯 UNIFORMISATION DES LIENS (Bleu, Gras, Underline Hover Only) === */
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

/* === FAQ STYLE (Flèches Material Design) === */
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

/* === CTA EINSTEIN === */
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
  .cta-image-wrapper {
    margin-top: 20px;
    min-width: unset;
  }

  .cta-einstein-img {
    max-width: 250px;
  }
}
</style>