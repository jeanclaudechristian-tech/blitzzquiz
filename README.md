# ⚡ BlizzQuiz - Plateforme de Quiz Multiplateforme

# ⚡ BlizzQuiz - Plateforme de Quiz Multiplateforme

[![Web](https://img.shields.io/badge/Web-Vercel--Ready-black?style=flat&logo=vercel)](https://blizzquiz.vercel.app)
[![API](https://img.shields.io/badge/API-Railway--Ready-0B0D0E?style=flat&logo=railway)](https://laravel-production-da37.up.railway.app/api)
[![Mobile](https://img.shields.io/badge/Mobile-EAS--Ready-000000?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![Env](https://img.shields.io/badge/Env-Docker--Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

[![Vue.js 3](https://img.shields.io/badge/Vue.js_3-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite 7](https://img.shields.io/badge/Vite_7-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Laravel 12](https://img.shields.io/badge/Laravel_12-FF2D20?style=flat&logo=laravel&logoColor=white)](https://laravel.com/)

[![Android](https://img.shields.io/badge/Android-Ready-3DDC84?style=flat&logo=android&logoColor=white)](https://www.android.com/)
[![Apple](https://img.shields.io/badge/Apple-Ready-lightgrey?style=flat&logo=apple&logoColor=white)](https://www.apple.com/)
[![Expo Go](https://img.shields.io/badge/Expo_Go-Compatible-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/client)

**BlizzQuiz** est une solution complète de quiz gamifiés conçue pour rendre l'apprentissage interactif au **Collège Ahuntsic**. Les enseignants créent des questionnaires tandis que les étudiants y répondent via le Web ou Mobile, bénéficiant d'un feedback immédiat et d'un classement (Leaderboard) motivant.

## 🎯 Objectif du projet

Concevoir et développer une plateforme de quiz en ligne conviviale qui prend en charge la création de quiz, la réponse aux questions, le calcul automatique des scores et l’affichage de statistiques de résultats pour les élèves et les enseignants.

## 👥 Utilisateurs cibles

- **Étudiants (9–30 ans)** : répondent aux quiz depuis mobile ou ordinateur, consultent leurs scores et historique.
- **Enseignants** : créent, modifient et publient des quiz, gèrent des groupes, consultent les résultats.
- **Administrateurs** : gèrent les comptes, mots de passe et ont une vue globale sur la plateforme.

## ✨ Fonctionnalités principales (MVP)

- Inscription / connexion (étudiants, enseignants, admin) avec validation de sécurité (force du mot de passe).
- Gestion des rôles et permissions (Étudiant, Enseignant, Admin, Super User).
- Création, modification et suppression de quiz (QCM, questions avec 4 choix et une bonne réponse).
- Gestion des groupes (création de groupes, codes d’invitation, groupes publics/privés).
- Accès aux quiz (liste de quiz, accès par code de quiz, quiz publics/privés).
- Calcul automatique des scores et sauvegarde des résultats en base de données.
- Page de résultats avec score, nombre de bonnes réponses et classement (leaderboard).
- Historique des tentatives pour les étudiants.

Fonctionnalités hors MVP (futures évolutions) : multijoueur temps réel (WebSocket), système de succès/badges, abonnement payant, anti‑cheat avancé.

## 🧱 Architecture & Stack technique

BlitzzQuiz est un projet multiplateforme organisé en trois environnements : frontend web, backend API, et application mobile.

- **Frontend Web**
  - Framework : **Vue 3** + **Vite 7**
  - State management : Pinia
  - Routing : Vue Router
  - UI : Vuetify
  - Autres : Axios (appels API)

- **Backend**
  - Langage / Framework : PHP 8 + Laravel 12 (API REST)
  - Authentification : Sanctum
  - Validation : Laravel Form Requests
  - ORM : Eloquent ORM

- **Mobile**
  - Framework : React Native (code partagé iOS / Android en JS/TS)

- **Base de données**
  - SGBD : PostgreSQL (données relationnelles : Users, Quizzes, Questions, Results, Groups, Assignments)
  - Propriétés : intégrité ACID, bonnes performances pour statistiques et classements (JOIN, agrégations, index).

- **Déploiement (prévu)**
  - Frontend : Vercel ou hébergement Docker + Nginx
  - Backend : Docker sur serveur Linux
  - Base de données : PostgreSQL sous Docker
  - Médias : service type Cloudinary ou S3 (à confirmer)

## 🔒 Limitations et Quotas (Free Tier)
[!NOTE]
En raison de l'utilisation de services gratuits (Free Tier), des limitations de ressources peuvent s'appliquer (Vercel, Railway, EAS). Si un service est inaccessible, il est probable que le quota mensuel ait été atteint ou que le service a été suspendu.

## 📂 Structure du dépôt

Le dépôt est organisé par environnement, chacun avec son propre `README.md` détaillé.

```txt
/.
├── README.md                 
├── backend/
│   └── README.md
├── frontend/
│   └── README.md
└── mobile/
    └── README.md
