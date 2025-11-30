# 🐳 Guide de Rendu avec Docker

## Pour le Professeur

Votre projet peut être lancé de deux façons :

### Option 1 : Lancement Ultra-Rapide (Recommandé)

#### Sur Windows
1. Assurez-vous que Docker Desktop est installé et lancé
2. Ouvrez PowerShell dans le dossier du projet
3. Exécutez :
```powershell
.\docker-start.ps1
```
4. Choisissez le mode (Production recommandé)
5. Accédez à http://localhost:3000

#### Sur Linux/macOS
1. Assurez-vous que Docker est installé
2. Ouvrez un terminal dans le dossier du projet
3. Rendez le script exécutable :
```bash
chmod +x docker-start.sh
```
4. Exécutez :
```bash
./docker-start.sh
```
5. Choisissez le mode (Production recommandé)
6. Accédez à http://localhost:3000

### Option 2 : Commandes Docker Manuelles

#### Production
```bash
docker-compose up -d
```
Puis accédez à http://localhost:3000

#### Développement (avec Vercel Dev)
```bash
docker-compose -f docker-compose.dev.yml up -d
```
Puis accédez à http://localhost:3000

## Configuration Requise

Avant de lancer, créez le fichier `.env.local` avec :

```env
# PostgreSQL (Neon) - Fourni dans le fichier de rendu
POSTGRES_URL="..."
POSTGRES_USER="..."
POSTGRES_PASSWORD="..."
POSTGRES_HOST="..."
POSTGRES_DATABASE="..."

# Redis (Upstash) - Fourni dans le fichier de rendu
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

## Commandes Utiles

### Voir les logs
```bash
docker-compose logs -f
```

### Arrêter l'application
```bash
docker-compose down
```

### Reconstruire après modification
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Fonctionnalités Testables

1. **Inscription** : Créez un compte sur `/register`
2. **Connexion** : Connectez-vous sur `/login`
3. **Messages Privés** : Sélectionnez un utilisateur (icône bleue)
4. **Salons Publics** : Sélectionnez un salon (icône violette #)

## Compte de Test Préconfiguré

- **Username** : test
- **Password** : testubo

## Documentation Complète

- **README.md** : Documentation principale du projet
- **DOCKER.md** : Guide Docker détaillé
- **API** : Consultez le README pour les endpoints

## Support

Pour toute question ou problème :
1. Vérifiez que Docker Desktop est bien lancé
2. Vérifiez que les ports 3000 ne sont pas déjà utilisés
3. Consultez DOCKER.md section "Troubleshooting"

---

**Étudiant** : Mohamed Barbych
**Projet** : URC - Universal Real-time Chat
**Date** : Novembre 2025
