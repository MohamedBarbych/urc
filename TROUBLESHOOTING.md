# 🔧 Guide de Dépannage - Problème Redis Résolu

## 🐛 Problème Identifié

**Symptôme:** L'inscription d'utilisateur créait bien l'utilisateur dans PostgreSQL, mais retournait une erreur `{"code":"INTERNAL_ERROR","message":"fetch failed"}`.

**Cause:** Le code dans `api/register.js` essayait de stocker le token de session dans Redis (ligne 76-79), mais Redis utilisait encore les anciennes credentials de `big-hawk-19843.upstash.io` (base supprimée).

## ✅ Solution Appliquée

### 1. Mise à jour du fichier `.env.local`

Toutes les variables Redis ont été mises à jour pour pointer vers la nouvelle base :
- **Ancienne:** `big-hawk-19843.upstash.io` ❌
- **Nouvelle:** `legible-skink-25746.upstash.io` ✅

Variables mises à jour :
```bash
KV_REST_API_URL="https://legible-skink-25746.upstash.io"
KV_REST_API_TOKEN="AWSSAAIncDIyNDJmZWZiMDIwMGQ0MTFkYjRmMDNmMTI1OTNlNjg1ZXAyMjU3NDY"
KV_URL="rediss://default:...@legible-skink-25746.upstash.io:6379"
REDIS_URL="rediss://default:...@legible-skink-25746.upstash.io:6379"
UPSTASH_REDIS_REST_URL="https://legible-skink-25746.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AWSSAAIncDIyNDJmZWZiMDIwMGQ0MTFkYjRmMDNmMTI1OTNlNjg1ZXAyMjU3NDY"
```

### 2. Redémarrage complet du serveur

**Important:** Vercel Dev ne recharge pas automatiquement les variables d'environnement. Il faut :

1. Arrêter complètement le serveur (Ctrl+C ou `taskkill`)
2. Relancer avec : `vercel dev`

## 🧪 Comment Tester

### Test 1 : API Redis directe
```powershell
curl http://localhost:3000/api/test-redis
```

**Résultat attendu:** Pas d'erreur `ENOTFOUND big-hawk-19843`

### Test 2 : Inscription d'utilisateur
1. Allez sur `http://localhost:3000/register`
2. Remplissez le formulaire avec un **nouveau** username/email
3. Cliquez sur "S'INSCRIRE"

**Résultat attendu:** 
- ✅ Redirection vers la page de messages
- ✅ Token de session stocké dans Redis
- ✅ Utilisateur créé dans PostgreSQL

### Test 3 : Vérifier les données

#### Dans Neon (PostgreSQL)
```sql
SELECT * FROM users ORDER BY created_on DESC LIMIT 5;
```

#### Dans Upstash (Redis)
Console Upstash → Data Browser → Vérifier les clés

## 📋 Checklist de Vérification

Avant de tester l'inscription, vérifiez :

- [ ] Le fichier `.env.local` contient `legible-skink-25746.upstash.io` (pas `big-hawk-19843`)
- [ ] Vercel Dev est complètement redémarré
- [ ] Le serveur affiche "Ready! Available at http://localhost:3000"
- [ ] Aucune erreur `ENOTFOUND` dans les logs
- [ ] Le username/email est unique (pas déjà dans la DB)

## 🔍 Commandes de Diagnostic

### Vérifier les variables Redis dans .env.local
```powershell
cd "C:\Users\dell\Desktop\urc (2)"
Select-String -Path ".env.local" -Pattern "UPSTASH_REDIS|KV_REST_API_URL"
```

### Vérifier les processus en cours
```powershell
Get-Process -Name node,vercel -ErrorAction SilentlyContinue
```

### Arrêter tous les serveurs
```powershell
taskkill /F /IM node.exe /T
taskkill /F /IM vercel.exe /T
```

### Relancer proprement
```powershell
$env:Path = "C:\Windows\System32;$env:Path"
cd "C:\Users\dell\Desktop\urc (2)"
vercel dev
```

## 💡 Astuces

### Script de lancement automatique

Utilisez le fichier `start-dev.ps1` créé :
```powershell
cd "C:\Users\dell\Desktop\urc (2)"
.\start-dev.ps1
```

### En cas de problème persistant

1. **Vérifier Upstash Console:**
   - Allez sur https://console.upstash.com/
   - Vérifiez que `legible-skink-25746` est actif
   - Testez la connexion avec le bouton "Connect"

2. **Vérifier Vercel Dashboard:**
   - Allez sur https://vercel.com/dashboard
   - Projet `urc` → Storage
   - Vérifiez que `dosinew-react` (Redis) est connecté

3. **Synchroniser les variables:**
   ```powershell
   vercel env pull .env.local --yes
   ```

## 📊 Flux de l'Inscription

1. **Frontend** (`RegisterPage.jsx`) → Envoi POST `/api/register`
2. **API** (`api/register.js`) :
   - ✅ Validation des données
   - ✅ Hash du mot de passe
   - ✅ **Connexion PostgreSQL** → Insertion utilisateur
   - ❌ **Connexion Redis** → Stockage token (c'était ici l'erreur !)
   - ✅ Retour du token au frontend
3. **Frontend** → Redirection vers `/messages`

## 🎯 Prochaines Étapes

Une fois l'inscription fonctionnelle :

1. ✅ Tester la connexion avec un utilisateur existant
2. ✅ Tester l'envoi de messages
3. ⚠️ Configurer Pusher Beams (optionnel - notifications push)
4. 🚀 Déployer sur Vercel : `vercel --prod`

---

**Date de résolution:** 30 novembre 2025
**Problème:** Variables Redis obsolètes
**Solution:** Mise à jour vers `legible-skink-25746.upstash.io`
