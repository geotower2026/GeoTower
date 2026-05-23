const mongoose = require('mongoose');

let connected = false;
let indexesEnsured = false;

function ensureCriticalIndexes() {
  if (indexesEnsured) return;
  indexesEnsured = true;

  try {
    const Delivery = require('../models/Delivery');
    const indexOptions = { background: true };
    const indexes = [
      { cityCode: 1, isCanceled: 1 },
      { cityCode: 1, isCanceled: 1, updatedAt: -1 },
      { cityCode: 1, isCanceled: 1, createdAt: -1 },
      { cityCode: 1, deliveryNumber: 1 },
      { cityCode: 1, linkedProgramacaoId: 1 },
      { cityCode: 1, programacaoId: 1 }
    ];

    Promise.all(indexes.map((index) => Delivery.collection.createIndex(index, indexOptions)))
      .then(() => console.log('[MONGO] indices criticos conferidos'))
      .catch((err) => console.warn('[MONGO] falha ao conferir indices criticos:', err && err.message));
  } catch (e) {
    console.warn('[MONGO] falha ao preparar indices criticos:', e && e.message);
  }
}

async function connectIfNeeded() {
  if (connected) return mongoose;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not provided');

  mongoose.set('strictQuery', false);

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // DEBUG: imprimir informações reais de conexão para diagnóstico
  try {
    console.log('[MONGO] uri:', (process.env.MONGODB_URI || '').replace(/\/\/.*@/, '//***@'));
    console.log('[MONGO] db name:', mongoose.connection.name);
    console.log('[MONGO] host:', mongoose.connection.host);
  } catch (e) {
    console.warn('[MONGO] debug log failed', e && e.message);
  }

  connected = true;
  console.log('✓ Connected to MongoDB');
  ensureCriticalIndexes();
  return mongoose;
}

module.exports = {
  connectIfNeeded,
  mongoose
};
