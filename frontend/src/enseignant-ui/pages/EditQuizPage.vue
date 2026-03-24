<template>
  <div class="edit-quiz-page">
    <AppHeader />
    <main class="edit-main">
      <section v-if="isLoading" class="edit-card skeleton-card" aria-busy="true">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-subtitle"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-large"></div>
        <div class="skeleton-row">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
        <div class="skeleton-line skeleton-actions"></div>
        <div class="skeleton-line skeleton-actions"></div>
      </section>

      <section v-else-if="loadError" class="edit-card state-card">
        <h2>Chargement impossible</h2>
        <p>{{ loadError }}</p>
        <button type="button" class="btn-primary" @click="reloadPageState">
          Reessayer
        </button>
      </section>

      <section v-if="quizLoaded" class="edit-card">
        <header class="edit-card-header">
          <h1>Editer le quiz</h1>
          <p class="subtitle">Modifie les informations de base de ton quiz</p>
        </header>

        <form class="edit-form" @submit.prevent="saveQuiz">
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

            <label for="quiz-image-url">Ou URL image</label>
            <input
              id="quiz-image-url"
              v-model="newImageUrl"
              type="url"
              placeholder="https://exemple.com/image-quiz.jpg"
              @blur="onImageUrlBlur"
            />
            <p class="field-help">Utilise un fichier local ou une URL, pas les deux.</p>

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
                v-if="newImageFile || newImageUrlPreview"
                type="button"
                class="image-action-btn"
                @click="clearPendingImage"
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
              <div class="visibility-toggle-simple" role="group" aria-label="Visibilite">
                <button
                  type="button"
                  class="vis-btn"
                  :class="{ active: form.isPublic }"
                  @click="form.isPublic = true"
                >
                  Public
                </button>
                <button
                  type="button"
                  class="vis-btn"
                  :class="{ active: !form.isPublic }"
                  @click="form.isPublic = false"
                >
                  Prive
                </button>
              </div>
            </div>
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <div class="actions">
            <div class="primary-actions">
              <button
                type="submit"
                class="btn-primary"
                :disabled="saving"
              >
                {{ saving ? 'Modification...' : 'Modifier quiz' }}
              </button>
            </div>

            <button type="button" class="btn-back-quiz" @click="goBackToMyQuizzes">
              <span class="material-symbols-outlined">west</span>
              Retour vers mes quiz
            </button>
          </div>
        </form>
      </section>

      <Transition name="toast-fade">
        <div v-if="successMessage" class="toast-success" role="status" aria-live="polite">
          <span class="material-symbols-outlined">check_circle</span>
          <span>{{ successMessage }}</span>
        </div>
      </Transition>
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
      isLoading: true,
      loadError: '',
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
      successMessage: '',
      currentImage: '',
      newImageFile: null,
      newImagePreview: '',
      newImageUrl: '',
      newImageUrlPreview: '',
      removeImage: false,
      imageError: '',
      initialSnapshot: null,
      redirectTimer: null,
    }
  },
  computed: {
    displayImage() {
      if (this.newImagePreview) return this.newImagePreview
      if (this.newImageUrlPreview) return this.newImageUrlPreview
      if (this.removeImage) return ''
      return this.currentImage || ''
    },
    normalizedFormState() {
      return this.snapshotFromForm()
    },
    isDirty() {
      if (!this.initialSnapshot) return false

      const current = JSON.stringify(this.normalizedFormState)
      const initial = JSON.stringify(this.initialSnapshot)
      const hasPendingImageChanges = !!this.newImageFile || !!this.newImageUrlPreview || this.removeImage
      return current !== initial || hasPendingImageChanges
    },
  },
  methods: {
    sanitizeText(value) {
      return String(value ?? '')
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    },

    sanitizeMultilineText(value) {
      return String(value ?? '')
        .replace(/\u00a0/g, ' ')
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    },

    normalizeNullable(value) {
      const sanitized = this.sanitizeText(value)
      return sanitized === '' ? '' : sanitized
    },

    snapshotFromForm() {
      return {
        titre: this.sanitizeText(this.form.titre),
        description: this.sanitizeMultilineText(this.form.description),
        categoryId: this.form.categoryId ? String(this.form.categoryId) : '',
        niveau: this.form.niveau ? String(this.form.niveau).trim() : '',
        isPublic: !!this.form.isPublic,
        code_quiz: this.form.code_quiz ? String(this.form.code_quiz).trim() : '',
      }
    },

    markSnapshot() {
      this.initialSnapshot = this.snapshotFromForm()
    },

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
      this.resetInputFile()
    },

    clearNewImageUrl() {
      this.newImageUrl = ''
      this.newImageUrlPreview = ''
    },

    clearPendingImage() {
      this.clearNewImage()
      this.clearNewImageUrl()
      this.imageError = ''
    },

    isValidHttpUrl(value) {
      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch (_error) {
        return false
      }
    },

    isValidDimensions(width, height) {
      return (
        width >= MIN_IMAGE_WIDTH &&
        height >= MIN_IMAGE_HEIGHT &&
        width <= MAX_IMAGE_WIDTH &&
        height <= MAX_IMAGE_HEIGHT
      )
    },

    removeCurrentImage() {
      this.clearPendingImage()
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

    async readDimensionsFromUrl(url) {
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => {
          resolve({ width: image.width, height: image.height })
        }
        image.onerror = () => {
          reject(new Error('invalid_image_url'))
        }
        image.src = url
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
        this.clearNewImageUrl()
        this.removeImage = false
      } catch {
        this.imageError = 'Impossible de lire cette image.'
        this.clearNewImage()
      }
    },

    async onImageUrlBlur() {
      this.imageError = ''
      const imageUrl = (this.newImageUrl || '').trim()
      this.newImageUrlPreview = ''

      if (!imageUrl) {
        return
      }

      if (!this.isValidHttpUrl(imageUrl)) {
        this.imageError = 'URL invalide. Utilise une URL http(s).'
        return
      }

      try {
        const { width, height } = await this.readDimensionsFromUrl(imageUrl)
        if (!this.isValidDimensions(width, height)) {
          this.imageError = 'Dimensions invalides. Utilise une image entre 640x360 et 4096x4096.'
          return
        }

        this.clearNewImage()
        this.newImageUrl = imageUrl
        this.newImageUrlPreview = imageUrl
        this.removeImage = false
      } catch {
        this.imageError = 'Impossible de charger cette URL image.'
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
      this.isLoading = true
      this.loadError = ''
      this.quizLoaded = false

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
        this.clearPendingImage()

        const { data: questions } = await api.get(`/quizzes/${id}/questions`)
        this.questionsCount = Array.isArray(questions) ? questions.length : 0

        this.markSnapshot()
        this.quizLoaded = true
      } catch (e) {
        console.error('Erreur chargement quiz', e.response?.data || e)
        this.loadError = 'Impossible de charger les informations du quiz.'
      } finally {
        this.isLoading = false
      }
    },

    buildPatchPayload() {
      const current = this.snapshotFromForm()
      const initial = this.initialSnapshot || {}

      const payload = {}
      const nullableKeys = new Set(['description', 'category_id', 'education_level'])

      const mapEntries = [
        ['titre', 'titre', current.titre],
        ['description', 'description', current.description],
        ['categoryId', 'category_id', current.categoryId ? Number(current.categoryId) : ''],
        ['niveau', 'education_level', current.niveau],
        ['isPublic', 'is_public', current.isPublic],
        ['code_quiz', 'code_quiz', current.code_quiz],
      ]

      for (const [snapshotKey, payloadKey, value] of mapEntries) {
        const initialValue = snapshotKey === 'categoryId'
          ? (initial[snapshotKey] ? Number(initial[snapshotKey]) : '')
          : initial[snapshotKey]

        const hasChanged = value !== initialValue
        if (!hasChanged) continue

        if (nullableKeys.has(payloadKey)) {
          payload[payloadKey] = value === '' ? null : value
        } else {
          payload[payloadKey] = value
        }
      }

      return payload
    },

    async saveQuiz() {
      this.error = ''
      this.successMessage = ''

      const cleanTitle = this.sanitizeText(this.form.titre)
      if (!cleanTitle) {
        this.error = 'Le titre du quiz est obligatoire.'
        return
      }

      this.form.titre = cleanTitle
      this.form.description = this.sanitizeMultilineText(this.form.description)
      this.form.niveau = this.normalizeNullable(this.form.niveau)
      this.form.categoryId = this.form.categoryId ? String(this.form.categoryId).trim() : ''
      this.form.code_quiz = this.form.code_quiz ? String(this.form.code_quiz).trim() : this.generateCode()

      this.saving = true

      try {
        const payload = this.buildPatchPayload()
        if (Object.keys(payload).length > 0) {
          await api.put(`/quizzes/${this.form.id}`, payload)
        }

        if (this.newImageUrl.trim() && !this.newImageFile) {
          await this.onImageUrlBlur()
          if (!this.newImageUrlPreview) {
            throw new Error('invalid_image_url')
          }
        }

        if (this.removeImage && this.currentImage && !this.newImageFile && !this.newImageUrlPreview) {
          await quizService.removeImage(this.form.id)
          this.currentImage = ''
        }

        if (this.newImageFile) {
          const upload = await quizService.uploadImage(this.form.id, this.newImageFile)
          this.currentImage = upload?.image || this.currentImage
          this.clearPendingImage()
          this.removeImage = false
        }

        if (this.newImageUrlPreview) {
          const result = await quizService.setImageUrl(this.form.id, this.newImageUrlPreview)
          this.currentImage = result?.image || this.newImageUrlPreview
          this.clearPendingImage()
          this.removeImage = false
        }

        this.markSnapshot()
        this.successMessage = 'Quiz modifie avec succes'
        this.redirectTimer = window.setTimeout(() => {
          this.goBackToMyQuizzes()
        }, 850)
      } catch (e) {
        console.error('Erreur mise a jour quiz', e.response?.data || e)
        if (e.message === 'invalid_image_url' && this.imageError) {
          this.error = this.imageError
          return
        }
        const imageApiError = e.response?.data?.errors?.image?.[0]
        const imageUrlApiError = e.response?.data?.errors?.image_url?.[0]
        this.error = imageApiError || imageUrlApiError || 'Erreur lors de la sauvegarde du quiz.'
      } finally {
        this.saving = false
      }
    },

    reloadPageState() {
      this.loadCategories()
      this.loadQuiz()
    },

    goBackToMyQuizzes() {
      this.$router.push({ path: '/catalogue', query: { scope: 'mine' } })
    },
  },
  beforeRouteLeave(_to, _from, next) {
    if (this.saving) {
      next(false)
      return
    }

    if (this.isDirty) {
      const shouldLeave = window.confirm(
        'Tu as des modifications non enregistrees. Quitter sans sauvegarder ?'
      )
      next(shouldLeave)
      return
    }

    next()
  },
  mounted() {
    this.loadCategories()
    this.loadQuiz()
  },
  beforeUnmount() {
    if (this.redirectTimer) {
      window.clearTimeout(this.redirectTimer)
      this.redirectTimer = null
    }
    this.revokePreview()
  },
}
</script>

<style scoped>
@import './EditQuizPage.css';
</style>

