<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api/Axios'
import { groupService } from '../../api/groups'
import { quizService } from '../../api/quiz'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const MIN_IMAGE_WIDTH = 640
const MIN_IMAGE_HEIGHT = 360
const MAX_IMAGE_WIDTH = 4096
const MAX_IMAGE_HEIGHT = 4096

const router = useRouter()
const route = useRoute()

const normalizeMode = (mode) => (mode === 'groupe' ? 'groupe' : 'quiz')
const generatePreviewCode = () => Math.random().toString(36).slice(2, 8).toUpperCase()

const creationMode = ref(normalizeMode(route.query.mode))
const quizError = ref('')
const groupError = ref('')
const savingQuiz = ref(false)
const savingGroup = ref(false)
const previewCode = ref(generatePreviewCode())
const categories = ref([])
const categoriesLoading = ref(false)
const categoriesError = ref('')
const quizImageInput = ref(null)
const quizImageFile = ref(null)
const quizImageUrl = ref('')
const quizImagePreview = ref('')
const quizImageError = ref('')

const quizForm = ref({
  titre: '',
  description: '',
  categoryId: '',
  niveau: '',
  isPublic: false,
})

const groupForm = ref({
  nom: '',
  isPublic: true,
})

const revokePreview = () => {
  if (quizImagePreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(quizImagePreview.value)
  }
}

const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_error) {
    return false
  }
}

const isValidDimensions = (width, height) =>
  width >= MIN_IMAGE_WIDTH &&
  height >= MIN_IMAGE_HEIGHT &&
  width <= MAX_IMAGE_WIDTH &&
  height <= MAX_IMAGE_HEIGHT

const loadImageDimensionsFromUrl = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve({ width: image.width, height: image.height })
    }
    image.onerror = () => {
      reject(new Error('invalid_image_url'))
    }
    image.src = url
  })

const resetQuizImage = () => {
  revokePreview()
  quizImageFile.value = null
  quizImageUrl.value = ''
  quizImagePreview.value = ''
  quizImageError.value = ''
  if (quizImageInput.value) {
    quizImageInput.value.value = ''
  }
}

const loadImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      resolve({ width: image.width, height: image.height, objectUrl })
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('invalid_image'))
    }

    image.src = objectUrl
  })

const onQuizImageSelected = async (event) => {
  quizImageError.value = ''
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    quizImageError.value = 'Image trop lourde. Maximum 5 Mo.'
    resetQuizImage()
    return
  }

  try {
    const { width, height, objectUrl } = await loadImageDimensions(file)
    if (
      width < MIN_IMAGE_WIDTH ||
      height < MIN_IMAGE_HEIGHT ||
      width > MAX_IMAGE_WIDTH ||
      height > MAX_IMAGE_HEIGHT
    ) {
      URL.revokeObjectURL(objectUrl)
      quizImageError.value =
        'Dimensions invalides. Utilise une image entre 640x360 et 4096x4096.'
      resetQuizImage()
      return
    }

    revokePreview()
    quizImageFile.value = file
    quizImageUrl.value = ''
    quizImagePreview.value = objectUrl
  } catch (error) {
    quizImageError.value = 'Impossible de lire cette image.'
    resetQuizImage()
  }
}

const validateQuizImageUrl = async (value, applyPreview = true) => {
  const imageUrl = (value || '').trim()
  if (!imageUrl) return null

  if (!isValidHttpUrl(imageUrl)) {
    throw new Error('invalid_url')
  }

  const { width, height } = await loadImageDimensionsFromUrl(imageUrl)
  if (!isValidDimensions(width, height)) {
    throw new Error('invalid_dimensions')
  }

  if (applyPreview) {
    revokePreview()
    quizImageFile.value = null
    if (quizImageInput.value) {
      quizImageInput.value.value = ''
    }
    quizImagePreview.value = imageUrl
  }

  return imageUrl
}

