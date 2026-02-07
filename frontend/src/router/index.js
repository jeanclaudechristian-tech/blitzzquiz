import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../page/HomePage.vue'
import DesktopConnexion from '../auth-ui/pages/DesktopConnexion.vue'
import DesktopInscriptionPage1 from '../auth-ui/pages/DesktopInscriptionPage1.vue'
import DesktopInscriptionPage2 from '../auth-ui/pages/DesktopInscriptionPage2.vue'
import DesktopCourriel from '../auth-ui/pages/DesktopCourriel.vue'
import DesktopResetMotDePasse from '../auth-ui/pages/DesktopResetMotDePasse.vue'
import DesktopValidation from '../auth-ui/pages/DesktopValidation.vue'
import DesktopSucces from '../auth-ui/pages/DesktopSucces.vue'

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
    }
  ]

  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  export default router