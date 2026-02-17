/**
 * Script para testar integração com Google Drive localmente (antes de fazer push)
 * Uso: MONGO_URI="..." node test-gdrive.js
 */


// Carrega variáveis do .env automaticamente
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const path = require('path');

async function testGDrive() {
  try {
    console.log('\n🔍 Testando integração Google Drive...\n');

    // Step 1: Checar arquivos de credenciais
    const credPath = path.join(__dirname, 'google-credentials.json');
    const tokenPath = path.join(__dirname, 'google-token.json');
    
    console.log('📁 Verificando arquivos de credenciais:');
    const credExists = fs.existsSync(credPath);
    const tokenExists = fs.existsSync(tokenPath);
    
    console.log(`   - google-credentials.json: ${credExists ? '✓' : '✗'}`);
    console.log(`   - google-token.json: ${tokenExists ? '✓' : '✗'}`);
    
    if (!credExists || !tokenExists) {
      console.error('\n❌ Arquivos de credenciais faltando!');
      console.error('   Copie os arquivos JSON para a raiz do backend/');
      process.exit(1);
    }

    // Step 2: Validar estrutura JSON
    console.log('\n📋 Validando estrutura das credenciais:');
    const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
    const credRoot = creds.installed || creds.web;
    
    if (!credRoot) {
      throw new Error('Estrutura inválida: missing "installed" or "web"');
    }
    
    console.log(`   - Tipo: ${creds.installed ? 'Desktop' : 'Web App'}`);
    console.log(`   - Client ID: ${credRoot.client_id ? '✓' : '✗'}`);
    console.log(`   - Client Secret: ${credRoot.client_secret ? '✓ (oculto)' : '✗'}`);
    console.log(`   - Redirect URIs: ${credRoot.redirect_uris ? '✓' : '✗'}`);

    // Step 3: Testar conexão com Google Drive
    console.log('\n🚀 Testando upload com Google Drive:');
    
    const { uploadFileToDrive } = require('./src/storage/gdrive');
    
    const testBuffer = Buffer.from('TEST_' + Date.now());
    const testFilename = `TEST_LOCAL_${Date.now()}.txt`;
    
    console.log(`   Enviando: ${testFilename}`);
    const result = await uploadFileToDrive(testBuffer, testFilename, 'text/plain');
    
    console.log('\n✅ SUCESSO! Google Drive está funcionando!');
    console.log(`   - File ID: ${result.id}`);
    console.log(`   - File Name: ${testFilename}`);
    console.log(`   - Web Link: ${result.webViewLink}`);
    console.log(`\n📌 Acesse: ${result.webViewLink}`);
    console.log('\n💡 IMPORTANTE: Você pode deletar o arquivo de teste do Google Drive manualmente.\n');
    
  } catch (err) {
    console.error('\n❌ ERRO ao testar Google Drive:');
    console.error(`   ${err.message}`);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Verifique se google-credentials.json e google-token.json existem');
    console.error('   2. Verifique se as credenciais têm permissão para escrever em Google Drive');
    console.error('   3. Tente atualizar o google-token.json usando google-drive-auth.js');
    process.exit(1);
  }
}

testGDrive();
