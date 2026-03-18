<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { groupService } from '../../api/groups'
import { resolveQuizImage } from '../../api/quiz'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const groupeNom = ref('Chargement...')
const quizzes = ref([])
const loading = ref(true)

const goBack = () => {
  router.push('/etudiant/mes-groupes')
}

const openQuiz = (quizId) => {
  router.push({
    path: `/etudiant/quiz/${quizId}/jouer`,
    query: { group: route.params.id },
  })
}

const loadGroupeQuizzes = async () => {
  const groupeId = route.params.id;
  if (!groupeId || groupeId === 'undefined') return router.push('/etudiant/mes-groupes');

  loading.value = true;
  try {
    const { data: groupe } = await groupService.show(groupeId);
    groupeNom.value = groupe.nom;

    const { data: quizzesData } = await groupService.getQuizzes(groupeId);
    quizzes.value = (quizzesData || []).map((q) => ({
        id: q.id,
        titre: q.titre,
        category: (q.category && typeof q.category === 'object') ? (q.category.name || q.category.NAME) : (q.category || 'Général'),
        image: resolveQuizImage(q),
        nbQuestions: q.questions_count ?? 0
    }));
  } catch (e) {
    router.push('/etudiant/mes-groupes');
  } finally {
    loading.value = false;
  }
};

onMounted(loadGroupeQuizzes)
</script>

<template>
  <div class="groupe-page">
    <AppHeader />

    <button class="fab-retour-blitzz" @click="goBack">
      <span class="material-symbols-outlined">west</span>
      Mes groupes
    </button>

    <div class="main-layout container-blitzz">
      <main class="quiz-grid-area">
        
        <header class="header-text">
          <h1 class="catalogue-main-title">{{ groupeNom }}</h1>
          <p class="quiz-counter" v-if="!loading">
            {{ quizzes.length }} QUIZ DISPONIBLES
          </p>
        </header>

        <div v-if="loading" class="loader-box">
          <div class="spinner"></div>
        </div>

        <div v-else-if="quizzes.length > 0" class="catalogue-quiz-grid">
          <div v-for="quiz in quizzes" :key="quiz.id" class="mini-quiz-card" @click="openQuiz(quiz.id)">
            <div class="card-inner">
              <img :src="quiz.image" alt="" draggable="false" />
              <div class="card-info-overlay">
                <h3 class="q-title">{{ quiz.titre }}</h3>
                <span class="q-cat">{{ quiz.category }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <h2>Aucun quiz disponible</h2>
          <p>Il n'y a pas encore de quiz assignés à ce groupe.</p>
        </div>
        
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700;800&display=swap');

.groupe-page {
  background: #fff;
  min-height: 100vh;
  padding-top: 140px;
  font-family: 'Inter', sans-serif;
  position: relative;
}

/* 🎯 STYLE RECTANGULAIRE (PHOTO 2) */
.fab-retour-blitzz {
  position: fixed;
  bottom: 30px;
  left: 30px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #111111; 
  color: #ffffff;
  border: none;
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

.fab-retour-blitzz:hover {
  background: #00A3FF; 
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 163, 255, 0.3);
}

/* Protection de la flèche Material */
.fab-retour-blitzz .material-symbols-outlined {
  font-family: 'Material Symbols Outlined' !important;
  font-size: 20px;
}

.main-layout { 
  display: flex; 
  max-width: 1250px; 
  margin: 0 auto; 
  padding: 0 20px 100px; 
  gap: 50px; 
}

.quiz-grid-area { 
  flex-grow: 1; 
  min-width: 0; 
}

.header-text { 
  margin-bottom: 35px; 
  border-bottom: 1px solid #f0f0f0; 
  padding-bottom: 20px; 
}

.catalogue-main-title { 
  font-family: 'Anton', sans-serif; 
  font-size: 2.8rem; 
  text-transform: uppercase; 
  color: #1a1a1a; 
  margin: 0; 
}

.quiz-counter { 
  font-size: 0.9rem; 
  font-family: 'Inter', sans-serif; 
  color: #888; 
  font-weight: 600; 
  margin-top: 8px; 
  text-transform: uppercase; 
}

.catalogue-quiz-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 30px; 
  width: 100%; 
}

.mini-quiz-card { 
  cursor: pointer; 
  transition: transform 0.2s ease; 
  width: 100%; 
}

.mini-quiz-card:hover { 
  transform: translateY(-5px); 
}

.card-inner { 
  position: relative; 
  width: 100%; 
  height: 200px; 
  border-radius: 12px; 
  overflow: hidden; 
  background: #111; 
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); 
}

.card-inner img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  opacity: 0.85; 
}

.card-info-overlay { 
  position: absolute; 
  inset: 0; 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  justify-content: flex-end; 
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%); 
}

.q-title { 
  font-family: 'Inter', sans-serif; 
  color: #fff; 
  font-weight: 800; 
  font-size: 1.2rem; 
  margin: 0 0 5px 0; 
  line-height: 1.2; 
}

.q-cat { 
  font-family: 'Inter', sans-serif; 
  color: #00A3FF; 
  font-weight: 800; 
  font-size: 0.75rem; 
  text-transform: uppercase; 
  letter-spacing: 0.5px; 
}

.empty-state { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-start; 
  padding: 40px 0; 
}

.empty-state h2 { 
  font-family: 'Inter', sans-serif; 
  font-size: 1.8rem; 
  font-weight: 800; 
  color: #1a1a1a; 
  margin: 0 0 10px 0; 
}

.empty-state p { 
  font-family: 'Inter', sans-serif; 
  font-size: 1rem; 
  color: #6b7280; 
  margin: 0; 
}

.loader-box { 
  display: flex; 
  justify-content: center; 
  padding: 100px 0; 
}

.spinner { 
  width: 40px; 
  height: 40px; 
  border: 4px solid #f3f4f6; 
  border-top-color: #00A3FF; 
  border-radius: 50%; 
  animation: spin 1s linear infinite; 
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

@media (max-width: 768px) {
  .catalogue-quiz-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
  .card-inner { height: 160px; }
  .fab-retour-blitzz { bottom: 20px; left: 20px; padding: 12px 18px; font-size: 0.85rem; }
}
</style>
