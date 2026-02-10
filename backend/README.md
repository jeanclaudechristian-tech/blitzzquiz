# ⚡ BlizzQuiz - Noyau Backend

[![Docker](https://img.shields.io/badge/Déploiement-Docker_Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
![Laravel](https://img.shields.io/badge/Laravel-12.49.0-FF2D20?style=flat&logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.2.12-777BB4?style=flat&logo=php)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Connecté-4169E1?style=flat&logo=postgresql)

## 📖 À propos du Projet

Ce dépôt contient le cœur du système **BlizzQuiz**, une API RESTful haute performance conçue avec **Laravel 12**. Le projet est structuré pour un environnement conteneurisé via **Docker**, garantissant une isolation optimale.

## 🛠 Spécifications Techniques

* **Architecture** : Basée sur Docker (Laravel, PostgreSQL, Redis).
* **Backend** : Laravel 12.49.0 (PHP 8.2.12 ZTS).
* **Base de données** : PostgreSQL 16+ avec contraintes d'unicité pour Google/Apple ID.
* **Sécurité** : Validation des Tokens JWT pour l'authentification tierce.

## 🚀 Guide de Démarrage (Environnement de Développement)

### 1. Configuration Initiale
* **Clonage** : 
```markdown
git clone https://github.com/jeanclaudechristian-tech/BlitzzQuiz.git
```
* **Variables d'environnement** : Copier `.env.example` et le renommer en `.env`.
* **Ajustement** : Configurer les accès PostgreSQL dans le fichier `.env`.
#### example：
```markdown
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=blizzquiz
DB_USERNAME=postgres
DB_PASSWORD=blizzPassword
```

### 2. Configuration de PHP
* **Vérification** : `php -v`. La version doit être **8.2.12** ou supérieure.
* **Si vous n'avez pas de php ou a un version ancienne:** https://windows.php.net/download/#php-8.2
* **Remplacement** : Si PHP est déjà installé, remplacer le dossier de l'ancienne version par la nouvelle version ZTS.
* **Si la commande `php -v` n'est pas reconnue, suivez ces étapes pour configurer Windows :** 
---
##### Étape 1 : Recherche
* Appuyez sur la touche `Windows`, tapez `Modifier les variables d'environnement système` et ouvrez le premier résultat.
##### Étape 2 : Accès aux Variables
* Dans l'onglet *Paramètres système avancés*, cliquez sur le bouton `Variables d'environnement...` en bas à droite.
##### Étape 3 : Modification du Path
* Dans la section *Variables système* (en bas), sélectionnez la ligne `Path` et cliquez sur `Modifier...`.
##### Étape 4 : Ajout du chemin
* Cliquez sur `Nouveau` et collez le chemin vers votre dossier PHP
---
* **Configuration (php.ini)** :
    * Copier `php.ini-development` (ou `php.ini-production`) et le renommer en `php.ini`.
    * Décommenter les extensions : `extension=pdo_pgsql`, `extension=pgsql`, `extension=openssl`, `extension=mbstring`, `extension=fileinfo`.
    * Décommenter la ligne `extension_dir = "ext"`.

### 3. Gestionnaire de Dépendances (Composer)
Si la commande n'est pas reconnue, installer via https://getcomposer.org/download/
```bash 
# Vérifier si Composer est installé
composer -v

# Installer les dépendances du projet (nécessite le fichier composer.json)
composer install

# Générer la clé de sécurité de l'application Laravel
php artisan key:generate
```

### 4. Base de Données (PostgreSQL)
* **Vérification** : S'assurer que PostgreSQL est installé et actif sur le port 5432.
* **Lien de téléchargement** : [postgresql.org](https://www.postgresql.org/download/).
* Ouvrez pgAdmin 4
* Créer votre mot de passe
* ***Vous devez avoir les mêmes
  `DB_USERNAME`
  `DB_PASSWORD`
dans `.env`***
* **Création manuelle (via pgAdmin 4)** :
    * Si la base n'existe pas, faire un clic droit sur *Databases* > *Create* > *Database...*
    * Nommer la base selon la valeur `DB_DATABASE` de votre `.env`.
* **Migration** : `php artisan migrate`.

### 5. Lancement

```bash
## démarrage
php artisan serve
```
* **Accès** : L'API est disponible sur `http://127.0.0.1:8000`.
---
*Si il y a des question contacter Siyuan(Contributeur DDdemonG) via Email(voir profile), Mio, teams(rarement présent) ou discord(DDdemonG#4483)*
