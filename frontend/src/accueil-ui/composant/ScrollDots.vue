<template>
  <div class="scroll-dots-pill" v-if="!isMobile && visibleDots.length > 0">
    <button
      v-for="(dot, index) in visibleDots"
      :key="index"
      class="scroll-dot"
      :class="{ active: activeIndex === index }"
      @click="scrollTo(dot.id)"
      :title="dot.label"
    />
  </div>
</template>

<script>
export default {
  name: 'ScrollDots',
  data() {
    return {
      activeIndex: 0,
      isMobile: false,
      // La liste de TOUTES les sections possibles
      allDots: [
        { id: 'section-hero',        label: 'Accueil' },
        { id: 'section-suggestions', label: 'Quiz suggérés' },
        { id: 'section-categories',  label: 'Catégories' },
        { id: 'section-cta',         label: 'Rejoignez-nous' }, /* Le nouveau point ! */
        { id: 'section-footer',      label: 'À propos' },
      ],
      visibleDots: [] // Les points qui sont réellement affichés
    }
  },
  mounted() {
    this.checkMobile();
    this.updateVisibleDots();
    window.addEventListener('resize', this.checkMobile);
    window.addEventListener('scroll', this.onScroll, { passive: true });
  },
  updated() {
    // Si l'utilisateur se connecte/déconnecte, on met à jour les points
    this.updateVisibleDots();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    window.removeEventListener('scroll', this.onScroll);
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    updateVisibleDots() {
      // On ne garde que les points dont la section existe sur la page
      this.visibleDots = this.allDots.filter(dot => document.getElementById(dot.id));
    },
    scrollTo(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    },
    onScroll() {
      if (this.visibleDots.length === 0) return;
      
      const offsets = this.visibleDots.map((dot, i) => {
        const el = document.getElementById(dot.id);
        if (!el) return { i, dist: Infinity };
        return { i, dist: Math.abs(el.getBoundingClientRect().top - 80) };
      });
      const closest = offsets.reduce((a, b) => a.dist < b.dist ? a : b);
      this.activeIndex = closest.i;
    }
  }
}
</script>

<style scoped>
:root {
  --color-ui-blue: #00A3FF;
}

.scroll-dots-pill {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000; 
  background-color: #00A3FF; 
  border-radius: 50px; 
  padding: 12px 8px; 
  display: flex;
  flex-direction: column;
  gap: 12px; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.4);
}

.scroll-dot:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.scroll-dot.active {
  background-color: #ffffff;
  transform: scale(1.3); 
}
</style>