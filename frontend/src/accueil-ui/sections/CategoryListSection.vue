<script setup>
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const router = useRouter();
const categoryImage = (fileName) =>
  new URL(`./images/categories/${fileName}`, import.meta.url).href;

// --- DONNÉES SYNCHRONISÉES AVEC LA BDD ---
// 🎯 Ajout des nouvelles catégories scolaires et professionnelles
const categories = [
  // SCOLAIRE
  { id: 1,  slug: 'math',         label: 'Math',               image: categoryImage('math.svg') },
  { id: 2,  slug: 'francais',     label: 'Français',           image: categoryImage('francais.svg') },
  { id: 3,  slug: 'sciences',     label: 'Sciences',           image: categoryImage('sciences.svg') },
  { id: 4,  slug: 'histoire',     label: 'Histoire',           image: categoryImage('histoire.svg') },
  { id: 5,  slug: 'sport',        label: 'Sport',              image: categoryImage('sport.svg') },
  { id: 6,  slug: 'trivia',       label: 'Trivia',             image: categoryImage('trivia.svg') },
  { id: 7,  slug: 'art',          label: 'Art',                image: categoryImage('art.svg') },
  
  // PROFESSIONNEL (Nouvelles entrées)
  { id: 8,  slug: 'ti',           label: 'Technologie Info.',  image: categoryImage('ti.svg') },
  { id: 9,  slug: 'sante',        label: 'Santé',              image: categoryImage('sante.svg') },
  { id: 10, slug: 'legal',        label: 'Légal',              image: categoryImage('legal.svg') },
  { id: 11, slug: 'construction', label: 'Construction',       image: categoryImage('construction.svg') },
  { id: 12, slug: 'admin',        label: 'Administration',     image: categoryImage('admin.svg') },
  { id: 13, slug: 'politique',    label: 'Politique',          image: categoryImage('politique.svg') },
  { id: 14, slug: 'ingenieur',    label: 'Ingénieur',          image: categoryImage('ingenieur.svg') },
  
  // AUTRES (Groupes ou Fallback)
  { id: 15, slug: 'films-series', label: 'Films & Séries',   image: categoryImage('films.svg') },
  { id: 16, slug: 'monde',        label: 'Monde & Culture',  image: categoryImage('monde.svg') },
  { id: 17, slug: 'general',      label: 'Général',          image: categoryImage('general.svg') },
];

// --- MATHÉMATIQUES STRICTES DU CAROUSEL ---
const currentIndex = ref(0);
const visibleCount = ref(4);

const maxIndex = computed(() => categories.length - visibleCount.value);

const windowWidthCss = computed(() => {
  return (220 * visibleCount.value) + (20 * (visibleCount.value - 1)) + 'px';
});

const updateResponsiveness = () => {
  const w = window.innerWidth;
  if (w < 600) visibleCount.value = 1;
  else if (w < 850) visibleCount.value = 2;
  else if (w < 1150) visibleCount.value = 3;
  else visibleCount.value = 4;

  if (currentIndex.value > maxIndex.value) {
    currentIndex.value = maxIndex.value;
  }
};

onMounted(() => {
  updateResponsiveness();
  window.addEventListener('resize', updateResponsiveness);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateResponsiveness);
});

const next = () => { if (currentIndex.value < maxIndex.value) currentIndex.value++; };
const prev = () => { if (currentIndex.value > 0) currentIndex.value--; };

// --- GESTION DU SWIPE/GLISSEMENT ---
const startX = ref(0);
let isDragging = false;

const startDrag = (e) => {
  isDragging = true;
  startX.value = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
};

const endDrag = (e) => {
  if (!isDragging || startX.value === 0) return;
  const endX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
  const diff = startX.value - endX;

  if (diff > 40) next(); 
  else if (diff < -40) prev(); 

  isDragging = false;
  startX.value = 0;
};

// 🎯 CORRECTION DE LA ROUTE ICI (Retrait de /etudiant)
const handleClick = (label) => {
  router.push(`/catalogue?category=${encodeURIComponent(label)}`);
};
</script>

