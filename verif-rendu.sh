#!/bin/bash

# Script de vérification avant rendu
# Je vérifie que tous les fichiers nécessaires sont présents

echo "🔍 Vérification du projet avant rendu"
echo "====================================="
echo ""

all_good=true

# Liste des fichiers obligatoires
required_files=(
    "package.json"
    "README.md"
    "DOCKER.md"
    "RENDU.md"
    ".env.example"
    "Dockerfile"
    "Dockerfile.dev"
    "docker-compose.yml"
    "docker-compose.dev.yml"
    ".dockerignore"
    "docker-start.ps1"
    "docker-start.sh"
)

echo "📄 Vérification des fichiers obligatoires..."
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file MANQUANT"
        all_good=false
    fi
done

echo ""
echo "📁 Vérification des dossiers..."
required_dirs=("api" "src" "public" "scripts")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        file_count=$(find "$dir" -type f | wc -l)
        echo "  ✅ $dir/ ($file_count fichiers)"
    else
        echo "  ❌ $dir/ MANQUANT"
        all_good=false
    fi
done

echo ""
echo "🔧 Vérification des fichiers API..."
api_files=("register.js" "login.js" "users.js" "rooms.js" "messages.js" "room-messages.js")
for file in "${api_files[@]}"; do
    path="api/$file"
    if [ -f "$path" ]; then
        echo "  ✅ $path"
    else
        echo "  ❌ $path MANQUANT"
        all_good=false
    fi
done

echo ""
echo "⚙️  Vérification de l'environnement..."

# Vérification Docker
if command -v docker &> /dev/null; then
    echo "  ✅ Docker installé"
    
    if docker info &> /dev/null; then
        echo "  ✅ Docker en cours d'exécution"
    else
        echo "  ⚠️  Docker non lancé (optionnel pour le rendu)"
    fi
else
    echo "  ⚠️  Docker non disponible (optionnel pour le rendu)"
fi

# Vérification Node.js
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo "  ✅ Node.js installé ($node_version)"
else
    echo "  ⚠️  Node.js non installé (optionnel si Docker utilisé)"
fi

echo ""
echo "📝 Vérification du fichier .env..."
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local présent"
    echo "  ⚠️  N'oubliez pas de fournir les credentials dans credentials.txt"
else
    echo "  ⚠️  .env.local absent (normal, créé à partir de .env.example)"
fi

if [ -f "credentials.txt" ]; then
    echo "  ✅ credentials.txt présent"
    echo "  ⚠️  Vérifiez que les credentials sont à jour dedans !"
else
    echo "  ❌ credentials.txt MANQUANT - À créer pour le rendu"
    all_good=false
fi

echo ""
echo "📊 Vérification de la taille du projet..."
if command -v du &> /dev/null; then
    project_size=$(du -sh --exclude=node_modules . 2>/dev/null | cut -f1)
    echo "  ℹ️  Taille du projet (sans node_modules): $project_size"
fi

echo ""
echo "====================================="
if [ "$all_good" = true ]; then
    echo "✅ Projet prêt pour le rendu !"
    echo ""
    echo "📦 Prochaines étapes :"
    echo "  1. Remplissez credentials.txt avec vos vraies credentials"
    echo "  2. Testez avec : ./docker-start.sh"
    echo "  3. Créez une archive ZIP du projet (sans node_modules)"
    echo "  4. Rendez l'archive au professeur"
else
    echo "❌ Certains fichiers sont manquants !"
    echo "Corrigez les erreurs ci-dessus avant le rendu."
fi

echo ""
