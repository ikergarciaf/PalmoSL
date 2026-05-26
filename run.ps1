# Palmo IA - Script de inicio
# Requiere: Python 3.11+, Node.js 20+

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Palmo IA - Inicio rapido ===" -ForegroundColor Cyan

# 0. Verificar versiones
try {
    $pyVer = python --version 2>&1
    Write-Host "[0/3] $pyVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python no encontrado. Instala Python 3.11+" -ForegroundColor Red
    exit 1
}
try {
    $nodeVer = node --version 2>&1
    Write-Host "[0/3] Node $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js no encontrado. Instala Node.js 20+" -ForegroundColor Red
    exit 1
}

# 1. Generar datos mock si no existen
Write-Host "[1/3] Generando datos de demostracion..." -ForegroundColor Yellow
Push-Location "$root\backend"
python -c "from config import get_settings, ensure_runtime_files; s=get_settings(); ensure_runtime_files(s); print('OK - Datos listos')"
Pop-Location

# 2. Instalar dependencias frontend si no existen
if (-not (Test-Path "$root\frontend\node_modules")) {
    Write-Host "[2/3] Instalando dependencias frontend..." -ForegroundColor Yellow
    Push-Location "$root\frontend"
    npm install
    Pop-Location
} else {
    Write-Host "[2/3] Frontend listo" -ForegroundColor Green
}

# 3. Iniciar backend y frontend
Write-Host "[3/3] Iniciando servicios..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C en cada terminal para detener" -ForegroundColor Gray
Write-Host ""

# Iniciar backend
$backend = Start-Process -FilePath "python" -ArgumentList "-m uvicorn api:app --reload --host 0.0.0.0 --port 8000" -NoNewWindow -PassThru -WorkingDirectory "$root\backend"

# Iniciar frontend
Push-Location "$root\frontend"
npm run dev
Pop-Location

# Limpiar
Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
