<template>
  <div class="groupe-quizzes-page">
    <AppHeader />
    <main class="groupe-quizzes-main">
      <section class="groupe-quizzes-card">
        <button type="button" class="back-button" @click="goBack">
          ← Retour au dashboard
        </button>

        <h1>{{ groupeNom }}</h1>

        <!-- Liens de navigation en haut de la card -->
        <nav class="card-nav">
          <button
            type="button"
            :class="['nav-link', { 'nav-link--active': activeTab === 'quiz' }]"
            @click="activeTab = 'quiz'"
          >
            Voir quiz
          </button>
          <button
            type="button"
            :class="['nav-link', { 'nav-link--active': activeTab === 'membres' }]"
            @click="activeTab = 'membres'"
          >
            Voir membres
          </button>
          <router-link to="/historique" class="nav-link">Voir historique</router-link>
        </nav>

        <!-- Contenu : quiz -->
        <template v-if="activeTab === 'quiz'">
          <p class="subtitle">Quiz associés à ce groupe</p>
          <div v-if="loading" class="loading-msg">Chargement des quiz...</div>
          <div v-else-if="quizzes.length === 0" class="empty-msg">
            Aucun quiz associé à ce groupe pour le moment.
          </div>
          <div v-else class="quizzes-grid">
          <div
            v-for="quiz in quizzes"
            :key="quiz.id"
            class="quiz-card"
            @click="openQuiz(quiz)"
          >
            <h3>{{ quiz.titre }}</h3>
            <p>{{ quiz.categorie }} • {{ quiz.nbQuestions }} questions</p>
            <button type="button" class="voir-btn">Jouer</button>
          </div>
          </div>
        </template>

        <!-- Contenu : membres -->
        <template v-else-if="activeTab === 'membres'">
          <p class="subtitle">Membres du groupe</p>
          <div v-if="loading" class="loading-msg">Chargement des membres...</div>
          <div v-else-if="membres.length === 0" class="empty-msg">
            Aucun membre dans ce groupe.
          </div>
          <div v-else class="membres-list">
            <div v-for="m in membres" :key="m.id" class="membre-item">
              <span class="membre-name">{{ m.nickname || m.name || m.email || 'Membre' }}</span>
              <span v-if="m.email" class="membre-email">{{ m.email }}</span>
            </div>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<script>
import { groupService } from '../../api/groups'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

export default {
  name: 'EtudiantGroupeQuizzesPage',
  components: {
    AppHeader
  },
  data() {
    return {
      groupeNom: 'Groupe',
      quizzes: [],
      membres: [],
      activeTab: 'quiz',
      loading: true
    }
  },
  methods: {
    goBack() {
      this.$router.push('/etudiant')
    },
    openQuiz(quiz) {
      // L'étudiant est déjà membre (vérifié côté API), on envoie vers le lobby du quiz
      this.$router.push(`/etudiant/quiz/${quiz.id}`)
    },
    async loadGroupeQuizzes() {
      const groupeId = this.$route.params.id
      if (!groupeId) {
        this.$router.push('/etudiant')
        return
      }

      this.loading = true
      try {
        // Récupère les infos du groupe (nom, etc.)
        const { data: groupe } = await groupService.show(groupeId)
        this.groupeNom = groupe.nom
        this.membres = groupe.members || []

        // Récupère les quiz assignés au groupe via GET /api/groups/{id}/quizzes
        const { data: quizzesData } = await groupService.getQuizzes(groupeId)
        this.quizzes = (quizzesData || []).map((q) => ({
          id: q.id,
          titre: q.titre,
          categorie: q.category || '',
          nbQuestions: q.questions_count ?? 0
        }))
      } catch (e) {
        console.error('Erreur chargement quiz du groupe', e)
        this.$router.push('/etudiant')
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.loadGroupeQuizzes()
  }
}
</script>

<style scoped>
@import './EtudiantGroupeQuizzesPage.css';
</style>
