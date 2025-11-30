# Script pour charger les variables .env.local et lancer Vercel Dev
Write-Host "🔧 Chargement des variables d'environnement depuis .env.local..." -ForegroundColor Cyan

# Charger les variables importantes
$env:UPSTASH_REDIS_REST_URL="https://legible-skink-25746.upstash.io"
$env:UPSTASH_REDIS_REST_TOKEN="AWSSAAIncDIyNDJmZWZiMDIwMGQ0MTFkYjRmMDNmMTI1OTNlNjg1ZXAyMjU3NDY"
$env:KV_REST_API_URL="https://legible-skink-25746.upstash.io"
$env:KV_REST_API_TOKEN="AWSSAAIncDIyNDJmZWZiMDIwMGQ0MTFkYjRmMDNmMTI1OTNlNjg1ZXAyMjU3NDY"

Write-Host "  ✓ UPSTASH_REDIS_REST_URL = $env:UPSTASH_REDIS_REST_URL" -ForegroundColor Green
Write-Host "  ✓ KV_REST_API_URL = $env:KV_REST_API_URL" -ForegroundColor Green

# Ajouter System32 au PATH
$env:Path = "C:\Windows\System32;$env:Path"

Write-Host "`n🚀 Lancement de Vercel Dev..." -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3000`n" -ForegroundColor White

# Lancer Vercel Dev
vercel dev
