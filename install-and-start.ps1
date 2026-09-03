# ============================================================
# Zoé Ferme ERP — Script d'installation avec reprise automatique
# Exécuter dans PowerShell en tant qu'administrateur
# ============================================================

$projectPath = "c:\Users\HP\Documents\Zoe-ferme-erp"
$maxAttempts = 20
$attempt = 0

Write-Host "🚀 Démarrage de l'installation de Zoé Ferme ERP" -ForegroundColor Cyan
Write-Host "📁 Dossier : $projectPath" -ForegroundColor Gray
Write-Host ""

# Configuration npm optimisée pour connexion lente
Write-Host "⚙️  Configuration npm..." -ForegroundColor Yellow
npm config set maxsockets 1
npm config set fetch-retries 15
npm config set fetch-retry-mintimeout 5000
npm config set fetch-retry-maxtimeout 120000
npm config set fetch-timeout 600000

Set-Location $projectPath

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host ""
    Write-Host "📦 Tentative $attempt/$maxAttempts — $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
    
    # Tuer les processus node restants
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    
    # Supprimer node_modules partiel proprement
    if (Test-Path "node_modules") {
        Write-Host "🧹 Nettoyage node_modules..." -ForegroundColor Gray
        cmd /c "rmdir /s /q node_modules 2>nul"
        Start-Sleep -Seconds 3
    }
    
    # Lancer npm install
    Write-Host "⬇️  Téléchargement des dépendances..." -ForegroundColor Yellow
    $result = npm install --no-audit --no-fund --maxsockets 1 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "✅ Installation réussie !" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Démarrage de l'application..." -ForegroundColor Cyan
        npm run dev
        break
    } else {
        Write-Host "❌ Échec (connexion coupée). Nouvelle tentative dans 10 secondes..." -ForegroundColor Red
        Write-Host $result -ForegroundColor DarkGray
        Start-Sleep -Seconds 10
    }
}

if ($attempt -ge $maxAttempts) {
    Write-Host ""
    Write-Host "⛔ Impossible d'installer après $maxAttempts tentatives." -ForegroundColor Red
    Write-Host "Conseils :" -ForegroundColor Yellow
    Write-Host "  1. Utilisez un hotspot 4G mobile" -ForegroundColor White
    Write-Host "  2. Réessayez la nuit (22h-6h)" -ForegroundColor White
    Write-Host "  3. Essayez un VPN (ProtonVPN gratuit)" -ForegroundColor White
}
