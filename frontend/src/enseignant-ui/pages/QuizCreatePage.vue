<template>
  <div class="quiz-create-page">
    <AppHeader />
    <main class="quiz-main">
      <section class="quiz-card">
        <header class="quiz-card-header">
          <h1>Créer un quiz</h1>
          <p>Renseigne les informations de base de ton quiz.</p>
        </header>

        <form class="quiz-form" @submit.prevent="handleSubmit">
          <div class="field-group">
            <label for="titre">Titre du quiz *</label>
            <input
              id="titre"
              v-model="form.titre"
              type="text"
              placeholder="Ex. Quiz de révision en mathématiques"
              required
            />
          </div>

          <div class="field-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              placeholder="Ajoute des consignes ou un contexte (optionnel)"
            ></textarea>
          </div>

          <div class="field-row">
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
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <div class="actions">
            <CallToActionBtn
              text="Enregistrer le quiz"
              variant="dark"
              @click="handleSubmit"
            />
            <button type="button" class="link-button" @click="goBack">
              Annuler et revenir à l’espace enseignant
            </button>
          </div>
        </form>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import api from '../../api/Axios'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'

export default {
  name: 'QuizCreatePage',
  components: {
    AppHeader,
    AppFooter,
    CallToActionBtn
  },
  data() {
    return {
      form: {
        titre: '',
        description: '',
        categorie: '',
        isPublic: false
      },
      error: ''
    }
  },
 methods: {
  async handleSubmit() {
    this.error = ''

    if (!this.form.titre.trim()) {
      this.error = 'Le titre du quiz est obligatoire.'
      return
    }

    try {
      // Appel API Laravel : POST /api/quizzes
      const { data } = await api.post('/quizzes', {
        titre: this.form.titre.trim(),
        description: this.form.description.trim(),
        is_public: this.form.isPublic,      // bool → Laravel cast
        // category est en DB, tu peux l'ajouter aussi si tu veux :
        category: this.form.categorie || null
      })

      console.log('Quiz créé en DB :', data)

      // Après création en DB, on retourne au dashboard enseignant
      this.$router.push('/enseignant')
    } catch (e) {
      console.error('Erreur création quiz', e.response?.data || e)
      if (e.response?.status === 422) {
        this.error = 'Données invalides, vérifie le titre et la description.'
      } else if (e.response?.status === 401) {
        this.error = 'Session expirée, reconnecte-toi.'
      } else if (e.response?.status === 403) {
        this.error = 'Tu n’as pas le droit de créer un quiz (rôle).'
      } else {
        this.error = 'Erreur lors de la création du quiz.'
      }
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

