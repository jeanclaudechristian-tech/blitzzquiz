<template>
  <div class="quiz-create-page">
    <AppHeader />
    <main class="quiz-main">
      <section class="quiz-card">
        <header class="quiz-card-header">
          <h1>📝 Créer un quiz</h1>
          <p class="subtitle">Renseignez les informations de base de votre quiz</p>
        </header>

        <form class="quiz-form" @submit.prevent="handleSubmit">
          <div class="field-group">
            <label for="titre">Titre du quiz *</label>
            <input
              id="titre"
              v-model="form.titre"
              type="text"
              placeholder="Ex: Quiz de révision en mathématiques"
              required
            />
          </div>

          <div class="field-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              placeholder="Ajoutez des consignes ou un contexte (optionnel)"
            ></textarea>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label for="categorie">Catégorie</label>
              <select id="categorie" v-model="form.categorie">
                <option value="">Choisir une catégorie</option>
                <option value="Math">Math</option>
                <option value="Français">Français</option>
                <option value="Sciences">Sciences</option>
                <option value="Histoire">Histoire</option>
              </select>
            </div>

            <div class="field-group">
              <label for="niveau">Niveau d'étude</label>
              <select id="niveau" v-model="form.niveau">
                <option value="">Choisir un niveau</option>
                <option value="Primaire">Primaire</option>
                <option value="Secondaire">Secondaire</option>
                <option value="Collégiale">Collégiale</option>
                <option value="Universitaire">Universitaire</option>
              </select>
            </div>
          </div>

          <!-- Ligne avec Visibilité et Bouton Créer des questions -->
          <div class="visibility-row">
            <div class="field-group visibility-group">
              <span class="field-label">Visibilité</span>
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
            </div>

            <button
              type="button"
              class="btn-create-questions"
              @click="saveAndAddQuestions"
            >
              ➕ Créer des questions
            </button>
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <div class="actions">
            <button
              type="submit"
              class="btn-primary"
              :disabled="!canSave"
              :title="!canSave ? 'Vous devez ajouter au moins une question avant de sauvegarder' : ''"
            >
              Enregistrer le quiz
            </button>
            <button type="button" class="btn-cancel" @click="goBack">
              Annuler et retourner
            </button>
          </div>
        </form>
      </section>
    </main>
    <AppFooter class="compact-footer" />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'

export default {
  name: 'QuizCreatePage',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      form: {
        titre: '',
        description: '',
        categorie: '',
        niveau: '',
        isPublic: false
      },
      error: '',
      quizId: null
    }
  },
  computed: {
    canSave() {
      // Vérifier si des questions ont été créées pour ce quiz
      if (!this.quizId) return false
      
      const questionsKey = `enseignant_quiz_questions_${this.quizId}`
      const saved = localStorage.getItem(questionsKey)
      
      if (!saved) return false
      
      try {
        const questions = JSON.parse(saved)
        return Array.isArray(questions) && questions.length > 0
      } catch {
        return false
      }
    }
  },
  methods: {
    handleSubmit() {
      this.error = ''

      if (!this.form.titre.trim()) {
        this.error = 'Le titre du quiz est obligatoire.'
        return
      }

      if (!this.canSave) {
        this.error = 'Vous devez créer au moins une question avant de sauvegarder le quiz.'
        return
      }

      this.saveQuiz()
      this.$router.push('/enseignant')
    },
    saveAndAddQuestions() {
      this.error = ''

      if (!this.form.titre.trim()) {
        this.error = 'Le titre du quiz est obligatoire.'
        return
      }

      // Sauvegarder ou mettre à jour le quiz
      const quizId = this.saveQuiz()
      // Rediriger vers la page de création de questions
      this.$router.push(`/enseignant/quiz/${quizId}/questions`)
    },
    saveQuiz() {
      // TODO (Laravel) : CRÉER le quiz dans la base de données
      // Route API : POST /api/quizzes
      // Headers : Authorization: Bearer {token}
      // Body : { titre, description, categorie, niveau, isPublic }
      // Réponse attendue : { id: 123, titre, ... }
      
      const storageKey = 'enseignant_quizzes'
      let existing = []
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) existing = parsed
        }
      } catch {
        existing = []
      }

      // Si le quiz existe déjà (modification), le mettre à jour
      if (this.quizId) {
        const index = existing.findIndex(q => q.id === this.quizId)
        if (index !== -1) {
          existing[index] = {
            ...existing[index],
            titre: this.form.titre.trim(),
            description: this.form.description.trim(),
            categorie: this.form.categorie,
            niveau: this.form.niveau,
            isPublic: this.form.isPublic
          }
          localStorage.setItem(storageKey, JSON.stringify(existing))
          return this.quizId
        }
      }

      // Sinon créer un nouveau quiz
      const newQuiz = {
        // TODO (Laravel) : remplacer Date.now() par l'id renvoyé par l'API
        id: Date.now(),
        titre: this.form.titre.trim(),
        description: this.form.description.trim(),
        categorie: this.form.categorie,
        niveau: this.form.niveau,
        isPublic: this.form.isPublic,
        statut: 'Brouillon',
        nbQuestions: 0
      }

      existing.push(newQuiz)
      localStorage.setItem(storageKey, JSON.stringify(existing))
      this.quizId = newQuiz.id
      
      return newQuiz.id
    },
    goBack() {
      this.$router.push('/enseignant')
    }
  }
}
</script>

<style scoped>
@import './QuizCreatePage.css';
</style>