const onQuizImageUrlBlur = async () => {
  quizImageError.value = ''
  if (!quizImageFile.value) {
    revokePreview()
    quizImagePreview.value = ''
  }
  try {
    const imageUrl = await validateQuizImageUrl(quizImageUrl.value, true)
    if (!imageUrl) return
  } catch (error) {
    if (error.message === 'invalid_url') {
      quizImageError.value = 'URL invalide. Utilise une URL http(s).'
      return
    }
    if (error.message === 'invalid_dimensions') {
      quizImageError.value =
        'Dimensions invalides. Utilise une image entre 640x360 et 4096x4096.'
      return
    }
    quizImageError.value = 'Impossible de charger cette URL image.'
  }
}

watch(
  () => route.query.mode,
  (mode) => {
    creationMode.value = normalizeMode(mode)
    if (creationMode.value === 'groupe') {
      previewCode.value = generatePreviewCode()
    }
  },
)

const setMode = (mode) => {
  const normalizedMode = normalizeMode(mode)
  creationMode.value = normalizedMode
  router.replace({
    path: '/enseignant',
    query: { mode: normalizedMode },
  })
}

const pageCopy = computed(() => {
  if (creationMode.value === 'groupe') {
    return {
      overline: 'CRÉATION DE GROUPE',
      title: 'Crée un groupe',
      subtitle: 'Génère un code puis gère tes membres.',
    }
  }

  return {
    overline: 'CRÉATION DE QUIZ',
    title: 'Crée un quiz',
    subtitle: 'Pose les bases puis passe aux questions.',
  }
})

const quizPrimaryLabel = computed(() =>
  savingQuiz.value ? 'Création...' : 'Créer et continuer',
)

const loadCategories = async () => {
  categoriesLoading.value = true
  categoriesError.value = ''
  try {
    const { data } = await api.get('/categories')
    categories.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erreur chargement categories', error.response?.data || error)
    categories.value = []
    categoriesError.value = 'Impossible de charger les categories.'
  } finally {
    categoriesLoading.value = false
  }
}

const uploadQuizImageIfNeeded = async (quizId) => {
  try {
    if (quizImageFile.value) {
      await quizService.uploadImage(quizId, quizImageFile.value)
      return true
    }

    const imageUrl = await validateQuizImageUrl(quizImageUrl.value, false)
    if (imageUrl) {
      await quizService.setImageUrl(quizId, imageUrl)
    }

    return true
  } catch (error) {
    console.error('Erreur image quiz', error.response?.data || error)
    if (error.message === 'invalid_url') {
      quizError.value = 'Le quiz est cree, mais l URL image est invalide.'
      return false
    }
    if (error.message === 'invalid_dimensions') {
      quizError.value =
        'Le quiz est cree, mais l image URL ne respecte pas les dimensions minimales.'
      return false
    }
    quizError.value =
      'Le quiz est cree, mais l image n a pas pu etre enregistree. Termine dans la page d edition.'
    return false
  }
}

const createQuiz = async () => {
  quizError.value = ''

  if (!quizForm.value.titre.trim()) {
    quizError.value = 'Le titre du quiz est obligatoire.'
    throw new Error('invalid')
  }

  savingQuiz.value = true

  const payload = {
    titre: quizForm.value.titre.trim(),
    description: quizForm.value.description.trim(),
    category_id: quizForm.value.categoryId ? Number(quizForm.value.categoryId) : null,
    education_level: (quizForm.value.niveau || '').toLowerCase() || null,
    is_public: quizForm.value.isPublic,
  }

  try {
    const { data } = await api.post('/quizzes', payload)
    return data
  } finally {
    savingQuiz.value = false
  }
}

const createQuizAndContinue = async () => {
  try {
    const quiz = await createQuiz()
    const uploadOk = await uploadQuizImageIfNeeded(quiz.id)

    if (!uploadOk) {
      router.push(`/enseignant/quiz/${quiz.id}/questions`)
      return
    }

    router.push(`/enseignant/quiz/${quiz.id}/questions`)
  } catch (error) {
    if (error.message === 'invalid') return
    console.error('Erreur creation quiz', error.response?.data || error)
    quizError.value = 'Erreur lors de la creation du quiz.'
  }
}

