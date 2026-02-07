#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\n========================================');
console.log('🔨 BUILD FRONTEND SCRIPT');
console.log('========================================\n');

try {
  // Checar diretório current
  console.log('📍 Diretório atual:', process.cwd());
  
  // Listar conteúdo
  const items = fs.readdirSync(process.cwd());
  console.log('📂 Conteúdo:', items.slice(0, 10));
  
  const frontendDir = path.join(process.cwd(), 'frontend');
  
  if (!fs.existsSync(frontendDir)) {
    console.error('❌ Diretório frontend não encontrado em:', frontendDir);
    console.error('Items disponíveis:', items);
    process.exit(1);
  }

  console.log('✅ Frontend dir encontrado:', frontendDir);

  // Install
  console.log('\n📦 Instalando dependências...');
  try {
    execSync('npm install --prefer-offline', { cwd: frontendDir, stdio: 'inherit' });
    console.log('✅ NPM install completo');
  } catch(e) {
    console.warn('⚠️  NPM install teve problemas (continuando)');
  }

  // Build
  console.log('\n🔨 Compilando React...');
  try {
    execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });
    console.log('✅ Build compilado');
  } catch(e) {
    console.error('❌ Erro durante build:', e.message);
    process.exit(1);
  }

  // Verificar resultado
  const buildDir = path.join(frontendDir, 'build');
  if (fs.existsSync(buildDir)) {
    const files = fs.readdirSync(buildDir);
    console.log('\n✅✅ BUILD CRIADO COM SUCESSO!');
    console.log('   Arquivos:', files.length);
    console.log('   Path:', buildDir);
  } else {
    console.error('❌ Build dir não foi criado!');
    process.exit(1);
  }
  
} catch (error) {
  console.error('\n❌ ERRO DURANTE BUILD:', error.message);
  console.error('\nStack:', error.stack);
  process.exit(1);
}

console.log('\n========================================\n');

