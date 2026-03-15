# ⚡ BlizzQuiz - Noyau Backend

[![Docker](https://img.shields.io/badge/Déploiement-Docker_Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
![Laravel](https://img.shields.io/badge/Laravel-12.49.0-FF2D20?style=flat&logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.2.12-777BB4?style=flat&logo=php)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Connecté-4169E1?style=flat&logo=postgresql)

## 📖 À propos du Projet

Ce dépôt contient l'API RESTful de BlizzQuiz, le moteur haute performance conçu sous Laravel 12. Ce noyau gère l'authentification, la logique des quiz et la synchronisation entre le module Web (Vercel) et le module Mobile (Expo).

---
* Le service API est présentement disponible sur https://laravel-production-da37.up.railway.app/api
---

## 🛠 Spécifications Techniques

* **Architecture** : Basée sur Docker (Laravel, PostgreSQL, Redis).
* **Backend** : Laravel 12.49.0 (PHP 8.2.12 ZTS).
* **Base de données** : PostgreSQL 16+.
* **Sécurité** : Validation des Tokens Sanctum pour l'authentification tierce.

## 🚀 Guide de Démarrage (Environnement de Développement)

## A. Configuration Manuel d'Environnement de Développement

### 1. Configuration des Variables d'Environnement
* **Clonage** : 
```markdown
git clone https://github.com/jeanclaudechristian-tech/BlitzzQuiz.git
```
* **Variables d'environnement** : Copier `.env.example` et le renommer en `.env`.
* **Ajustement** : Configurer les accès PostgreSQL dans le fichier `.env`.
* **Variables de mail, de frontend et de Google Auth**
#### example：
```markdown
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=blizzquiz
DB_USERNAME=postgres
DB_PASSWORD=blizzPassword

# URL de votre frontend
FRONTEND_URL=http://localhost:3000

# Mail service avec resend
MAIL_MAILER=resend
RESEND_API_KEY=Your_Resend_API_Key
MAIL_FROM_ADDRESS=no-reply@Your_Domaine.com
MAIL_FROM_NAME=Your_Mail_Name

# Google Authentication
GOOGLE_CLIENT_ID=Your_Web_Client_ID
GOOGLE_CLIENT_SECRET=Your_web_Client_Secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
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
* **Accès** : L'API est disponible sur `http://127.0.0.1:8000` ou `http://localhost:8000`.
---
## B. Déploiement via Docker (Méthode recommandée)
Le projet est optimisé pour être déployé instantanément sur Railway ou localement via Docker Compose. 
#### ajouter ces deux documents:
docker-compose.yml
```yaml
services:
    backend:
        container_name: blizzquiz-backend
        build:
            context: .
            dockerfile: Dockerfile
        restart: always
        ports:
            - "8001:80" 
        volumes:
            - ./:/var/www
            - ./.env:/var/www/.env
        networks:
            - blizzquiz-network

networks:
    blizzquiz-network:
        driver: bridge

```
dockerfile:
```bash 
FROM php:8.2-apache-alpine

RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    curl-dev \
    icu-dev \
    postgresql-dev

RUN docker-php-ext-install pdo_pgsql mbstring zip pcntl bcmath intl

RUN cp /etc/apache2/httpd.conf /etc/apache2/httpd.conf.bak \
    && sed -i 's/#LoadModule rewrite_module/LoadModule rewrite_module/' /etc/apache2/httpd.conf \
    && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/httpd.conf

ENV APACHE_DOCUMENT_ROOT /var/www/public
RUN sed -ri -e 's!/var/www/localhost/htdocs!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/httpd.conf

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .

RUN chown -R apache:apache storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80

CMD ["httpd", "-D", "FOREGROUND"]
```
Ensuite dans la terminale
```bash
# Lancer l'environnement complet
docker-compose up -d --build
```
* Note : L'image Docker utilise PHP 8.2 Apach pour une performance maximale et une compatibilité avec les extensions requises (pdo_pgsql, openssl, mbstring).
---

## 🔒 Spécifications de Sécurité

* **CORS :** Les en-têtes sont configurés pour accepter les requêtes provenant de l'interface Web hébergée sur Vercel。

* **Sanctum :** Validation des jetons d'authentification pour les utilisateurs.

---
* Note : En raison de l'utilisation de forfaits gratuits (Free Tier) pour les différents services (Vercel, EAS, Railway, Supabase, ect.), des quotas de consommation s'appliquent. Si l'accès est impossible, il est probable que la limite soit atteinte ou que le service ait été suspendu.
---
