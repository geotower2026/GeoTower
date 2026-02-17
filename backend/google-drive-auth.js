// Script para autenticar com Google Drive e gerar google-token.json
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'google-credentials.json');
const TOKEN_PATH = path.join(__dirname, 'google-token.json');

function getOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const credRoot = credentials.installed || credentials.web;
  if (!credRoot) throw new Error('Estrutura de credenciais inválida');
  const { client_id, client_secret, redirect_uris } = credRoot;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  const oAuth2Client = getOAuth2Client();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
    prompt: 'consent',
  });
  console.log('\n1. Acesse este link no navegador e autorize o app:');
  console.log(authUrl);
  const code = await askQuestion('\n2. Cole aqui o código de autorização: ');
  const { tokens } = await oAuth2Client.getToken(code.trim());
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log(`\n✅ google-token.json salvo em ${TOKEN_PATH}`);
  console.log('Você pode rodar test-gdrive.js para testar o upload.');
}

main().catch(err => {
  console.error('Erro na autenticação:', err.message);
  process.exit(1);
});
