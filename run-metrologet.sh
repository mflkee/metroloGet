#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
BACKEND_PYTHON="$ROOT_DIR/.venv/bin/python"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_HOST="${HOST:-127.0.0.1}"
BACKEND_PORT="${PORT:-8000}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
API_URL="${REACT_APP_API_URL:-http://$BACKEND_HOST:$BACKEND_PORT}"

if [ ! -x "$BACKEND_PYTHON" ]; then
  echo "Missing Python environment: $BACKEND_PYTHON"
  exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Missing frontend dependencies in $FRONTEND_DIR/node_modules"
  exit 1
fi

cd "$ROOT_DIR"
HOST="$BACKEND_HOST" PORT="$BACKEND_PORT" "$BACKEND_PYTHON" main.py &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Backend:  http://$BACKEND_HOST:$BACKEND_PORT"
echo "Frontend: http://$FRONTEND_HOST:$FRONTEND_PORT"

cd "$FRONTEND_DIR"
HOST="$FRONTEND_HOST" PORT="$FRONTEND_PORT" BROWSER=none REACT_APP_API_URL="$API_URL" npm start
