<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { quizService, resolveQuizImage } from '../api/quiz';
import api from '../api/Axios';
import AppHeader from '../accueil-ui/composant/AppHeader.vue';
import QuizModal from '../quiz-ui/quiz.vue';
import GuestModal from '../accueil-ui/composant/GuestModal.vue';
const showQuizModal = ref(false);
const selectedQuizId = ref(null);

// ── Actions mode "Mes quiz" ──────────────────────────────────
const deleteModal  = ref(false);
const quizToDelete = ref(null);
const deleting     = ref(false);

const editQuiz      = (id) => router.push(`/enseignant/quiz/${id}/editer`);
const editQuestions = (id) => router.push(`/enseignant/quiz/${id}/questions`);

const askDelete = (quiz) => {
    quizToDelete.value = quiz;
    deleteModal.value  = true;
};
const cancelDelete = () => {
    quizToDelete.value = null;
    deleteModal.value  = false;
};
const confirmDelete = async () => {
    if (!quizToDelete.value) return;
    deleting.value = true;
    try {
        await api.delete(`/quizzes/${quizToDelete.value.id}`);
        quizzes.value = quizzes.value.filter(q => q.id !== quizToDelete.value.id);
        deleteModal.value  = false;
        quizToDelete.value = null;
    } catch (e) {
        console.error('Erreur suppression quiz', e);
    } finally {
        deleting.value = false;
    }
};
const router = useRouter();
const route = useRoute();
const scopeMine = computed(() => route.query.scope === 'mine');

const currentUserId = computed(() => {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.id ?? null;
    } catch {
        return null;
    }
});

// --- ÉTATS ---
const quizzes = ref([]);
const isLoading = ref(true);
const loadError = ref('');

// 🎯 1. ÉTAT POUR AFFICHER LE MODAL
const showGuestModal = ref(false);

// 🎯 ÉTATS DU HEADER & MOBILE
const isHeaderHidden = ref(false);
const isMobileFilterOpen = ref(false);
let isMouseInHeader = false;
let previousScrollY = 0;
let latestScrollY = 0;
let latestMouseY = Number.POSITIVE_INFINITY;
let headerRafId = null;

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

const hideBrokenImage = (event) => {
    const img = event?.target;
    if (!img) return;
    img.style.display = 'none';
};

// --- 🎯 LOGIQUE SCROLL & SOURIS ---
const updateHeaderVisibility = () => {
    headerRafId = null;

    if (latestScrollY <= 80) {
        isHeaderHidden.value = false;
        isMouseInHeader = false;
        previousScrollY = latestScrollY;
        return;
    }

    if (latestMouseY < 120) {
        isHeaderHidden.value = false;
        isMouseInHeader = true;
        previousScrollY = latestScrollY;
        return;
    }

    if (latestScrollY > previousScrollY) {
        isHeaderHidden.value = true;
        isMouseInHeader = false;
    } else if (latestScrollY < previousScrollY) {
        isHeaderHidden.value = false;
    } else if (isMouseInHeader) {
        isHeaderHidden.value = true;
        isMouseInHeader = false;
    }

    previousScrollY = latestScrollY;
};

const scheduleHeaderVisibilityUpdate = () => {
    if (headerRafId !== null) return;
    headerRafId = window.requestAnimationFrame(updateHeaderVisibility);
};

const handleScroll = () => {
    latestScrollY = window.scrollY;
    scheduleHeaderVisibilityUpdate();
};

const handleMouseMove = (e) => {
    latestMouseY = e.clientY;
    scheduleHeaderVisibilityUpdate();
};

// --- DATA ---
const mapQuiz = (q) => {
    const catName = (q.category && typeof q.category === 'object')
        ? (q.category.name || q.category.NAME)
        : q.category;
    return {
        id: q.id,
        titre: q.titre,
        category: catName || 'Général',
        image: resolveQuizImage(q),
        education_level: q.education_level || 'Tous',
        owner_id: q.owner_id ?? q.ownerId ?? null,
        is_public: q.is_public ?? true,
        questions_count: q.questions_count ?? 0,
    };
};

const loadQuizzes = async () => {
    isLoading.value = true;
    loadError.value = '';
    try {
        // En mode "Mes quiz", le backend peut inclure des quiz publics d'autres utilisateurs.
        // On filtre explicitement côté frontend sur owner_id pour éviter les actions interdites (403).
        if (scopeMine.value) {
            const { data } = await api.get('/quizzes');
            const mine = data
                .map(mapQuiz)
                .filter((q) => currentUserId.value && q.owner_id === currentUserId.value);
            quizzes.value = mine;
        } else {
            const token = localStorage.getItem('token');
            const raw = token
                ? await quizService.list()
                : await quizService.listPublic();
            quizzes.value = raw.map(mapQuiz);
        }
    } catch (e) {
        console.error("Erreur de chargement", e);
        quizzes.value = [];
        loadError.value = "Impossible de charger les quiz pour le moment.";
    } finally {
        isLoading.value = false;
    }
};

watch(() => route.query.category, (newCat) => { selectedCategory.value = newCat || ''; });
watch(() => route.query.scope, () => { loadQuizzes(); });

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
    if (scopeMine.value) {
        return 'MES QUIZ';
    }
    let title = selectedCategory.value ? `QUIZ ${selectedCategory.value}` : 'TOUS LES QUIZ';
    if (selectedLevel.value !== 'Tous') title += ` - ${selectedLevel.value}`;
    return title.toUpperCase();
});

