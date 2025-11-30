#!/bin/bash

# Script de lancement rapide pour Docker
# Je configure et lance l'application URC avec Docker

echo "🚀 Lancement rapide de URC avec Docker"
echo "======================================"
echo ""

# Je vérifie si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé."
    echo "📥 Installez Docker Desktop : https://docs.docker.com/get-docker/"
    exit 1
fi

# Je vérifie si Docker est en cours d'exécution
if ! docker info &> /dev/null; then
    echo "❌ Docker n'est pas lancé."
    echo "▶️  Lancez Docker Desktop et réessayez."
    exit 1
fi

echo "✅ Docker est prêt"
echo ""

# Je vérifie si .env.local existe
if [ ! -f .env.local ]; then
    echo "⚠️  Le fichier .env.local n'existe pas."
    echo "📝 Je crée un fichier .env.local depuis .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✅ Fichier .env.local créé"
        echo ""
        echo "⚙️  Veuillez éditer .env.local avec vos credentials :"
        echo "   - PostgreSQL (Neon)"
        echo "   - Redis (Upstash)"
        echo ""
        echo "Puis relancez ce script."
        exit 0
    else
        echo "❌ Le fichier .env.example n'existe pas."
        exit 1
    fi
fi

echo "✅ Fichier .env.local trouvé"
echo ""

# Je demande le mode (dev ou prod)
echo "Choisissez le mode de lancement :"
echo "1) Production (build optimisé)"
echo "2) Développement (avec Vercel Dev)"
read -p "Votre choix [1-2] : " mode

case $mode in
    1)
        echo ""
        echo "🏗️  Construction de l'image de production..."
        docker-compose build
        
        echo ""
        echo "🚀 Lancement du conteneur en mode production..."
        docker-compose up -d
        
        echo ""
        echo "✅ Application lancée avec succès !"
        echo "🌐 Accès : http://localhost:3000"
        echo ""
        echo "📊 Voir les logs : docker-compose logs -f"
        echo "🛑 Arrêter : docker-compose down"
        ;;
    2)
        echo ""
        echo "🏗️  Construction de l'image de développement..."
        docker-compose -f docker-compose.dev.yml build
        
        echo ""
        echo "🚀 Lancement du conteneur en mode développement..."
        docker-compose -f docker-compose.dev.yml up -d
        
        echo ""
        echo "✅ Application lancée avec succès en mode DEV !"
        echo "🌐 Accès : http://localhost:3000"
        echo "🔥 Hot-reload activé"
        echo ""
        echo "📊 Voir les logs : docker-compose -f docker-compose.dev.yml logs -f"
        echo "🛑 Arrêter : docker-compose -f docker-compose.dev.yml down"
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac
