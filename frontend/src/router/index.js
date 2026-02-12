import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../page/HomePage.vue'
import DesktopConnexion from '../auth-ui/pages/DesktopConnexion.vue'
import DesktopInscriptionPage1 from '../auth-ui/pages/DesktopInscriptionPage1.vue'
import DesktopInscriptionPage2 from '../auth-ui/pages/DesktopInscriptionPage2.vue'
import DesktopCourriel from '../auth-ui/pages/DesktopCourriel.vue'
import DesktopResetMotDePasse from '../auth-ui/pages/DesktopResetMotDePasse.vue'
import DesktopValidation from '../auth-ui/pages/DesktopValidation.vue'
import DesktopSucces from '../auth-ui/pages/DesktopSucces.vue'
import EnseignantDashboard from '../enseignant-ui/pages/EnseignantDashboard.vue'
import QuizCreatePage from '../enseignant-ui/pages/QuizCreatePage.vue'
import EditQuizPage from '../enseignant-ui/pages/EditQuizPage.vue'
import QuizQuestionsPage from '../enseignant-ui/pages/QuizQuestionsPage.vue'

const routes = [
    {
      path: '/',
      name: 'Home',
      component: HomePage
    },
    {
      path: '/home',
      redirect: '/'
    },
    {
      path: '/connexion',
      name: 'Connexion',
      component: DesktopConnexion
    },
    {
      path: '/inscription',
      name: 'Inscription1',
      component: DesktopInscriptionPage1
    },
    {
      path: '/inscription/details',
      name: 'Inscription2',
      component: DesktopInscriptionPage2
    },
    {
      path: '/reset-courriel',
      name: 'ResetCourriel',
      component: DesktopCourriel
    },
    {
      path: '/reset-mot-de-passe',
      name: 'ResetMotDePasse',
      component: DesktopResetMotDePasse
    },
    {
      path: '/validation',
      name: 'Validation',
      component: DesktopValidation
    },
    {
      path: '/succes',
      name: 'Succes',
      component: DesktopSucces
    },
    {
      path: '/enseignant',
      name: 'EnseignantDashboard',
      component: EnseignantDashboard
    },
    {
      path: '/enseignant/quiz/nouveau',
      name: 'QuizCreate',
      component: QuizCreatePage
    },
    {
      path: '/enseignant/quiz/:id/editer',
      name: 'QuizEdit',
      component: EditQuizPage
    },
    {
      path: '/enseignant/quiz/:id/questions',
      name: 'QuizQuestions',
      component: QuizQuestionsPage
    }
  ]

  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  export default router