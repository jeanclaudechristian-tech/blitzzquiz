<template>
  <Teleport to="body">
    <div class="guest-modal-backdrop">

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
              <p style="font-size: 1.1rem; color: #4b5563; max-width: 80%;">{{ quizDetails?.description || 'Testez vos connaissances.' }}</p>
              <div style="display: flex; gap: 30px; background: #f3f4f6; padding: 15px 30px; border-radius: 12px;">
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
                <h2 v-if="question.type !== 'FILL_IN'" class="question-prompt">
                  {{ resolveQuestionText(question) }}
                </h2>

                <template v-if="question.type === 'FILL_IN'">
                  <div class="fill-in-render">
                    <template v-for="(part, pIdx) in question.parts" :key="pIdx">
                      <span v-if="!part.match(/\[\[(\d+)\]\]/)">{{ part }}</span>
                      <input v-else
                             type="text"
                             class="play-fill-input"
                             :class="getFillInClass(question, part.match(/\[\[(\d+)\]\]/)[1], index)"
                             :value="answers[index]?.[part.match(/\[\[(\d+)\]\]/)[1]] || ''"
                             :readonly="showFeedback && index === currentIndex"
                             @input="(e) => syncFillIn(e, index, part.match(/\[\[(\d+)\]\]/)[1])"
                             placeholder="..."
                      />
                    </template>
                  </div>
                </template>

                <div v-if="question.type !== 'FILL_IN'" class="choices-grid">
                  <button
                    v-for="opt in getQuestionOptions(question)"
                    :key="opt.value"
                    type="button"
                    :class="[
                      'choice-btn',
                      {
                        selected: selectedChoice === opt.value && index === currentIndex,
                        correct: showFeedback && index === currentIndex && opt.value === question.metadata?.bonneReponse,
                        wrong:
                          showFeedback &&
                          index === currentIndex &&
                          selectedChoice === opt.value &&
                          opt.value !== question.metadata?.bonneReponse,
                      },
                    ]"
                    @click="index === currentIndex ? selectChoice(opt.value) : null"
                  >
                    <span class="choice-label">{{ opt.value }}</span>
                    <span class="choice-text">{{ opt.label }}</span>
                  </button>
                </div>

                <div
                  v-if="showFeedback && index === currentIndex"
                  class="answer-explanation"
                >
                  <p class="answer-explanation-title">Explication</p>
                  <p class="answer-explanation-text">{{ explanationText(question) }}</p>
                </div>
              </section>

              <footer class="play-footer" style="justify-content: center;">
                <button 
                  v-if="index === currentIndex"
                  class="next-btn"
                  :disabled="!canSubmitCurrentQuestion(question, index)"
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
              <h1 class="question-text" style="font-size: 2rem;">Résultat du quiz</h1>
            </header>
            <section class="play-body" style="align-items: center; justify-content: center; text-align: center;">
              <div style="font-size: 5rem; font-weight: 800; color: #00A3FF;">
                {{ finalResult?.correct }} <span style="color: #10b981;">/ {{ finalResult?.total }}</span>
              </div>
              <div style="font-size: 1.5rem; font-weight: 700; margin-top: 10px;">{{ finalResult?.percent }} % de réussite</div>
            </section>
            <footer class="play-footer" style="justify-content: center; gap: 15px;">
              <button class="result-action-btn" @click="replayQuiz">Rejouer</button>
              <button class="result-action-btn" @click="goToHistory">Historique</button>
            </footer>
          </div>

          <div class="play-card-3d empty-state-card" v-if="!quizLoaded && loading">
            <h2>Chargement du quiz...</h2>
            <p>Patiente quelques secondes.</p>
          </div>

          <div class="play-card-3d empty-state-card" v-else-if="!quizLoaded && error">
            <h2>{{ error.includes('ne contient pas encore') ? 'Quiz sans question' : 'Quiz indisponible' }}</h2>
            <p class="error-text">{{ error }}</p>
            <button class="result-action-btn" @click="closeModal">Fermer</button>
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
  components: { CallToActionBtn },
  props: { quizId: { type: [String, Number] } },
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
      this.quizLoaded = false;
      this.quizState = 'loading';
      const id = this.quizId || this.$route.params.id;
      try {
        const [quizRes, questionsRes] = await Promise.all([
          api.get(`/quizzes/${id}`).catch(() => ({ data: {} })),
          api.get(`/quizzes/${id}/questions`)
        ]);

        this.quizDetails = quizRes.data;
        // 🎯 预处理填空题文本，防止渲染时丢失焦点
        this.questions = (questionsRes.data || []).map((rawQuestion) => {
          const q = { ...rawQuestion };
          q.texte = this.resolveQuestionText(q);

          if (q.type === 'FILL_IN' && q.texte) {
            q.parts = q.texte.split(/(\[\[\d+\]\])/g);
          }
          return q;
        });

        if (this.questions.length > 0) {
          this.quizLoaded = true;
          this.quizState = 'lobby';
          this.answers = new Array(this.questions.length).fill(null);
        } else {
          this.error = 'Ce quiz ne contient pas encore de questions.';
        }
      } catch (e) {
        this.error = "Erreur chargement";
      }
      finally { this.loading = false; }
    },

    syncFillIn(e, qIdx, blankNum) {
      if (!this.answers[qIdx]) this.answers[qIdx] = {};
      this.answers[qIdx][blankNum] = e.target.value;
      if (qIdx === this.currentIndex) {
        const hasInput = Object.values(this.answers[qIdx]).some(v => v.trim() !== '');
        this.selectedChoice = hasInput ? 'FILLING' : '';
      }
    },

    getFillInClass(question, num, qIdx) {
      if (!this.showFeedback || qIdx !== this.currentIndex) return '';
      const val = this.answers[qIdx]?.[num] || '';
      const blanks = question.metadata?.blanks || [];
      const blankData = blanks[parseInt(num) - 1];
      if (!blankData) return '';
      const studentInput = val.toLowerCase().trim();
      const accepted = (blankData.accepted_answers || []).map(a => a.toLowerCase().trim());
      return accepted.includes(studentInput) ? 'is-correct' : 'is-wrong';
    },

    getQuestionOptions(question) {
      if (!question) return [];

      const normalizedType = String(question.type || '').toUpperCase();

      if (normalizedType === 'TF') {
        const options = Array.isArray(question.metadata?.options)
          ? question.metadata.options
          : [];

        if (options.length >= 2) {
          return options
            .map((opt, index) => ({
              value: opt?.value || (index === 0 ? 'A' : index === 1 ? 'B' : ''),
              label: String(opt?.label || '').trim(),
            }))
            .filter((opt) => opt.value && opt.label);
        }

        return [
          { value: 'A', label: 'Vrai' },
          { value: 'B', label: 'Faux' },
        ];
      }

      const qcmOptions = ['A', 'B', 'C', 'D'].map((opt) => ({
        value: opt,
        label: String(question.metadata?.[`choix${opt}`] || '').trim(),
      }));

      const nonEmptyQcmOptions = qcmOptions.filter((opt) => opt.label);
      return nonEmptyQcmOptions.length > 0 ? nonEmptyQcmOptions : qcmOptions;
    },
    resolveQuestionText(question) {
      const candidates = [
        question?.texte,
        question?.text,
        question?.question,
        question?.label,
      ];

      for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate.trim();
        }
      }

      return 'Question introuvable';
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
      if (!this.showFeedback) this.selectedChoice = opt;
    },
    canSubmitCurrentQuestion(question, qIdx) {
      if (qIdx !== this.currentIndex) return false;
      if (this.inReview) return true;

      if (question?.type === 'FILL_IN') {
        const ans = this.answers[qIdx];
        if (!ans || typeof ans !== 'object') return false;
        return Object.values(ans).some((value) => String(value || '').trim() !== '');
      }

      return Boolean(this.selectedChoice);
    },

    nextQuestion() {
      const currentQuestion = this.questions[this.currentIndex];
      if (!this.canSubmitCurrentQuestion(currentQuestion, this.currentIndex)) return;

      if (!this.inReview) {
        if (currentQuestion?.type === 'FILL_IN') {
          this.answers[this.currentIndex] = { ...(this.answers[this.currentIndex] || {}) };
        } else {
          this.answers[this.currentIndex] = this.selectedChoice;
        }
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
      let score = 0;

      this.questions.forEach((q, idx) => {
        const ans = this.answers[idx];
        if (!ans) return;

        if (q.type === 'FILL_IN') {
          const blanks = q.metadata?.blanks || [];
          if (!blanks.length) return;

          let correctInQ = 0;
          blanks.forEach((b, bIdx) => {
            const input = (ans[bIdx + 1] || '').trim().toLowerCase();
            const accepted = (b.accepted_answers || []).map((a) => String(a).trim().toLowerCase());
            if (accepted.includes(input)) correctInQ += 1;
          });

          score += correctInQ / blanks.length;
          return;
        }

        if (ans === q.metadata?.bonneReponse) {
          score += 1;
        }
      });

      const correct = Number(score.toFixed(2));
      const percent = total ? Math.round((score / total) * 100) : 0;
      this.finalResult = {
        total,
        correct,
        percent,
      };

      try {
        await api.post(`/quizzes/${id}/results`, { score: percent });
      } catch (e) {
        console.error('Erreur enregistrement resultat', e);
      }

      sessionStorage.setItem(`etudiant_quiz_result_${id}`, JSON.stringify(this.finalResult));
      this.$emit('finish', this.finalResult);

      this.quizState = 'result';
    },
    startQuizFromLobby() {
      this.quizState = 'playing';
    },
    replayQuiz() {
      this.currentIndex = 0;
      this.answers = new Array(this.questions.length).fill(null);
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
        this.$router.push(groupId ? `/etudiant/groupes/${groupId}/quiz` : '/etudiant');
        return;
      }

      this.$emit('close');
    },
    getCardStyle(index) {
      const offset = index - this.currentIndex;
      if (offset < 0) return { opacity: 0, transform: 'translateY(-150vh) rotateX(20deg) scale(0.8)', pointerEvents: 'none' };
      return { zIndex: this.questions.length - offset, transform: `translateY(${offset * 20}px) scale(${1 - offset * 0.04})`, opacity: offset > 4 ? 0 : 1 - offset * 0.15, pointerEvents: offset === 0 ? 'auto' : 'none', transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)' };
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

<style scoped src="./quiz.css"></style>

<style scoped>
/* 🎯 FILL-IN INPUT STYLES (Scoped & Deep) */
:deep(.play-fill-input) {
  display: inline-block;
  border: none;
  border-bottom: 2px solid #00A3FF;
  background: rgba(0, 163, 255, 0.05);
  padding: 2px 10px;
  margin: 0 5px;
  border-radius: 4px;
  width: clamp(78px, 20vw, 120px);
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: #00A3FF;
  text-align: center;
  outline: none;
  transition: all 0.2s ease;
}

:deep(.play-fill-input:focus) {
  background: rgba(0, 163, 255, 0.15);
  border-bottom-width: 3px;
}

:deep(.play-fill-input[readonly]) {
  background: #f3f4f6;
  border-bottom-color: #d1d5db;
  color: #6b7280;
  cursor: not-allowed;
}

.fill-in-render {
  font-size: 1.4rem;
  line-height: 1.9;
  color: #1a1a1a;
  text-align: center;
  padding: 10px 4px;
  font-family: 'Inter', sans-serif;
}

/* MODAL BACKGROUND & UTILS */
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
}

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

  :deep(.play-fill-input) {
    width: 92px;
    margin: 2px 4px;
  }

  .fill-in-render {
    font-size: 1.08rem;
    line-height: 1.7;
    padding: 8px 0;
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
}

.result-action-btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  background: #f3f4f6;
  color: #1a1a1a;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.result-action-btn:hover {
  background: #e5e7eb;
}

:deep(.play-fill-input.is-correct) {
  border-bottom-color: #10b981 !important;
  background: rgba(16, 185, 129, 0.1) !important;
  color: #10b981 !important;
}

/* 错误时的样式：变红 */
:deep(.play-fill-input.is-wrong) {
  border-bottom-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
}
</style>

