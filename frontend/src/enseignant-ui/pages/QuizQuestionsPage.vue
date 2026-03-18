<template>
  <div class="quiz-questions-page">
    <div
        v-if="isDragging"
        class="drag-cursor"
        :style="dragCursorStyle"
    >
      <div class="cursor-dot"></div>
    </div>
    <AppHeader />
    <main class="questions-main" v-if="quizLoaded">
      <header class="questions-header">
        <h1>Questions – {{ quizTitle }}</h1>
        <button type="button" class="link-button" @click="goBack">
          ← Retour à la création
        </button>
      </header>

      <section class="questions-layout">
        <aside class="questions-list">
          <div class="questions-list-header">
            <h2>Questions ({{ questions.length }})</h2>
          </div>

          <div v-for="(q, index) in questions" :key="q.id"
               :class="['question-item', { active: index === currentIndex }]" @click="loadQuestion(index)">
            <span>Q{{ index + 1 }}</span>
            <button type="button" class="question-delete" @click.stop="deleteQuestion(index)">
              Supprimer
            </button>
          </div>

          <button type="button" class="add-question-btn" @click="newQuestion">
            + Nouvelle question
          </button>
        </aside>

        <section class="question-form">
          <form @submit.prevent="addOrUpdateQuestion">
            <div class="field-group">
              <label for="texte">Texte de la question *</label>
              <textarea id="texte" v-model="form.texte" rows="3" placeholder="Tapez votre texte ici..." />
            </div>

            <div class="field-group">
              <label for="type">Type de question</label>
              <select id="type" v-model="form.type" @change="handleTypeChange">
                <option value="QCM">Choix multiples (QCM)</option>
                <option value="TF">Vrai ou Faux</option>
                <option value="FILL_IN">Remplir les blancs</option>
              </select>
            </div>

            <div v-if="form.type === 'QCM'" class="qcm-section">
              <div class="field-group">
                <label>Choix de réponse *</label>
                <div class="choices-grid">
                  <div v-for="opt in ['A','B','C','D']" :key="opt" class="choice-item">
                    <span class="choice-label">{{ opt }}</span>
                    <input v-model="form['choix'+opt]" type="text" :placeholder="'Choix ' + opt" />
                  </div>
                </div>
              </div>
              <div class="field-group">
                <label>Bonne réponse *</label>
                <div class="answer-radios">
                  <label v-for="opt in ['A','B','C','D']" :key="opt">
                    <input type="radio" :value="opt" v-model="form.bonneReponse" />
                    <span>{{ opt }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="form.type === 'TF'" class="tf-section">
              <div class="field-group">
                <label>Bonne réponse *</label>
                <div class="answer-radios">
                  <label><input type="radio" value="A" v-model="form.bonneReponse" /> <span>Vrai</span></label>
                  <label><input type="radio" value="B" v-model="form.bonneReponse" /> <span>Faux</span></label>
                </div>
              </div>
            </div>

            <div v-if="form.type === 'FILL_IN'" class="field-group" style="margin-bottom: 8px;">
              <label>Zone d'insertion de réponse</label>
            </div>

            <div
                v-if="form.type === 'FILL_IN'"
                class="fill-in-drop-editor"
                :class="{ 'is-dragging-mode': isDragging }"
            >
              <div class="drop-surface">
                <span
                    class="drop-zone"
                    :class="{ 'zone-active': activeDropZone === 0 }"
                    @dragover.prevent
                    @dragenter="handleDragEnter(0)"
                    @dragleave="handleDragLeave(0)"
                    @drop="handleDrop($event, 0)"
                ></span>

                <template v-for="(char, index) in form.texte" :key="index">
                  <span class="char">{{ char }}</span>
                  <span
                      class="drop-zone"
                      :class="{ 'zone-active': activeDropZone === index + 1 }"
                      @dragover.prevent
                      @dragenter="handleDragEnter(index + 1)"
                      @dragleave="handleDragLeave(index + 1)"
                      @drop="handleDrop($event, index + 1)"
                  ></span>
                </template>
              </div>
            </div>

            <div v-if="form.type === 'FILL_IN'" class="answers-management" style="margin-bottom: 20px;">
              <div class="answers-pool">
                <div
                    v-for="(blank, bIndex) in form.blanks"
                    :key="blank.id"
                    class="draggable-answer-card"
                    draggable="true"
                    @dragstart="handleDragStart($event, bIndex)"
                    @dragend="isDragging = false; activeDropZone = null; dragCounter = 0"
                >
                  <span class="tag">#{{ bIndex + 1 }}</span>
                  <input v-model="blank.rawAnswers" placeholder="Réponse" @blur="syncFillInAnswers(bIndex)" />
                  <button type="button" class="btn-del-answer" @click="removeBlank(bIndex)">×</button>
                </div>
                <button type="button" class="btn-add-blank" @click="addNewBlank">+ Nouveau</button>
              </div>
            </div>

            <div class="field-group">
              <label for="explication">Explication (optionnel)</label>
              <textarea id="explication" v-model="form.explication" rows="2" placeholder="Expliquez pourquoi..." />
            </div>

            <p v-if="error" class="form-error">{{ error }}</p>

            <div class="builder-actions">
              <CallToActionBtn :text="currentIndex === null ? 'Ajouter la question' : 'Mettre à jour'" variant="dark" type="submit" />
              <CallToActionBtn text="Enregistrer" variant="blue" @click="saveAll" />
            </div>
          </form>
        </section>
      </section>
    </main>
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'
import api from '../../api/Axios'

export default {
  name: 'QuizQuestionsPage',
  components: { AppHeader, CallToActionBtn },
  data() {
    return {
      quizLoaded: false,
      quizTitle: '',
      questions: [],
      currentIndex: null,
      form: {
        type: 'QCM',
        texte: '',
        choixA: '', choixB: '', choixC: '', choixD: '',
        bonneReponse: 'A',
        blanks: [{ id: Date.now(), rawAnswers: '', accepted_answers: [] }],
        explication: '',
      },
      error: '',
      isDragging: false,
      activeDropZone: null,
      dragCounter: 0,
      dragMouseX: 0,
      dragMouseY: 0,
      emptyDragImage: null,
    }
  },
  methods: {
    handleTypeChange() {
      this.error = '';
      if (this.form.type === 'TF' && !['A', 'B'].includes(this.form.bonneReponse)) {
        this.form.bonneReponse = 'A';
      }
    },
    addNewBlank() {
      this.form.blanks.push({ id: Date.now(), rawAnswers: '', accepted_answers: [] });
    },
    removeBlank(index) {
      this.form.blanks.splice(index, 1);
    },
    syncFillInAnswers(index) {
      const raw = this.form.blanks[index].rawAnswers;
      this.form.blanks[index].accepted_answers = raw.split(',').map(s => s.trim()).filter(s => s);
    },
    async addOrUpdateQuestion() {
      this.error = '';
      if (!this.form.texte.trim()) {
        this.error = 'Le texte de la question est obligatoire.';
        return;
      }

      let payload = {
        type: this.form.type,
        texte: this.form.texte.trim(),
        explication: this.form.explication
      };

      if (this.form.type === 'QCM') {
        Object.assign(payload, {
          choixA: this.form.choixA,
          choixB: this.form.choixB,
          choixC: this.form.choixC,
          choixD: this.form.choixD,
          bonneReponse: this.form.bonneReponse
        });
      } else if (this.form.type === 'TF') {
        Object.assign(payload, { bonneReponse: this.form.bonneReponse });
      } else if (this.form.type === 'FILL_IN') {
        payload.blanks = this.form.blanks.map(b => ({
          accepted_answers: b.accepted_answers.length > 0 ? b.accepted_answers : b.rawAnswers.split(',').map(s => s.trim()).filter(s => s)
        }));
      }

      const quizId = this.$route.params.id;
      try {
        if (this.currentIndex === null) {
          const { data } = await api.post(`/quizzes/${quizId}/questions`, payload);
          this.questions.push(data);
        } else {
          const qId = this.questions[this.currentIndex].id;
          const { data } = await api.put(`/questions/${qId}`, payload);
          this.questions.splice(this.currentIndex, 1, data);
        }
        this.newQuestion();
      } catch (e) {
        this.error = "Erreur lors de l'enregistrement.";
      }
    },
    loadQuestion(index) {
      const q = this.questions[index];
      this.currentIndex = index;
      const meta = q.metadata || {};

      this.form = {
        type: q.type || 'QCM',
        texte: q.texte || '',
        choixA: meta.choixA || '',
        choixB: meta.choixB || '',
        choixC: meta.choixC || '',
        choixD: meta.choixD || '',
        bonneReponse: meta.bonneReponse || 'A',
        blanks: meta.blanks ? meta.blanks.map((b, i) => ({
          id: `old-${i}`,
          accepted_answers: b.accepted_answers,
          rawAnswers: b.accepted_answers.join(', ')
        })) : [{ id: Date.now(), rawAnswers: '', accepted_answers: [] }],
        explication: q.explanation || '',
      };
    },
    newQuestion() {
      this.currentIndex = null;
      this.form = {
        type: 'QCM', texte: '',
        choixA: '', choixB: '', choixC: '', choixD: '',
        bonneReponse: 'A',
        blanks: [{ id: Date.now(), rawAnswers: '', accepted_answers: [] }],
        explication: '',
      };
    },
    updateDragMousePosition(event) {
      if (this.isDragging) {
        // dragover 事件的坐标同样在 clientX/Y 中
        this.dragMouseX = event.clientX;
        this.dragMouseY = event.clientY;
      }
    },

    handleDragStart(event, index) {
      this.isDragging = true;
      event.dataTransfer.setData('answerIndex', index);
      event.dataTransfer.effectAllowed = 'copy';

      // 重点：如果 emptyDragImage 还没加载完，setDragImage 会失效
      if (this.emptyDragImage) {
        event.dataTransfer.setDragImage(this.emptyDragImage, 0, 0);
      }
    },

    handleDragEnd() {
      // 1. 退出拖拽模式，隐藏小圆点
      this.isDragging = false;
      this.draggedChar = null;
      this.activeDropZone = null;

      // 2. 原有逻辑
      const draggedElement = document.querySelector('.is-being-dragged');
      if (draggedElement) {
        draggedElement.classList.remove('is-being-dragged');
      }
    },

    handleDragEnter(position) {
      // 直接设置当前激活的区域
      this.activeDropZone = position;
    },

    handleDragLeave(position) {
      // 仅当离开当前激活区域时才清空（可选，通常 drop 会处理清空）
      if (this.activeDropZone === position) {
        // 这里其实可以不做处理，或者加一个小延迟
      }
    },

    handleDrop(event, charPosition) {
      // 1. 必须阻止默认行为，否则数据无法写入
      event.preventDefault();

      // 2. 重置拖拽状态
      this.isDragging = false;
      this.activeDropZone = null;
      this.dragCounter = 0;

      // 3. 获取数据并插入
      const answerIndex = event.dataTransfer.getData('answerIndex');
      if (answerIndex !== "") {
        const placeholder = `[[${parseInt(answerIndex) + 1}]]`;
        const text = this.form.texte;
        // 在指定位置切开字符串并插入标记
        this.form.texte = text.slice(0, charPosition) + placeholder + text.slice(charPosition);
      }
    },
    async loadQuizMeta() {
      const id = this.$route.params.id;
      try {
        const { data } = await api.get(`/quizzes/${id}`);
        this.quizTitle = data.titre;
        this.quizLoaded = true;
      } catch (e) { this.$router.push('/enseignant'); }
    },
    async loadQuestions() {
      const id = this.$route.params.id;
      try {
        const { data } = await api.get(`/quizzes/${id}/questions`);
        this.questions = data;
      } catch (e) { this.questions = []; }
    },
    async deleteQuestion(index) {
      const q = this.questions[index];
      if (!q.id) return this.questions.splice(index, 1);
      if (confirm('Supprimer ?')) {
        await api.delete(`/questions/${q.id}`);
        this.questions.splice(index, 1);
        this.newQuestion();
      }
    },
    saveAll() { this.$router.push('/enseignant'); },
    goBack() { this.$router.push('/enseignant'); }
  },
  computed: {
    dragCursorStyle() {
      return {
        left: `${this.dragMouseX}px`,
        top: `${this.dragMouseY}px`
      };
    }
  },
  mounted() {
    this.loadQuizMeta();
    this.loadQuestions();

    // 预加载透明图
    this.emptyDragImage = new Image();
    this.emptyDragImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    // 核心修复：拖拽时 mousemove 可能会失效，必须监听全局 dragover
    window.addEventListener('mousemove', this.updateDragMousePosition);
    window.addEventListener('dragover', this.updateDragMousePosition);
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.updateDragMousePosition);
    window.removeEventListener('dragover', this.updateDragMousePosition);
  },
}
</script>

<style scoped>
@import './QuizQuestionsPage.css';
</style>

<style scoped>
@import './QuizQuestionsPage.css';
</style>
