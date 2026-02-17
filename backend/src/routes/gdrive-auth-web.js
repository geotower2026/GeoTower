// Endpoint temporário para autenticação Google Drive no Render
const express = require('express');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const router = express.Router();

const CREDENTIALS_PATH = path.join(__dirname, '../google-credentials.json');
const TOKEN_PATH = path.join(__dirname, '../google-token.json');

function getOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const credRoot = credentials.installed || credentials.web;
  if (!credRoot) throw new Error('Estrutura de credenciais inválida');
  const { client_id, client_secret, redirect_uris } = credRoot;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

// 1. Gera URL de autorização
router.get('/gdrive-auth-url', (req, res) => {
  try {
    const oAuth2Client = getOAuth2Client();
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
      prompt: 'consent',
    });
    res.json({ url: authUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Recebe o código e salva o token
router.post('/gdrive-auth-token', express.json(), async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Faltou o código!' });
    const oAuth2Client = getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code.trim());
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    res.json({ success: true, message: 'Token salvo!', tokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
