#!/usr/bin/env bash
# ============================================================
#  Palmo IA — Script de arranque completo (Mac / Linux)
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

cyan()  { echo -e "\033[36m>>> $*\033[0m"; }
green() { echo -e "\033[32m    OK: $*\033[0m"; }
yellow(){ echo -e "\033[33m    AVISO: $*\033[0m"; }

echo ""
echo "============================================"
echo "  Palmo IA v1.0.0"
echo "============================================"

# ── Backend ──────────────────────────────────────────────────
cyan "Preparando backend..."
cd "$BACKEND_DIR"

if [ ! -f ".env" ]; then
    yellow ".env no encontrado. Copiando desde .env.example..."
    cp .env.example .env
    yellow "Edita backend/.env con tus credenciales."
fi

cyan "Instalando dependencias Python..."
pip install -r requirements.txt -q
green "Dependencias Python instaladas"

cyan "Iniciando API en http://localhost:8000 ..."
python api.py &
BACKEND_PID=$!
green "Backend PID: $BACKEND_PID"
sleep 2

# ── Frontend ─────────────────────────────────────────────────
cyan "Preparando frontend..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    cyan "Instalando dependencias Node.js..."
    npm install --silent
fi

cyan "Iniciando panel en http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  Sistema Palmo IA en marcha"
echo "  Panel:    http://localhost:5173"
echo "  API:      http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo "  Ctrl+C para detener todo"
echo "============================================"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Sistema detenido.'" EXIT
wait
