<template>
  <div class="groupe-quizzes-page">
    <AppHeader />
    <main class="groupe-quizzes-main">
      <section class="groupe-quizzes-card">
        <button type="button" class="back-button" @click="goBack">
          ← Retour au dashboard
        </button>

        <h1>{{ groupeNom }}</h1>
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
