// Script para testar conexão e listar collections dos bancos de Manaus e Itajaí
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uris = [
  { name: 'Manaus', uri: process.env.MONGODB_URI },
  { name: 'Itajaí', uri: process.env.MONGODB_URI_ITAJAI }
];

async function testConnection({ name, uri }) {
  if (!uri) {
    console.log(`[${name}] URI não configurada.`);
    return;
  }
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    const dbName = uri.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`\n[${name}] Conexão OK! Database: ${dbName}`);
    console.log('Collections:', collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.log(`\n[${name}] Erro:`, err.message);
  }
}

(async () => {
  for (const info of uris) {
    await testConnection(info);
  }
})();
