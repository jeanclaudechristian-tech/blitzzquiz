<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
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

let autoPlayInterval = null;
let inactivityTimeout = null;
let isWheelLocked = false;
let touchStartX = 0;
let touchEndX = 0;

const loadQuizzes = async () => {
    isLoading.value = true;

    try {
        const data = await quizService.getSuggestionQuizzes(8);
        quizzes.value = data.quizzes;
        isLoggedIn.value = data.isLoggedIn;
    } catch (error) {
        console.error('Echec total du chargement :', error);
        quizzes.value = [];
        isLoggedIn.value = false;
    } finally {
        isLoading.value = false;
    }
};

const handleCardClick = (quizId) => {
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

onMounted(async () => {
    await loadQuizzes();
    startAutoPlay();
});

onUnmounted(() => {
    stopAutoPlay();
    clearTimeout(inactivityTimeout);
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
                    <div class="quiz-card" @click="handleCardClick(quiz.id)" style="cursor: pointer;">
                        <div class="card-image-container">
                            <img :src="quiz.image" :alt="quiz.title" draggable="false" />
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
</style>
