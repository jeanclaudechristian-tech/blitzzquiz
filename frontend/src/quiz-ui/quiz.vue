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
              <p style="font-size: 1.1rem; color: #4b5563; max-width: 80%;">{{ quizDetails?.description || 'Testez vos connaissances.' }}</p>
              <div style="display: flex; gap: 30px; background: #f3f4f6; padding: 15px 30px; border-radius: 12px;">
                <div><strong>Questions :</strong> {{ questions.length }}</div>
                <div><strong>Durée :</strong> ~{{ Math.max(1, Math.round(questions.length / 3)) }} min</div>
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
                <div class="timer" v-if="index === currentIndex">{{ remainingSeconds }}s</div>
              </header>

              <section class="play-body">
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

                <template v-else>
                  <h1 class="question-text">{{ question.texte }}</h1>
                  <div class="choices-grid">
                    <template v-for="opt in ['A', 'B', 'C', 'D']" :key="opt">
                      <button v-if="choiceText(opt, question)" type="button"
                              :class="['choice-btn', {
                          selected: selectedChoice === opt && index === currentIndex,
                          correct: showFeedback && index === currentIndex && opt === question.metadata?.bonneReponse,
                          wrong: showFeedback && index === currentIndex && selectedChoice === opt && opt !== question.metadata?.bonneReponse,
                        }]"
                              @click="index === currentIndex ? selectChoice(opt) : null"
                      >
                        <span class="choice-label">{{ opt }}</span>
                        <span class="choice-text">{{ choiceText(opt, question) }}</span>
                      </button>
                    </template>
                  </div>
                </template>
              </section>

              <footer class="play-footer" style="justify-content: center;">
                <button v-if="index === currentIndex" class="next-btn" :disabled="!selectedChoice" @click="nextQuestion">
                  {{ index === questions.length - 1 ? 'Terminer' : 'Suivant' }}
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
      remainingSeconds: 60,
      timerId: null,
      answers: [],
      finalResult: null,
      loading: false,
      error: '',
    }
  },
  methods: {
    async loadQuizData() {
      this.loading = true;
      const id = this.quizId || this.$route.params.id;
      try {
        const [quizRes, questionsRes] = await Promise.all([
          api.get(`/quizzes/${id}`).catch(() => ({ data: {} })),
          api.get(`/quizzes/${id}/questions`)
        ]);

        this.quizDetails = quizRes.data;
        // 🎯 预处理填空题文本，防止渲染时丢失焦点
        this.questions = (questionsRes.data || []).map(q => {
          if (q.type === 'FILL_IN' && q.texte) {
            q.parts = q.texte.split(/(\[\[\d+\]\])/g);
          }
          return q;
        });

        if (this.questions.length > 0) {
          this.quizLoaded = true;
          this.quizState = 'lobby';
          this.answers = new Array(this.questions.length).fill(null);
        }
      } catch (e) { this.error = "Erreur chargement"; }
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

    choiceText(opt, question) {
      if (question.type === 'TF') return opt === 'A' ? 'Vrai' : (opt === 'B' ? 'Faux' : '');
      return question.metadata?.[`choix${opt}`] || '';
    },

    selectChoice(opt) {
      if (!this.showFeedback) this.selectedChoice = opt;
    },

    nextQuestion() {
      if (!this.selectedChoice) return;
      if (this.selectedChoice !== 'FILLING') this.answers[this.currentIndex] = this.selectedChoice;
      this.showFeedback = true;
      setTimeout(() => {
        if (this.currentIndex < this.questions.length - 1) {
          this.currentIndex++;
          this.selectedChoice = '';
          this.showFeedback = false;
        } else {
          this.finishQuiz();
        }
      }, 600);
    },

    async finishQuiz() {
      this.stopTimer();
      let totalScore = 0;
      this.questions.forEach((q, idx) => {
        const ans = this.answers[idx];
        if (!ans) return;
        if (q.type === 'FILL_IN') {
          const blanks = q.metadata?.blanks || [];
          let correctInQ = 0;
          blanks.forEach((b, bIdx) => {
            const input = (ans[bIdx + 1] || '').trim().toLowerCase();
            if (b.accepted_answers.map(a => a.toLowerCase()).includes(input)) correctInQ++;
          });
          totalScore += blanks.length ? (correctInQ / blanks.length) : 0;
        } else if (ans === q.metadata?.bonneReponse) {
          totalScore += 1;
        }
      });
      const percent = Math.round((totalScore / this.questions.length) * 100);
      this.finalResult = { total: this.questions.length, correct: totalScore.toFixed(1), percent };
      api.post(`/quizzes/${this.quizId || this.$route.params.id}/results`, { score: percent }).catch(e => console.error(e));
      this.quizState = 'result';
    },

    startQuizFromLobby() { this.quizState = 'playing'; this.startTimer(); },
    startTimer() { this.timerId = setInterval(() => { if (this.remainingSeconds > 0) this.remainingSeconds--; else this.finishQuiz(); }, 1000); },
    stopTimer() { clearInterval(this.timerId); },
    replayQuiz() { this.currentIndex = 0; this.answers = []; this.quizState = 'playing'; this.startTimer(); },
    closeModal() { this.stopTimer(); this.$emit('close'); },
    getCardStyle(index) {
      const offset = index - this.currentIndex;
      if (offset < 0) return { opacity: 0, transform: 'translateY(-150vh) rotateX(20deg) scale(0.8)', pointerEvents: 'none' };
      return { zIndex: this.questions.length - offset, transform: `translateY(${offset * 20}px) scale(${1 - offset * 0.04})`, opacity: offset > 4 ? 0 : 1 - offset * 0.15, pointerEvents: offset === 0 ? 'auto' : 'none', transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)' };
    },
    goToHistory() { this.closeModal(); this.$router.push('/historique'); },
    goToLeaderboard() { this.closeModal(); this.$router.push({ path: '/classement', query: { quiz: this.quizId || this.$route.params.id } }); }
  },
  mounted() { this.loadQuizData(); },
  beforeUnmount() { this.stopTimer(); }
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
  width: 120px;
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
  line-height: 2;
  color: #1a1a1a;
  text-align: center;
  padding: 10px;
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