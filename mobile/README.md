# 📱 BlizzQuiz - Module d'Aperçu Mobile

[![Hôte](https://img.shields.io/badge/Host-Emperor-orange?logo=ubuntu&logoColor=white)](http://emperor.tail28a528.ts.net)
[![Network](https://img.shields.io/badge/Network-Tailscale-9993FF?logo=tailscale&logoColor=white)](https://tailscale.com/)
[![Framework](https://img.shields.io/badge/Framework-Expo_SDK_51-black?logo=expo&logoColor=white)](https://expo.dev/)

## 🚀 Présentation du Déploiement
Le module BlizzQuiz Mobile est un environnement d'aperçu en temps réel basé sur **Expo**. Il permet de valider les fonctionnalités mobiles directement sur votre appareil **Le Monde** (iPhone 17).

* **Hôte de service :** Emperor (Ubuntu 24.04 LTS)
* **Adresse Tailscale :** http://emperor.tail28a528.ts.net:8086
* **Statut de gestion :** Administré via CasaOS

---

## 📲 Guide d'Installation Rapide

Pour tester l'application sur votre iPhone ou Android, suivez ces étapes :

### 1. Rejoindre le Réseau (Tailscale)
Le serveur est sur un réseau privé. Sans cela, l'application ne pourra pas se connecter à **Emperor**.
* **Télécharger :** [Tailscale pour iOS/Android](https://tailscale.com/download)
* **Connexion :** Connectez-vous au compte autorisé.
* **Vérification :** Assurez-vous que le statut est "Active" et que le nœud `emperor` est joignable.

### 2. Installer le Runtime (Expo Go)
Expo Go permet d'exécuter le code de développement sans compiler de fichier IPA/APK.
* **Télécharger iOS :** [Expo Go sur l'App Store](https://apps.apple.com/app/expo-go/id982107779)
* **Télécharger Android :** [Expo Go sur Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 3. Lancement
1. Ouvrez **Expo Go**.
2. Scannez le QR Code fourni par le terminal ou saisissez l'URL : `exp://emperor.tail28a528.ts.net:8086`.
![QR.png](QR.png)
3. 
> ⚠️ **Note Importante :** Vous devez être membre du réseau Tailscale de **Siyuan** pour accéder au serveur. Si vous n'avez pas d'accès, une erreur de réseau apparaîtra.

---

## 🛠️ Stack Technique

| Composant | Technologie | Version / Détails |
| :--- | :--- | :--- |
| **Framework** | Expo (React Native Web) | SDK 51+ |
| **Runtime Node** | Node.js | v20.19.0 (Bullseye) |
| **Réseau** | Tailscale Mesh | Sécurisé de bout en bout |

---

## 📦 Méthodes de Déploiement (Admin)

### Option A : Déploiement via Docker (Recommandé)
```bash
cd /DevMultiRuntime/BlizzQuiz/mobile/
sudo docker compose up -d
```

### Option B : Déploiement Temporaire Dans Terminale Windows (Développement local)
```bash
npm install
npx expo start
```

---
*Dernière mise à jour : Janvier 2026*