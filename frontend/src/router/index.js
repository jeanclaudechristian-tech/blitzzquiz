import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../page/HomePage.vue";
import DesktopConnexion from "../auth-ui/pages/DesktopConnexion.vue";
import DesktopInscriptionPage1 from "../auth-ui/pages/DesktopInscriptionPage1.vue";
import DesktopInscriptionPage2 from "../auth-ui/pages/DesktopInscriptionPage2.vue";
import DesktopCourriel from "../auth-ui/pages/DesktopCourriel.vue";
import DesktopResetMotDePasse from "../auth-ui/pages/DesktopResetMotDePasse.vue";
import DesktopSucces from "../auth-ui/pages/DesktopSucces.vue";
import EnseignantDashboard from "../enseignant-ui/pages/EnseignantDashboard.vue";
import QuizCreatePage from "../enseignant-ui/pages/QuizCreatePage.vue";
import EditQuizPage from "../enseignant-ui/pages/EditQuizPage.vue";
import QuizQuestionsPage from "../enseignant-ui/pages/QuizQuestionsPage.vue";
import PrevisualiserQuestions from "../enseignant-ui/pages/PrevisualiserQuestions.vue";
import EtudiantDashboard from "../etudiant-ui/pages/EtudiantDashboard.vue";
import QuizCataloguePage from "../etudiant-ui/pages/QuizCataloguePage.vue";
import EnterQuizCodePage from "../etudiant-ui/pages/EnterQuizCodePage.vue";
import EtudiantQuizLobbyPage from "../etudiant-ui/pages/EtudiantQuizLobbyPage.vue";
import EtudiantQuizPlayPage from "../etudiant-ui/pages/EtudiantQuizPlayPage.vue";
import EtudiantQuizLoadingPage from "../etudiant-ui/pages/EtudiantQuizLoadingPage.vue";
import EtudiantQuizResultPage from "../etudiant-ui/pages/EtudiantQuizResultPage.vue";
import LeaderboardPage from "../classement-ui/pages/LeaderboardPage.vue";
import HistoriquePage from "../historique-ui/pages/HistoriquePage.vue";
import AdminDashboard from "../admin-ui/pages/AdminDashboard.vue";
import UsersListPage from "../admin-ui/pages/UsersListPage.vue";
import SuperAdminView from "../admin-ui/pages/SuperAdminView.vue";
import GroupesListPage from "../enseignant-ui/pages/GroupesListPage.vue";
import GroupeCreatePage from "../enseignant-ui/pages/GroupeCreatePage.vue";
import GroupeDetailsPage from "../enseignant-ui/pages/GroupeDetailsPage.vue";

const routes = [
  {
  path: '/etudiant/quiz/code/:code/lobby',
  name: 'EtudiantQuizLobby',
  component: EtudiantQuizLobbyPage,
},
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/home",
    redirect: "/",
  },
  {
    path: "/connexion",
    name: "Connexion",
    component: DesktopConnexion,
  },
  {
    path: "/inscription",
    name: "Inscription1",
    component: DesktopInscriptionPage1,
  },
  {
    path: "/inscription/details",
    name: "Inscription2",
    component: DesktopInscriptionPage2,
  },
  {
    path: "/reset-courriel",
    name: "ResetCourriel",
    component: DesktopCourriel,
  },
  {
    path: "/reset-mot-de-passe",
    name: "ResetMotDePasse",
    component: DesktopResetMotDePasse,
  },
  {
    path: "/succes",
    name: "Succes",
    component: DesktopSucces,
  },
  // ROUTE CALLBACK ACTIVÉE
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: () => import("@/auth-ui/AuthCallback.vue"),
  },
  {
    path: "/enseignant",
    name: "EnseignantDashboard",
    component: EnseignantDashboard,
  },
  {
    path: "/enseignant/quiz/nouveau",
    name: "QuizCreate",
    component: QuizCreatePage,
  },
  {
    path: "/enseignant/quiz/:id/editer",
    name: "QuizEdit",
    component: EditQuizPage,
  },
  {
    path: "/enseignant/quiz/:id/questions",
    name: "QuizQuestions",
    component: QuizQuestionsPage,
  },
  {
    path: "/enseignant/quiz/:id/previsualiser",
    name: "PrevisualiserQuestions",
    component: PrevisualiserQuestions,
  },
  {
    path: "/enseignant/groupes",
    name: "GroupesList",
    component: GroupesListPage,
  },
  {
    path: "/enseignant/groupes/nouveau",
    name: "GroupeCreate",
    component: GroupeCreatePage,
  },
  {
    path: "/enseignant/groupes/:id",
    name: "GroupeDetails",
    component: GroupeDetailsPage,
  },
  {
    path: "/etudiant",
    name: "EtudiantDashboard",
    component: EtudiantDashboard,
  },
  {
    path: "/etudiant/catalogue",
    name: "EtudiantCatalogue",
    component: QuizCataloguePage,
  },
  {
    path: "/etudiant/code",
    name: "EtudiantEnterCode",
    component: EnterQuizCodePage,
  },
  {
    path: "/etudiant/quiz/:id",
    name: "EtudiantQuizLobby",
    component: EtudiantQuizLobbyPage,
  },
  {
    path: "/etudiant/quiz/:id/jouer",
    name: "EtudiantQuizPlay",
    component: EtudiantQuizPlayPage,
  },
  {
    path: "/etudiant/quiz/:id/loading",
    name: "EtudiantQuizLoading",
    component: EtudiantQuizLoadingPage,
  },
  {
    path: "/etudiant/quiz/:id/resultat",
    name: "EtudiantQuizResult",
    component: EtudiantQuizResultPage,
  },
  {
    path: "/classement",
    name: "Leaderboard",
    component: LeaderboardPage,
  },
  {
    path: "/historique",
    name: "Historique",
    component: HistoriquePage,
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    component: AdminDashboard,
  },
  {
    path: "/admin/users",
    name: "AdminUsersList",
    component: UsersListPage,
  },
  {
    path: "/admin/super",
    name: "SuperAdmin",
    component: SuperAdminView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
