<template>
  <div class="categorie-page">
    <AppHeader />

    <main class="categorie-main container-blitzz">
      <header class="page-header">
        <h1 class="page-title">Catégories</h1>
        <p class="page-subtitle">Trouvez votre prochain défi par thématique</p>
      </header>

      <section class="top-categories-grid">
        <div class="big-cat-card">
          <div class="card-bg-overlay"></div>
          <h2 class="cat-title">Histoire</h2>
        </div>
        <div class="big-cat-card">
          <div class="card-bg-overlay"></div>
          <h2 class="cat-title">Sciences</h2>
        </div>
        <div class="big-cat-card">
          <div class="card-bg-overlay"></div>
          <h2 class="cat-title">Sports</h2>
        </div>
      </section>

      <section class="sub-categories-grid">
        <div class="small-cat-card" v-for="i in 9" :key="'small-'+i">
          <span class="cat-title-small">Sous-catégorie {{ i }}</span>
          <span class="quiz-count">{{ Math.floor(Math.random() * 40) + 10 }} quiz</span>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AppHeader from '../accueil-ui/composant/AppHeader.vue'

export default {
  name: 'CategoriePage',
  components: {
    AppHeader
  }
}
</script>

<style scoped>
/* On utilise les variables globales de l'app si elles existent (d'où le var()) */
.categorie-page {
  background-color: var(--color-bg, #ffffff);
  min-height: 100vh;
  padding-top: 140px; 
  padding-bottom: 80px;
}

.container-blitzz {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 40px;
}

.page-title {
  font-family: 'Anton', sans-serif;
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  color: var(--color-dark, #1a1a1a);
  text-transform: uppercase;
  line-height: 1.1;
  letter-spacing: 1px;
  margin: 0 0 10px 0;
}

.page-subtitle {
  font-family: var(--font-base, 'Inter', sans-serif);
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

/* ==========================================================================
   TOP GRID : 3 Grosses Cartes
   ========================================================================== */
.top-categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-bottom: 40px;
}

.big-cat-card {
  position: relative;
  height: 260px;
  background-color: #111;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 25px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.big-cat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 80%);
  z-index: 1;
}

.cat-title {
  position: relative;
  z-index: 2;
  color: #fff;
  font-family: var(--font-base, 'Inter', sans-serif);
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
}

/* ==========================================================================
   BOTTOM GRID : Cartes fines
   ========================================================================== */
.sub-categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.small-cat-card {
  height: 70px;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.small-cat-card:hover {
  border-color: var(--color-blue, #00A3FF);
  background-color: rgba(0, 163, 255, 0.05);
  transform: translateY(-2px);
}

.cat-title-small {
  font-family: var(--font-base, 'Inter', sans-serif);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-dark, #1a1a1a);
}

.quiz-count {
  font-family: var(--font-base, 'Inter', sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-blue, #00A3FF);
  background: rgba(0, 163, 255, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

/* ==========================================================================
   RESPONSIVE MOBILE
   ========================================================================== */
@media (max-width: 768px) {
  .categorie-page {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .top-categories-grid,
  .sub-categories-grid {
    grid-template-columns: 1fr;
  }
  
  .big-cat-card {
    height: 200px;
  }
}
</style>