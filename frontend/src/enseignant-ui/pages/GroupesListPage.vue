<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import { groupService } from '../../api/groups'

const router = useRouter()
const groupes = ref([])
const loading = ref(true)

const currentUserId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.id ?? null
})

const ownedGroups = computed(() =>
  groupes.value.filter((group) => group.owner_id === currentUserId.value),
)

const loadGroupes = async () => {
  loading.value = true
  try {
    const { data } = await groupService.list()
    const raw = Array.isArray(data) ? data : data.data
    groupes.value = raw.map((group) => ({
      id: group.id,
      nom: group.nom ?? group.name,
      owner_id: group.owner_id,
      code: group.code_invitation ?? group.code,
      isPublic: Boolean(group.is_public),
      nbMembres:
        group.nb_membres ??
        group.members_count ??
        (group.members ? group.members.length : 0),
    }))
  } catch (error) {
    console.error('Erreur chargement groupes', error)
    groupes.value = []
  } finally {
    loading.value = false
  }
}

const goToGroup = (id) => {
  router.push(`/enseignant/groupes/${id}`)
}

const goToCreateGroup = () => {
  router.push({ path: '/enseignant', query: { mode: 'groupe' } })
}

const goToCreateHub = () => {
  router.push({ path: '/enseignant', query: { mode: 'groupe' } })
}

onMounted(loadGroupes)
</script>

<template>
  <div class="teacher-groups-page">
    <AppHeader />

    <div class="main-layout">
      <main class="content-area">
        <header class="header-text">
          <h1 class="anton-title">MES GROUPES</h1>
          <p v-if="!loading" class="count-text">
            {{ ownedGroups.length }} GROUPES CREES
          </p>
        </header>

        <div v-if="loading" class="loader">
          <div class="spinner"></div>
        </div>

        <div v-else-if="ownedGroups.length > 0" class="group-list">
          <article
            v-for="group in ownedGroups"
            :key="group.id"
            class="group-card-blitzz"
            @click="goToGroup(group.id)"
          >
            <div class="card-icon">
              <span class="material-symbols-outlined">groups</span>
            </div>

            <div class="card-info">
              <h3>{{ group.nom }}</h3>
              <p>
                {{ group.nbMembres }} Membres • Code: {{ group.code }} • {{ group.isPublic ? 'Public' : 'Privé' }}
              </p>
            </div>

            <span class="material-symbols-outlined arrow">chevron_right</span>
          </article>
        </div>

        <div v-else class="empty-state">
          <span class="material-symbols-outlined icon">group_add</span>
          <h2>Aucun groupe</h2>
          <p>Commence par creer ton premier groupe.</p>
          <button type="button" class="empty-btn" @click="goToCreateGroup">
            Creer un groupe
          </button>
        </div>
      </main>
    </div>

    <button class="fab-retour-creation" @click="goToCreateHub">
      <span class="material-symbols-outlined">west</span>
      Retour a la creation
    </button>
  </div>
</template>

<style scoped>
@import './GroupesListPage.css';
</style>
