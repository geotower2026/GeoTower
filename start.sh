#!/bin/bash

# Script para garantir que o build existe
echo "Checando build..."

if [ ! -d "frontend/build" ]; then
  echo "Build não encontrado! Tentando compilar..."
  cd frontend
  npm install
  npm run build
  cd ..
fi

echo "Build pronto! Iniciando servidor..."
node backend/src/server.js
