<template>
  <Teleport to="body">
    <div class="guest-modal-backdrop" v-if="quizLoaded || loading || error" @click.self="closeModal">

      <button class="guest-modal-close-floating" @click="closeModal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="quiz-3d-container">
        <div class="quiz-stack-track">

          <div class="play-card-3d" v-if="quizState === 'lobby'"
            style="z-index: 100; transform: translateY(0) scale(1); opacity: 1;">
            <header class="play-header" style="justify-content: center;">
              <h1 class="question-text" style="margin-bottom: 0;">{{ quizDetails?.titre || 'Quiz' }}</h1>
            </header>

            <section class="play-body" style="align-items: center; text-align: center; gap: 20px;">
              <p style="font-size: 1.1rem; color: #4b5563; max-width: 80%;">
                {{ quizDetails?.description || 'Testez vos connaissances en complétant ce quiz.' }}
              </p>

              <div
                style="display: flex; gap: 30px; background: #f3f4f6; padding: 15px 30px; border-radius: 12px; font-family: 'Inter', sans-serif;">
                <div><strong>Questions :</strong> {{ questions.length }}</div>
              </div>

              <div
                style="text-align: left; background: #fff; border: 1px solid #e5e7eb; padding: 15px 25px; border-radius: 12px; width: 60%;">
                <p style="font-weight: bold; margin-bottom: 10px; font-family: 'Inter', sans-serif;">Règles rapides :
                </p>
                <ul style="color: #6b7280; font-family: 'Inter', sans-serif; font-size: 0.95rem; padding-left: 20px;">
                  <li>Score calculé automatiquement</li>
                </ul>
              </div>
            </section>

            <footer class="play-footer" style="justify-content: center;">
              <CallToActionBtn text="Commencer le quiz" variant="blue" @click="startQuizFromLobby" />
            </footer>
          </div>

          <template v-if="quizState === 'playing'">
            <div v-for="(question, index) in questions" :key="question.id || index" class="play-card-3d"
              :style="getCardStyle(index)">
              <header class="play-header">
                <div class="progress-info">
                  <span>Question {{ index + 1 }} / {{ questions.length }}</span>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: ((index) / questions.length * 100) + '%' }"></div>
                  </div>
                </div>
              </header>

              <section class="play-body">
                <h1 class="question-text">{{ question.texte }}</h1>

                <div class="choices-grid">
                  <button v-for="opt in ['A', 'B', 'C', 'D']" :key="opt" type="button" :class="[
                    'choice-btn',
                    {
                      selected: selectedChoice === opt && index === currentIndex,
                      correct: showFeedback && index === currentIndex && opt === question.metadata?.bonneReponse,
                      wrong: showFeedback && index === currentIndex && selectedChoice === opt && opt !== question.metadata?.bonneReponse,
                    },
                  ]" @click="index === currentIndex ? selectChoice(opt) : null">
                    <span class="choice-label">{{ opt }}</span>
                    <span class="choice-text">{{ choiceText(opt, question) }}</span>
                  </button>
                </div>

                <div class="answer-explanation-slot">
                  <div
                    v-if="showFeedback && index === currentIndex"
                    class="answer-explanation"
                  >
                    <p class="answer-explanation-title">Explication</p>
                    <p class="answer-explanation-text">{{ explanationText(question) }}</p>
                  </div>
                </div>
              </section>

              <footer class="play-footer" style="justify-content: center;">
                <button 
                  v-if="index === currentIndex && (selectedChoice || inReview)"
                  class="next-btn"
                  @click="nextQuestion"
                >
                  {{ inReview ? (index === questions.length - 1 ? 'Voir le resultat' : 'Question suivante') : 'Valider la reponse' }}
                </button>
              </footer>
            </div>
          </template>

          <div class="play-card-3d" v-if="quizState === 'result'"
            style="z-index: 100; transform: translateY(0) scale(1); opacity: 1;">
            <header class="play-header" style="justify-content: center; border-bottom: none; padding-top: 40px;">
              <h1 class="question-text" style="margin-bottom: 0; font-size: 2rem;">Résultat du quiz</h1>
            </header>

            <section class="play-body"
              style="align-items: center; justify-content: center; gap: 15px; text-align: center;">
              <div style="font-size: 5rem; font-weight: 800; color: #00A3FF; font-family: 'Inter', sans-serif;">
                {{ finalResult.correct }} <span style="color: #10b981;">/ {{ finalResult.total }}</span>
              </div>
              
              <div style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; font-family: 'Inter', sans-serif; margin-top: 10px;">
                {{ finalResult.percent }} % de réussite
              </div>
              
              <p style="color: #6b7280; font-family: 'Inter', sans-serif; font-weight: 500; margin-top: 5px;">
                Classement estimé : top {{ Math.max(1, 100 - finalResult.percent) }} %
              </p>
            </section>

            <footer class="play-footer" style="justify-content: center; gap: 15px; border-top: none; padding-bottom: 40px;">
              <button 
                style="padding: 12px 24px; border-radius: 12px; font-weight: 600; background: #f3f4f6; color: #1a1a1a; border: none; cursor: pointer; transition: background 0.2s;" 
                onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'" 
                @click="replayQuiz">Rejouer</button>
                
              <button 
                style="padding: 12px 24px; border-radius: 12px; font-weight: 600; background: #f3f4f6; color: #1a1a1a; border: none; cursor: pointer; transition: background 0.2s;" 
                onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'" 
                @click="goToHistory">Historique</button>
                
              <button 
                style="padding: 12px 24px; border-radius: 12px; font-weight: 600; background: #f3f4f6; color: #1a1a1a; border: none; cursor: pointer; transition: background 0.2s;" 
                onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'" 
                @click="goToLeaderboard">Classement</button>
            </footer>
          </div>

          <div class="play-card-3d empty-state-card" v-if="!quizLoaded && (loading || error)">
            <p v-if="loading">Chargement du quiz...</p>
            <p v-else-if="error" class="error-text">{{ error }}</p>
          </div>

        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import api from '../api/Axios'
