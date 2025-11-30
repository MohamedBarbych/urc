# Script de lancement rapide pour Docker (Windows PowerShell)
# Je configure et lance l'application URC avec Docker

Write-Host "🚀 Lancement rapide de URC avec Docker" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Je vérifie si Docker est installé
try {
    docker --version | Out-Null
    Write-Host "✅ Docker est installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas installé." -ForegroundColor Red
    Write-Host "📥 Installez Docker Desktop : https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

# Je vérifie si Docker est en cours d'exécution
try {
    docker info | Out-Null
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas lancé." -ForegroundColor Red
    Write-Host "▶️  Lancez Docker Desktop et réessayez." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Je vérifie si .env.local existe
if (-not (Test-Path .env.local)) {
    Write-Host "⚠️  Le fichier .env.local n'existe pas." -ForegroundColor Yellow
    Write-Host "📝 Je crée un fichier .env.local depuis .env.example..." -ForegroundColor Cyan
    
    if (Test-Path .env.example) {
        Copy-Item .env.example .env.local
        Write-Host "✅ Fichier .env.local créé" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚙️  Veuillez éditer .env.local avec vos credentials :" -ForegroundColor Yellow
        Write-Host "   - PostgreSQL (Neon)" -ForegroundColor Yellow
        Write-Host "   - Redis (Upstash)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Puis relancez ce script." -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "❌ Le fichier .env.example n'existe pas." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Fichier .env.local trouvé" -ForegroundColor Green
Write-Host ""

# Je demande le mode (dev ou prod)
Write-Host "Choisissez le mode de lancement :" -ForegroundColor Cyan
Write-Host "1) Production (build optimisé)" -ForegroundColor White
Write-Host "2) Développement (avec Vercel Dev)" -ForegroundColor White
$mode = Read-Host "Votre choix [1-2]"

switch ($mode) {
    "1" {
        Write-Host ""
        Write-Host "🏗️  Construction de l'image de production..." -ForegroundColor Cyan
        docker-compose build
        
        Write-Host ""
        Write-Host "🚀 Lancement du conteneur en mode production..." -ForegroundColor Cyan
        docker-compose up -d
        
        Write-Host ""
        Write-Host "✅ Application lancée avec succès !" -ForegroundColor Green
        Write-Host "🌐 Accès : http://localhost:3000" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📊 Voir les logs : docker-compose logs -f" -ForegroundColor White
        Write-Host "🛑 Arrêter : docker-compose down" -ForegroundColor White
    }
    "2" {
        Write-Host ""
        Write-Host "🏗️  Construction de l'image de développement..." -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml build
        
        Write-Host ""
        Write-Host "🚀 Lancement du conteneur en mode développement..." -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml up -d
        
        Write-Host ""
        Write-Host "✅ Application lancée avec succès en mode DEV !" -ForegroundColor Green
        Write-Host "🌐 Accès : http://localhost:3000" -ForegroundColor Yellow
        Write-Host "🔥 Hot-reload activé" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "📊 Voir les logs : docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor White
        Write-Host "🛑 Arrêter : docker-compose -f docker-compose.dev.yml down" -ForegroundColor White
    }
    default {
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        exit 1
    }
}
