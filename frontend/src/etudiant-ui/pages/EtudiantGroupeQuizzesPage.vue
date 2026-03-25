<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { groupService } from '../../api/groups'
import { resolveQuizImage } from '../../api/quiz'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const groupeNom = ref('Chargement...')
const quizzes = ref([])
const members = ref([])
const loading = ref(true)

const confirmModal = ref(false)
const leaving = ref(false)

const rankingModal = ref(false)
const selectedRankingQuizId = ref('')
const rankingRows = ref([])
const rankingLoading = ref(false)
const rankingError = ref('')

const currentUserId = computed(() => {
  try {
    const raw = localStorage.getItem('user')
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.id ?? null
  } catch {
    return null
  }
})

const selectedRankingQuiz = computed(
  () => quizzes.value.find((quiz) => String(quiz.id) === String(selectedRankingQuizId.value)) || null,
)

const rankingResultRows = computed(() => {
  const rankingByUser = new Map(
    rankingRows.value.map((row) => [
      Number(row.userId),
      {
        score: Number(row.score),
        attemptsCount: Number(row.attemptsCount),
        durationSeconds:
          row.durationSeconds === null || row.durationSeconds === undefined
            ? null
            : Number(row.durationSeconds),
        date: row.date,
        displayName: row.displayName,
        email: row.email,
        avatar: row.avatar || '',
      },
    ]),
  )

  const rows = members.value.map((member) => {
    const result = rankingByUser.get(Number(member.id))
    return {
      id: `member-${member.id}`,
      userId: Number(member.id),
      displayName: member.displayName,
      email: member.email,
      avatar: member.avatar || result?.avatar || '',
      isCurrentUser: Number(member.id) === Number(currentUserId.value),
      score: result ? result.score : null,
      attemptsCount: result ? result.attemptsCount : 0,
      durationSeconds: result?.durationSeconds ?? null,
      date: result?.date || null,
    }
  })

  rankingRows.value.forEach((row) => {
    const userId = Number(row.userId)
    if (!userId || rows.some((item) => Number(item.userId) === userId)) return
    rows.push({
      id: `extra-${userId}`,
      userId,
      displayName: row.displayName || `Participant ${userId}`,
      email: row.email || 'Courriel indisponible',
      avatar: row.avatar || '',
      isCurrentUser: userId === Number(currentUserId.value),
      score: Number(row.score),
      attemptsCount: Number(row.attemptsCount),
      durationSeconds:
        row.durationSeconds === null || row.durationSeconds === undefined
          ? null
          : Number(row.durationSeconds),
      date: row.date,
    })
  })

  rows.sort((a, b) => {
    const scoreA = a.score === null ? -1 : a.score
    const scoreB = b.score === null ? -1 : b.score
    if (scoreA !== scoreB) return scoreB - scoreA

    if (a.score !== null && b.score !== null) {
      const durationA = a.durationSeconds
      const durationB = b.durationSeconds
      const hasDurationA = Number.isFinite(durationA)
      const hasDurationB = Number.isFinite(durationB)

      if (hasDurationA && hasDurationB && durationA !== durationB) {
        return durationA - durationB
      }
      if (hasDurationA !== hasDurationB) {
        return hasDurationA ? -1 : 1
      }

      const dateA = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER
      const dateB = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER
      if (dateA !== dateB) return dateA - dateB
    }

    return a.displayName.localeCompare(b.displayName, 'fr', { sensitivity: 'base' })
  })

  let rank = 0
  return rows.map((row) => {
    if (row.score === null) {
      return { ...row, rank: null }
    }
    rank += 1
    return { ...row, rank }
  })
})

const goBack = () => {
  router.push('/etudiant/mes-groupes')
}

const syncSelectedRankingQuiz = () => {
  if (!quizzes.value.length) {
    selectedRankingQuizId.value = ''
    rankingRows.value = []
    rankingError.value = ''
    return
  }

  const quizIds = new Set(quizzes.value.map((quiz) => String(quiz.id)))
  if (!quizIds.has(String(selectedRankingQuizId.value))) {
    selectedRankingQuizId.value = String(quizzes.value[0].id)
  }
}

