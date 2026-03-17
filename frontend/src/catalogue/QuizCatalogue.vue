<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { quizService } from '../api/quiz';
import AppHeader from '../accueil-ui/composant/AppHeader.vue';
import QuizModal from '../quiz-ui/quiz.vue'; // 🎯 Vérifie bien que le chemin est correct
// 🎯 1. IMPORT DU MODAL
import GuestModal from '../accueil-ui/composant/GuestModal.vue';
const showQuizModal = ref(false);
const selectedQuizId = ref(null);
const router = useRouter();
const route = useRoute();

// --- ÉTATS ---
const quizzes = ref([]);
const isLoading = ref(true);

// 🎯 1. ÉTAT POUR AFFICHER LE MODAL
const showGuestModal = ref(false);

// 🎯 ÉTATS DU HEADER & MOBILE
const isHeaderHidden = ref(false);
const isMobileFilterOpen = ref(false);
let lastScrollY = 0;
let isMouseInHeader = false;

// --- FILTRES ---
const sortBy = ref('recent');
const selectedLevel = ref('Tous');
const selectedCategory = ref(route.query.category || '');

// 🎯 FIX: Changement de Cégep par "Collégial"
const levels = ['Tous', 'Primaire', 'Secondaire', 'Collégial', 'Université'];
const categories = [
    { id: '', label: 'Toutes', size: 'large' },
    { id: 'Math', label: 'Math', size: 'large' },
    { id: 'Français', label: 'Français', size: 'large' },
    { id: 'Sciences', label: 'Sciences', size: 'large' },
    { id: 'Histoire', label: 'Histoire', size: 'small' },
    { id: 'Sport', label: 'Sport', size: 'small' },
    { id: 'Trivia', label: 'Trivia', size: 'small' },
    { id: 'Art', label: 'Art', size: 'small' },
    // --- Nouvelles Catégories Professionnelles ---
    { id: 'Technologie Info.', label: 'T.I.', size: 'small' },
    { id: 'Santé', label: 'Santé', size: 'small' },
    { id: 'Légal', label: 'Légal', size: 'small' },
    { id: 'Construction', label: 'BTP', size: 'small' },
    { id: 'Administration', label: 'Admin', size: 'small' },
    { id: 'Politique', label: 'Pol.', size: 'small' },
    { id: 'Ingénieur', label: 'Ingé.', size: 'small' },
    // --- Divertissement & Autres ---
    { id: 'Films & Séries', label: 'Films', size: 'small' },
    { id: 'Monde & Culture', label: 'Culture', size: 'small' },
    { id: 'Général', label: 'Général', size: 'small' }
];

// 🎯 2. LOGIQUE DE VÉRIFICATION AU CLIC
const handleQuizClick = (quizId) => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
        showGuestModal.value = true;
    } else {
        // Au lieu de router.push, on ouvre la modale directement
        selectedQuizId.value = quizId;
        showQuizModal.value = true;
    }
};

// --- 🎯 LOGIQUE SCROLL & SOURIS ---
const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY <= 80) {
        isHeaderHidden.value = false;
    } else if (currentScrollY > lastScrollY) {
        isHeaderHidden.value = true;
    } else {
        isHeaderHidden.value = false;
    }
    lastScrollY = currentScrollY;
};

const handleMouseMove = (e) => {
    if (window.scrollY <= 80) {
        isHeaderHidden.value = false;
        return;
    }
    if (e.clientY < 120) {
        isHeaderHidden.value = false;
        isMouseInHeader = true;
    } else if (isMouseInHeader) {
        isHeaderHidden.value = true;
        isMouseInHeader = false;
    }
};

// --- DATA ---
const loadQuizzes = async () => {
    isLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        const response = token
            ? { data: await quizService.list() }
            : { data: await quizService.listPublic() };

        quizzes.value = response.data.map(q => {
            // 🎯 FIX: Extraction du nom de la catégorie (JSON bleu)
            const catName = (q.category && typeof q.category === 'object') ? (q.category.name || q.category.NAME) : q.category;

            return {
                id: q.id,
                titre: q.titre,
                category: catName || 'Général',
                image: q.image || '/images/default-quiz.jpg',
                education_level: q.education_level || 'Tous'
            };
        });
    } catch (e) {
        console.error("Erreur de chargement", e);
        quizzes.value = [];
    } finally {
        isLoading.value = false;
    }
};

watch(() => route.query.category, (newCat) => { selectedCategory.value = newCat || ''; });

