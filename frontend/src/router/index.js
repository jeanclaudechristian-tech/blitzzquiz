import { createRouter, createWebHistory } from "vue-router";
import MainPage from "../accueil-ui/MainPage.vue"; 
import DesktopConnexion from "../auth-ui/pages/DesktopConnexion.vue";
import DesktopInscriptionPage1 from "../auth-ui/pages/DesktopInscriptionPage1.vue";
import DesktopInscriptionPage2 from "../auth-ui/pages/DesktopInscriptionPage2.vue";
import DesktopCourriel from "../auth-ui/pages/DesktopCourriel.vue";
import DesktopResetMotDePasse from "../auth-ui/pages/DesktopResetMotDePasse.vue";
import DesktopSucces from "../auth-ui/pages/DesktopSucces.vue";
import EnseignantDashboard from "../enseignant-ui/pages/EnseignantDashboard.vue";
import EditQuizPage from "../enseignant-ui/pages/EditQuizPage.vue";
import QuizQuestionsPage from "../enseignant-ui/pages/QuizQuestionsPage.vue";
import PrevisualiserQuestions from "../enseignant-ui/pages/PrevisualiserQuestions.vue";
import EtudiantDashboard from "../etudiant-ui/pages/EtudiantDashboard.vue";
// ❌ Supprimé : QuizCataloguePage (Ancien catalogue)
// ❌ Supprimé : EnterQuizCodePage (Géré par CodeModal)
// ❌ Supprimé : EnterGroupCodePage (Géré par CodeModal)
import EtudiantGroupeQuizzesPage from "../etudiant-ui/pages/EtudiantGroupeQuizzesPage.vue";
import EtudiantQuizResultPage from "../etudiant-ui/pages/EtudiantQuizResultPage.vue";
import LeaderboardPage from "../classement-ui/pages/LeaderboardPage.vue";
import HistoriquePage from "../historique-ui/pages/HistoriquePage.vue";
import AdminDashboard from "../admin-ui/pages/AdminDashboard.vue";
import UsersListPage from "../admin-ui/pages/UsersListPage.vue";
import SuperAdminView from "../admin-ui/pages/SuperAdminView.vue";
import GroupesListPage from "../enseignant-ui/pages/GroupesListPage.vue";
import GroupeDetailsPage from "../enseignant-ui/pages/GroupeDetailsPage.vue";
import EtudiantProfil from "../etudiant-ui/pages/EtudiantProfil.vue";

// ✅ AJOUTÉ : Import pour la page de tes groupes
import EtudiantGroupesPage from "../etudiant-ui/pages/EtudiantGroupesPage.vue"; 

// === LES DEUX IMPORTS QUIZ ===
import QuizPlayOverlay from "../quiz-ui/quiz.vue"; 
import QuizCatalogue from "../catalogue/QuizCatalogue.vue"; 

const routes = [
  {
    path: "/",
    name: "Home",
    component: MainPage,
  },
  {
    // 🎯 LE CATALOGUE UNIQUE POUR TOUT LE MONDE
    path: "/catalogue",
    name: "CataloguePublic",
    component: QuizCatalogue,
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
    path: "/inscription/success",
    name: "InscriptionSuccess",
    component: () => import("../auth-ui/pages/InscriptionSuccess.vue"),
  },
  {
    path: "/verify-email",
    name: "VerifyEmail",
    component: () => import("../auth-ui/pages/DesktopEmailVerify.vue"),
  },
  {
    path: "/reset-courriel",
    name: "ResetCourriel",
    component: DesktopCourriel,
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: DesktopResetMotDePasse,
  },
  {
    path: "/succes",
    name: "Succes",
    component: DesktopSucces,
  },
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
    redirect: { path: "/enseignant", query: { mode: "quiz" } },
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
    redirect: { path: "/enseignant", query: { mode: "groupe" } },
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
    // ✅ AJOUTÉ : La route pour les groupes de l'étudiant
    path: "/etudiant/mes-groupes",
    name: "EtudiantMesGroupes",
    component: EtudiantGroupesPage,
  },
  {
    path: "/etudiant/groupes/:id/quiz",
    name: "EtudiantGroupeQuizzes",
    component: EtudiantGroupeQuizzesPage,
  },
  {
    // 🎯 ROUTE UNIQUE POUR JOUER (MODALE 3D)
    path: "/etudiant/quiz/:id/jouer",
    name: "EtudiantQuizPlay",
    component: QuizPlayOverlay,
    props: true,
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
  {
    path: "/etudiant/profil",
    name: "etudiant-profil",
    component: EtudiantProfil,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
});

router.beforeEach((to, from, next) => {
  // 假设你把用户信息存在 localStorage 或 Pinia 里
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAuthenticated = !!user.id;
  const userRole = user.role; // 'STUDENT', 'TEACHER', 'ADMIN'

  // 1. 保护所有以 /admin 开头的路由
  if (to.path.startsWith('/admin')) {
    if (isAuthenticated && userRole === 'ADMIN') {
      next(); // 只有管理员可以进入
    } else {
      next('/connexion'); // 否则踢回登录页
    }
  }
  // 2. 保护超级管理员页面
  else if (to.path === '/admin/super') {
    if (user.role === 'ADMIN') { // 或者由后端在登录时返回一个 isSuper 标记
      next();
    } else {
      next('/admin');
    }
  }
  else {
    next();
  }
});

export default router;
