# ⚡ BlizzQuiz - Module d'Aperçu Mobile

[![Framework](https://img.shields.io/badge/Framework-Expo_SDK_54-black?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-20232A?logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![iOS](https://img.shields.io/badge/iOS-Ready-lightgrey?logo=apple&logoColor=white)](https://expo.dev/)
[![Android](https://img.shields.io/badge/Android-Ready-3DDC84?logo=android&logoColor=white)](https://expo.dev/)
[![Deployment](https://img.shields.io/badge/Status-EAS_Cloud_Hosted-blue)](https://expo.dev/)

## 🚀 Présentation du Déploiement
Le module **BlizzQuiz Mobile** est désormais hébergé sur le **Cloud Expo (EAS)**. Il permet un aperçu instantané sans aucune configuration réseau complexe, accessible de n'importe où, que vous soyez au Collège Ahuntsic ou ailleurs.

* **Dernière Version :** `test version 1` (avec logo Eclaire)
* **Runtime Version :** `1.0.0`

---

## 📲 Guide d'Installation Rapide (iOS & Android)

Plus besoin de VPN ou de configuration serveur. Suivez simplement ces étapes :

### 1. Préparer le Runtime (Expo Go)
L'application s'exécute via **Expo Go**, évitant ainsi l'installation fastidieuse de fichiers IPA/APK en phase de test.
* **iOS :** [Télécharger sur l'App Store](https://apps.apple.com/app/expo-go/id982107779)
* **Android :** [Télécharger sur Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2. Lancement Immédiat
1. Ouvrez l'application **Expo Go**.
2. Scannez le **QR Code de Production** ci-dessous (généré via EAS).
3. L'application se chargera automatiquement depuis les serveurs d'Expo.
> ✨ **Astuce :** Le premier chargement peut prendre quelques secondes le temps de récupérer le dernier "Bundle" depuis les serveurs d'Expo. Une fois chargé, le logo **Eclaire** s'affichera sur l'écran de démarrage.
![QR Code de Production](https://qr.expo.dev/eas-update?slug=exp&projectId=97e152af-4bb5-42a9-af37-b8464bf15ea8&groupId=6111fe66-4621-496a-968f-87966ff36997&host=u.expo.dev)
>
> [!IMPORTANT]
> **Avis pour l'aperçu Expo Go**：
> En raison des restrictions techniques de l'environnement Expo Go, l'authentification native Google a été désactivée dans cette version d'aperçu. Cette fonctionnalité nécessite un build autonome (.ipa/.apk) pour fonctionner.

---
* Note : En raison de l'utilisation de forfaits gratuits (Free Tier) pour les différents services (Vercel, EAS, Railway, Supabase, ect.), des quotas de consommation s'appliquent. Si l'accès est impossible, il est probable que la limite soit atteinte ou que le service ait été suspendu.
---

## 🛠️ Stack Technique

| Composant | Technologie                       | Détails                              |
| :--- |:----------------------------------|:-------------------------------------|
| **Framework** | Expo SDK 54                       | React Native avec React Compiler     |
| **Distribution** | EAS Update                        | Hébergement Cloud (CDN)              |
| **Animation** | Lottie React Native et Reanimated | Fluidité interactive                 |
| **Compatibilité Android** | Android 6.0+                      | API Level 23+                        |
| **Compatibilité iOS** | iOS 15.1+                         | -                                    |

---
* Pour code source de version ExpoGO, consulte branche `expogo-mobile`
---
*Dernière mise à jour : 15 Mars 2026*