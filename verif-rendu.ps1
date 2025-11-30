# Script de vérification avant rendu
# Je vérifie que tous les fichiers nécessaires sont présents

Write-Host "🔍 Vérification du projet avant rendu" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Liste des fichiers obligatoires
$requiredFiles = @(
    "package.json",
    "README.md",
    "DOCKER.md",
    "RENDU.md",
    ".env.example",
    "Dockerfile",
    "Dockerfile.dev",
    "docker-compose.yml",
    "docker-compose.dev.yml",
    ".dockerignore",
    "docker-start.ps1",
    "docker-start.sh"
)

Write-Host "📄 Vérification des fichiers obligatoires..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file MANQUANT" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "📁 Vérification des dossiers..." -ForegroundColor Yellow
$requiredDirs = @("api", "src", "public", "scripts")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir -PathType Container) {
        $fileCount = (Get-ChildItem $dir -Recurse -File | Measure-Object).Count
        Write-Host "  ✅ $dir/ ($fileCount fichiers)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $dir/ MANQUANT" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "🔧 Vérification des fichiers API..." -ForegroundColor Yellow
$apiFiles = @("register.js", "login.js", "users.js", "rooms.js", "messages.js", "room-messages.js")
foreach ($file in $apiFiles) {
    $path = "api\$file"
    if (Test-Path $path) {
        Write-Host "  ✅ $path" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $path MANQUANT" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "⚙️  Vérification de l'environnement..." -ForegroundColor Yellow

# Vérification Docker
try {
    docker --version | Out-Null
    Write-Host "  ✅ Docker installé" -ForegroundColor Green
    
    docker info | Out-Null
    Write-Host "  ✅ Docker en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Docker non disponible (optionnel pour le rendu)" -ForegroundColor Yellow
}

# Vérification Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js installé ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Node.js non installé (optionnel si Docker utilisé)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Vérification du fichier .env..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "  ✅ .env.local présent" -ForegroundColor Green
    Write-Host "  ⚠️  N'oubliez pas de fournir les credentials dans credentials.txt" -ForegroundColor Yellow
} else {
    Write-Host "  ⚠️  .env.local absent (normal, créé à partir de .env.example)" -ForegroundColor Yellow
}

if (Test-Path "credentials.txt") {
    Write-Host "  ✅ credentials.txt présent" -ForegroundColor Green
    Write-Host "  ⚠️  Vérifiez que les credentials sont à jour dedans !" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ credentials.txt MANQUANT - À créer pour le rendu" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "📊 Vérification de la taille du projet..." -ForegroundColor Yellow
$projectSize = (Get-ChildItem -Recurse -File -Exclude node_modules | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  ℹ️  Taille du projet (sans node_modules): $([math]::Round($projectSize, 2)) MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ Projet prêt pour le rendu !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "  1. Remplissez credentials.txt avec vos vraies credentials" -ForegroundColor White
    Write-Host "  2. Testez avec : .\docker-start.ps1" -ForegroundColor White
    Write-Host "  3. Créez une archive ZIP du projet (sans node_modules)" -ForegroundColor White
    Write-Host "  4. Rendez l archive au professeur" -ForegroundColor White
} else {
    Write-Host "❌ Certains fichiers sont manquants !" -ForegroundColor Red
    Write-Host "Corrigez les erreurs ci-dessus avant le rendu." -ForegroundColor Yellow
}

Write-Host ""
