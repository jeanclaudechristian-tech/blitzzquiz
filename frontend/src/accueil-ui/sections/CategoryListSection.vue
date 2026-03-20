<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const router = useRouter()

const categories = [
  { id: 1, slug: 'math', label: 'Math' },
  { id: 2, slug: 'francais', label: 'Français' },
  { id: 3, slug: 'sciences', label: 'Sciences' },
  { id: 4, slug: 'histoire', label: 'Histoire' },
  { id: 5, slug: 'sport', label: 'Sport' },
  { id: 6, slug: 'trivia', label: 'Trivia' },
  { id: 7, slug: 'art', label: 'Art' },
  { id: 8, slug: 'ti', label: 'Technologie Info.' },
  { id: 9, slug: 'sante', label: 'Santé' },
  { id: 10, slug: 'legal', label: 'Légal' },
  { id: 11, slug: 'construction', label: 'Construction' },
  { id: 12, slug: 'admin', label: 'Administration' },
  { id: 13, slug: 'politique', label: 'Politique' },
  { id: 14, slug: 'ingenieur', label: 'Ingénieur' },
  { id: 15, slug: 'films-series', label: 'Films & Séries' },
  { id: 16, slug: 'monde', label: 'Monde & Culture' },
  { id: 17, slug: 'general', label: 'Général' },
]

const CATEGORY_COLORS = {
  math: '#50CAFF',
  francais: '#007BFF',
  sciences: '#28A745',
  histoire: '#6F42C1',
  sport: '#FD7E14',
  trivia: '#A837BE',
  art: '#FFC107',
  ti: '#1E2631',
  sante: '#DC3545',
  legal: '#FFA826',
  construction: '#121820',
  admin: '#007BFF',
  politique: '#6F42C1',
  ingenieur: '#1E2631',
  'films-series': '#A837BE',
  monde: '#50CAFF',
  general: '#28A745',
}

const getCategoryColor = (slug) => CATEGORY_COLORS[slug] || '#1E2631'

const currentIndex = ref(0)
const visibleCount = ref(4)

const maxIndex = computed(() => categories.length - visibleCount.value)

const windowWidthCss = computed(() => {
  return (220 * visibleCount.value) + (20 * (visibleCount.value - 1)) + 'px'
})

const updateResponsiveness = () => {
  const w = window.innerWidth
  if (w < 600) visibleCount.value = 1
  else if (w < 850) visibleCount.value = 2
  else if (w < 1150) visibleCount.value = 3
  else visibleCount.value = 4

  if (currentIndex.value > maxIndex.value) {
    currentIndex.value = maxIndex.value
  }
}

onMounted(() => {
  updateResponsiveness()
  window.addEventListener('resize', updateResponsiveness)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateResponsiveness)
})

const next = () => {
  if (currentIndex.value < maxIndex.value) currentIndex.value++
}

const prev = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const startX = ref(0)
let isDragging = false

const startDrag = (e) => {
  isDragging = true
  startX.value = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
}

const endDrag = (e) => {
  if (!isDragging || startX.value === 0) return
  const endX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX
  const diff = startX.value - endX

  if (diff > 40) next()
  else if (diff < -40) prev()

  isDragging = false
  startX.value = 0
}

const handleClick = (label) => {
  router.push(`/catalogue?category=${encodeURIComponent(label)}`)
}
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
        <div class="carousel-track" :style="{ transform: `translateX(calc(${currentIndex} * -240px))` }">
          <div
            v-for="(cat, i) in categories"
            :key="cat.id"
            class="mini-quiz-card category-card"
            :style="{ '--category-color': getCategoryColor(cat.slug) }"
            :class="{ 'strict-active': i >= currentIndex && i < currentIndex + visibleCount }"
            @click="handleClick(cat.label)"
          >
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

.carousel-window:active {
  cursor: grabbing;
}

.carousel-track {
  display: flex;
  gap: 20px;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

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
  padding: 22px 18px 20px;
  background: var(--category-color);
  border: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 0;
  visibility: hidden;
  transform: scale(0.8);
  pointer-events: none;
  transition: opacity 0.35s ease, transform 0.35s ease, visibility 0.35s;
  cursor: pointer;
}

.category-card.strict-active {
  opacity: 1;
  visibility: visible;
  transform: scale(1);
  pointer-events: auto;
  box-shadow: 0 12px 28px rgba(30, 38, 49, 0.22);
}

.category-card.strict-active:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 18px 34px rgba(30, 38, 49, 0.3);
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
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: uppercase;
  text-align: center;
  display: block;
  width: 100%;
}

.slider-btn {
  position: absolute;
  top: 50%;
  margin-top: -24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
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

.slider-btn .material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-size: 22px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  direction: ltr;
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

.slider-btn.left-arrow {
  left: -30px;
}

.slider-btn.right-arrow {
  right: -30px;
}

.slider-btn:hover:not(.disabled-btn) {
  background-color: var(--color-blue);
  color: #ffffff;
  transform: scale(1.1) !important;
}

.disabled-btn {
  opacity: 0.3;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 768px) {
  .title-copy {
    font-size: 2rem;
  }

  .slider-btn {
    width: 40px;
    height: 40px;
    margin-top: -20px;
  }

  .slider-btn.left-arrow {
    left: 10px;
  }

  .slider-btn.right-arrow {
    right: 10px;
  }
}
</style>
