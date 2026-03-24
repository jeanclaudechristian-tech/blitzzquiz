<script setup>
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue';
import { quizService } from '@/api/quiz';
import { useQuizStore } from '@/stores/quizStore';
import GuestModal from '../composant/GuestModal.vue';
import QuizModal from '../../quiz-ui/quiz.vue';

const quizStore = useQuizStore();
const sectionRef = ref(null);
const currentIndex = ref(0);
const isPaused = ref(false);
const isVisible = ref(true);
const quizzes = ref([]);
const isLoading = ref(true);
const isLoggedIn = ref(false);
const showGuestModal = ref(false);
const showQuizModal = ref(false);
const selectedQuizId = ref(null);
const cardToneByQuizId = ref({});

let autoPlayInterval = null;
let inactivityTimeout = null;
let isWheelLocked = false;
let touchStartX = 0;
let touchEndX = 0;

const hasValidToken = () => {
    const token = localStorage.getItem('token');
    return Boolean(token && token !== 'null' && token !== 'undefined');
};

const syncAuthState = () => {
    isLoggedIn.value = hasValidToken();
};

const loadQuizzes = async () => {
    isLoading.value = true;
    syncAuthState();

    try {
        const data = await quizService.getSuggestionQuizzes(8);
        quizzes.value = data.quizzes;
        cardToneByQuizId.value = {};
        // Toujours se baser sur le token local pour eviter un etat stale en keep-alive.
        syncAuthState();
    } catch (error) {
        console.error('Echec total du chargement :', error);
        quizzes.value = [];
        syncAuthState();
    } finally {
        isLoading.value = false;
    }
};

const handleCardClick = (quizId) => {
    syncAuthState();

    if (!isLoggedIn.value) {
        showGuestModal.value = true;
        return;
    }

    selectedQuizId.value = quizId;
    showQuizModal.value = true;
};

const nextSlide = () => {
    if (quizzes.value.length === 0) return;
    currentIndex.value = (currentIndex.value + 1) % quizzes.value.length;
};

const prevSlide = () => {
    if (quizzes.value.length === 0) return;
    currentIndex.value = (currentIndex.value - 1 + quizzes.value.length) % quizzes.value.length;
};

const getCardStyle = (index) => {
    if (quizzes.value.length === 0) return {};
    let diff = index - currentIndex.value;
    if (diff < 0) diff += quizzes.value.length;

    const isVisibleCard = diff < 5;

    return {
        opacity: isVisibleCard ? (1 - diff * 0.2) : 0,
        zIndex: quizzes.value.length - diff,
        transform: `translateY(${diff * -20}px) translateZ(${diff * -100}px)`,
        pointerEvents: diff === 0 ? 'auto' : 'none',
        transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
    };
};

const onQuizImageError = (event) => {
    const img = event?.target;
    if (!img) return;
    img.style.display = 'none';
};

const getCardTone = (quizId) => cardToneByQuizId.value[quizId] || 'light';

const analyzeImageTone = (event, quizId) => {
    const img = event?.target;
    if (!img || !quizId) return;

    try {
        const sampleWidth = 48;
        const sampleHeight = 48;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = sampleWidth;
        canvas.height = sampleHeight;
        ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);

        const data = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;

        // Focus on lower-left area where overlay text is rendered.
        let totalLuma = 0;
        let count = 0;
        for (let y = Math.floor(sampleHeight * 0.58); y < sampleHeight; y += 1) {
            for (let x = 0; x < Math.floor(sampleWidth * 0.65); x += 1) {
                const i = (y * sampleWidth + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                totalLuma += 0.2126 * r + 0.7152 * g + 0.0722 * b;
                count += 1;
            }
        }

        if (!count) return;
        const avgLuma = totalLuma / count;
        cardToneByQuizId.value = {
            ...cardToneByQuizId.value,
            [quizId]: avgLuma >= 155 ? 'dark' : 'light'
        };
    } catch (_error) {
        // Cross-origin images can block pixel reads; keep default readable style.
        cardToneByQuizId.value = {
            ...cardToneByQuizId.value,
            [quizId]: 'light'
        };
    }
};

