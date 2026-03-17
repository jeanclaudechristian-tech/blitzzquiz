<template>
    <Teleport to="body">
        <div class="code-modal-backdrop" @click.self="close" v-if="!showQuizModal">
            <div class="code-modal-card">

                <div v-if="step === 'selection'" class="step-container">
                    <button class="code-modal-close" @click="close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <h2 class="code-modal-title">Que veux-tu rejoindre ?</h2>
                    <p class="code-modal-subtitle">Choisis le type de session auquel tu as été invité.</p>

                    <div class="choices-wrapper">
                        <button class="choice-card" @click="selectMode('quiz')">
                            <span class="icon material-symbols-outlined">quiz</span>
                            <div class="choice-text">
                                <h3>Un Quiz</h3>
                                <p>Code fourni par le prof pour jouer</p>
                            </div>
                        </button>

                        <button class="choice-card" @click="selectMode('group')">
                            <span class="icon material-symbols-outlined">groups</span>
                            <div class="choice-text">
                                <h3>Un Groupe</h3>
                                <p>Rejoindre ta classe ou tes amis</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div v-else-if="step === 'input'" class="step-container">
                    <button class="code-modal-back" @click="step = 'selection'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>

                    <button class="code-modal-close" @click="close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <h2 class="code-modal-title">{{ mode === 'quiz' ? 'Rejoindre un Quiz' : 'Rejoindre un Groupe' }}
                    </h2>
                    <p class="code-modal-subtitle">Indique le code à 6 caractères.</p>

                    <form class="code-form" @submit.prevent="handleSubmit">
                        <input v-model="code" type="text" maxlength="6" class="code-input" placeholder="ABC123"
                            @input="onInput" autofocus />
                        <p v-if="error" class="error-msg">{{ error }}</p>

                        <button type="submit" class="btn btn-primary submit-btn"
                            :disabled="loading || code.length !== 6">
                            {{ loading ? 'Vérification...' : 'Rejoindre' }}
                        </button>
                    </form>
                </div>

            </div>
        </div>

        <QuizModal 
            v-if="showQuizModal" 
            :quizId="playingQuizId" 
            @close="closeAll" 
        />
    </Teleport>
</template>

<script>
import api from '../../api/Axios';
import { groupService } from '../../api/groups';
import QuizModal from '../../quiz-ui/quiz.vue'; // 🎯 Importation de la modale

export default {
    name: 'CodeModal',
    components: {
        QuizModal // 🎯 Déclaration du composant
    },
    data() {
        return {
            step: 'selection',
            mode: '',
            code: '',
            error: '',
            loading: false,
            // 🎯 Nouvelles variables pour gérer le quiz
            showQuizModal: false,
            playingQuizId: null
        }
    },
    methods: {
        close() {
            this.$emit('close');
        },
        closeAll() {
            this.showQuizModal = false;
            this.close(); // Ferme complètement le CodeModal quand le quiz est fini ou quitté
        },
        selectMode(selectedMode) {
            const token = localStorage.getItem('token');
            if (!token || token === 'null') {
                this.close();
                this.$emit('show-guest-modal');
                return;
            }

            this.mode = selectedMode;
            this.error = '';
            this.code = '';
            this.step = 'input';
        },
        onInput() {
            this.code = this.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
            this.error = '';
        },
        async handleSubmit() {
            if (this.code.length !== 6) return;

            this.loading = true;
            this.error = '';

            try {
                if (this.mode === 'quiz') {
                    const { data } = await api.get(`/quizzes/code/${this.code}`);
                    // 🎯 AU LIEU DU ROUTEUR : On lance la modale
                    this.playingQuizId = data.id;
                    this.showQuizModal = true;

                } else if (this.mode === 'group') {
                    const { data } = await groupService.joinByCode(this.code);
                    this.close();

                    if (data && data.group_id) {
                        this.$router.push(`/etudiant/groupes/${data.group_id}/quiz`);
                    }
                }
            } catch (e) {
                // GESTION DE L'ERREUR 409 (Déjà membre)
                if (e.response?.status === 409) {
                    this.error = "Tu as déjà rejoint ce groupe !";
                    this.loading = false;
                    return; 
                }

                if (e.response?.status === 404) {
                    this.error = `Aucun ${this.mode === 'quiz' ? 'quiz' : 'groupe'} trouvé.`;
                } else {
                    this.error = "Erreur de vérification.";
                }
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
/* AUCUN CHANGEMENT DANS LES STYLES */
.code-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.code-modal-card {
    position: relative;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.12);
    padding: 48px 48px 40px;
    width: 100%;
    max-width: 460px;
    display: flex;
    flex-direction: column;
    text-align: center;
    animation: slideUp 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.step-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.code-modal-close,
.code-modal-back {
    position: absolute;
    top: 16px;
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
    transition: color 0.2s ease;
}

.code-modal-close {
    right: 16px;
}

.code-modal-back {
    left: 16px;
}

.code-modal-close:hover,
.code-modal-back:hover {
    color: #1a1a1a;
}

.code-modal-title {
    font-family: 'Anton', sans-serif;
    font-size: 1.8rem;
    letter-spacing: 1px;
    color: #1a1a1a;
    margin: 0 0 12px;
}

.code-modal-subtitle {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.95rem;
    font-weight: 400;
    color: #6b7280;
    line-height: 1.6;
    margin: 0 0 32px;
}

.choices-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.choice-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    padding: 16px 20px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
}

.choice-card:hover {
    border-color: #00A3FF;
    background: #f0f9ff;
}

.icon {
    font-size: 2rem;
    color: #1a1a1a;
    transition: color 0.2s ease;
}

.choice-card:hover .icon {
    color: #00A3FF;
}

.choice-text h3 {
    margin: 0 0 4px 0;
    font-family: 'Inter', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a1a;
}

.choice-text p {
    margin: 0;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    color: #6b7280;
}

.code-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.code-input {
    width: 100%;
    padding: 16px;
    font-family: 'Inter', sans-serif;
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    letter-spacing: 6px;
    background: #f9fafb;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    text-transform: uppercase;
    outline: none;
    transition: border-color 0.2s ease;
}

.code-input:focus {
    border-color: #00A3FF;
    background: #ffffff;
}

.error-msg {
    color: #ef4444;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    margin: 12px 0 0 0;
}

.submit-btn {
    width: 100%;
    margin-top: 24px;
    padding: 14px 24px;
    border-radius: 6px;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: #1a1a1a;
    color: #fff;
}

.submit-btn:hover:not(:disabled) {
    background: #333;
}

.submit-btn:disabled {
    background: #d1d5db;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .code-modal-card {
        margin: 16px;
        padding: 36px 24px 28px;
    }
}
</style>