const createQuizOnly = async () => {
  try {
    const quiz = await createQuiz()
    await uploadQuizImageIfNeeded(quiz.id)
    openMyQuizzes()
  } catch (error) {
    if (error.message === 'invalid') return
    console.error('Erreur creation quiz', error.response?.data || error)
    quizError.value = 'Erreur lors de la creation du quiz.'
  }
}

const createGroup = async () => {
  groupError.value = ''

  if (!groupForm.value.nom.trim()) {
    groupError.value = 'Le nom du groupe est obligatoire.'
    return
  }

  savingGroup.value = true

  try {
    const { data: group } = await groupService.create({
      nom: groupForm.value.nom.trim(),
      is_public: groupForm.value.isPublic,
    })
    router.push(`/enseignant/groupes/${group.id}`)
  } catch (error) {
    console.error('Erreur creation groupe', error.response?.data || error)
    groupError.value =
      error.response?.data?.message || 'Erreur lors de la creation du groupe.'
  } finally {
    savingGroup.value = false
  }
}

const openGroups = () => {
  router.push('/enseignant/groupes')
}

const openMyQuizzes = () => {
  router.push({
    path: '/catalogue',
    query: { scope: 'mine' },
  })
}

const headerLinkLabel = computed(() =>
  creationMode.value === 'groupe' ? 'Mes groupes' : 'Mes quiz',
)

const onHeaderLinkClick = () => {
  if (creationMode.value === 'groupe') {
    openGroups()
    return
  }
  openMyQuizzes()
}

onMounted(loadCategories)

onBeforeUnmount(() => {
  revokePreview()
})
</script>

