# 🚀 Comment Lancer le Projet URC

## ⚠️ Problème Identifié

Vercel Dev sur Windows ne charge pas automatiquement le fichier `.env.local`. Les variables d'environnement doivent être configurées manuellement.

## ✅ Solution - Commande de Lancement

Utilisez cette commande pour lancer le projet avec les bonnes variables Redis :

```powershell
cd "C:\Users\dell\Desktop\urc (2)"
$env:Path="C:\Windows\System32;$env:Path"
$env:UPSTASH_REDIS_REST_URL="https://legible-skink-25746.upstash.io"
$env:UPSTASH_REDIS_REST_TOKEN="AWSSAAIncDIyNDJmZWZiMDIwMGQ0MTFkYjRmMDNmMTI1OTNlNjg1ZXAyMjU3NDY"
vercel dev
```

## 📋 Étapes Détaillées

### 1. Ouvrir PowerShell
- Appuyez sur `Win + X`
- Choisissez "Windows PowerShell" ou "Terminal"

### 2. Copier-Coller la Commande
Copiez cette commande complète en une seule fois :

```powershell
cd "C:\Users\dell\Desktop\urc (2)"; $env:Path="C:\Windows\System32;$env:Path"; $env:UPSTASH_REDIS_REST_URL="https://legible-skink-25746.upstash.io"; $env:UPSTASH_REDIS_REST_TOKEN="AWSSAAIncDIyNDJmZWZiMDIwMGQ0MTFkYjRmMDNmMTI1OTNlNjg1ZXAyMjU3NDY"; vercel dev
```

### 3. Attendez la Compilation
Vous verrez :
```
Vercel CLI 48.12.0
> Running Dev Command "npm start"
Starting the development server...
> Ready! Available at http://localhost:3000
Compiled successfully!
```

### 4. Testez l'Application
Ouvrez votre navigateur : `http://localhost:3000`

## 🧪 Test d'Inscription

1. Allez sur `http://localhost:3000/register`
2. Remplissez avec un **nouveau** username/email :
   - Username: `testuser2025` (ou n'importe quel nom unique)
   - Email: `test2025@example.com`
   - Password: `123456` (minimum 6 caractères)
3. Cliquez sur "S'INSCRIRE"

**Résultat attendu :**
- ✅ Pas d'erreur "fetch failed"
- ✅ Redirection vers `/messages`
- ✅ Session active

## 🔧 Alternative : Script PowerShell

### Créer un fichier `launch.ps1`

Créez un fichier `launch.ps1` dans le dossier du projet avec ce contenu :

```powershell
# Lancement URC avec variables Redis
Write-Host "🚀 Lancement URC..." -ForegroundColor Cyan

$env:Path = "C:\Windows\System32;$env:Path"
$env:UPSTASH_REDIS_REST_URL = "https://legible-skink-25746.upstash.io"
$env:UPSTASH_REDIS_REST_TOKEN = "AWSSAAIncDIyNDJmZWZiMDIwMGQ0MTFkYjRmMDNmMTI1OTNlNjg1ZXAyMjU3NDY"

Write-Host "Variables Redis configurees" -ForegroundColor Green
vercel dev
```

### Utiliser le Script

```powershell
cd "C:\Users\dell\Desktop\urc (2)"
.\launch.ps1
```

## ❗ En cas d'Erreur "fetch failed"

Si vous voyez toujours l'erreur, vérifiez les logs du terminal pour voir :
- Est-ce que l'erreur mentionne `big-hawk-19843` ? → Mauvaises variables
- Est-ce que l'erreur mentionne `legible-skink-25746` ? → Problème de connexion Upstash

### Diagnostic

```powershell
# Vérifier que les variables sont bien configurées
echo $env:UPSTASH_REDIS_REST_URL
# Devrait afficher: https://legible-skink-25746.upstash.io

# Tester la connexion à Upstash
Test-Connection legible-skink-25746.upstash.io
```

## 📊 Flux de l'Application

1. **Frontend** (`http://localhost:3000`) → React App
2. **API** (`http://localhost:3000/api/*`) → Edge Functions
   - `/api/register` - Inscription
   - `/api/login` - Connexion
   - `/api/messages` - Messages
   - `/api/users` - Utilisateurs
   - `/api/rooms` - Salons

## 🎯 Comptes de Test

### Compte Existant
- **Username:** `test`
- **Password:** `testubo`

### Nouveaux Comptes
Créez-en via `/register` avec des usernames uniques

## 🛑 Arrêter le Serveur

Appuyez sur `Ctrl + C` dans le terminal

## 📚 Fichiers Importants

- `.env.local` - Variables d'environnement (ne PAS commit)
- `api/` - Routes API (Edge Functions)
- `src/` - Code React (Frontend)
- `package.json` - Dépendances
- `vercel.json` - Configuration Vercel

---

**Date:** 30 novembre 2025
**Problème résolu:** Variables Redis non chargées par Vercel Dev
**Solution:** Configuration manuelle via PowerShell