import CallToActionBtn from '../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'QuizModal',
  components: {
    CallToActionBtn,
  },
  props: {
    quizId: {
      type: [String, Number],
      required: false
    }
  },
  emits: ['close', 'finish'],
  data() {
    return {
      quizLoaded: false,
      quizState: 'loading',
      quizDetails: null,
      questions: [],
      currentIndex: 0,
      selectedChoice: '',
      showFeedback: false,
      inReview: false,
      answers: [],
      finalResult: null,
      loading: false,
      error: '',
      scrollLockY: 0,
      scrollLockSnapshot: null,
    }
  },
  methods: {
    lockPageScroll() {
      const html = document.documentElement;
      const body = document.body;

      this.scrollLockY = window.scrollY || window.pageYOffset || 0;
      this.scrollLockSnapshot = {
        htmlOverflow: html.style.overflow,
        bodyOverflow: body.style.overflow,
        bodyPosition: body.style.position,
        bodyTop: body.style.top,
        bodyWidth: body.style.width,
      };

      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${this.scrollLockY}px`;
      body.style.width = '100%';
    },
    unlockPageScroll() {
      const html = document.documentElement;
      const body = document.body;
      const snap = this.scrollLockSnapshot;

      if (!snap) return;

      html.style.overflow = snap.htmlOverflow;
      body.style.overflow = snap.bodyOverflow;
      body.style.position = snap.bodyPosition;
      body.style.top = snap.bodyTop;
      body.style.width = snap.bodyWidth;

      window.scrollTo(0, this.scrollLockY);
      this.scrollLockSnapshot = null;
    },
    async loadQuizData() {
      this.loading = true;
      this.error = '';

      const id = this.quizId || this.$route.params.id;

      if (!id) {
        this.error = "ID du quiz manquant.";
        this.loading = false;
        return;
      }

      try {
        const [quizRes, questionsRes] = await Promise.all([
          api.get(`/quizzes/${id}`).catch(() => ({ data: {} })),
          api.get(`/quizzes/${id}/questions`)
        ]);

        this.quizDetails = quizRes.data;
        this.questions = Array.isArray(questionsRes.data) ? questionsRes.data : [];

        if (this.questions.length > 0) {
          this.quizLoaded = true;
          this.quizState = 'lobby';
        } else {
          this.error = "Aucune question trouvée.";
        }
      } catch (e) {
        console.error('Erreur chargement quiz', e.response?.data || e);
        this.error = e.response?.status === 401
          ? "Session expirée. Veuillez vous reconnecter."
          : "Erreur lors du chargement du quiz.";
      } finally {
        this.loading = false;
      }
    },
    startQuizFromLobby() {
      this.quizState = 'playing';
    },
    choiceText(opt, question) {
      if (!question || !question.metadata) return '';
      return question.metadata[`choix${opt}`] || '';
    },
    explanationText(question) {
      return (
        question?.explanation ||
        question?.explication ||
        question?.metadata?.explication ||
        question?.metadata?.explanation ||
        'Aucune explication fournie.'
      );
    },
    selectChoice(opt) {
      if (this.showFeedback) return;
      this.selectedChoice = opt;
    },
    nextQuestion() {
      if (!this.selectedChoice && !this.inReview) return;

      if (!this.inReview) {
        this.answers[this.currentIndex] = this.selectedChoice;
        this.showFeedback = true;
        this.inReview = true;
        return;
      }

      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex += 1;
        this.selectedChoice = '';
        this.showFeedback = false;
        this.inReview = false;
      } else {
        this.finishQuiz();
      }
    },
    async finishQuiz() {
      const id = this.quizId || this.$route.params.id;
      const total = this.questions.length;
      let correct = 0;

      this.questions.forEach((q, idx) => {
        const bonne = q.metadata?.bonneReponse;
        if (this.answers[idx] && this.answers[idx] === bonne) {
          correct += 1;
        }
      });

      const percent = total ? Math.round((correct / total) * 100) : 0;
      this.finalResult = {
        total,
        correct,
        percent,
      };

      try {
        await api.post(`/quizzes/${id}/results`, { score: percent });
      } catch (e) {
        console.error('Erreur enregistrement résultat', e);
      }

      sessionStorage.setItem(`etudiant_quiz_result_${id}`, JSON.stringify(this.finalResult));
      this.$emit('finish', this.finalResult);
      
      this.quizState = 'result'; 
    },
    replayQuiz() {
      this.currentIndex = 0;
      this.answers = [];
      this.selectedChoice = '';
      this.showFeedback = false;
      this.inReview = false;
      this.finalResult = null;
      this.quizState = 'playing';
    },
    closeModal(useRouteFallback = true) {
      this.unlockPageScroll();

      if (useRouteFallback && this.$route.name === 'EtudiantQuizPlay') {
        const groupId = this.$route.query.group;

        if (groupId) {
          this.$router.push(`/etudiant/groupes/${groupId}/quiz`);
          return;
        }

        this.$router.push('/etudiant');
        return;
      }

      this.$emit('close');
    },
    getCardStyle(index) {
      const offset = index - this.currentIndex;

      if (offset < 0) {
        return {
          opacity: 0,
          pointerEvents: 'none',
          transform: 'translateY(-150vh) rotateX(20deg) scale(0.8)',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s'
        };
      }

      const zIndex = this.questions.length - offset;
      const translateY = offset * 20;
      const scale = 1 - (offset * 0.04);
      const opacity = offset > 4 ? 0 : 1 - (offset * 0.15);

      return {
        zIndex: zIndex,
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: opacity,
        pointerEvents: offset === 0 ? 'auto' : 'none',
        transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s'
      };
    },
    goToHistory() {
      this.closeModal(false);
      setTimeout(() => {
        this.$router.push('/historique');
      }, 100);
    },
    goToLeaderboard() {
      const id = this.quizId || this.$route.params.id;
      const groupId = this.$route.query.group;
      this.closeModal(false);
      setTimeout(() => {
        this.$router.push({
          path: '/classement',
          query: groupId ? { quiz: id, group: groupId } : { quiz: id },
        });
      }, 100);
    }
  },
  mounted() {
    this.lockPageScroll();
    this.loadQuizData();
  },
  beforeUnmount() {
    this.unlockPageScroll();
  },
}
</script>

<style scoped>
@import '../accueil-ui/accueil-ui.css';
/* Garde ton quiz.css intact */
</style>

<style scoped src="./quiz.css"></style>

<style scoped>
/* BACKDROP - flou + opacite pour le plein ecran */
.guest-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* BOUTON X (Fermer) */
.guest-modal-close-floating {
  position: absolute;
  top: 30px;
  right: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 10001;
}

.guest-modal-close-floating:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .guest-modal-close-floating {
    top: 20px;
    right: 20px;
    padding: 6px;
  }
}

/* STYLES DU NOUVEAU BOUTON SUIVANT */
.next-btn {
  width: 100%;
  padding: 14px 24px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  background: #00A3FF;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.next-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.next-btn:hover:not(:disabled) {
  background: #0082cc;
  transform: translateY(-2px);
}
</style>

