// Script de migração para marcar containerReturned = true em processos FINALIZADO existentes
// Execute com: node scripts/migrate_container_returned.js

const mongoose = require('mongoose');
require('dotenv').config();

const ProgramacaoEntrega = require('../src/models/ProgramacaoEntrega');

async function migrateContainerReturned() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/delivery');
    console.log('Conectado ao MongoDB');

    // Buscar processos FINALIZADO sem containerReturned definido ou false
    const processosParaMigrar = await ProgramacaoEntrega.find({
      status: 'FINALIZADO',
      $or: [
        { containerReturned: { $exists: false } },
        { containerReturned: false }
      ]
    });

    console.log(`Encontrados ${processosParaMigrar.length} processos para migrar`);

    // Atualizar cada um
    for (const processo of processosParaMigrar) {
      await ProgramacaoEntrega.findByIdAndUpdate(processo._id, {
        containerReturned: true,
        editedBy: 'Sistema - Migração',
        editedAt: new Date()
      });
      console.log(`Migrado: ${processo.processo} (${processo._id})`);
    }

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro na migração:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

migrateContainerReturned();