<template>
  <section class="quiz-list-section">
    
    <header class="section-title-wrapper">
      <h2 class="title-copy">Explorez nos catégories</h2>
      <p class="subtitle-copy">
        Plongez dans nos  
        <router-link to="/catalogue" class="text-link-blue">différentes thématiques</router-link> 
        pour tester vos connaissances.
      </p>
    </header>

    <div class="carousel-outer">
      <button class="slider-btn left-arrow" @click="prev" :class="{ 'disabled-btn': currentIndex === 0 }">
        <span class="material-symbols-outlined">arrow_back_ios_new</span>
      </button>

      <div 
        class="carousel-window" 
        :style="{ width: windowWidthCss }"
        @mousedown="startDrag" 
        @mouseup="endDrag" 
        @mouseleave="endDrag"
        @touchstart="startDrag" 
        @touchend="endDrag"
      >
        <div 
          class="carousel-track" 
          :style="{ transform: `translateX(calc(${currentIndex} * -240px))` }"
        >
          <div
            v-for="(cat, i) in categories"
            :key="cat.id"
            class="mini-quiz-card category-card"
            :class="{ 'strict-active': i >= currentIndex && i < currentIndex + visibleCount }"
            @click="handleClick(cat.label)"
          >
            <img :src="cat.image" :alt="cat.label" class="card-bg-img" draggable="false" />
            <div class="category-overlay">
              <span class="category-label">{{ cat.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <button class="slider-btn right-arrow" @click="next" :class="{ 'disabled-btn': currentIndex >= maxIndex }">
        <span class="material-symbols-outlined">arrow_forward_ios</span>
      </button>
    </div>
    
  </section>
</template>

<style scoped>
@import '../accueil-ui.css';

/* ==========================================================================
   COPYWRITING TITRE
   ========================================================================== */
.section-title-wrapper {
  text-align: center;
  margin-bottom: 40px;
  padding: 0 20px;
}

.title-copy {
  font-family: 'Anton', sans-serif;
  font-size: 2.8rem;
  color: var(--color-dark);
  margin: 0 0 10px 0;
  letter-spacing: 1px;
}

.subtitle-copy {
  font-family: var(--font-base);
  font-size: 1.1rem;
  color: #6b7280;
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.5;
}

.text-link-blue {
  color: var(--color-blue);
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.text-link-blue:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* ==========================================================================
   CAROUSEL OUTER
   ========================================================================== */
.carousel-outer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative; 
}

.carousel-window {
  position: relative;
  overflow: visible; 
  cursor: grab;
}
.carousel-window:active { cursor: grabbing; }

.carousel-track {
  display: flex;
  gap: 20px;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

/* ==========================================================================
   STYLE ET APPARITION STRICTE DES CARTES
   ========================================================================== */
.category-card {
  flex: 0 0 220px; 
  height: 220px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 22px 18px 20px;
  background: rgba(248, 245, 238, 0.88);
  border: 1px solid rgba(80, 202, 255, 0.18);
  
  opacity: 0;
  visibility: hidden;
  transform: scale(0.8);
  pointer-events: none;
  transition: opacity 0.4s ease, transform 0.4s ease, visibility 0.4s;
  cursor: pointer;
}

.category-card.strict-active {
  opacity: 1;
  visibility: visible;
  transform: scale(1);
  pointer-events: auto;
  box-shadow: 0 12px 28px rgba(30, 38, 49, 0.12);
}

.category-card.strict-active:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 18px 34px rgba(30, 38, 49, 0.16);
}

.card-bg-img {
  width: 126px;
  height: 126px;
  object-fit: contain;
  display: block;
  flex: 0 0 auto;
}

.category-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 42px;
  pointer-events: none;
}

.category-label {
  color: var(--color-dark);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: uppercase;
  text-align: center;
  display: block;
  width: 100%;
}

/* ==========================================================================
   BOUTONS MATERIEL DESIGN (FIXÉS AUX BORDURES)
   ========================================================================== */
.slider-btn {
  position: absolute; 
  top: 50%; 
  margin-top: -24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-dark);
  transform: scale(1) !important;
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
  z-index: 10;
}

.slider-btn.left-arrow { left: -30px; }
.slider-btn.right-arrow { right: -30px; }

.slider-btn:hover:not(.disabled-btn) {
  background-color: var(--color-blue);
  color: #ffffff;
  transform: scale(1.1) !important; 
}

.disabled-btn { opacity: 0.3; cursor: not-allowed; box-shadow: none; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .title-copy { font-size: 2rem; }
  .slider-btn { width: 40px; height: 40px; margin-top: -20px; }
  .slider-btn.left-arrow { left: 10px; }
  .slider-btn.right-arrow { right: 10px; }
}
</style>
