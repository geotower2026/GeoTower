const mongoose = require('mongoose');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not defined. Add it to your local .env before running this script.');
  process.exit(1);
}

async function debugEntregas() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB\n');

    const db = mongoose.connection.db;
    const entregas = ['MNBU3383801', 'ECMU5241902', 'ECMU5241841'];

    console.log('INVESTIGANDO ENTREGAS QUE NAO SUMIRAM:\n');

    for (const numero of entregas) {
      console.log(`\nEntrega: ${numero}`);
      console.log('-'.repeat(50));

      const delivery = await db.collection('deliveries').findOne({
        $or: [
          { numero },
          { numero: { $regex: numero, $options: 'i' } },
          { deliveryNumber: numero },
          { deliveryNumber: { $regex: numero, $options: 'i' } },
        ],
      });

      if (delivery) {
        console.log('Encontrado em deliveries:');
        console.log('  Status:', delivery.status);
        console.log('  containerReturned:', delivery.containerReturned);
        console.log('  horarioDevolucaoVazio:', delivery.horarioDevolucaoVazio);
        console.log('  Docs devolucaoVazio:', delivery.documents?.devolucaoVazio);
        console.log('  Docs devolucaoContainerVazio:', delivery.documents?.devolucaoContainerVazio);

        const hasMarker1 = delivery.observations?.includes('(CONTAINER_VAZIO_DEVOLVIDO)');
        const hasMarker2 = delivery.observations?.includes('(Baixa_Container)');

        if (hasMarker1 || hasMarker2) {
          console.log('  Markers encontrados:');
          if (hasMarker1) console.log('    - CONTAINER_VAZIO_DEVOLVIDO');
          if (hasMarker2) console.log('    - Baixa_Container');
        } else {
          console.log('  Sem markers especiais');
        }

        console.log('  Observacoes:', delivery.observations);
      } else {
        console.log('Nao encontrado em deliveries');
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Erro:', error.message);
    process.exitCode = 1;
  }
}

debugEntregas();