const formatResultDate = (value) => {
  if (!value) return 'Aucune tentative'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Date indisponible'
  return parsed.toLocaleString('fr-CA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const formatDuration = (value) => {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return 'Duree n/d'
  const totalSeconds = Math.max(0, Math.floor(Number(value)))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const scoreClass = (score) => {
  if (score === null) return 'ranking-score--none'
  if (score >= 80) return 'ranking-score--excellent'
  if (score >= 60) return 'ranking-score--good'
  return 'ranking-score--low'
}

const loadRanking = async (quizId) => {
  if (!quizId) return

  rankingLoading.value = true
  rankingError.value = ''

  try {
    const { data } = await groupService.getQuizRanking(route.params.id, quizId)
    const rawRows = Array.isArray(data) ? data : []
    rankingRows.value = rawRows.map((row) => ({
      userId: Number(row.user_id || row.user?.id || 0),
      displayName:
        row.user?.nickname ||
        row.user?.username ||
        row.user?.name ||
        row.nom ||
        (row.user_id ? `Participant ${row.user_id}` : 'Participant'),
      email: row.user?.email || 'Courriel indisponible',
      avatar: row.user?.avatar || '',
      score: Number(row.score ?? 0),
      attemptsCount: Number(row.attempts_count ?? 1),
      durationSeconds:
        row.duration_seconds === null || row.duration_seconds === undefined
          ? null
          : Number(row.duration_seconds),
      date: row.date_tentative || row.created_at || null,
    }))
  } catch (error) {
    console.error('Erreur chargement classement du groupe', error.response?.data || error)
    rankingRows.value = []
    rankingError.value = error.response?.data?.error || 'Impossible de charger le classement.'
  } finally {
    rankingLoading.value = false
  }
}

const openRankingModal = async () => {
  rankingModal.value = true
  syncSelectedRankingQuiz()

  if (selectedRankingQuizId.value) {
    await loadRanking(selectedRankingQuizId.value)
  }
}

const selectRankingQuiz = async (quizId) => {
  const nextId = String(quizId)
  if (nextId === String(selectedRankingQuizId.value) && rankingRows.value.length) return
  selectedRankingQuizId.value = nextId
  await loadRanking(nextId)
}

const closeRankingModal = () => {
  rankingModal.value = false
}

const confirmerQuitter = async () => {
  leaving.value = true
  try {
    await groupService.leave(route.params.id)
    router.push('/etudiant/mes-groupes')
  } catch (e) {
    console.error('Erreur lors du depart du groupe', e)
  } finally {
    leaving.value = false
  }
}

const openQuiz = (quizId) => {
  router.push({
    path: `/etudiant/quiz/${quizId}/jouer`,
    query: { group: route.params.id },
  })
}

const hideBrokenImage = (event) => {
  const img = event?.target
  if (!img) return
  img.style.display = 'none'
}

const loadGroupeQuizzes = async () => {
  const groupeId = route.params.id
  if (!groupeId || groupeId === 'undefined') return router.push('/etudiant/mes-groupes')

  loading.value = true
  try {
    const { data: groupe } = await groupService.show(groupeId)
    groupeNom.value = groupe.nom
    members.value = (Array.isArray(groupe.members) ? groupe.members : []).map((member) => ({
      id: Number(member.id),
      displayName:
        member.nickname ||
        member.username ||
        member.name ||
        member.email?.split('@')[0] ||
        'Membre',
      email: member.email || 'Courriel indisponible',
      avatar: member.avatar || '',
    }))

    const { data: quizzesData } = await groupService.getQuizzes(groupeId)
    quizzes.value = (quizzesData || []).map((q) => ({
      id: q.id,
      titre: q.titre,
      category:
        q.category && typeof q.category === 'object'
          ? q.category.name || q.category.NAME
          : q.category || 'General',
      image: resolveQuizImage(q),
      nbQuestions: q.questions_count ?? 0,
    }))

    syncSelectedRankingQuiz()
  } catch (e) {
    router.push('/etudiant/mes-groupes')
  } finally {
    loading.value = false
  }
}

onMounted(loadGroupeQuizzes)
</script>

<template>
  <div class="groupe-page">
    <AppHeader />

    <!-- Modale confirmation quitter -->
    <Transition name="modal-fade">
      <div v-if="confirmModal" class="modal-overlay" @click.self="confirmModal = false">
        <div class="modal-box">
          <div class="modal-icon">
            <span class="material-symbols-outlined">group_remove</span>
          </div>
          <h2 class="modal-title">Quitter le groupe ?</h2>
          <p class="modal-desc">
            Tu vas quitter <strong>{{ groupeNom }}</strong>.
            Tu pourras rejoindre à nouveau avec le code d'invitation.
          </p>
          <div class="modal-actions">
            <button class="modal-btn modal-btn--cancel" @click="confirmModal = false">
              Annuler
            </button>
            <button class="modal-btn modal-btn--confirm" @click="confirmerQuitter" :disabled="leaving">
              <span v-if="leaving" class="mini-spinner"></span>
              <span v-else class="material-symbols-outlined">logout</span>
              {{ leaving ? 'En cours...' : 'Quitter' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modale classement -->
    <Transition name="modal-fade">
      <div v-if="rankingModal" class="modal-overlay modal-overlay--ranking" @click.self="closeRankingModal">
        <div class="modal-box ranking-modal">
          <div class="ranking-modal-head">
            <div>
              <h2 class="ranking-modal-title">Classement du groupe</h2>
              <p class="ranking-modal-subtitle">
                Choisis un quiz assigne pour voir les notes de tous les membres.
              </p>
            </div>
            <button type="button" class="ranking-close-btn" @click="closeRankingModal">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div v-if="quizzes.length === 0" class="ranking-empty">
            <h3>Aucun quiz assigne</h3>
            <p>Le classement sera disponible des qu un quiz est ajoute a ce groupe.</p>
          </div>

          <div v-else class="ranking-modal-layout">
            <aside class="ranking-quiz-list" aria-label="Quiz du groupe">
              <button
                v-for="quiz in quizzes"
                :key="quiz.id"
                type="button"
                :class="[
                  'ranking-quiz-item',
                  { 'is-active': String(quiz.id) === String(selectedRankingQuizId) },
                ]"
                @click="selectRankingQuiz(quiz.id)"
              >
                <strong>{{ quiz.titre }}</strong>
                <span>{{ quiz.nbQuestions }} question(s)</span>
              </button>
            </aside>

            <section class="ranking-results-panel">
              <header class="ranking-results-head">
                <div>
                  <h3>{{ selectedRankingQuiz?.titre || 'Selectionne un quiz' }}</h3>
                  <p>{{ rankingResultRows.length }} membre(s) du groupe</p>
                </div>
              </header>

              <p v-if="rankingLoading" class="ranking-state">Chargement du classement...</p>
              <p v-else-if="rankingError" class="ranking-state ranking-state--error">{{ rankingError }}</p>

              <div v-else class="ranking-results-list">
                <article
                  v-for="row in rankingResultRows"
                  :key="row.id"
                  :class="['ranking-result-row', { 'is-current-user': row.isCurrentUser }]"
                >
                  <div class="ranking-rank">
                    <strong>{{ row.rank ? `#${row.rank}` : '--' }}</strong>
                  </div>

                  <div class="ranking-member">
                    <strong class="ranking-member-main">
                      <span class="ranking-user-avatar" :title="row.displayName">
                        <span class="ranking-avatar-fallback">
                          {{ (row.displayName || '?').trim().charAt(0).toUpperCase() }}
                        </span>
                        <img
                          v-if="row.avatar"
                          :src="row.avatar"
                          :alt="`Avatar ${row.displayName}`"
                          @error="hideBrokenImage"
                        />
                      </span>
                      <span class="ranking-member-name">{{ row.displayName }}</span>
                      <span v-if="row.isCurrentUser" class="you-chip">Vous</span>
                    </strong>
                    <span>{{ row.email }}</span>
                  </div>

                  <div class="ranking-score-block">
                    <strong :class="['ranking-score', scoreClass(row.score)]">
                      {{ row.score === null ? '--' : `${row.score}%` }}
                    </strong>
                    <span>
                      {{
                        row.score === null
                          ? 'Aucune tentative'
                          : `${row.attemptsCount} tentative(s) - ${formatDuration(row.durationSeconds)} - ${formatResultDate(row.date)}`
                      }}
                    </span>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>

    <button class="fab-retour-blitzz" @click="goBack">
      <span class="material-symbols-outlined">west</span>
      Mes groupes
    </button>

    <div class="main-layout container-blitzz">
      <main class="quiz-grid-area">
        
        <header class="header-text">
          <div class="header-top-row">
            <div>
              <h1 class="catalogue-main-title">{{ groupeNom }}</h1>
              <p class="quiz-counter" v-if="!loading">
                {{ quizzes.length }} QUIZ DISPONIBLES
              </p>
            </div>
            <div class="header-actions">
              <button class="btn-classement-groupe" @click="openRankingModal">
                <span class="material-symbols-outlined">leaderboard</span>
                Voir classement
              </button>
              <button class="btn-quitter-groupe" @click="confirmModal = true">
                <span class="material-symbols-outlined">logout</span>
                Quitter le groupe
              </button>
            </div>
          </div>
        </header>

        <div v-if="loading" class="loader-box">
          <div class="spinner"></div>
        </div>

        <div v-else-if="quizzes.length > 0" class="catalogue-quiz-grid">
          <div v-for="quiz in quizzes" :key="quiz.id" class="mini-quiz-card" @click="openQuiz(quiz.id)">
            <div class="card-inner">
              <img
                v-if="quiz.image"
                :src="quiz.image"
                alt=""
                draggable="false"
                @error="hideBrokenImage"
              />
              <div class="card-info-overlay">
                <h3 class="q-title">{{ quiz.titre }}</h3>
                <span class="q-cat">{{ quiz.category }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <h2>Aucun quiz disponible</h2>
          <p>Il n'y a pas encore de quiz assignés à ce groupe.</p>
        </div>
        
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700;800&display=swap');

.groupe-page {
  background: #fff;
  min-height: 100vh;
  padding-top: 140px;
  font-family: 'Inter', sans-serif;
  position: relative;
}

/* 🎯 STYLE RECTANGULAIRE (PHOTO 2) */
.fab-retour-blitzz {
  position: fixed;
  bottom: 30px;
  left: 30px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #111111; 
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.fab-retour-blitzz:hover {
  background: #00A3FF; 
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 163, 255, 0.3);
}

/* Protection de la flèche Material */
.fab-retour-blitzz .material-symbols-outlined {
  font-family: 'Material Symbols Outlined' !important;
  font-size: 20px;
}

.header-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
  margin-bottom: 35px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-classement-groupe {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  background: #111111;
  color: #ffffff;
  border: 2px solid #111111;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}

.btn-classement-groupe .material-symbols-outlined {
  font-size: 18px;
}

.btn-classement-groupe:hover {
  background: #00a3ff;
  border-color: #00a3ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0, 163, 255, 0.28);
}

.btn-quitter-groupe {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: #f9fafb;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}

.btn-quitter-groupe .material-symbols-outlined {
  font-size: 18px;
}

.btn-quitter-groupe:hover {
  background: #111111;
  color: #ffffff;
  border-color: #111111;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* ── Modale ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}

.modal-overlay--ranking {
  align-items: flex-start;
  padding-top: 130px;
}

.ranking-modal {
  width: min(1100px, 96vw);
  max-width: 1100px;
  max-height: calc(100vh - 180px);
  padding: 22px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.ranking-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.ranking-modal-title {
  margin: 0;
  font-family: 'Anton', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-size: 1.8rem;
  line-height: 1;
  color: #111111;
}

.ranking-modal-subtitle {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 0.92rem;
  font-weight: 600;
}

.ranking-close-btn {
  width: 38px;
  height: 38px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  color: #4b5563;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ranking-close-btn:hover {
  border-color: #111111;
  color: #111111;
}

.ranking-empty {
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
}

.ranking-empty h3 {
  margin: 0 0 8px;
  font-size: 1.2rem;
  font-weight: 800;
  color: #111111;
}

.ranking-empty p {
  margin: 0;
  color: #6b7280;
  font-weight: 600;
}

.ranking-modal-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 14px;
  min-height: 0;
  flex: 1;
}

.ranking-quiz-list {
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 12px;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-quiz-item {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  padding: 12px 12px;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.2s ease;
}

.ranking-quiz-item strong {
  color: #111827;
  font-size: 0.95rem;
  line-height: 1.2;
}

.ranking-quiz-item span {
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 600;
}

.ranking-quiz-item:hover {
  border-color: #00a3ff;
}

.ranking-quiz-item.is-active {
  border-color: #00a3ff;
  background: rgba(0, 163, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(0, 163, 255, 0.2);
}

.ranking-results-panel {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.ranking-results-head {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f7;
}

.ranking-results-head h3 {
  margin: 0;
  color: #111111;
  font-size: 1.05rem;
  font-weight: 800;
}

.ranking-results-head p {
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 0.84rem;
  font-weight: 600;
}

.ranking-state {
  margin: 0;
  padding: 24px 16px;
  color: #6b7280;
  font-size: 0.92rem;
  font-weight: 600;
}

.ranking-state--error {
  color: #b91c1c;
}

.ranking-results-list {
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-result-row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) minmax(165px, 230px);
  gap: 10px;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
}

.ranking-result-row.is-current-user {
  border-color: rgba(0, 163, 255, 0.45);
  box-shadow: 0 0 0 1px rgba(0, 163, 255, 0.22);
}

.ranking-rank strong {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 38px;
  border-radius: 999px;
  background: #eef2f7;
  color: #111827;
  font-size: 0.9rem;
  font-weight: 800;
}

.ranking-member {
  min-width: 0;
}

.ranking-member strong {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  color: #111111;
  font-size: 0.95rem;
  font-weight: 800;
}

.ranking-member strong span {
  flex-shrink: 0;
}

.ranking-member-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}

.ranking-user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  overflow: hidden;
  background: #e5e7eb;
  border: 1px solid #d1d5db;
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ranking-avatar-fallback {
  font-size: 0.76rem;
  font-weight: 800;
  color: #374151;
  line-height: 1;
}

.ranking-user-avatar img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ranking-member-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
}

.ranking-member > span {
  display: block;
  margin-top: 4px;
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.ranking-score-block {
  text-align: right;
}

.ranking-score-block > span {
  display: block;
  margin-top: 3px;
  color: #6b7280;
  font-size: 0.76rem;
  font-weight: 600;
}

.ranking-score {
  font-size: 1rem;
  font-weight: 800;
}

.ranking-score--none {
  color: #6b7280;
}

.ranking-score--excellent {
  color: #059669;
}

.ranking-score--good {
  color: #0ea5e9;
}

.ranking-score--low {
  color: #d97706;
}

.you-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(0, 163, 255, 0.12);
  color: #0369a1;
  font-size: 0.72rem;
  font-weight: 700;
}

.modal-icon {
  width: 64px;
  height: 64px;
  background: #111111;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #ffffff;
}

.modal-icon .material-symbols-outlined {
  font-size: 30px;
}

.modal-title {
  font-family: 'Anton', sans-serif;
  font-size: 1.8rem;
  color: #1a1a1a;
  margin: 0 0 12px;
  text-transform: uppercase;
}

.modal-desc {
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.5;
  margin: 0 0 28px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 20px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}

.modal-btn .material-symbols-outlined {
  font-size: 18px;
}

.modal-btn--cancel {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.modal-btn--cancel:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.modal-btn--confirm {
  background: #111111;
  color: #ffffff;
  border: 2px solid transparent;
}

.modal-btn--confirm:hover:not(:disabled) {
  background: #00A3FF;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 163, 255, 0.3);
}

.modal-btn--confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-active .modal-box,
.modal-fade-leave-active .modal-box {
  transition: transform 0.25s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-box,
.modal-fade-leave-to .modal-box {
  transform: scale(0.92) translateY(20px);
  opacity: 0;
}

.main-layout { 
  display: flex; 
  max-width: 1250px; 
  margin: 0 auto; 
  padding: 0 20px 100px; 
  gap: 50px; 
}

.quiz-grid-area { 
  flex-grow: 1; 
  min-width: 0; 
}

.header-text { 
  margin-bottom: 0;
}

.catalogue-main-title { 
  font-family: 'Anton', sans-serif; 
  font-size: 2.8rem; 
  text-transform: uppercase; 
  color: #1a1a1a; 
  margin: 0; 
}

.quiz-counter { 
  font-size: 0.9rem; 
  font-family: 'Inter', sans-serif; 
  color: #888; 
  font-weight: 600; 
  margin-top: 8px; 
  text-transform: uppercase; 
}

.catalogue-quiz-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 30px; 
  width: 100%; 
}

.mini-quiz-card { 
  cursor: pointer; 
  transition: transform 0.2s ease; 
  width: 100%; 
}

.mini-quiz-card:hover { 
  transform: translateY(-5px); 
}

.card-inner { 
  position: relative; 
  width: 100%; 
  height: 200px; 
  border-radius: 12px; 
  overflow: hidden; 
  background: #111; 
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); 
}

.card-inner img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  opacity: 0.85; 
}

.card-info-overlay { 
  position: absolute; 
  inset: 0; 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  justify-content: flex-end; 
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%); 
}

.q-title { 
  font-family: 'Inter', sans-serif; 
  color: #fff; 
  font-weight: 800; 
  font-size: 1.2rem; 
  margin: 0 0 5px 0; 
  line-height: 1.2; 
}

.q-cat { 
  font-family: 'Inter', sans-serif; 
  color: #00A3FF; 
  font-weight: 800; 
  font-size: 0.75rem; 
  text-transform: uppercase; 
  letter-spacing: 0.5px; 
}

.empty-state { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-start; 
  padding: 40px 0; 
}

.empty-state h2 { 
  font-family: 'Inter', sans-serif; 
  font-size: 1.8rem; 
  font-weight: 800; 
  color: #1a1a1a; 
  margin: 0 0 10px 0; 
}

.empty-state p { 
  font-family: 'Inter', sans-serif; 
  font-size: 1rem; 
  color: #6b7280; 
  margin: 0; 
}

.loader-box { 
  display: flex; 
  justify-content: center; 
  padding: 100px 0; 
}

.spinner { 
  width: 40px; 
  height: 40px; 
  border: 4px solid #f3f4f6; 
  border-top-color: #00A3FF; 
  border-radius: 50%; 
  animation: spin 1s linear infinite; 
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

@media (max-width: 768px) {
  .catalogue-quiz-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
  .card-inner { height: 160px; }
  .fab-retour-blitzz { bottom: 20px; left: 20px; padding: 12px 18px; font-size: 0.85rem; }
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  .btn-classement-groupe,
  .btn-quitter-groupe {
    padding: 10px 14px;
    font-size: 0.82rem;
  }
  .modal-overlay--ranking {
    padding: 18px 14px;
    align-items: center;
  }
  .ranking-modal {
    width: 100%;
    max-height: calc(100vh - 36px);
    padding: 16px;
  }
  .ranking-modal-title {
    font-size: 1.4rem;
  }
  .ranking-modal-layout {
    grid-template-columns: 1fr;
  }
  .ranking-quiz-list {
    max-height: 170px;
  }
  .ranking-result-row {
    grid-template-columns: 54px 1fr;
    grid-template-areas:
      'rank member'
      'score score';
  }
  .ranking-rank {
    grid-area: rank;
  }
  .ranking-member {
    grid-area: member;
  }
  .ranking-score-block {
    grid-area: score;
    text-align: left;
    margin-left: 56px;
  }
}
</style>
