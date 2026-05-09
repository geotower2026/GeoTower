const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function corrigirCampos() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado no banco');

    const collection = mongoose.connection.collection('deliveries');

    const campos = [
      'documents.retiradaCheio',
      'documents.chegadaCliente',
      'documents.inicioDesova',
      'documents.fimDesova',
      'documents.entregaVazio'
    ];

    let totalCorrigidos = 0;

    for (const campo of campos) {
      console.log(`\n🔍 Verificando campo: ${campo}`);

      const filtro = {};
      filtro[campo] = { $type: 'string' };

      const docs = await collection.find(filtro).toArray();

      console.log(`📦 Encontrados: ${docs.length}`);

      for (const doc of docs) {
        try {
          let valor = campo.split('.').reduce((o, i) => o?.[i], doc);

          if (!valor) continue;

          let parsed = valor;

          for (let i = 0; i < 3; i++) {
            if (typeof parsed === 'string') {
              parsed = JSON.parse(parsed);
            }
          }

          if (!Array.isArray(parsed)) {
            console.log(`⚠️ Ignorado: ${doc._id}`);
            continue;
          }

          // monta objeto update
          const update = {};
          update[campo] = parsed;

          await collection.updateOne(
            { _id: doc._id },
            { $set: update }
          );

          totalCorrigidos++;
          console.log(`✔ Corrigido: ${doc._id}`);

        } catch (err) {
          console.log(`❌ Erro doc: ${doc._id}`);
        }
      }
    }

    console.log(`\n🚀 FINALIZADO! Total corrigidos: ${totalCorrigidos}`);
    process.exit();

  } catch (err) {
    console.error('❌ Erro geral:', err);
    process.exit(1);
  }
}

corrigirCampos();
