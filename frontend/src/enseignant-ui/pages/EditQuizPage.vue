<template>
  <div class="edit-quiz-page">
    <AppHeader />
    <main class="edit-main">
      <section v-if="quizLoaded" class="edit-card">
        <header class="edit-card-header">
          <h1>Editer le quiz</h1>
          <p class="subtitle">Modifie les informations de base de ton quiz</p>
        </header>

        <form class="edit-form" @submit.prevent="saveQuiz(false)">
          <div class="field-group">
            <label for="titre">Titre du quiz *</label>
            <input
              id="titre"
              v-model="form.titre"
              type="text"
              placeholder="Titre de ton quiz"
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

          <div class="field-group">
            <label for="quiz-image">Image de la carte</label>
            <input
              id="quiz-image"
              ref="quizImageInput"
              class="file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="onImageSelected"
            />
            <p class="field-help">
              Formats: JPG, PNG, WebP. Max 5 Mo. Dimensions entre 640x360 et 4096x4096.
            </p>

            <div v-if="displayImage" class="image-preview">
              <img :src="displayImage" alt="Apercu image quiz" />
            </div>

            <div class="image-actions">
              <button
                v-if="currentImage && !removeImage && !newImageFile"
                type="button"
                class="image-action-btn"
                @click="removeCurrentImage"
              >
                Supprimer image
              </button>

              <button
                v-if="removeImage && currentImage"
                type="button"
                class="image-action-btn"
                @click="undoRemoveImage"
              >
                Annuler suppression
              </button>

              <button
                v-if="newImageFile"
                type="button"
                class="image-action-btn"
                @click="clearNewImage"
              >
                Retirer nouvelle image
              </button>
            </div>

            <p v-if="imageError" class="form-error">{{ imageError }}</p>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label for="categorie">Categorie</label>
              <select id="categorie" v-model="form.categoryId">
                <option value="">Choisir une categorie</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="String(category.id)"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="field-group">
              <label for="niveau">Niveau d etude</label>
              <select id="niveau" v-model="form.niveau">
                <option value="">Choisir un niveau</option>
                <option value="Primaire">Primaire</option>
                <option value="Secondaire">Secondaire</option>
                <option value="Collegiale">Collegiale</option>
                <option value="Universitaire">Universitaire</option>
              </select>
            </div>
          </div>

          <div class="visibility-section">
            <div class="field-group visibility-group">
              <span class="field-label">Visibilite</span>
              <button
                type="button"
                class="toggle"
                :class="{ active: form.isPublic }"
                @click="form.isPublic = !form.isPublic"
              >
                <span class="toggle-thumb"></span>
                <span class="toggle-label">
                  {{ form.isPublic ? 'Public' : 'Prive' }}
                </span>
              </button>
            </div>

            <div v-if="!form.isPublic" class="code-block">
              <p class="code-label">Code du quiz</p>
              <div class="code-row">
                <span class="code-value">{{ form.code_quiz }}</span>
                <button
                  type="button"
                  class="copy-btn"
                  @click="copyCode"
                  title="Copier le code"
                >
                  Copier
                </button>
              </div>
            </div>
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <p v-if="!hasQuestions" class="form-warning">
            Tu dois creer au moins une question avant d enregistrer le quiz.
          </p>

          <div class="actions">
            <div class="primary-actions">
              <button
                type="button"
                class="btn-primary"
                @click="saveQuiz(false)"
                :disabled="!hasQuestions || saving"
                :title="!hasQuestions ? 'Ajoute des questions avant d enregistrer' : ''"
              >
                Enregistrer le quiz
              </button>
              <button
                type="button"
                class="btn-publish"
                @click="saveQuiz(true)"
                :disabled="!hasQuestions || saving"
                :title="!hasQuestions ? 'Ajoute des questions avant de publier' : ''"
              >
                Publier
              </button>
              <button
                type="button"
                class="btn-secondary"
                @click="goToQuestions"
              >
                Gerer les questions
              </button>
            </div>
            <button type="button" class="btn-cancel" @click="goBack">
              Retour a la creation
            </button>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import api from '../../api/Axios'
import { quizService } from '../../api/quiz'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const MIN_IMAGE_WIDTH = 640
const MIN_IMAGE_HEIGHT = 360
const MAX_IMAGE_WIDTH = 4096
const MAX_IMAGE_HEIGHT = 4096

