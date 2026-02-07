#!/bin/bash

# Script de verificação de instalação
# Executa: bash verify-setup.sh (no Linux/Mac) ou executar individualmente no Windows

echo "🔍 Verificando instalação do Delivery Documentation App..."
echo ""

# Verificar Node.js
echo "Checando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✓ Node.js $NODE_VERSION encontrado"
else
    echo "✗ Node.js não encontrado. Instale de https://nodejs.org/"
    exit 1
fi

# Verificar npm
echo "Checando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✓ npm $NPM_VERSION encontrado"
else
    echo "✗ npm não encontrado"
    exit 1
fi

# Verificar MongoDB
echo "Checando MongoDB..."
if command -v mongod &> /dev/null; then
    echo "✓ MongoDB instalado"
else
    echo "⚠ MongoDB não encontrado (use MongoDB Atlas ou instale localmente)"
fi

# Verificar estrutura de pastas
echo ""
echo "Checando estrutura..."
if [ -d "backend" ] && [ -d "frontend" ]; then
    echo "✓ Pastas backend e frontend encontradas"
else
    echo "✗ Estrutura incorreta. Certifique-se de estar na raiz do projeto"
    exit 1
fi

# Verificar arquivo .env
echo ""
echo "Checando arquivo .env..."
if [ -f ".env" ]; then
    echo "✓ Arquivo .env encontrado"
else
    echo "⚠ Arquivo .env não encontrado. Copiar de .env.example:"
    echo "  cp .env.example .env"
fi

# Verificar node_modules
echo ""
echo "Checando dependências..."
if [ -d "backend/node_modules" ]; then
    echo "✓ Backend dependências instaladas"
else
    echo "⚠ Backend dependências não instaladas. Execute: npm run setup"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✓ Frontend dependências instaladas"
else
    echo "⚠ Frontend dependências não instaladas. Execute: npm run setup"
fi

echo ""
echo "🎉 Verificação completa!"
echo ""
echo "Próximos passos:"
echo "1. Configurar .env com suas credenciais"
echo "2. Instalar dependências: npm run setup"
echo "3. Iniciar: npm run dev"
