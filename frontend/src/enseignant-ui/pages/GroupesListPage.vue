<template>
  <div class="groupes-page">
    <AppHeader />
    <main class="groupes-main">
      <header class="groupes-header">
        <h1>Mes Groupes</h1>
        <CallToActionBtn text="Créer un groupe" variant="dark" @click="goToCreateGroupe" />
      </header>

      <!-- Filtres et recherche -->
      <div class="groupes-filters">
        <input v-model="searchTerm" type="text" placeholder="Rechercher un groupe…" class="search-input" />
        <select v-model="filterStatut" class="filter-select">
          <option value="">Tous les statuts</option>
          <option value="public">Public</option>
          <option value="prive">Privé</option>
        </select>
      </div>

      <!-- Liste des groupes -->
      <div v-if="filteredGroupes.length" class="groupes-grid">
        <article v-for="groupe in filteredGroupes" :key="groupe.id" class="groupe-card">
          <h3 class="groupe-name">{{ groupe.nom }}</h3>
          <p class="groupe-meta">
            {{ groupe.nbMembres }} membre{{ groupe.nbMembres > 1 ? 's' : '' }}
          </p>
          <span :class="['pill', groupe.isPublic ? 'pill--public' : 'pill--private']">
            {{ groupe.isPublic ? 'Public' : 'Privé' }}
          </span>
          <button type="button" class="voir-button" @click="openGroupe(groupe)">
            Voir
          </button>
        </article>
      </div>

      <!-- Message si aucun groupe -->
      <div v-else class="groupes-empty">
        <p>Aucun groupe trouvé.</p>
        <button type="button" class="link-button" @click="goToCreateGroupe">
          Créer votre premier groupe
        </button>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'
import AppFooter from '../../accueil-ui/composant/AppFooter.vue'
import CallToActionBtn from '../../accueil-ui/composant/CallToActionBtn.vue'
import { groupService } from '../../api/groups' // AJOUT

export default {
  name: 'GroupesListPage',
  components: {
    AppHeader,
    AppFooter,
    CallToActionBtn,
  },
  data() {
    return {
      groupes: [],
      searchTerm: '',
      filterStatut: '',
    }
  },
  computed: {
    filteredGroupes() {
      const term = this.searchTerm.trim().toLowerCase()
      return this.groupes.filter((g) => {
        const matchSearch = !term || g.nom.toLowerCase().includes(term)
        const matchStatut =
          !this.filterStatut ||
          (this.filterStatut === 'public' && g.isPublic) ||
          (this.filterStatut === 'prive' && !g.isPublic)
        return matchSearch && matchStatut
      })
    },
  },
  methods: {
    async loadGroupes() {
      // VERSION API (remplace complètement le localStorage)
      try {
        const { data } = await groupService.list()
        const raw = Array.isArray(data) ? data : data.data

        this.groupes = raw.map((g) => ({
          id: g.id,
          nom: g.nom,
          isPublic: !!g.is_public,
          nbMembres: g.nb_membres ?? (g.members ? g.members.length : 0),
        }))
      } catch (e) {
        console.error('Erreur chargement groupes', e)
        this.groupes = []
      }
    },
    goToCreateGroupe() {
      this.$router.push('/enseignant/groupes/nouveau')
    },
    openGroupe(groupe) {
      this.$router.push(`/enseignant/groupes/${groupe.id}`)
    },
  },
  mounted() {
    this.loadGroupes()
  },
}
</script>

<style scoped>
@import './GroupesListPage.css';
</style>