export default {
  name: 'EditQuizPage',
  components: {
    AppHeader,
  },
  data() {
    return {
      quizLoaded: false,
      form: {
        id: null,
        titre: '',
        description: '',
        categoryId: '',
        niveau: '',
        isPublic: false,
        code_quiz: '',
        statut: 'Brouillon',
      },
      categories: [],
      questionsCount: 0,
      error: '',
      saving: false,
      currentImage: '',
      newImageFile: null,
      newImagePreview: '',
      removeImage: false,
      imageError: '',
    }
  },
  computed: {
    hasQuestions() {
      return this.questionsCount > 0
    },
    displayImage() {
      if (this.newImagePreview) return this.newImagePreview
      if (this.removeImage) return ''
      return this.currentImage || ''
    },
  },
  methods: {
    generateCode() {
      return Math.random().toString(36).substring(2, 8).toUpperCase()
    },

    revokePreview() {
      if (this.newImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(this.newImagePreview)
      }
    },

    resetInputFile() {
      const input = this.$refs.quizImageInput
      if (input) input.value = ''
    },

    clearNewImage() {
      this.revokePreview()
      this.newImagePreview = ''
      this.newImageFile = null
      this.imageError = ''
      this.resetInputFile()
    },

    removeCurrentImage() {
      this.clearNewImage()
      this.removeImage = true
    },

    undoRemoveImage() {
      this.removeImage = false
      this.imageError = ''
    },

    async readDimensions(file) {
      return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file)
        const image = new Image()

        image.onload = () => resolve({ width: image.width, height: image.height, objectUrl })
        image.onerror = () => {
          URL.revokeObjectURL(objectUrl)
          reject(new Error('invalid_image'))
        }

        image.src = objectUrl
      })
    },

    async onImageSelected(event) {
      this.imageError = ''
      const file = event.target.files?.[0]
      if (!file) return

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        this.imageError = 'Image trop lourde. Maximum 5 Mo.'
        this.clearNewImage()
        return
      }

      try {
        const { width, height, objectUrl } = await this.readDimensions(file)
        if (
          width < MIN_IMAGE_WIDTH ||
          height < MIN_IMAGE_HEIGHT ||
          width > MAX_IMAGE_WIDTH ||
          height > MAX_IMAGE_HEIGHT
        ) {
          URL.revokeObjectURL(objectUrl)
          this.imageError = 'Dimensions invalides. Utilise une image entre 640x360 et 4096x4096.'
          this.clearNewImage()
          return
        }

        this.revokePreview()
        this.newImagePreview = objectUrl
        this.newImageFile = file
        this.removeImage = false
      } catch {
        this.imageError = 'Impossible de lire cette image.'
        this.clearNewImage()
      }
    },

    async loadCategories() {
      try {
        const { data } = await api.get('/categories')
        this.categories = Array.isArray(data) ? data : []
      } catch (e) {
        console.error('Erreur chargement categories', e.response?.data || e)
        this.categories = []
      }
    },

    async loadQuiz() {
      const id = this.$route.params.id

      try {
        const { data: quiz } = await api.get(`/quizzes/${id}`)

        this.form = {
          id: quiz.id,
          titre: quiz.titre || '',
          description: quiz.description || '',
          categoryId: quiz.category_id ? String(quiz.category_id) : '',
          niveau: quiz.education_level || '',
          isPublic: !!quiz.is_public,
          code_quiz: quiz.code_quiz || this.generateCode(),
          statut: quiz.statut || 'Brouillon',
        }

        this.currentImage = quiz.image || ''
        this.removeImage = false
        this.clearNewImage()

        const { data: questions } = await api.get(`/quizzes/${id}/questions`)
        this.questionsCount = Array.isArray(questions) ? questions.length : 0

        this.quizLoaded = true
      } catch (e) {
        console.error('Erreur chargement quiz', e.response?.data || e)
        this.$router.push('/enseignant')
      }
    },

    async saveQuiz(publish = false) {
      this.error = ''

      if (!this.form.titre.trim()) {
        this.error = 'Le titre du quiz est obligatoire.'
        return
      }

      if (!this.hasQuestions) {
        this.error = 'Tu dois creer au moins une question avant d enregistrer le quiz.'
        return
      }

      this.saving = true

      try {
        const payload = {
          titre: this.form.titre.trim(),
          description: this.form.description.trim(),
          category_id: this.form.categoryId ? Number(this.form.categoryId) : null,
          education_level: this.form.niveau || null,
          is_public: this.form.isPublic,
          code_quiz: this.form.code_quiz,
          statut: publish ? 'Publie' : this.form.statut || 'Brouillon',
        }

        await api.put(`/quizzes/${this.form.id}`, payload)

        if (this.removeImage && this.currentImage && !this.newImageFile) {
          await quizService.removeImage(this.form.id)
          this.currentImage = ''
        }

        if (this.newImageFile) {
          const upload = await quizService.uploadImage(this.form.id, this.newImageFile)
          this.currentImage = upload?.image || this.currentImage
          this.clearNewImage()
          this.removeImage = false
        }

        this.$router.push('/enseignant')
      } catch (e) {
        console.error('Erreur mise a jour quiz', e.response?.data || e)
        const imageApiError = e.response?.data?.errors?.image?.[0]
        this.error = imageApiError || 'Erreur lors de la sauvegarde du quiz.'
      } finally {
        this.saving = false
      }
    },

    goToQuestions() {
      this.$router.push(`/enseignant/quiz/${this.form.id}/questions`)
    },

    goBack() {
      this.$router.push('/enseignant')
    },

    copyCode() {
      if (!this.form.code_quiz) return
      navigator.clipboard?.writeText(this.form.code_quiz).catch(() => {})
    },
  },
  mounted() {
    this.loadCategories()
    this.loadQuiz()
  },
  beforeUnmount() {
    this.revokePreview()
  },
}
</script>

<style scoped>
@import './EditQuizPage.css';
</style>

