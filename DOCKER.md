# Guide Docker pour URC

## Introduction

J'ai dockerisé l'application URC pour faciliter le déploiement et garantir un environnement cohérent sur toutes les plateformes (Windows, Linux, macOS).

## Prérequis

- **Docker Desktop** installé sur votre machine
  - Windows : [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - Linux : [Docker Engine](https://docs.docker.com/engine/install/)
  - macOS : [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Docker Compose** (inclus dans Docker Desktop)

## Fichiers Docker

### Structure

```
urc/
├── Dockerfile              # Image de production (build optimisé)
├── Dockerfile.dev          # Image de développement (avec Vercel Dev)
├── docker-compose.yml      # Configuration production
├── docker-compose.dev.yml  # Configuration développement
├── .dockerignore          # Fichiers exclus du build
└── .env.local             # Variables d'environnement (NE PAS COMMITTER)
```

## Utilisation

### Mode Production

#### 1. Préparer les variables d'environnement

Je m'assure que le fichier `.env.local` contient toutes les variables nécessaires :

```env
POSTGRES_URL="postgres://..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
# ... (voir .env.example pour la liste complète)
```

#### 2. Construire l'image

**Windows (PowerShell)** :
```powershell
docker-compose build
```

**Linux/macOS (Bash)** :
```bash
docker-compose build
```

#### 3. Lancer le conteneur

**Windows (PowerShell)** :
```powershell
docker-compose up -d
```

**Linux/macOS (Bash)** :
```bash
docker-compose up -d
```

L'application sera accessible sur : `http://localhost:3000`

#### 4. Vérifier les logs

```bash
docker-compose logs -f frontend
```

#### 5. Arrêter le conteneur

```bash
docker-compose down
```

### Mode Développement

Le mode développement utilise Vercel Dev avec hot-reload.

#### 1. Lancer en mode développement

**Windows (PowerShell)** :
```powershell
docker-compose -f docker-compose.dev.yml up
```

**Linux/macOS (Bash)** :
```bash
docker-compose -f docker-compose.dev.yml up
```

#### 2. Accéder à l'application

- Frontend : `http://localhost:3000`
- API Functions : `http://localhost:3000/api/*`

#### 3. Arrêter

```bash
docker-compose -f docker-compose.dev.yml down
```

## Commandes Utiles

### Reconstruire l'image (après modification du code)

```bash
docker-compose build --no-cache
```

### Voir les conteneurs en cours d'exécution

```bash
docker ps
```

### Accéder au shell du conteneur

```bash
docker exec -it urc-frontend sh
```

### Nettoyer les images inutilisées

```bash
docker system prune -a
```

### Voir les logs en temps réel

```bash
docker-compose logs -f
```

## Variables d'Environnement

Je configure les variables dans `.env.local` (jamais commité dans Git) :

```env
# PostgreSQL (Neon)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="username"
POSTGRES_HOST="host.neon.tech"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
KV_REST_API_URL="https://your-instance.upstash.io"
KV_REST_API_TOKEN="your-token"
KV_URL="https://your-instance.upstash.io"
REDIS_URL="https://your-instance.upstash.io"
```

## Déploiement

### Sur un serveur Linux

#### 1. Cloner le projet

```bash
git clone https://github.com/MohamedBarbych/urc.git
cd urc
```

#### 2. Créer le fichier .env.local

```bash
nano .env.local
# Je colle mes variables d'environnement
```

#### 3. Lancer Docker Compose

```bash
docker-compose up -d
```

### Avec Docker Hub

#### 1. Construire et tagger l'image

```bash
docker build -t mohammedbarbych/urc:latest .
```

#### 2. Pousser vers Docker Hub

```bash
docker push mohammedbarbych/urc:latest
```

#### 3. Sur le serveur cible

```bash
docker pull mohammedbarbych/urc:latest
docker run -d -p 3000:3000 --env-file .env.local mohammedbarbych/urc:latest
```

## Troubleshooting

### Erreur "Cannot connect to Docker daemon"

**Problème** : Docker Desktop n'est pas lancé

**Solution** : Je lance Docker Desktop et j'attends qu'il soit complètement démarré

### Erreur "Port already in use"

**Problème** : Le port 3000 est déjà utilisé

**Solution** :
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

### Les variables d'environnement ne sont pas chargées

**Problème** : Le fichier `.env.local` n'est pas lu

**Solution** : Je m'assure que le fichier existe et utilise :
```bash
docker-compose --env-file .env.local up
```

### L'application ne se lance pas

**Problème** : Erreur de build ou de dépendances

**Solution** :
```bash
# Je nettoie tout et reconstruis
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up
```

## Architecture Docker

### Image de Production (Dockerfile)

1. **Base** : Node.js 18 Alpine (image légère)
2. **Installation** : Dépendances de production uniquement
3. **Build** : Compilation de l'application React
4. **Serveur** : `serve` pour servir les fichiers statiques
5. **Optimisations** : Multi-stage build, cache npm

### Image de Développement (Dockerfile.dev)

1. **Base** : Node.js 18 Alpine
2. **Outils** : Vercel CLI installé globalement
3. **Installation** : Toutes les dépendances (dev + prod)
4. **Volumes** : Code source monté pour le hot-reload
5. **Développement** : Vercel Dev avec rechargement automatique

## Sécurité

### Bonnes pratiques appliquées

- ✅ Fichier `.dockerignore` pour exclure les fichiers sensibles
- ✅ Variables d'environnement via `.env.local` (non commité)
- ✅ Image Alpine pour réduire la surface d'attaque
- ✅ Utilisateur non-root dans le conteneur
- ✅ Dépendances de production uniquement en prod

### Fichiers à ne JAMAIS committer

- `.env.local`
- `.env.production`
- Tout fichier contenant des secrets ou tokens

## Performance

### Optimisations appliquées

- **Image légère** : Alpine Linux (~5MB base)
- **Cache npm** : Les dépendances sont mises en cache
- **Multi-stage build** : Séparation build/runtime
- **Production build** : Code React minifié et optimisé

### Taille de l'image

- **Production** : ~300MB (avec dépendances)
- **Développement** : ~500MB (avec outils de dev)

## Support Multi-plateforme

Cette configuration Docker fonctionne de manière identique sur :
- ✅ Windows 10/11 (avec Docker Desktop)
- ✅ Linux (Ubuntu, Debian, CentOS, etc.)
- ✅ macOS (Intel et Apple Silicon)

## Conclusion

Avec Docker, je peux déployer l'application URC de manière cohérente et reproductible sur n'importe quelle plateforme. Le professeur pourra tester le projet sans problème de configuration ou de compatibilité système.

Pour toute question, consultez la documentation Docker officielle : https://docs.docker.com
