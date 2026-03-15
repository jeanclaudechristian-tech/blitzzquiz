# 🌐 BlizzQuiz - Interface Web de Distribution

[![Vue](https://img.shields.io/badge/Framework-Vue.js_3.5.27-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Build_Tool-Vite_7.3.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node](https://img.shields.io/badge/Runtime-Node.js_v22.16-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![Docker](https://img.shields.io/badge/Environment-Docker_Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)


## 🚀 Présentation du Déploiement
Le module BlizzQuiz Frontend est l'interface utilisateur officielle, optimisée pour la performance sous Vite 7. Le service est désormais déployé sur Vercel pour garantir une accessibilité mondiale et une haute disponibilité sans aucune dépendance matérielle locale.

* **Plateforme d'hébergement :** Vercel Cloud
* **Point de terminaison :** https://blizzquiz.vercel.app
* **Workflow :** Déploiement continu (CI/CD) via GitHub

---
 
## 📲 Guide d'Accès Rapide (Utilisateurs)

L'accès est désormais simplifié : plus besoin de configuration VPN ou de réseau privé. Suivez simplement ces étapes :

### Accès Direct au Web
Ouvrez simplement votre navigateur (Safari, Chrome) sur n'importe quel appareil, que ce soit votre PC ou votre mobile Le Monde :
**https://blizzquiz.vercel.app**



---
* Note : En raison de l'utilisation de forfaits gratuits (Free Tier) pour les différents services (Vercel, EAS, Railway, Supabase, ect.), des quotas de consommation s'appliquent. Si l'accès est impossible, il est probable que la limite soit atteinte ou que le service ait été suspendu.
---

## 🛠️ Stack Technique et Compatibilité

| Composant | Technologie | Version / Détails |
| :--- | :--- |:------------------|
| **Framework** | Vue.js 3 | Composition API   |
| **Outil de Build** | Vite 7 | Haute performance |
| **Runtime Node** | Node.js | v20.19.0          |

---

## 📦 Méthodes de Déploiement

### Option A : Déploiement Cloud (Standard Vercel)
Cette méthode est le standard de production pour BlizzQuiz. Le déploiement est automatisé via une plateforme Serverless pour garantir une latence minimale.

* **CD (Continuous Deployment) :** Chaque `push` sur GitHub déclenche une nouvelle version.

* **Avantage :** SSL automatique et gestion des certificats sans intervention manuelle.

### Option B : Déploiement par Conteneur (Docker Ready)
Le projet inclut une configuration Docker complète pour un environnement de développement ou de production isolé.

```bash
docker-compose up -d
```
* **Configuration :** Utilise l'image `node:20-bullseye` pour garantir la compatibilité des dépendances.

* **Mappage des ports :** Accès via le port `8088` de l'hôte (redirigé vers le port `3000` du conteneur).

* **Volume :** Le répertoire courant est monté dans `/app` pour permettre le rechargement à chaud (Hot Reload).


## 🔒 Configuration de Sécurité (Vite 7)
Le projet utilise les dernières fonctionnalités de Vite 7 pour sécuriser les échanges :

* **Écoute Globale :** Le serveur est configuré sur 0.0.0.0 dans le conteneur pour accepter les requêtes externes.
* **Protection DNS :** Avec le passage à Vercel, la gestion des allowedHosts est simplifiée et sécurisée par l'infrastructure cloud.

---
*Dernière mise à jour : 15 Mars 2026*