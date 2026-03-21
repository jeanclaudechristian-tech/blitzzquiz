<template>
  <div class="quiz-questions-page">
    <AppHeader />
    <main class="questions-main" v-if="isPageLoading">
      <section class="questions-skeleton">
        <div class="skeleton-line skeleton-kicker"></div>
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-subtitle"></div>
      </section>
      <section class="questions-layout">
        <aside class="questions-list skeleton-block">
          <div class="skeleton-line skeleton-list-title"></div>
          <div class="skeleton-line skeleton-item" v-for="n in 4" :key="`list-${n}`"></div>
          <div class="skeleton-line skeleton-add"></div>
        </aside>
        <section class="question-form skeleton-block">
          <div class="skeleton-line skeleton-field" v-for="n in 7" :key="`field-${n}`"></div>
        </section>
      </section>
    </main>

    <main class="questions-main" v-else-if="quizLoaded">
      <header class="questions-header">
        <div class="questions-header-copy">
          <p class="questions-kicker">Édition du quiz</p>
          <h1>Questions - {{ quizTitle }}</h1>
          <p class="questions-subtitle">
            Ajoute, ajuste et réorganise les questions avant publication.
          </p>
          <p class="save-state" :class="`save-state--${saveState}`">{{ saveStateLabel }}</p>
        </div>
        <button type="button" class="link-button" @click="goBack">
          Mes quiz
        </button>
      </header>

      <section class="questions-layout">
        <!-- ── Sidebar ── -->
        <aside class="questions-list">
          <div class="questions-list-header">
            <h2>Questions ({{ questions.length }})</h2>
          </div>

            <div v-for="(q, index) in questions" :key="q.id"
            :class="['question-item', { active: index === currentIndex }]" @click="loadQuestion(index)">
            <span>Q{{ index + 1 }}</span>
            <button
              type="button"
              class="question-delete"
              :disabled="deletingQuestionId === q.id"
              @click.stop="deleteQuestion(index)"
            >
              {{ deletingQuestionId === q.id ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>

          <button
            type="button"
            class="add-question-btn"
            @click="newQuestion"
          >
            + Nouvelle question
          </button>
        </aside>

        <!-- ── Form ── -->
        <section class="question-form">
          <form @submit.prevent="addOrUpdateQuestion">
            <div class="field-group">
              <label for="question-type">Type de question *</label>
              <select id="question-type" v-model="form.type" class="type-select">
                <option value="QCM">QCM</option>
                <option value="TF">Vrai / Faux</option>
                <option value="FILL_IN">Texte à trous</option>
              </select>
            </div>

            <div class="field-group">
              <label for="texte">Texte de la question *</label>
              <textarea
                ref="texteInput"
                id="texte"
                v-model="form.texte"
                rows="3"
                :placeholder="isFillIn ? 'Ex: La capitale de la France est [[1]].' : 'Ex: Quelle est la capitale de la France ?'"
              />
              <button v-if="isFillIn" type="button" class="helper-link" @click="insertFillInPlaceholder">
                + Insérer un trou [[n]]
              </button>
              <p v-if="isFillIn" class="field-help">
                Utilise [[1]], [[2]], ... dans le texte pour créer les trous.
              </p>
              <p v-if="fieldErrors.texte" class="field-error">{{ fieldErrors.texte }}</p>
            </div>

            <div v-if="isQcm" class="field-group">
              <label>Choix de réponse *</label>
              <div class="choices-grid">
                <div class="choice-item">
                  <span class="choice-label">A</span>
                  <input
                    v-model="form.choixA"
                    type="text"
                    placeholder="Choix A"
                  />
                </div>
                <div class="choice-item">
                  <span class="choice-label">B</span>
                  <input
                    v-model="form.choixB"
                    type="text"
                    placeholder="Choix B"
                  />
                </div>
                <div class="choice-item">
                  <span class="choice-label">C</span>
                  <input
                    v-model="form.choixC"
                    type="text"
                    placeholder="Choix C"
                  />
                </div>
                <div class="choice-item">
                  <span class="choice-label">D</span>
                  <input
                    v-model="form.choixD"
                    type="text"
                    placeholder="Choix D"
                  />
                </div>
              </div>
              <p v-if="fieldErrors.choices" class="field-error">{{ fieldErrors.choices }}</p>
            </div>

            <div class="field-group">
              <label>Bonne réponse *</label>
              <div v-if="isQcm" class="answer-radios">
                <label v-for="opt in ['A', 'B', 'C', 'D']" :key="opt">
                  <input
                    type="radio"
                    :value="opt"
                    v-model="form.bonneReponse"
                  />
                  <span>{{ opt }}</span>
                </label>
              </div>
              <div v-else-if="isTf" class="answer-radios">
                <label>
                  <input
                    type="radio"
                    value="A"
                    v-model="form.bonneReponse"
                  />
                  <span>Vrai</span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="B"
                    v-model="form.bonneReponse"
                  />
                  <span>Faux</span>
                </label>
              </div>
            </div>

            <div v-if="isFillIn" class="field-group">
              <label>Réponses attendues *</label>
              <div v-if="fillInSlots.length === 0" class="fillin-empty">
                Ajoute au moins un trou dans le texte (ex: [[1]]).
              </div>
              <div v-else class="fillin-grid">
                <div v-for="slot in fillInSlots" :key="slot" class="fillin-item">
                  <span class="fillin-label">Trou #{{ slot }}</span>
                  <input
                    v-model="form.fillInAnswers[slot]"
                    type="text"
                    :placeholder="`Réponses possibles pour [[${slot}]] (séparées par virgule)`"
                  />
                </div>
              </div>
              <label class="case-sensitive-checkbox">
                <input type="checkbox" v-model="form.caseSensitive" />
                <span>Respecter la casse (majuscules/minuscules)</span>
              </label>
              <p v-if="fieldErrors.fillIn" class="field-error">{{ fieldErrors.fillIn }}</p>
            </div>

            <div class="field-group">
              <label for="explication">Explication (optionnel)</label>
              <textarea
                id="explication"
                v-model="form.explication"
                rows="2"
                placeholder="Expliquez pourquoi cette réponse est correcte…"
              />
            </div>

            <p v-if="error" class="form-error">{{ error }}</p>

            <div class="builder-actions">
              <button type="submit" class="btn-primary">
                {{ primaryActionLabel }}
              </button>
              <button type="button" class="btn-secondary" @click="saveAll">
                Enregistrer
              </button>
              <button
                type="button"
                class="link-button"
                @click="preview"
              >
                Prévisualiser
              </button>
            </div>
          </form>

        </section>
      </section>
      <transition name="fade-up">
        <div v-if="toastMessage" class="toast-msg">{{ toastMessage }}</div>
      </transition>
    </main>
    <main class="questions-main" v-else>
      <section class="question-form">
        <p class="form-error">Impossible de charger le quiz.</p>
        <button type="button" class="btn-secondary" @click="loadInitialData">Réessayer</button>
      </section>
    </main>
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import api from '../../api/Axios'

export default {
  name: 'QuizQuestionsPage',
  components: { AppHeader },
  data() {
    return {
      quizLoaded: false,
      isPageLoading: true,
      quizTitle: '',
      questions: [],
      currentIndex: null,
      form: {
        type: 'QCM',
        texte: '',
        choixA: '',
        choixB: '',
        choixC: '',
        choixD: '',
        bonneReponse: 'A',
        explication: '',
        fillInAnswers: {},
        caseSensitive: false,
      },
      error: '',
      fieldErrors: {
        texte: '',
        choices: '',
        fillIn: '',
      },
      saveState: 'idle',
      deletingQuestionId: null,
      originalFormSnapshot: '',
      autoSaveTimer: null,
      toastMessage: '',
      toastTimer: null,
    }
  },
  computed: {
    primaryActionLabel() {
      return this.currentIndex == null ? 'Ajouter la question' : 'Modifier la question'
    },
    isQcm() {
      return this.form.type === 'QCM'
    },
    isTf() {
      return this.form.type === 'TF'
    },
    isFillIn() {
      return this.form.type === 'FILL_IN'
    },
    fillInSlots() {
      const text = this.form.texte || ''
      const matches = Array.from(text.matchAll(/\[\[(\d+)\]\]/g))
      const unique = [...new Set(matches.map((m) => Number(m[1])))]
      return unique.sort((a, b) => a - b)
    },
    saveStateLabel() {
      if (this.saveState === 'saving') return 'Enregistrement...'
      if (this.saveState === 'saved') return 'Toutes les modifications sont enregistrées'
      if (this.saveState === 'error') return 'Erreur de sauvegarde'
      return this.isDirty ? 'Modifications non enregistrées' : 'Prêt'
    },
    currentQuestionId() {
      if (this.currentIndex == null) return null
      return this.questions[this.currentIndex]?.id || null
    },
    isDirty() {
      if (!this.quizLoaded) return false
      return this.formSnapshot() !== this.originalFormSnapshot
    },
  },
  watch: {
    'form.type'() {
      if (this.isTf && !['A', 'B'].includes(this.form.bonneReponse)) {
        this.form.bonneReponse = 'A'
      }
      this.syncFillInAnswers()
    },
    'form.texte'() {
      if (this.isFillIn) this.syncFillInAnswers()
    },
    form: {
      deep: true,
      handler() {
        if (this.isPageLoading || !this.quizLoaded) return
        if (this.currentQuestionId) this.scheduleAutoSave()
      },
    },
  },
  methods: {
    formSnapshot() {
      return JSON.stringify({
        type: this.form.type,
        texte: this.form.texte,
        choixA: this.form.choixA,
        choixB: this.form.choixB,
        choixC: this.form.choixC,
        choixD: this.form.choixD,
        bonneReponse: this.form.bonneReponse,
        explication: this.form.explication,
        fillInAnswers: this.form.fillInAnswers,
        caseSensitive: this.form.caseSensitive,
      })
    },
    markSavedSnapshot() {
      this.originalFormSnapshot = this.formSnapshot()
    },
    clearFieldErrors() {
      this.fieldErrors = { texte: '', choices: '', fillIn: '' }
    },
    showToast(message) {
      this.toastMessage = message
      if (this.toastTimer) clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(() => {
        this.toastMessage = ''
      }, 1800)
    },
    scheduleAutoSave() {
      if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = setTimeout(() => {
        if (!this.currentQuestionId || !this.isDirty) return
        this.addOrUpdateQuestion({ silent: true, fromAuto: true })
      }, 900)
    },
    insertFillInPlaceholder() {
      const currentMax = this.fillInSlots.length > 0 ? Math.max(...this.fillInSlots) : 0
      const nextSlot = currentMax + 1
      const placeholder = `[[${nextSlot}]]`
      const input = this.$refs.texteInput
      if (input && typeof input.selectionStart === 'number') {
        const start = input.selectionStart
        const end = input.selectionEnd
        const before = this.form.texte.slice(0, start)
        const after = this.form.texte.slice(end)
        this.form.texte = `${before}${placeholder}${after}`
        this.$nextTick(() => {
          input.focus()
          const pos = start + placeholder.length
          input.setSelectionRange(pos, pos)
        })
        return
      }
      this.form.texte = `${this.form.texte}${this.form.texte ? ' ' : ''}${placeholder}`
    },
    async loadInitialData() {
      this.isPageLoading = true
      const id = this.$route.params.id
      try {
        const [{ data: quiz }, { data: questions }] = await Promise.all([
          api.get(`/quizzes/${id}`),
          api.get(`/quizzes/${id}/questions`),
        ])
        this.quizTitle = quiz?.titre || 'Quiz'
        this.questions = Array.isArray(questions) ? questions : []
        this.quizLoaded = true
        this.resetForm()
      } catch (e) {
        console.error('Erreur chargement quiz/questions', e.response?.data || e)
        this.quizLoaded = false
      } finally {
        this.isPageLoading = false
      }
    },

    resetForm() {
      this.form = {
        type: 'QCM',
        texte: '',
        choixA: '',
        choixB: '',
        choixC: '',
        choixD: '',
        bonneReponse: 'A',
        explication: '',
        fillInAnswers: {},
        caseSensitive: false,
      }
      this.currentIndex = null
      this.error = ''
      this.clearFieldErrors()
      this.saveState = 'idle'
      this.markSavedSnapshot()
    },

    loadQuestion(index) {
      const q = this.questions[index]
      if (!q) return

      this.currentIndex = index
      const blankAnswers = {}
      const blanks = Array.isArray(q.metadata?.blanks) ? q.metadata.blanks : []
      blanks.forEach((blank, i) => {
        const slot = i + 1
        const values = Array.isArray(blank?.accepted_answers) ? blank.accepted_answers : []
        blankAnswers[slot] = values.join(', ')
      })

      this.form = {
        type: q.type || 'QCM',
        texte: q.texte || '',
        choixA: q.metadata?.choixA || '',
        choixB: q.metadata?.choixB || '',
        choixC: q.metadata?.choixC || '',
        choixD: q.metadata?.choixD || '',
        bonneReponse: q.metadata?.bonneReponse || (q.type === 'TF' ? 'A' : 'A'),
        explication: q.explanation || '',
        fillInAnswers: blankAnswers,
        caseSensitive: !!q.metadata?.case_sensitive,
      }
      this.syncFillInAnswers()
      this.clearFieldErrors()
      this.markSavedSnapshot()
      this.saveState = 'saved'
    },

    newQuestion() {
      this.resetForm()
    },

    syncFillInAnswers() {
      const currentAnswers = this.form.fillInAnswers || {}
      const nextAnswers = {}
      this.fillInSlots.forEach((slot) => {
        nextAnswers[slot] = currentAnswers[slot] || ''
      })
      this.form.fillInAnswers = nextAnswers
    },

    async addOrUpdateQuestion(options = {}) {
      const { silent = false, fromAuto = false } = options
      this.error = ''
      this.clearFieldErrors()
      this.saveState = 'saving'
      const {
        type,
        texte,
        choixA,
        choixB,
        choixC,
        choixD,
        bonneReponse,
        explication,
      } = this.form

      if (!texte.trim()) {
        this.fieldErrors.texte = 'Veuillez renseigner le texte de la question.'
        this.error = this.fieldErrors.texte
        this.saveState = 'error'
        return
      }

      const resolvedType = type || 'QCM'
      const payload = {
        type: resolvedType,
        texte: texte.trim(),
        explication: explication?.trim() ?? '',
      }

      if (resolvedType === 'QCM') {
        if (!choixA.trim() || !choixB.trim() || !choixC.trim() || !choixD.trim()) {
          this.fieldErrors.choices = 'Veuillez remplir les 4 choix de réponse.'
          this.error = this.fieldErrors.choices
          this.saveState = 'error'
          return
        }
        payload.choixA = choixA.trim()
        payload.choixB = choixB.trim()
        payload.choixC = choixC.trim()
        payload.choixD = choixD.trim()
        payload.bonneReponse = bonneReponse
      } else if (resolvedType === 'TF') {
        payload.bonneReponse = ['A', 'B'].includes(bonneReponse) ? bonneReponse : 'A'
      } else if (resolvedType === 'FILL_IN') {
        const slots = this.fillInSlots
        if (slots.length === 0) {
          this.fieldErrors.fillIn = 'Ajoute au moins un trou avec le format [[1]] dans le texte.'
          this.error = this.fieldErrors.fillIn
          this.saveState = 'error'
          return
        }

        const blanks = slots.map((slot) => {
          const raw = this.form.fillInAnswers?.[slot] || ''
          const accepted = raw
            .split(',')
            .map((answer) => answer.trim())
            .filter(Boolean)
          return { accepted_answers: accepted }
        })

        if (blanks.some((blank) => blank.accepted_answers.length === 0)) {
          this.fieldErrors.fillIn = 'Chaque trou doit avoir au moins une réponse attendue.'
          this.error = this.fieldErrors.fillIn
          this.saveState = 'error'
          return
        }

        payload.blanks = blanks
        payload.case_sensitive = !!this.form.caseSensitive
      }

      const quizId = this.$route.params.id

      try {
        if (this.currentIndex == null || !this.questions[this.currentIndex]?.id) {
          const { data } = await api.post(
            `/quizzes/${quizId}/questions`,
            payload,
          )
          this.questions.push(data)
          this.currentIndex = this.questions.length - 1
        } else {
          const qId = this.questions[this.currentIndex].id
          const { data } = await api.put(`/questions/${qId}`, payload)
          this.questions.splice(this.currentIndex, 1, data)
        }
        this.markSavedSnapshot()
        this.saveState = 'saved'
        if (!silent && !fromAuto) {
          this.showToast('Question enregistrée')
        }
      } catch (e) {
        console.error(
          'Erreur enregistrement question',
          e.response?.data || e,
        )
        this.error =
          "Erreur lors de l'enregistrement de la question."
        this.saveState = 'error'
      }
    },

    async deleteQuestion(index) {
      if (index < 0 || index >= this.questions.length) return
      const question = this.questions[index]

      if (!question?.id) {
        this.questions.splice(index, 1)
        if (this.currentIndex === index) this.resetForm()
        else if (this.currentIndex > index) this.currentIndex -= 1
        return
      }

      if (!confirm('Supprimer cette question ?')) return

      try {
        this.deletingQuestionId = question.id
        await api.delete(`/questions/${question.id}`)
        this.questions.splice(index, 1)
        if (this.currentIndex === index) this.resetForm()
        else if (this.currentIndex > index) this.currentIndex -= 1
        this.showToast('Question supprimée')
      } catch (e) {
        console.error(
          'Erreur suppression question',
          e.response?.data || e,
        )
        alert("Impossible de supprimer la question.")
      } finally {
        this.deletingQuestionId = null
      }
    },

    async saveAll() {
      if (this.isDirty) {
        await this.addOrUpdateQuestion({ silent: false })
        if (this.saveState === 'error') return
      }
      this.goBack()
    },
    preview() {
      this.$router.push(`/enseignant/quiz/${this.$route.params.id}/previsualiser`)
    },
    goBack() {
      this.$router.push({
        path: '/catalogue',
        query: { scope: 'mine' },
      })
    },
  },
  mounted() {
    this.loadInitialData()
  },
  beforeRouteLeave(_to, _from, next) {
    if (this.isDirty) {
      const ok = window.confirm('Tu as des modifications non enregistrées. Quitter cette page ?')
      next(ok)
      return
    }
    next()
  },
  beforeUnmount() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer)
    if (this.toastTimer) clearTimeout(this.toastTimer)
  },
}
</script>

<style scoped>
@import './QuizQuestionsPage.css';
</style>


