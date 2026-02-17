// Script para criar arquivos de credenciais do Google a partir das variáveis de ambiente no Render
const fs = require('fs');
const path = require('path');

function writeIfEnv(varName, filePath) {
  if (process.env[varName]) {
    try {
      fs.writeFileSync(filePath, process.env[varName]);
      console.log(`[CRED] ${varName} criado em ${filePath}`);
    } catch (e) {
      console.error(`[CRED] Falha ao criar ${filePath}:`, e.message);
    }
  } else {
    console.warn(`[CRED] Variável ${varName} não encontrada`);
  }
}

const credPath = path.join(__dirname, '../google-credentials.json');
const tokenPath = path.join(__dirname, '../google-token.json');

writeIfEnv('GOOGLE_CREDENTIALS', credPath);
writeIfEnv('GOOGLE_CREDENTIALS_JSON', credPath); // compatibilidade
writeIfEnv('GOOGLE_TOKEN_JSON', tokenPath);
