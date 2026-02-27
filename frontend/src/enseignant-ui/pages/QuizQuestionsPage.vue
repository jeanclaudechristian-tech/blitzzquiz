<template>
  <div class="quiz-questions-page">
    <AppHeader />
    <main class="questions-main" v-if="quizLoaded">
      <header class="questions-header">
        <h1>Questions – {{ quizTitle }}</h1>
        <button type="button" class="link-button" @click="goBack">
          ← Retour à Mes quiz
        </button>
      </header>

      <section class="questions-layout">
        <!-- ── Sidebar ── -->
        <aside class="questions-list">
          <div class="questions-list-header">
            <h2>Questions ({{ questions.length }})</h2>
          </div>

          <div
            v-for="(q, index) in questions"
            :key="q.id"
            :class="['question-item', { active: index === currentIndex }]"
            @click="loadQuestion(index)"
          >
            <span>Q{{ index + 1 }}</span>
            <button
              type="button"
              class="question-delete"
              @click.stop="deleteQuestion(index)"
            >
              Supprimer
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
              <label for="texte">Texte de la question *</label>
              <textarea
                id="texte"
                v-model="form.texte"
                rows="3"
                placeholder="Ex: Quelle est la capitale de la France ?"
              />
            </div>

            <div class="field-group">
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
            </div>

            <div class="field-group">
              <label>Bonne réponse *</label>
              <div class="answer-radios">
                <label v-for="opt in ['A','B','C','D']" :key="opt">
                  <input
                    type="radio"
                    :value="opt"
                    v-model="form.bonneReponse"
                  />
                  <span>{{ opt }}</span>
                </label>
              </div>
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
              <CallToActionBtn
                text="Ajouter la question"
                variant="dark"
                type="submit"
              />
              <CallToActionBtn
                text="Enregistrer"
                variant="blue"
                @click="saveAll"
              />
              <button
                type="button"
                class="link-button"
                @click="preview"
              >
                Prévisualiser
              </button>
            </div>
          </form>

          <transition name="fade-up">
            <div v-if="showPreview" class="preview-card">
              <h3>Aperçu</h3>
              <p class="preview-question">{{ form.texte }}</p>
              <ul class="preview-choices">
                <li><strong>A.</strong> {{ form.choixA }}</li>
                <li><strong>B.</strong> {{ form.choixB }}</li>
                <li><strong>C.</strong> {{ form.choixC }}</li>
                <li><strong>D.</strong> {{ form.choixD }}</li>
              </ul>
            </div>
          </transition>
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
        texte: '',
        choixA: '',
        choixB: '',
        choixC: '',
        choixD: '',
        bonneReponse: 'A',
        explication: '',
      },
      error: '',
      showPreview: false,
    }
  },
  methods: {
    async loadQuizMeta() {
      const id = this.$route.params.id
      try {
        const { data } = await api.get(`/quizzes/${id}`)
        this.quizTitle = data.titre
        this.quizLoaded = true
      } catch (e) {
        console.error('Erreur chargement quiz', e.response?.data || e)
        this.$router.push('/enseignant')
      }
    },

    async loadQuestions() {
      const id = this.$route.params.id
      try {
        const { data } = await api.get(`/quizzes/${id}/questions`)
        this.questions = Array.isArray(data) ? data : []
      } catch (e) {
        console.error('Erreur chargement questions', e.response?.data || e)
        this.questions = []
      }
    },

    resetForm() {
      this.form = {
        texte: '',
        choixA: '',
        choixB: '',
        choixC: '',
        choixD: '',
        bonneReponse: 'A',
        explication: '',
      }
      this.currentIndex = null
      this.error = ''
    },

    loadQuestion(index) {
      const q = this.questions[index]
      if (!q) return

      this.currentIndex = index
      this.form = {
        texte: q.texte || '',
        choixA: q.metadata?.choixA || '',
        choixB: q.metadata?.choixB || '',
        choixC: q.metadata?.choixC || '',
        choixD: q.metadata?.choixD || '',
        bonneReponse: q.metadata?.bonneReponse || 'A',
        explication: q.explanation || '',
      }
    },

    newQuestion() {
      this.resetForm()
    },

    async addOrUpdateQuestion() {
      this.error = ''
      const {
        texte,
        choixA,
        choixB,
        choixC,
        choixD,
        bonneReponse,
        explication,
      } = this.form

      if (
        !texte.trim() ||
        !choixA.trim() ||
        !choixB.trim() ||
        !choixC.trim() ||
        !choixD.trim()
      ) {
        this.error =
          'Veuillez remplir le texte de la question et les 4 choix.'
        return
      }

      const payload = {
        texte: texte.trim(),
        choixA: choixA.trim(),
        choixB: choixB.trim(),
        choixC: choixC.trim(),
        choixD: choixD.trim(),
        bonneReponse,
        explication: explication?.trim() ?? '',
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
        this.showPreview = true
      } catch (e) {
        console.error(
          'Erreur enregistrement question',
          e.response?.data || e,
        )
        this.error =
          "Erreur lors de l'enregistrement de la question."
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
        await api.delete(`/questions/${question.id}`)
        this.questions.splice(index, 1)
        if (this.currentIndex === index) this.resetForm()
        else if (this.currentIndex > index) this.currentIndex -= 1
      } catch (e) {
        console.error(
          'Erreur suppression question',
          e.response?.data || e,
        )
        alert("Impossible de supprimer la question.")
      }
    },

    saveAll() {
      this.$router.push('/enseignant')
    },
    preview() {
      this.showPreview = true
    },
    goBack() {
      this.$router.push('/enseignant')
    },
  },
  mounted() {
    this.loadQuizMeta()
    this.loadQuestions()
  },
}
</script>

<style scoped>
@import './QuizQuestionsPage.css';
</style>