<template>
  <div class="teacher-create-page">
    <AppHeader />

    <main class="teacher-create-main">
      <header class="create-header">
        <div class="header-copy">
          <h1>{{ pageCopy.title }}</h1>
          <p class="page-subtitle">{{ pageCopy.subtitle }}</p>
        </div>

        <button type="button" class="header-link" @click="onHeaderLinkClick">
          {{ headerLinkLabel }}
        </button>
      </header>

      <section class="creation-card">
        <form
          v-if="creationMode === 'quiz'"
          class="creation-form"
          @submit.prevent="createQuizAndContinue"
        >
          <div class="field-group field-group--wide">
            <label for="quiz-title">Titre du quiz</label>
            <input
              id="quiz-title"
              v-model="quizForm.titre"
              type="text"
              placeholder="Ex: Révision finale en mathématiques"
              required
            />
          </div>

          <div class="field-group field-group--wide">
            <label for="quiz-description">Description</label>
            <textarea
              id="quiz-description"
              v-model="quizForm.description"
              rows="5"
              placeholder="Ajoute un contexte ou des consignes."
            ></textarea>
          </div>

          <div class="field-group field-group--wide">
            <label for="quiz-image">Image de la carte (optionnel)</label>
            <input
              id="quiz-image"
              ref="quizImageInput"
              class="file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="onQuizImageSelected"
            />
            <p class="field-help">
              Formats: JPG, PNG, WebP. Max 5 Mo. Dimensions entre 640x360 et 4096x4096.
            </p>

            <label for="quiz-image-url">Ou URL image (optionnel)</label>
            <input
              id="quiz-image-url"
              v-model="quizImageUrl"
              type="url"
              placeholder="https://exemple.com/image-quiz.jpg"
              @blur="onQuizImageUrlBlur"
            />
            <p class="field-help">Utilise un fichier local ou une URL, pas les deux.</p>

            <div v-if="quizImagePreview" class="image-preview">
              <img :src="quizImagePreview" alt="Aperçu image quiz" />
              <button
                type="button"
                class="image-clear-btn"
                @click="resetQuizImage"
              >
                Retirer l'image
              </button>
            </div>

            <p v-if="quizImageError" class="form-error">{{ quizImageError }}</p>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label for="quiz-category">Catégorie</label>
              <select id="quiz-category" v-model="quizForm.categoryId">
                <option value="" :disabled="categoriesLoading">
                  {{ categoriesLoading ? 'Chargement des categories...' : 'Choisir une catégorie' }}
                </option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="String(category.id)"
                >
                  {{ category.name }}
                </option>
              </select>
              <button
                v-if="categoriesError"
                type="button"
                class="inline-retry-btn"
                @click="loadCategories"
              >
                Réessayer de charger les catégories
              </button>
              <p v-if="categoriesError" class="form-error">{{ categoriesError }}</p>
            </div>

            <div class="field-group">
              <label for="quiz-level">Niveau d'étude</label>
              <select id="quiz-level" v-model="quizForm.niveau">
                <option value="">Choisir un niveau</option>
                <option value="Primaire">Primaire</option>
                <option value="Secondaire">Secondaire</option>
                <option value="Collegiale">Collégial</option>
                <option value="Universitaire">Universitaire</option>
              </select>
            </div>
          </div>

          <div class="field-group field-group--wide">
            <span class="field-label">Visibilité</span>
            <div class="choice-row">
              <button
                type="button"
                class="choice-btn"
                :class="{ active: quizForm.isPublic }"
                @click="quizForm.isPublic = true"
              >
                Public
              </button>
              <button
                type="button"
                class="choice-btn"
                :class="{ active: !quizForm.isPublic }"
                @click="quizForm.isPublic = false"
              >
                Privé
              </button>
            </div>
          </div>

          <p v-if="quizError" class="form-error">{{ quizError }}</p>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="savingQuiz">
              {{ quizPrimaryLabel }}
            </button>
            <button
              type="button"
              class="btn-secondary"
              :disabled="savingQuiz"
              @click="createQuizOnly"
            >
              Enregistrer seulement
            </button>
          </div>
        </form>

        <form v-else class="creation-form" @submit.prevent="createGroup">
          <div class="field-group field-group--wide">
            <label for="group-name">Nom du groupe</label>
            <input
              id="group-name"
              v-model="groupForm.nom"
              type="text"
              placeholder="Ex: Groupe sciences 2026"
              required
              :disabled="savingGroup"
            />
          </div>

          <div class="field-row field-row--group">
            <div class="field-group">
              <span class="field-label">Visibilité</span>
              <div class="choice-row">
                <button
                  type="button"
                  class="choice-btn"
                  :class="{ active: groupForm.isPublic }"
                  @click="groupForm.isPublic = true"
                  :disabled="savingGroup"
                >
                  Public
                </button>
                <button
                  type="button"
                  class="choice-btn"
                  :class="{ active: !groupForm.isPublic }"
                  @click="groupForm.isPublic = false"
                  :disabled="savingGroup"
                >
                  Privé
                </button>
              </div>
            </div>

            <div class="code-preview">
              <span class="field-label">Code</span>
              <strong>{{ previewCode }}</strong>
            </div>
          </div>

          <p v-if="groupError" class="form-error">{{ groupError }}</p>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="savingGroup">
              {{ savingGroup ? 'Création...' : 'Créer le groupe' }}
            </button>
            <button type="button" class="btn-secondary" @click="openGroups" :disabled="savingGroup">
              Voir mes groupes
            </button>
          </div>
        </form>
      </section>

    </main>

    <nav class="creation-toggle" aria-label="Type de creation">
      <button
        type="button"
        class="creation-toggle-btn"
        :class="{ active: creationMode === 'quiz' }"
        @click="setMode('quiz')"
      >
        Quiz
      </button>
      <button
        type="button"
        class="creation-toggle-btn"
        :class="{ active: creationMode === 'groupe' }"
        @click="setMode('groupe')"
      >
        Groupe
      </button>
    </nav>
  </div>
</template>

<style scoped>
@import './EnseignantDashboard.css';
</style>

