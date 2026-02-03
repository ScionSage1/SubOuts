# SubOuts Deployment Script
# Run from: C:\ServerApp\SubOuts

$ErrorActionPreference = "Stop"
$appPath = "C:\ServerApp\SubOuts"
$serviceName = "subouts-api"

Write-Host "`n=== Deploying SubOuts ===" -ForegroundColor Cyan

try {
    Set-Location $appPath

    # Pull latest
    Write-Host "`n>> Pulling from Git..." -ForegroundColor Yellow
    git fetch origin
    git reset --hard origin/main
    git log -1 --oneline

    # Stop service
    Write-Host "`n>> Stopping $serviceName..." -ForegroundColor Yellow
    pm2 stop $serviceName

    # Server dependencies
    Write-Host "`n>> Installing server dependencies..." -ForegroundColor Yellow
    Set-Location "$appPath\server"
    npm ci --production

    # Build server (TypeScript)
    Write-Host "`n>> Building server..." -ForegroundColor Yellow
    npm run build

    # Build client
    Write-Host "`n>> Building React frontend..." -ForegroundColor Yellow
    Set-Location "$appPath\client"
    npm ci
    npm run build

    # Restart service
    Write-Host "`n>> Starting $serviceName..." -ForegroundColor Yellow
    Set-Location "$appPath\server"
    pm2 restart $serviceName
    pm2 save

    Write-Host "`n=== SubOuts deployed successfully! ===" -ForegroundColor Green
    pm2 list

} catch {
    Write-Host "`nDEPLOYMENT FAILED: $_" -ForegroundColor Red
    pm2 restart $serviceName
    exit 1
}