onMounted(() => {
    latestScrollY = window.scrollY;
    previousScrollY = latestScrollY;
    loadQuizzes();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('mousemove', handleMouseMove);
    if (headerRafId !== null) {
        window.cancelAnimationFrame(headerRafId);
        headerRafId = null;
    }
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
                    <div class="header-row">
                        <div>
                            <h1 class="anton-title">{{ dynamicTitle }}</h1>
                            <p class="count-text">{{ filteredQuizzes.length }} QUIZ {{ scopeMine ? '' : 'DISPONIBLES' }}</p>
                        </div>
                        <button v-if="scopeMine" class="btn-nouveau-quiz" @click="router.push('/enseignant')">
                            <span class="material-symbols-outlined">add</span>
                            Nouveau quiz
                        </button>
                    </div>
                </header>

                <div v-if="isLoading" class="loader">
                    <div class="spinner"></div>
                </div>
                <div v-else-if="loadError" class="status-state status-state--error">
                    <span class="material-symbols-outlined icon">error</span>
                    <h2>Chargement impossible</h2>
                    <p>{{ loadError }}</p>
                    <button class="retry-btn" @click="loadQuizzes">Reessayer</button>
                </div>

                <!-- ── Mode Liste (Mes quiz) ── -->
                <template v-else-if="scopeMine">
                    <div v-if="filteredQuizzes.length > 0" class="quiz-list-wrapper">
                        <div class="quiz-list-header">
                            <span>Titre</span>
                            <span>Visibilité</span>
                            <span>Questions</span>
                            <span>Actions</span>
                        </div>
                        <div
                            v-for="(quiz, i) in filteredQuizzes"
                            :key="quiz.id"
                            class="quiz-list-row"
                            :style="{ animationDelay: `${i * 0.055}s` }"
                        >
                            <!-- Image + Titre -->
                            <div class="row-title-cell">
                                <div class="row-thumb">
                                    <img
                                        v-if="quiz.image"
                                        :src="quiz.image"
                                        alt=""
                                        draggable="false"
                                        @error="hideBrokenImage"
                                    />
                                    <div class="row-thumb-overlay">
                                        <h3>{{ quiz.titre }}</h3>
                                        <span>{{ quiz.category }}</span>
                                    </div>
                                </div>
                                <span class="row-titre-text">{{ quiz.titre }}</span>
                            </div>

                            <!-- Visibilité -->
                            <span>
                                <span class="pill" :class="quiz.is_public ? 'pill--public' : 'pill--prive'">
                                    {{ quiz.is_public ? 'Public' : 'Privé' }}
                                </span>
                            </span>

                            <!-- Questions -->
                            <span class="row-questions">{{ quiz.questions_count }}</span>

                            <!-- Actions -->
                            <div class="row-actions">
                                <button class="act-btn" @click="editQuiz(quiz.id)">
                                    <span class="material-symbols-outlined">edit</span>
                                    Modifier quiz
                                </button>
                                <button class="act-btn" @click="editQuestions(quiz.id)">
                                    <span class="material-symbols-outlined">quiz</span>
                                    Modifier questions
                                </button>
                                <button class="act-btn act-btn--danger" @click="askDelete(quiz)">
                                    <span class="material-symbols-outlined">delete</span>
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-else class="empty-state">
                        <span class="material-symbols-outlined icon">quiz</span>
                        <h2>Aucun quiz</h2>
                        <p>Tu n'as pas encore créé de quiz.</p>
                    </div>
                </template>

                <!-- ── Mode Grille (Catalogue normal) ── -->
                <template v-else>
                    <div class="grid-3">
                        <div v-for="quiz in filteredQuizzes" :key="quiz.id" class="quiz-card"
                            @click="handleQuizClick(quiz.id)">
                            <div class="card-inner">
                                <img
                                    v-if="quiz.image"
                                    :src="quiz.image"
                                    alt=""
                                    draggable="false"
                                    @error="hideBrokenImage"
                                />
                                <div class="card-info-bottom">
                                    <h3 class="q-title">{{ quiz.titre }}</h3>
                                    <span class="q-cat">{{ quiz.category }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="filteredQuizzes.length === 0" class="empty-state">
                        <span class="material-symbols-outlined icon">search_off</span>
                        <h2>Aucun résultat</h2>
                        <p>Essayez de modifier vos filtres de recherche.</p>
                    </div>
                </template>
            </main>

        </div>

        <button class="mobile-fab mobile-fab-back" @click="router.push('/')">
            <span class="material-symbols-outlined icon-bold">chevron_left</span>
        </button>

        <button class="mobile-fab mobile-fab-filter" @click="isMobileFilterOpen = true">
            <span class="material-symbols-outlined icon-bold">tune</span>
        </button>

        <GuestModal v-if="showGuestModal" @close="showGuestModal = false" />

        <!-- Modale suppression quiz -->
        <Transition name="modal-fade">
            <div v-if="deleteModal" class="modal-overlay" @click.self="cancelDelete">
                <div class="modal-box">
                    <div class="modal-icon-del">
                        <span class="material-symbols-outlined">delete</span>
                    </div>
                    <h2 class="modal-title">Supprimer ce quiz ?</h2>
                    <p class="modal-desc">
                        Tu vas supprimer <strong>{{ quizToDelete?.titre }}</strong>.
                        Cette action est irréversible.
                    </p>
                    <div class="modal-actions">
                        <button class="modal-btn modal-btn--cancel" @click="cancelDelete">Annuler</button>
                        <button class="modal-btn modal-btn--confirm" @click="confirmDelete" :disabled="deleting">
                            <span v-if="deleting" class="mini-spinner"></span>
                            <span v-else class="material-symbols-outlined">delete</span>
                            {{ deleting ? 'Suppression...' : 'Supprimer' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

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

<style scoped src="./catalogue-ui.css"></style>

