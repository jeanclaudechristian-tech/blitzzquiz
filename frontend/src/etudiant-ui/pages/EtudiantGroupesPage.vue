<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { groupService } from '../../api/groups'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

const router = useRouter()
const groupes = ref([])
const loading = ref(true)

const loadGroups = async () => {
  loading.value = true
  try {
    const { data } = await groupService.list() 
    groupes.value = data
  } catch (e) {
    console.error("Erreur chargement groupes", e)
  } finally {
    loading.value = false
  }
}

const goToGroup = (id) => {
  router.push(`/etudiant/groupes/${id}/quiz`)
}

const goHome = () => {
  router.push('/')
}

onMounted(loadGroups)
</script>

<template>
  <div class="mes-groupes-page">
    <AppHeader />

    <div class="main-layout container-blitzz">
      <main class="content-area">

        <header class="header-text">
          <h1 class="anton-title">MES GROUPES</h1>
          <p class="count-text" v-if="!loading">{{ groupes.length }} CLASSES REJOINTES</p>
        </header>

        <div v-if="loading" class="loader">
          <div class="spinner"></div>
        </div>

        <div v-else-if="groupes.length > 0" class="group-grid">
          <div 
            v-for="g in groupes" 
            :key="g.id" 
            class="group-card-blitzz" 
            @click="goToGroup(g.id)"
          >
            <div class="card-icon">
              <span class="material-symbols-outlined">groups</span>
            </div>
            <div class="card-info">
              <h3>{{ g.nom }}</h3>
              <p>{{ g.nb_membres }} Membres</p>
            </div>
            <span class="material-symbols-outlined arrow">chevron_right</span>
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="material-symbols-outlined icon">group_add</span>
          <h2>Aucun groupe</h2>
          <p>Utilise le bouton <strong>CODE</strong> en haut pour rejoindre ta première classe !</p>
        </div>
      </main>
    </div>

    <button class="fab-retour-accueil" @click="goHome">
      <span class="material-symbols-outlined">west</span>
      Retour à l'accueil
    </button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;700;800&display=swap');

.mes-groupes-page {
  background: #fff;
  min-height: 100vh;
  padding-top: 130px;
  font-family: 'Inter', sans-serif;
  position: relative;
}

.main-layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px 100px;
}

/* 🎯 STYLE RECTANGULAIRE (PHOTO 2) */
.fab-retour-accueil {
  position: fixed;
  bottom: 40px;
  left: 40px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #111111; 
  color: #ffffff;
  border: none;
  /* 🎯 Changé de 50px à 8px pour le look rectangulaire */
  border-radius: 8px; 
  padding: 14px 24px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.fab-retour-accueil:hover {
  background: #00A3FF; 
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 163, 255, 0.3);
}

.fab-retour-accueil .material-symbols-outlined {
  font-size: 20px;
}

.anton-title {
  font-family: 'Anton', sans-serif;
  font-size: 4.5rem;
  line-height: 1;
  color: #1a1a1a;
  text-transform: uppercase;
  margin: 0;
}

.count-text {
  font-weight: 700;
  color: #9ca3af;
  margin-top: 10px;
  font-size: 0.9rem;
}

.group-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 50px;
}

.group-card-blitzz {
  background: #f9fafb;
  border: 2px solid #f3f4f6;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-card-blitzz:hover {
  border-color: #00A3FF;
  background: #fff;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 163, 255, 0.1);
}

.card-icon {
  width: 56px;
  height: 56px;
  background: #111;
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.card-info h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #1a1a1a;
}

.card-info p {
  margin: 4px 0 0;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.9rem;
}

.arrow {
  margin-left: auto;
  color: #d1d5db;
}

.loader { display: flex; justify-content: center; padding: 100px 0; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top-color: #00A3FF; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 100px 0; color: #9ca3af; }
.empty-state .icon { font-size: 4rem; margin-bottom: 20px; }

@media (max-width: 768px) {
  .anton-title { font-size: 3rem; }
  .fab-retour-accueil {
    bottom: 20px;
    left: 20px;
    padding: 12px 20px;
    font-size: 0.85rem;
    border-radius: 8px;
  }
}
</style>