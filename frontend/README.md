# 🌐 BlizzQuiz - Interface Web de Distribution

[![Hôte](https://img.shields.io/badge/Host-Emperor-orange?logo=ubuntu&logoColor=white)](http://emperor.tail28a528.ts.net)
[![Network](https://img.shields.io/badge/Network-Tailscale-9993FF?logo=tailscale&logoColor=white)](https://tailscale.com/)
[![Managed by](https://img.shields.io/badge/Admin-CasaOS-00D1FF?logo=docker&logoColor=white)]()


## 🚀 Présentation du Déploiement
Le module BlizzQuiz Frontend est l'interface utilisateur officielle, optimisée pour la performance et la sécurité sous **Vite 7**. Ce service est exposé de manière indépendante pour garantir une haute disponibilité sur le réseau Tailscale.

* **Nœud d'hébergement :** Emperor (Ubuntu 24.04 LTS)
* **Point de terminaison :** [http://emperor.tail28a528.ts.net:8088](http://emperor.tail28a528.ts.net:8088)
* **Intégration :** Détection automatique et gestion via CasaOS

---
 
## 📲 Guide d'Accès Rapide (Utilisateurs)

Pour accéder aux modules BlizzQuiz depuis votre appareil mobile (ex: **Le Monde**) ou un autre client, suivez ces étapes :

### 1. Préparer la Connexion (Tailscale)
Le réseau est sécurisé via un maillage privé. Vous devez être membre du réseau Tailscale pour atteindre l'hôte **Emperor**.
* **Téléchargement :** [Installer Tailscale](https://tailscale.com/download) (iOS, Android, Windows, macOS).
* **Configuration :** Connectez-vous avec vos identifiants autorisés et vérifiez que le nœud `emperor` est bien visible dans votre liste de serveurs.

### 2. Accéder à l'Interface Web (8088)
Ouvrez simplement votre navigateur (Safari, Chrome) et accédez à l'URL suivante :
> [http://emperor.tail28a528.ts.net:8088](http://emperor.tail28a528.ts.net:8088)

### 3. Explorer le Module Mobile (Expo Go)
Pour tester les fonctionnalités natives sans installation complète :
* **Téléchargement :** Installez **Expo Go** depuis l'App Store ou le Google Play Store.
* **Lancement :** 1. Assurez-vous que Tailscale est actif.
    2. Ouvrez l'application **Expo Go**.
    3. Scannez le QR Code généré par le serveur sur le port `8086` ou entrez manuellement l'URL de développement fournie par l'administrateur.

---
💡 *Note : Vous devez être dans le réseau Tailscale de Siyuan (contributeur) pour pouvoir se connecter via Tailscale. Si vous n'êtes pas connecté avec Siyuan, déploie-le localement.*

---

## 🛠️ Stack Technique et Compatibilité

| Composant | Technologie | Version / Détails |
| :--- | :--- | :--- |
| **Framework** | Vue.js 3 | Composition API |
| **Outil de Build** | Vite 7 | Haute performance |
| **Runtime Node** | Node.js | v20.19.0 (Bullseye) |
| **Sécurité** | DNS Filtering | `allowedHosts` configuré pour Emperor |

---

## 📦 Méthodes de Déploiement

### Option A : Déploiement par Conteneur (Standard Emperor)
Cette méthode utilise Docker Compose pour mapper le répertoire physique `/DevMultiRuntime/` vers l'environnement de production isolé.

```yaml
# Extrait de la configuration docker-compose.yaml
services:
  blizzquiz-web:
    image: node:20-bullseye
    ports:
      - "8088:3000" # Accès externe 8088 (évite conflit Picard 8081)
    command: npm run dev -- --host 0.0.0.0
```

* **Commande de relance :** `docker restart blizzquiz-web`

### Option B : Déploiement Temporaire Dans Terminale Windows (Développement local)
Pour une exécution sans virtualisation sur le nœud **Emperor**.

```bash
# 1. Installation des dépendances (via PowerShell ou CMD)
npm install

# 2. Lancement avec exposition réseau
npm run dev -- --host
```

---

## 🔒 Configuration de Sécurité (Vite 7)
Pour permettre l'accès via le domaine Tailscale, la configuration `vite.config.js` inclut une protection contre le détournement de DNS :

* **Hôtes autorisés :** `emperor.tail28a528.ts.net` est explicitement déclaré dans `server.allowedHosts`.
* **Écoute globale :** Le serveur est configuré sur `0.0.0.0` pour accepter les requêtes externes au conteneur.

---
*Dernière mise à jour : Janvier 2026*