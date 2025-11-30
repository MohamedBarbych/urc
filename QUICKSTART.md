# 🚀 Guide de Démarrage Rapide - URC

## ✅ Installation terminée !

Les dépendances ont été installées et Vercel CLI est prêt.

## 📋 Étapes suivantes

### 1. Configurer les variables d'environnement

Vous devez remplir le fichier `.env.local` avec vos propres clés.

#### A. Vercel Postgres (Neon)

1. Allez sur https://vercel.com/dashboard
2. Créez/Accédez à votre projet
3. Allez dans **Storage** → Créez une base **Postgres (Neon)**
4. Une fois créée, cliquez sur **Open in Neon**
5. Dans Neon, allez dans **SQL Editor** et exécutez le script `scripts/db.sql`
6. Retournez sur Vercel → **Settings** → **Environment Variables**
7. Copiez toutes les variables commençant par `POSTGRES_*` dans votre `.env.local`

Variables nécessaires :
```
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
```

#### B. Upstash Redis

1. Allez sur https://console.upstash.com/
2. Créez un compte / Connectez-vous
3. Créez une nouvelle base **Redis**
4. Copiez les valeurs **REST URL** et **REST TOKEN**
5. Ajoutez-les dans `.env.local` :

```
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

#### C. Pusher Beams (Notifications Push)

1. Allez sur https://dashboard.pusher.com/beams
2. Créez un compte / Connectez-vous
3. Créez une nouvelle instance **Beams**
4. Copiez **Instance ID** et **Secret Key**
5. Ajoutez-les dans `.env.local` :

```
PUSHER_INSTANCE_ID=your_instance_id
PUSHER_SECRET_KEY=your_secret_key
```

### 2. Lancer le projet

Une fois les variables configurées, vous pouvez lancer le projet avec :

```bash
# Option 1 : Mode React standard (port 3000)
npm start

# Option 2 : Mode Vercel (recommandé pour tester les API Edge)
vercel dev
```

### 3. Tester la connexion

Un utilisateur par défaut est créé via le script SQL :
- **Username:** `test`
- **Password:** `testubo`

## 🔧 Commandes utiles

```bash
# Installer les dépendances
npm install

# Lier le projet à Vercel (optionnel)
vercel link

# Récupérer automatiquement les variables d'environnement depuis Vercel
vercel env pull .env.local

# Lancer en développement
npm start          # React Dev Server (port 3000)
vercel dev         # Vercel Dev Server (port 3000)

# Build pour production
npm run build
```

## ❗ Problèmes fréquents

### "vercel: command not found"
→ Réinstallez globalement : `npm install -g vercel`

### Erreurs de connexion à la base de données
→ Vérifiez que toutes les variables `POSTGRES_*` sont remplies dans `.env.local`

### Erreurs Redis
→ Vérifiez `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`

### Notifications ne fonctionnent pas
→ Vérifiez `PUSHER_INSTANCE_ID` et `PUSHER_SECRET_KEY`

## 📚 Documentation

- [Vercel](https://vercel.com/docs)
- [Upstash Redis](https://docs.upstash.com/redis)
- [Pusher Beams](https://pusher.com/docs/beams)
- [Neon Postgres](https://neon.tech/docs/introduction)

---

**Bon développement ! 🎉**