const handleWheel = (e) => {
    if (!isVisible.value || quizStore.isModalOpen || quizzes.value.length === 0) return;

    e.preventDefault();

    if (!isWheelLocked) {
        if (e.deltaY > 0) {
            nextSlide();
        } else {
            prevSlide();
        }

        resetInactivityTimer();
        isWheelLocked = true;

        setTimeout(() => {
            isWheelLocked = false;
        }, 500);
    }
};

const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
    isPaused.value = true;
};

const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    isPaused.value = false;
    resetInactivityTimer();
};

const handleSwipe = () => {
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
        nextSlide();
    } else if (diff < -50) {
        prevSlide();
    }
};

const startAutoPlay = () => {
    stopAutoPlay();

    if (!isPaused.value && isVisible.value && !quizStore.isModalOpen && quizzes.value.length > 0) {
        autoPlayInterval = setInterval(nextSlide, 3500);
    }
};

const stopAutoPlay = () => {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }
};

const resetInactivityTimer = () => {
    stopAutoPlay();
    clearTimeout(inactivityTimeout);

    inactivityTimeout = setTimeout(() => {
        if (!isPaused.value) {
            startAutoPlay();
        }
    }, 2000);
};

const refreshAuthAndSuggestionsIfNeeded = async () => {
    const wasLoggedIn = isLoggedIn.value;
    syncAuthState();

    if (wasLoggedIn !== isLoggedIn.value) {
        showGuestModal.value = false;
        await loadQuizzes();
    }
};

onMounted(async () => {
    await loadQuizzes();
    startAutoPlay();
    window.addEventListener('focus', refreshAuthAndSuggestionsIfNeeded);
    window.addEventListener('storage', refreshAuthAndSuggestionsIfNeeded);
});

onActivated(() => {
    void refreshAuthAndSuggestionsIfNeeded();
    startAutoPlay();
});

onDeactivated(() => {
    stopAutoPlay();
    clearTimeout(inactivityTimeout);
});

onUnmounted(() => {
    stopAutoPlay();
    clearTimeout(inactivityTimeout);
    window.removeEventListener('focus', refreshAuthAndSuggestionsIfNeeded);
    window.removeEventListener('storage', refreshAuthAndSuggestionsIfNeeded);
});
</script>

<template>
    <section ref="sectionRef" class="suggestion-section">
        <div
            v-if="!isLoading && quizzes.length > 0"
            class="carousel-container"
            @wheel.prevent="handleWheel"
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
        >
            <div class="carousel-track">
                <div
                    v-for="(quiz, index) in quizzes"
                    :key="quiz.id"
                    class="quiz-card-wrapper"
                    :style="getCardStyle(index)"
                >
                    <div
                        class="quiz-card"
                        :class="`quiz-card--tone-${getCardTone(quiz.id)}`"
                        @click="handleCardClick(quiz.id)"
                        style="cursor: pointer;"
                    >
                        <div class="card-image-container">
                            <img
                                v-if="quiz.image"
                                :src="quiz.image"
                                :alt="quiz.title"
                                crossorigin="anonymous"
                                draggable="false"
                                @load="analyzeImageTone($event, quiz.id)"
                                @error="onQuizImageError"
                            />
                        </div>
                        <div class="card-info">
                            <h3>{{ quiz.title }}</h3>
                            <span>{{ quiz.category }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <GuestModal v-if="showGuestModal" @close="showGuestModal = false" />

        <QuizModal
            v-if="showQuizModal"
            :quizId="selectedQuizId"
            @close="showQuizModal = false"
        />
    </section>
</template>

<style scoped>
@import '../accueil-ui.css';

.carousel-container {
    overflow: visible;
}
</style>