const filteredQuizzes = computed(() => {
    let result = quizzes.value.filter((q) => {
        const matchCat = !selectedCategory.value || String(q.category).toLowerCase() === selectedCategory.value.toLowerCase();

        // 🎯 FIX: Match intelligent pour "Collégial"
        let matchLvl = false;
        const dbLevel = q.education_level ? String(q.education_level).toLowerCase() : '';

        if (selectedLevel.value === 'Tous') {
            matchLvl = true;
        } else if (selectedLevel.value === 'Collégial') {
            matchLvl = dbLevel.includes('collég'); // Trouve "collégiale" de la BDD
        } else {
            matchLvl = dbLevel === selectedLevel.value.toLowerCase();
        }

        return matchCat && matchLvl;
    });
    return sortBy.value === 'recent' ? result.slice().reverse() : result;
});

const dynamicTitle = computed(() => {
    let title = selectedCategory.value ? `QUIZ ${selectedCategory.value}` : 'TOUS LES QUIZ';
    if (selectedLevel.value !== 'Tous') title += ` - ${selectedLevel.value}`;
    return title.toUpperCase();
});

onMounted(() => {
    loadQuizzes();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<template>
    <div class="catalogue-page">
        <AppHeader :class="{ 'force-hide': isHeaderHidden, 'force-show': !isHeaderHidden }" />

        <div class="main-layout container-blitzz">

            <aside class="sidebar-wrapper">
                <div class="fixed-sidebar-content">

                    <div class="filter-panel">
                        <div class="f-group">
                            <span class="f-label">Trier par</span>
                            <div class="bento">
                                <button class="f-btn large" :class="{ active: sortBy === 'recent' }"
                                    @click="sortBy = 'recent'">Récent</button>
                                <button class="f-btn large" :class="{ active: sortBy === 'populaire' }"
                                    @click="sortBy = 'populaire'">Populaire</button>
                            </div>
                        </div>

                        <div class="f-group">
                            <span class="f-label">Niveaux</span>
                            <div class="stack">
                                <button v-for="lvl in levels" :key="lvl"
                                    :class="['f-btn full', { active: selectedLevel === lvl }]"
                                    @click="selectedLevel = lvl">
                                    {{ lvl }}
                                </button>
                            </div>
                        </div>

                        <div class="f-group no-mb">
                            <span class="f-label">Catégories</span>
                            <div class="bento">
                                <button v-for="cat in categories" :key="cat.id"
                                    :class="['f-btn', cat.size, { active: selectedCategory === cat.id }]"
                                    @click="selectedCategory = cat.id">
                                    {{ cat.label }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button class="retour-btn-fixed" @click="router.push('/')">
                        <span class="material-symbols-outlined">west</span>
                        Retour à l'accueil
                    </button>

                </div>
            </aside>

            <main class="quiz-grid-area">
                <header class="header-text">
                    <h1 class="anton-title">{{ dynamicTitle }}</h1>
                    <p class="count-text">{{ filteredQuizzes.length }} QUIZ DISPONIBLES</p>
                </header>

                <div v-if="isLoading" class="loader">
                    <div class="spinner"></div>
                </div>

                <div v-else class="grid-3">
                    <div v-for="quiz in filteredQuizzes" :key="quiz.id" class="quiz-card"
                        @click="handleQuizClick(quiz.id)">
                        <div class="card-inner">
                            <img :src="quiz.image" alt="" draggable="false" />
                            <div class="card-info-bottom">
                                <h3 class="q-title">{{ quiz.titre }}</h3>
                                <span class="q-cat">{{ quiz.category }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="!isLoading && filteredQuizzes.length === 0" class="empty-state">
                    <span class="material-symbols-outlined icon">search_off</span>
                    <h2>Aucun résultat</h2>
                    <p>Essayez de modifier vos filtres de recherche.</p>
                </div>
            </main>

        </div>

        <button class="mobile-fab mobile-fab-back" @click="router.push('/')">
            <span class="material-symbols-outlined icon-bold">chevron_left</span>
        </button>

        <button class="mobile-fab mobile-fab-filter" @click="isMobileFilterOpen = true">
            <span class="material-symbols-outlined icon-bold">tune</span>
        </button>

        <GuestModal v-if="showGuestModal" @close="showGuestModal = false" />

        <QuizModal 
            v-if="showQuizModal" 
            :quizId="selectedQuizId" 
            @close="showQuizModal = false" 
        />

        <Transition name="fade-slide-up">
            <div v-if="isMobileFilterOpen" class="mobile-modal-bg" @click.self="isMobileFilterOpen = false">
                <div class="mobile-modal-sheet filter-panel">

                    <div class="modal-header">
                        <h3>Filtres de recherche</h3>
                        <button class="close-btn" @click="isMobileFilterOpen = false">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div class="f-group">
                        <span class="f-label">Trier par</span>
                        <div class="bento">
                            <button class="f-btn large" :class="{ active: sortBy === 'recent' }"
                                @click="sortBy = 'recent'">Récent</button>
                            <button class="f-btn large" :class="{ active: sortBy === 'populaire' }"
                                @click="sortBy = 'populaire'">Populaire</button>
                        </div>
                    </div>

                    <div class="f-group">
                        <span class="f-label">Niveaux</span>
                        <div class="stack">
                            <button v-for="lvl in levels" :key="lvl"
                                :class="['f-btn full', { active: selectedLevel === lvl }]" @click="selectedLevel = lvl">
                                {{ lvl }}
                            </button>
                        </div>
                    </div>

                    <div class="f-group no-mb">
                        <span class="f-label">Catégories</span>
                        <div class="bento">
                            <button v-for="cat in categories" :key="cat.id"
                                :class="['f-btn', cat.size, { active: selectedCategory === cat.id }]"
                                @click="selectedCategory = cat.id; isMobileFilterOpen = false">
                                {{ cat.label }}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </Transition>

    </div>
</template>

<style scoped>
/* ==========================================================================
   IMPORT DES POLICES
   ========================================================================== */
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ==========================================================================
   🎯 CONTRÔLE ABSOLU DU HEADER (Animations d'apparition/disparition)
   ========================================================================== */
:deep(.header-container) {
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease !important;
}

:deep(.header-container.force-hide) {
    transform: translateY(-150px) !important;
    opacity: 0 !important;
    pointer-events: none !important;
}

:deep(.header-container.force-show) {
    transform: translateY(0) !important;
    opacity: 1 !important;
    pointer-events: auto !important;
}

/* ==========================================================================
   PAGE & LAYOUT GLOBAL
   ========================================================================== */
.catalogue-page {
    background: #fff;
    min-height: 100vh;
    padding-top: 130px;
    font-family: 'Inter', sans-serif !important;
}

.main-layout {
    display: flex;
    align-items: flex-start;
    max-width: 1250px;
    margin: 0 auto;
    padding: 0 20px;
    padding-bottom: 100px;
}

/* ==========================================================================
   SIDEBAR FIXE (FLOTTANTE ET INDÉPENDANTE)
   ========================================================================== */
.sidebar-wrapper {
    width: 260px;
    flex-shrink: 0;
}

.fixed-sidebar-content {
    position: fixed;
    top: 130px;
    width: 260px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.filter-panel {
    background-color: #50CAFF !important;
    border-radius: 12px;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(80, 202, 255, 0.2);
    max-height: calc(100vh - 220px);
    overflow-y: auto;
    scrollbar-width: none;
}

.filter-panel::-webkit-scrollbar {
    display: none;
}

.f-group {
    margin-bottom: 25px;
}

.no-mb {
    margin-bottom: 0;
}

.f-label {
    display: block;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
}

.bento {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.f-btn {
    background: rgba(255, 255, 255, 0.2) !important;
    border: none !important;
    border-radius: 8px !important;
    color: #fff !important;
    font-weight: 600 !important;
    font-family: 'Inter', sans-serif !important;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.f-btn:hover {
    background: rgba(255, 255, 255, 0.3) !important;
}

.f-btn.active {
    background: #ffffff !important;
    color: #00A3FF !important;
    font-weight: 800 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.f-btn.large {
    width: calc(50% - 4px);
    padding: 10px 0;
    font-size: 0.85rem;
}

.f-btn.small {
    width: calc(33.33% - 6px);
    padding: 8px 0;
    font-size: 0.75rem;
}

.f-btn.full {
    width: 100%;
    padding: 10px 15px;
    justify-content: flex-start;
}

.retour-btn-fixed {
    background: #111111 !important;
    color: #ffffff !important;
    border: none;
    border-radius: 12px;
    padding: 14px;
    width: 100%;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.retour-btn-fixed:hover {
    background: #333333 !important;
    transform: translateY(-2px);
}

/* ==========================================================================
   ZONE GRILLE DE QUIZ
   ========================================================================== */
.quiz-grid-area {
    flex-grow: 1;
    margin-left: 50px;
    min-width: 0;
}

.header-text {
    margin-bottom: 40px;
}

.anton-title {
    font-family: 'Anton', sans-serif !important;
    font-size: 4.5rem;
    line-height: 1;
    color: #1a1a1a;
    margin: 0;
    text-transform: uppercase;
}

.count-text {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    color: #9ca3af;
    margin-top: 8px;
    font-size: 0.9rem;
}

/* --- GRILLE --- */
.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    align-items: start !important;
    grid-auto-rows: max-content !important;
}

/* --- CARTES 16:9 --- */
.quiz-card {
    cursor: pointer;
    transition: transform 0.2s ease;
    width: 100%;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    box-shadow: none !important;
}

.quiz-card:hover {
    transform: translateY(-6px);
}

.card-inner {
    position: relative;
    aspect-ratio: 16 / 9 !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    background: #111 !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
}

.card-inner img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    opacity: 0.85 !important;
    transition: transform 0.3s ease;
    display: block !important;
}

.quiz-card:hover .card-inner img {
    transform: scale(1.05);
}

/* OVERLAY TEXTE */
.card-info-bottom {
    position: absolute !important;
    inset: 0 !important;
    padding: 15px 20px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-end !important;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 60%) !important;
    pointer-events: none !important;
    border: none !important;
}

.q-title {
    font-family: 'Inter', sans-serif !important;
    color: #ffffff !important;
    font-weight: 800 !important;
    font-size: 1.15rem !important;
    margin: 0 0 4px 0 !important;
    line-height: 1.2 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

.q-cat {
    font-family: 'Inter', sans-serif !important;
    color: #00A3FF !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    font-size: 0.7rem !important;
    letter-spacing: 0.5px !important;
    margin: 0 !important;
}

/* --- ÉTATS VIDES & LOADER --- */
.empty-state {
    text-align: center;
    padding: 80px 20px;
    color: #6b7280;
}

.empty-state .icon {
    font-size: 3rem;
    color: #d1d5db;
    margin-bottom: 10px;
}

.empty-state h2 {
    color: #111;
    font-weight: 800;
    font-size: 1.5rem;
    margin-bottom: 8px;
    font-family: 'Inter', sans-serif;
}

.loader {
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
    to {
        transform: rotate(360deg);
    }
}

/* ==========================================================================
   🎯 MOBILE (Boutons flottants, Modal et 2 Colonnes)
   ========================================================================== */
.mobile-fab {
    display: none;
}

/* Modal Desktop invisible */
.mobile-modal-bg {
    display: none;
}

@media (max-width: 950px) {
    .grid-3 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .anton-title {
        font-size: 3.5rem;
    }
}

@media (max-width: 768px) {
    .sidebar-wrapper {
        display: none;
    }

    .fixed-sidebar-content {
        display: none;
    }

    .quiz-grid-area {
        margin-left: 0;
    }

    .catalogue-page {
        padding-top: 100px;
    }

    .anton-title {
        font-size: 2.8rem;
    }

    /* 🎯 2 COLONNES SUR MOBILE */
    .grid-3 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 15px;
    }

    /* On réduit légèrement le texte pour que ça rentre bien dans 2 colonnes sur petit écran */
    .card-info-bottom {
        padding: 10px !important;
    }

    .q-title {
        font-size: 0.95rem !important;
    }

    .q-cat {
        font-size: 0.65rem !important;
    }

    /* 🎯 BOUTONS FLOTTANTS (FABs) */
    .mobile-fab {
        display: flex;
        position: fixed;
        bottom: 25px;
        width: 55px;
        height: 55px;
        border-radius: 50%;
        border: none;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
    }

    .mobile-fab:active {
        transform: scale(0.9);
    }

    .icon-bold {
        font-size: 28px;
        font-weight: 600;
    }

    /* Bouton Retour (Bas Gauche, Blanc) */
    .mobile-fab-back {
        left: 20px;
        background: #ffffff;
        color: #111111;
    }

    /* Bouton Filtre (Bas Droite, Bleu) */
    .mobile-fab-filter {
        right: 20px;
        background: #00A3FF;
        color: #ffffff;
    }

    /* 🎯 MODAL DE FILTRES MOBILE */
    .mobile-modal-bg {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 2000;
        display: flex;
        align-items: flex-end;
    }

    .mobile-modal-sheet {
        position: relative;
        top: 0;
        width: 100%;
        max-height: 85vh;
        border-radius: 24px 24px 0 0 !important;
        /* Arrondi en haut */
        padding: 30px 20px 40px 20px !important;
        margin: 0 !important;
        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
    }

    .modal-header h3 {
        color: #fff;
        font-weight: 800;
        font-size: 1.3rem;
        margin: 0;
        font-family: 'Inter', sans-serif;
    }

    .close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
}

/* Animation Modal Mobile */
.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
    transition: opacity 0.3s ease;
}

.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
    opacity: 0;
}

.fade-slide-up-enter-active .mobile-modal-sheet,
.fade-slide-up-leave-active .mobile-modal-sheet {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-up-enter-from .mobile-modal-sheet,
.fade-slide-up-leave-to .mobile-modal-sheet {
    transform: translateY(100%);
}
</style>
