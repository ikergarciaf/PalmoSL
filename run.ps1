# ============================================================
#  Palmo IA — Script de arranque completo (Windows PowerShell)
# ============================================================

param(
    [switch]$OnlyBackend,
    [switch]$OnlyFrontend,
    [switch]$Scheduler
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step { param($msg) Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "    OK: $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "    AVISO: $msg" -ForegroundColor Yellow }

Write-Host "`n============================================" -ForegroundColor White
Write-Host "  Palmo IA v1.0.0 — Palmo Suministro Integral" -ForegroundColor White
Write-Host "============================================`n" -ForegroundColor White

# ── Backend ──────────────────────────────────────────────────
if (-not $OnlyFrontend) {
    Write-Step "Arrancando backend..."

    $BackendDir = Join-Path $ScriptDir "backend"
    Push-Location $BackendDir

    # .env check
    if (-not (Test-Path ".env")) {
        Write-Warn ".env no encontrado. Copiando desde .env.example..."
        Copy-Item ".env.example" ".env"
        Write-Warn "Edita backend/.env con tus credenciales para el modo produccion."
    } else {
        Write-Ok ".env encontrado"
    }

    # Install deps
    Write-Step "Instalando dependencias Python..."
    pip install -r requirements.txt --quiet
    Write-Ok "Dependencias instaladas"

    if ($Scheduler) {
        Write-Step "Iniciando scheduler (modo continuo)..."
        Write-Host "    Emails cada 10 min + stock diario. Ctrl+C para detener." -ForegroundColor Yellow
        Start-Process -NoNewWindow -FilePath "python" -ArgumentList "scheduler.py"
    } else {
        Write-Step "Iniciando API (http://localhost:8000)..."
        Start-Process -NoNewWindow -FilePath "python" -ArgumentList "api.py"
    }

    Pop-Location
    Start-Sleep -Seconds 2
    Write-Ok "Backend listo en http://localhost:8000"
}

# ── Frontend ─────────────────────────────────────────────────
if (-not $OnlyBackend) {
    Write-Step "Arrancando frontend..."

    $FrontendDir = Join-Path $ScriptDir "frontend"
    Push-Location $FrontendDir

    if (-not (Test-Path "node_modules")) {
        Write-Step "Instalando dependencias Node.js..."
        npm install --silent
        Write-Ok "Dependencias Node instaladas"
    } else {
        Write-Ok "node_modules ya existe"
    }

    Write-Step "Iniciando panel web (http://localhost:5173)..."
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev"
    Pop-Location

    Start-Sleep -Seconds 3
    Write-Ok "Panel listo en http://localhost:5173"
}

Write-Host "`n============================================" -ForegroundColor White
Write-Host "  Sistema Palmo IA en marcha" -ForegroundColor Green
Write-Host "  Panel:   http://localhost:5173" -ForegroundColor Cyan
Write-Host "  API:     http://localhost:8000" -ForegroundColor Cyan
Write-Host "  Docs API: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor White
