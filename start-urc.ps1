# Script de démarrage URC avec PATH et ENV corrigés
Write-Host "Démarrage URC..." -ForegroundColor Green

# 1. Correction du PATH
$env:Path = "C:\Windows\System32;C:\Windows;" + $env:Path
Write-Host "✓ PATH corrigé" -ForegroundColor Yellow

# 2. Chargement des variables .env.local
if (Test-Path .env.local) {
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
    Write-Host "✓ Variables d'environnement chargées" -ForegroundColor Yellow
}

# 3. Désactivation du navigateur auto
$env:BROWSER = 'none'

# 4. Lancement de Vercel Dev
Write-Host "Lancement de Vercel Dev sur http://localhost:3000" -ForegroundColor Green
vercel dev --listen 3000
