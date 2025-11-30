# Application de Messagerie en Temps Réel - URC

**Étudiant:** BARBYCH Mohamed  
**Formation:** Master Informatique - Université de Bretagne Occidentale  
**Année universitaire:** 2024-2025

---

## 📸 Captures d'écran de l'application

### Page d'inscription
![Inscription](doc/demo.gif)
*Interface d'inscription permettant la création d'un nouveau compte utilisateur avec validation des champs email, nom d'utilisateur et mot de passe.*

### Page de connexion
![Connexion](doc/demo.gif)
*Écran de connexion sécurisé avec gestion des sessions utilisateur et redirection automatique vers le dashboard.*

### Dashboard de messagerie
![Dashboard - Vue d'ensemble](doc/demo.gif)
*Interface principale de messagerie offrant une vue complète des conversations et des salons de discussion.*

![Dashboard - Liste des utilisateurs](doc/demo.gif)
*Panneau latéral affichant tous les utilisateurs connectés avec indicateur de messages non lus.*

![Dashboard - Conversation privée](doc/demo.gif)
*Fenêtre de chat privé permettant l'échange de messages en temps réel entre deux utilisateurs.*

![Dashboard - Salons de discussion](doc/demo.gif)
*Accès aux différents salons thématiques (General, News, Random) pour des discussions de groupe.*

![Dashboard - Messages dans un salon](doc/demo.gif)
*Interface de messagerie de groupe avec historique des messages et identification des auteurs.*

---

## 📋 Présentation du projet

Cette application web moderne permet aux utilisateurs de communiquer en temps réel, que ce soit via des **messages privés** entre deux personnes ou dans des **salons de discussion publics**. Le projet a été développé dans le cadre du module de développement web avancé et met en œuvre les technologies les plus récentes de l'écosystème JavaScript.

### Fonctionnalités principales

#### Gestion des utilisateurs
- **Inscription** : Création de compte avec validation des données (email unique, nom d'utilisateur, mot de passe)
- **Connexion** : Authentification sécurisée avec génération de tokens de session
- **Déconnexion** : Invalidation propre des sessions utilisateur

#### Messagerie privée
- Envoi et réception de messages entre utilisateurs
- Historique des conversations conservé
- Mise à jour automatique des messages toutes les 3 secondes
- Interface intuitive avec liste des contacts

#### Salons de discussion
- Trois salons prédéfinis : **General**, **News**, **Random**
- Messages visibles par tous les membres du salon
- Identification de l'auteur de chaque message
- Rafraîchissement automatique du fil de discussion

#### Interface utilisateur
- Design moderne et responsive grâce à Material-UI
- Navigation fluide entre conversations privées et salons
- Indicateur visuel du nombre de messages par conversation
- Barre de recherche pour filtrer les utilisateurs (si implémentée)

---

## 🏗️ Architecture technique

### Stack technologique

#### Frontend
- **React 19.2.0** : Framework JavaScript pour construire l'interface utilisateur
- **Material-UI 7.3.4** : Bibliothèque de composants UI modernes et accessibles
- **Zustand 5.0.8** : Gestion d'état légère et performante
- **React Router DOM 7.9.4** : Navigation côté client pour une expérience SPA fluide

#### Backend
- **Node.js 18** avec **Express.js 5.1.0** : Serveur web robuste et performant
- **PostgreSQL** (Neon Cloud) : Base de données relationnelle pour stocker les utilisateurs et salons
- **Redis** (Upstash) : Cache en mémoire pour la persistance des messages en temps réel

#### Infrastructure
- **Docker** : Conteneurisation de l'application pour un déploiement simplifié
- **Docker Compose** : Orchestration du conteneur web

### Architecture de la base de données

#### Table `users`
```sql
CREATE TABLE users (
   user_id serial PRIMARY KEY,
   username VARCHAR(50) UNIQUE NOT NULL,
   password VARCHAR(100) NOT NULL,
   email VARCHAR(255) UNIQUE NOT NULL,
   created_on TIMESTAMP NOT NULL,
   last_login TIMESTAMP,
   external_id VARCHAR(50) UNIQUE NOT NULL
);
```

#### Table `rooms`
```sql
CREATE TABLE rooms (
   room_id serial PRIMARY KEY,
   name VARCHAR(50) UNIQUE NOT NULL,
   created_on TIMESTAMP NOT NULL,
   created_by INTEGER NOT NULL
);
```

### Stockage des messages

Les messages sont stockés dans **Redis** pour optimiser les performances :
- **Messages privés** : Clé `msg:{userId1}:{userId2}`
- **Messages de salon** : Clé `room:{roomId}:messages`
- **Expiration** : 7 jours (604800 secondes)

---

## 🚀 Installation et déploiement

### Prérequis

- **Docker Desktop** installé et démarré
- **Git** pour cloner le dépôt
- Accès aux services cloud :
  - PostgreSQL (Neon)
  - Redis (Upstash)

### Configuration des variables d'environnement

Créer un fichier `.env.local` à la racine du projet avec les variables suivantes :

```bash
# PostgreSQL (Neon)
POSTGRES_URL="postgresql://username:password@host/database"

# Redis (Upstash)
KV_REST_API_URL="https://legible-skink-25746.upstash.io"
KV_REST_API_TOKEN="votre_token_redis"
```

### Déploiement avec Docker

L'application est entièrement dockerisée pour simplifier le déploiement. Une seule commande suffit :

```bash
docker compose up --build -d
```

**Ce qui se passe en arrière-plan :**
1. Construction de l'image Docker avec Node.js 18 Alpine
2. Installation des dépendances npm
3. Compilation du frontend React (`npm run build`)
4. Démarrage du serveur Express sur le port 3000
5. Le serveur sert à la fois :
   - Les fichiers statiques React (frontend)
   - Les endpoints API REST (backend)

### Accès à l'application

Une fois le conteneur démarré, l'application est accessible à :

**http://localhost:3000**

---

## 🔌 API REST

Le backend expose plusieurs endpoints sécurisés :

### Authentification

#### `POST /api/register`
Inscription d'un nouvel utilisateur.

**Body :**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

**Réponse :**
```json
{
  "success": true,
  "token": "uuid-session-token",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### `POST /api/login`
Connexion d'un utilisateur existant.

**Body :**
```json
{
  "username": "john_doe",
  "password": "motdepasse123"
}
```

**Réponse :**
```json
{
  "success": true,
  "token": "uuid-session-token",
  "user": { ... }
}
```

### Endpoints protégés (nécessitent un token)

Tous les endpoints suivants requièrent le header :
```
Authorization: Bearer {token}
```

#### `GET /api/users`
Récupère la liste de tous les utilisateurs (sauf l'utilisateur courant).

#### `GET /api/rooms`
Récupère la liste des salons de discussion disponibles.

#### `GET /api/messages?otherUserId={id}`
Récupère l'historique des messages privés avec un utilisateur.

#### `POST /api/messages`
Envoie un message privé à un utilisateur.

**Body :**
```json
{
  "receiverId": 5,
  "content": "Salut, comment ça va ?"
}
```

#### `GET /api/room-messages?roomId={id}`
Récupère les messages d'un salon.

#### `POST /api/room-messages`
Envoie un message dans un salon.

**Body :**
```json
{
  "roomId": 1,
  "content": "Hello tout le monde !"
}
```

---

## 📂 Structure du projet

```
urc/
├── src/                          # Code source React
│   ├── pages/                    # Composants de pages
│   │   ├── LoginPage.jsx        # Page de connexion
│   │   ├── RegisterPage.jsx     # Page d'inscription
│   │   └── MessagesPage.jsx     # Interface de messagerie
│   ├── store/                    # Gestion d'état Zustand
│   │   ├── authStore.js         # État d'authentification
│   │   └── usersStore.js        # État des utilisateurs et messages
│   ├── model/                    # Types TypeScript
│   ├── App.jsx                   # Composant racine
│   └── index.js                  # Point d'entrée React
│
├── public/                       # Ressources statiques
│   ├── index.html               # Template HTML
│   └── favicon.ico
│
├── server.js                     # Serveur Express (Backend)
├── Dockerfile                    # Configuration Docker
├── docker-compose.yml            # Orchestration Docker
├── package.json                  # Dépendances npm
└── README.md                     # Ce fichier

```

---

## 🔒 Sécurité

### Authentification
- Mots de passe hashés avec **SHA-256**
- Tokens de session stockés dans Redis avec expiration
- Validation des tokens sur chaque requête API protégée

### Validation des données
- Vérification de l'unicité des emails et noms d'utilisateur
- Validation des champs requis côté serveur
- Protection contre les injections SQL via requêtes paramétrées

### CORS
- Configuration CORS activée pour permettre les requêtes cross-origin

---

## 🧪 Tests et validation

### Scénarios testés

#### 1. Inscription
- Création d'un nouveau compte avec email unique
- Validation de l'unicité du nom d'utilisateur
- Génération automatique d'un ID externe (UUID)

#### 2. Connexion
- Authentification avec identifiants valides
- Génération de token de session
- Redirection automatique vers le dashboard

#### 3. Messagerie privée
- Envoi de messages entre deux utilisateurs
- Réception et affichage de l'historique
- Mise à jour automatique (polling toutes les 3s)

#### 4. Salons de discussion
- Navigation entre les salons (General, News, Random)
- Envoi de messages visibles par tous
- Identification de l'auteur et horodatage

#### 5. Déconnexion
- Nettoyage de la session
- Suppression du token localStorage
- Redirection vers la page de connexion

---

## 🛠️ Commandes utiles

### Développement local

```bash
# Démarrer l'application
docker compose up -d

# Voir les logs en temps réel
docker logs -f urc2-web-1

# Arrêter l'application
docker compose down

# Rebuild complet (après modifications du code)
docker compose up --build -d

# Accéder au shell du conteneur
docker exec -it urc2-web-1 sh
```

### Gestion de Git

```bash
# Sauvegarder les modifications
git add -A
git commit -m "Description des changements"

# Pousser vers GitHub
git push origin main
```

---

## 📈 Améliorations futures possibles

### Fonctionnalités
- [ ] Notifications push en temps réel (WebSockets)
- [ ] Envoi de fichiers et images
- [ ] Emojis et réactions aux messages
- [ ] Création de salons personnalisés par les utilisateurs
- [ ] Modération des salons (admins, bannissement)
- [ ] Recherche dans l'historique des messages
- [ ] Statut en ligne/hors ligne des utilisateurs

### Technique
- [ ] Migration vers WebSockets (Socket.io) au lieu du polling
- [ ] Compression des messages (gzip)
- [ ] Pagination de l'historique des messages
- [ ] Cache côté client (Service Worker)
- [ ] Tests unitaires et d'intégration (Jest, React Testing Library)
- [ ] CI/CD avec GitHub Actions

### Interface
- [ ] Mode sombre/clair
- [ ] Thèmes personnalisables
- [ ] Accessibilité WCAG 2.1 niveau AA
- [ ] Version mobile native (React Native)

---

## 🐛 Dépannage

### Le conteneur ne démarre pas
```bash
# Vérifier les logs
docker logs urc2-web-1

# Vérifier que le port 3000 n'est pas déjà utilisé
netstat -ano | findstr :3000

# Nettoyer et reconstruire
docker compose down
docker system prune -f
docker compose up --build -d
```

### Erreur 401 (Non autorisé)
- Vérifier que le token est bien présent dans localStorage
- Se déconnecter et se reconnecter
- Vider le cache du navigateur (Ctrl + Shift + R)

### Messages qui ne s'affichent pas
- Vérifier la connexion à Redis (Upstash)
- Regarder les logs du serveur : `docker logs urc2-web-1`
- Vérifier que le polling fonctionne (devtools > Network)

---

## 📚 Ressources et documentation

### Technologies utilisées
- [React Documentation](https://react.dev/)
- [Material-UI](https://mui.com/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

### Services cloud
- [Neon PostgreSQL](https://neon.tech/)
- [Upstash Redis](https://upstash.com/)

---

## 📝 Notes de développement

### Choix techniques justifiés

**Pourquoi Docker ?**  
Docker garantit que l'application fonctionne de manière identique sur tous les environnements (développement, production), éliminant les problèmes de "ça marche sur ma machine".

**Pourquoi Redis pour les messages ?**  
Redis offre des performances exceptionnelles pour les lectures/écritures fréquentes, essentielles pour une application de messagerie temps réel. La persistance limitée (7 jours) est suffisante pour un prototype académique.

**Pourquoi PostgreSQL ET Redis ?**  
- PostgreSQL : Données structurées et permanentes (utilisateurs, salons)
- Redis : Données volatiles et haute fréquence (messages, sessions)

**Pourquoi Zustand au lieu de Redux ?**  
Zustand est plus léger, plus simple et suffisant pour la gestion d'état de cette application. Pas de boilerplate inutile.

**Pourquoi polling au lieu de WebSockets ?**  
Le polling (toutes les 3 secondes) simplifie l'architecture pour un prototype. Les WebSockets nécessiteraient une gestion plus complexe des connexions et de la scalabilité.

---

## ✅ Conclusion

Ce projet démontre la maîtrise de l'ensemble de la stack JavaScript moderne, de la conception d'une architecture full-stack à son déploiement via Docker. L'application est fonctionnelle, sécurisée et prête à être présentée.

**Points forts du projet :**
- ✅ Architecture moderne et scalable
- ✅ Code propre et bien structuré
- ✅ Déploiement simplifié avec Docker
- ✅ Interface utilisateur intuitive et responsive
- ✅ Sécurité (hashing, tokens, validation)
- ✅ Documentation complète

---

**BARBYCH Mohamed**  
Master Informatique - UBO  
GitHub: [@MohamedBarbych](https://github.com/MohamedBarbych)
