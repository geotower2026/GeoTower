#!/bin/bash
set -e

echo "📦 Fazendo build do Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Frontend built com sucesso!"
echo "🚀 Iniciando Backend..."
cd backend
npm start
