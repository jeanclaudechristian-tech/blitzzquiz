<template>
  <div class="quiz-create-page">
    <AppHeader />
    <main class="quiz-main">
      <section class="quiz-card">
        <header class="quiz-card-header">
          <h1>Créer un quiz</h1>
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
              :disabled="saving"
            >
              ➕ Créer des questions
            </button>
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <div class="actions">
            <button
              type="submit"
              class="btn-primary"
              :disabled="saving"
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
  </div>
</template>

<script>
import api from '../../api/Axios'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

export default {
  name: 'QuizCreatePage',
  components: {
    AppHeader
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
      saving: false
    }
  },
  methods: {
    async createQuizOnApi() {
      this.error = ''
      if (!this.form.titre.trim()) {
        this.error = 'Le titre du quiz est obligatoire.'
        throw new Error('invalid')
      }

      this.saving = true

      const payload = {
  titre: this.form.titre.trim(),
  description: this.form.description.trim(),
  category: this.form.categorie || null,        
  education_level: this.form.niveau || null,    
  is_public: this.form.isPublic
}


      const { data } = await api.post('/quizzes', payload)
      // data doit contenir au moins { id, ... }
      this.saving = false
      return data
    },

    async handleSubmit() {
      try {
        const quiz = await this.createQuizOnApi()
        // juste retour au dashboard après création
        this.$router.push('/enseignant')
      } catch (e) {
        if (e.message === 'invalid') return
        console.error('Erreur création quiz', e.response?.data || e)
        this.error = "Erreur lors de la création du quiz."
        this.saving = false
      }
    },

    async saveAndAddQuestions() {
      try {
        const quiz = await this.createQuizOnApi()
        this.$router.push(`/enseignant/quiz/${quiz.id}/questions`)
      } catch (e) {
        if (e.message === 'invalid') return
        console.error('Erreur création quiz + questions', e.response?.data || e)
        this.error = "Erreur lors de la création du quiz."
        this.saving = false
      }
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
