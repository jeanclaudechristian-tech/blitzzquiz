<template>
  <div class="edit-quiz-page">
    <AppHeader />
    <main class="edit-main">
      <section v-if="quizLoaded" class="edit-card">
        <header class="edit-card-header">
          <h1>Éditer le quiz</h1>
          <p>Modifie les informations de base de ton quiz.</p>
        </header>

        <div class="edit-layout">
          <form class="edit-form" @submit.prevent="saveQuiz()">
            <div class="field-group">
              <label for="titre">Titre du quiz *</label>
              <input
                id="titre"
                v-model="form.titre"
                type="text"
                required
              />
            </div>

            <div class="field-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
              ></textarea>
            </div>

            <div class="field-group">
              <label for="categorie">Catégorie</label>
              <select id="categorie" v-model="form.categorie">
                <option value="">Choisir</option>
                <option value="Math">Math</option>
                <option value="Français">Français</option>
                <option value="Sciences">Sciences</option>
                <option value="Histoire">Histoire</option>
              </select>
            </div>

            <p v-if="error" class="form-error">{{ error }}</p>

            <div class="edit-actions">
              <CallToActionBtn
                text="Enregistrer"
                variant="dark"
                @click="saveQuiz(false)"
              />
              <CallToActionBtn
                text="Publier"
                variant="blue"
                @click="saveQuiz(true)"
              />
              <button type="button" class="link-button" @click="goBack">
                Retour à Mes quiz
              </button>
            </div>
          </form>

          <aside class="visibility-card">
            <h2>Visibilité</h2>
            <button
              type="button"
              class="toggle"
              :class="{ active: form.isPublic }"
              @click="form.isPublic = !form.isPublic"
            >
              <span class="toggle-thumb"></span>
              <span class="toggle-label">
                {{ form.isPublic ? 'Public' : 'Privé' }}
              </span>
            </button>

            <div v-if="!form.isPublic" class="code-block">
              <p class="code-label">Code du quiz</p>
              <div class="code-row">
                <span class="code-value">{{ form.code_quiz }}</span>
                <button
                  type="button"
                  class="copy-btn"
                  @click="copyCode"
                >
                  Copier
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'EditQuizPage',
  components: {
    AppHeader,
    AppFooter,
    CallToActionBtn
  },
  data() {
    return {
      quizLoaded: false,
      form: {
        id: null,
        titre: '',
        description: '',
        categorie: '',
        isPublic: false,
        code_quiz: '',
        statut: 'Brouillon'
      },
      error: ''
    }
  },
  methods: {
    generateCode() {
      return Math.random().toString(36).substring(2, 8).toUpperCase()
    },
    loadQuiz() {
      // TODO (Laravel) : remplacer cette lecture localStorage
      // par GET /api/quizzes/{id}.
      const storageKey = 'enseignant_quizzes'
      const id = Number(this.$route.params.id)
      const saved = localStorage.getItem(storageKey)
      if (!saved) {
        this.$router.push('/enseignant')
        return
      }
      let quizzes = []
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) quizzes = parsed
      } catch {
        this.$router.push('/enseignant')
        return
      }
      const quiz = quizzes.find(q => q.id === id)
      if (!quiz) {
        this.$router.push('/enseignant')
        return
      }
      if (!quiz.code_quiz) {
        quiz.code_quiz = this.generateCode()
        localStorage.setItem(storageKey, JSON.stringify(quizzes))
      }
      this.form = {
        id: quiz.id,
        titre: quiz.titre,
        description: quiz.description || '',
        categorie: quiz.categorie || '',
        isPublic: !!quiz.isPublic,
        code_quiz: quiz.code_quiz,
        statut: quiz.statut || 'Brouillon'
      }
      this.quizLoaded = true
    },
    saveQuiz(publish = false) {
      this.error = ''
      if (!this.form.titre.trim()) {
        this.error = 'Le titre du quiz est obligatoire.'
        return
      }
      // TODO (Laravel) : remplacer tout ce bloc par
      // PATCH/PUT /api/quizzes/{id} avec les champs du formulaire.
      const storageKey = 'enseignant_quizzes'
      let quizzes = []
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) quizzes = parsed
        }
      } catch {
        quizzes = []
      }
      const idx = quizzes.findIndex(q => q.id === this.form.id)
      if (idx === -1) {
        this.$router.push('/enseignant')
        return
      }
      quizzes[idx] = {
        ...quizzes[idx],
        titre: this.form.titre.trim(),
        description: this.form.description.trim(),
        categorie: this.form.categorie,
        isPublic: this.form.isPublic,
        code_quiz: this.form.code_quiz,
        statut: publish ? 'Publié' : (quizzes[idx].statut || 'Brouillon')
      }
      localStorage.setItem(storageKey, JSON.stringify(quizzes))
      if (publish) {
        console.log('Quiz publié')
      }
      this.$router.push('/enseignant')
    },
    goBack() {
      this.$router.push('/enseignant')
    },
    copyCode() {
      if (!this.form.code_quiz) return
      navigator.clipboard?.writeText(this.form.code_quiz).catch(() => {})
    }
  },
  mounted() {
    this.loadQuiz()
  }
}
</script>

<style scoped>
@import './EditQuizPage.css';
</style>

