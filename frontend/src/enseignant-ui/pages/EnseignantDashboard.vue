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
const quizImageInput = ref(null)
const quizImageFile = ref(null)
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

const resetQuizImage = () => {
  revokePreview()
  quizImageFile.value = null
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
    quizImagePreview.value = objectUrl
  } catch (error) {
    quizImageError.value = 'Impossible de lire cette image.'
    resetQuizImage()
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
      overline: 'CREATION DE GROUPE',
      title: 'Cree un groupe',
      subtitle: 'Genere un code puis gere tes membres.',
    }
  }

  return {
    overline: 'CREATION DE QUIZ',
    title: 'Cree un quiz',
    subtitle: 'Pose les bases puis passe aux questions.',
  }
})

const quizPrimaryLabel = computed(() =>
  savingQuiz.value ? 'Creation...' : 'Creer et continuer',
)

const loadCategories = async () => {
  try {
    const { data } = await api.get('/categories')
    categories.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erreur chargement categories', error.response?.data || error)
    categories.value = []
  }
}

const uploadQuizImageIfNeeded = async (quizId) => {
  if (!quizImageFile.value) return true

  try {
    await quizService.uploadImage(quizId, quizImageFile.value)
    return true
  } catch (error) {
    console.error('Erreur upload image quiz', error.response?.data || error)
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
      router.push(`/enseignant/quiz/${quiz.id}/editer`)
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
    router.push(`/enseignant/quiz/${quiz.id}/editer`)
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
          <p class="page-overline">{{ pageCopy.overline }}</p>
          <h1>{{ pageCopy.title }}</h1>
          <p class="page-subtitle">{{ pageCopy.subtitle }}</p>
        </div>

        <button type="button" class="header-link" @click="openGroups">
          Mes groupes
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
              placeholder="Ex: Revision finale en mathematiques"
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

            <div v-if="quizImagePreview" class="image-preview">
              <img :src="quizImagePreview" alt="Apercu image quiz" />
              <button type="button" class="image-clear-btn" @click="resetQuizImage">
                Retirer l image
              </button>
            </div>

            <p v-if="quizImageError" class="form-error">{{ quizImageError }}</p>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label for="quiz-category">Categorie</label>
              <select id="quiz-category" v-model="quizForm.categoryId">
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
              <label for="quiz-level">Niveau d etude</label>
              <select id="quiz-level" v-model="quizForm.niveau">
                <option value="">Choisir un niveau</option>
                <option value="Primaire">Primaire</option>
                <option value="Secondaire">Secondaire</option>
                <option value="Collegiale">Collegiale</option>
                <option value="Universitaire">Universitaire</option>
              </select>
            </div>
          </div>

          <div class="field-group field-group--wide">
            <span class="field-label">Visibilite</span>
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
                Prive
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
            />
          </div>

          <div class="field-row field-row--group">
            <div class="field-group">
              <span class="field-label">Visibilite</span>
              <div class="choice-row">
                <button
                  type="button"
                  class="choice-btn"
                  :class="{ active: groupForm.isPublic }"
                  @click="groupForm.isPublic = true"
                >
                  Public
                </button>
                <button
                  type="button"
                  class="choice-btn"
                  :class="{ active: !groupForm.isPublic }"
                  @click="groupForm.isPublic = false"
                >
                  Prive
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
              {{ savingGroup ? 'Creation...' : 'Creer le groupe' }}
            </button>
            <button type="button" class="btn-secondary" @click="openGroups">
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

