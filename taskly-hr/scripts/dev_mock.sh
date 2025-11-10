#!/usr/bin/env bash
set -e

# Start json-server (mock API) on 3001 and Next.js on 3000 concurrently
# Requires npm packages: concurrently, json-server

# ensure run from repo root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR/web"

# install if node_modules missing (best-effort)
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies (web)..."
  npm i
fi

# run concurrently
npx concurrently -n API,WEB "npx json-server --watch ../mocks/db.json --port 3001" "npm run dev"
