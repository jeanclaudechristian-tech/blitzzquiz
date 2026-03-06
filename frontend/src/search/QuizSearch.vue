<template>
  <div class="quiz-search">

    <div class="search-bar">
      <input
        v-model="query"
        type="text"
        placeholder="Rechercher par titre, catégorie ou description..."
        @input="onInput"
      />
      <span v-if="loading" class="spinner">⏳</span>
    </div>

    <p v-if="query.length > 0 && query.length < 2" class="hint">
      Écris au moins 2 caractères...
    </p>

    <p v-if="noResults" class="no-results">
      Aucun quiz trouvé pour <strong>{{ query }}</strong>
    </p>

    <ul v-if="results.length" class="results">
      <li v-for="quiz in results" :key="quiz.id" class="quiz-card" @click="goToQuiz(quiz)"> <!-- ✅ -->
        <div class="quiz-header">
          <span class="titre">{{ quiz.titre }}</span>
          <span class="category">{{ quiz.category }}</span>
        </div>
        <p class="description" v-html="quiz.description_highlight"></p>
        <div class="quiz-footer">
          <span class="level">{{ quiz.education_level ?? 'Tous niveaux' }}</span>
          <span class="count">{{ quiz.questions_count }} question(s)</span>
        </div>
      </li>
    </ul>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router' // ✅

const router = useRouter() // ✅

const query     = ref('')
const results   = ref([])
const loading   = ref(false)
const noResults = ref(false)

let debounceTimer = null

function onInput() {
  noResults.value = false
  clearTimeout(debounceTimer)

  if (query.value.length < 2) {
    results.value = []
    return
  }

  debounceTimer = setTimeout(fetchResults, 350)
}

async function fetchResults() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')

    const { data } = await axios.get('/api/quizzes/search', {
      params: { q: query.value },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    results.value = data
    noResults.value = data.length === 0
  } catch (err) {
    console.error('Erreur recherche:', err)
  } finally {
    loading.value = false
  }
}

// ✅
function goToQuiz(quiz) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const role = user?.role

  if (role === 'STUDENT') {
    router.push(`/etudiant/quiz/${quiz.id}`)
  } else if (role === 'TEACHER' || role === 'ADMIN') {
    router.push(`/enseignant/quiz/${quiz.id}/editer`)
  }
}
</script>

<style scoped>
.quiz-search { max-width: 680px; margin: 0 auto; font-family: sans-serif; }

.search-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.search-bar input {
  flex: 1; padding: 10px 16px;
  border: 2px solid #d1d5db; border-radius: 10px;
  font-size: 1rem; transition: border-color .2s;
}
.search-bar input:focus { outline: none; border-color: #6366f1; }

.results { padding: 0; margin: 0; }

.quiz-card {
  list-style: none;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 12px;
  transition: box-shadow .2s;
  cursor: pointer; /* ✅ */
}
.quiz-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }

.quiz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.titre { font-weight: 700; font-size: 1rem; color: #111827; }
.category {
  font-size: 0.78rem;
  background: #ede9fe; color: #6d28d9;
  padding: 2px 10px; border-radius: 99px;
}

.description { font-size: 0.9rem; color: #4b5563; margin: 6px 0; line-height: 1.5; }

.quiz-footer { display: flex; justify-content: space-between; margin-top: 10px; }
.level, .count { font-size: 0.8rem; color: #9ca3af; }

:deep(mark) { background: #fef08a; border-radius: 3px; padding: 0 3px; }

.hint, .no-results { color: #9ca3af; font-size: 0.9rem; padding: 8px 0; }
</style>
