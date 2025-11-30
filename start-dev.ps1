# Script de lancement de Vercel Dev pour URC
# Ce script configure l'environnement et lance Vercel Dev

Write-Host "🚀 Démarrage de URC avec Vercel Dev..." -ForegroundColor Cyan

# Ajouter System32 au PATH (nécessaire pour cmd.exe)
$env:Path = "C:\Windows\System32;$env:Path"
Write-Host "✅ System32 ajouté au PATH" -ForegroundColor Green

# Naviguer vers le dossier du projet
Set-Location -Path "C:\Users\dell\Desktop\urc (2)"
Write-Host "✅ Dossier du projet: $PWD" -ForegroundColor Green

Write-Host "`n📦 Lancement de Vercel Dev..." -ForegroundColor Yellow
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - API: http://localhost:3000/api/*" -ForegroundColor White
Write-Host "`n⏳ Attendez la compilation..." -ForegroundColor Yellow
Write-Host "`n💡 Astuce: Appuyez sur Ctrl+C pour arrêter le serveur`n" -ForegroundColor Gray

# Lancer Vercel Dev
vercel dev
