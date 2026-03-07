require('dotenv').config();
const mongoose = require('mongoose');
const Delivery = require('../src/models/Delivery');
const Ycompany = require('../src/models/Ycompany');
const { connectIfNeeded } = require('../src/db/mongo');

async function syncDeliveryDatesToYcompany() {
  try {
    await connectIfNeeded();
    console.log('🔄 Iniciando sincronização de datas de entregas para Ycompany...');

    // Buscar todas as entregas
    const deliveries = await Delivery.find({}).lean();
    console.log(`📦 Encontradas ${deliveries.length} entregas`);

    let updatedCount = 0;

    for (const delivery of deliveries) {
      const deliveryNumber = delivery.deliveryNumber;
      if (!deliveryNumber) continue;

      // Tentar encontrar Ycompany por linkedYcompanyId ou por campos
      let ycompanyRecord = null;

      if (delivery.linkedYcompanyId) {
        ycompanyRecord = await Ycompany.findById(delivery.linkedYcompanyId);
      }

      if (!ycompanyRecord) {
        // Buscar por campos
        ycompanyRecord = await Ycompany.findOne({
          $or: [
            { geomaritima: new RegExp(`^${deliveryNumber}$`, 'i') },
            { numero: new RegExp(`^${deliveryNumber}$`, 'i') },
            { containerNumero: new RegExp(`^${deliveryNumber}$`, 'i') },
            { processo: new RegExp(`^${deliveryNumber}$`, 'i') },
            { codigo: new RegExp(`^${deliveryNumber}$`, 'i') },
            { geomaritima: deliveryNumber },
            { numero: deliveryNumber },
            { containerNumero: deliveryNumber },
            { processo: deliveryNumber },
            { codigo: deliveryNumber }
          ]
        });
      }

      if (!ycompanyRecord) {
        console.log(`❌ Ycompany não encontrado para entrega: ${deliveryNumber}`);
        continue;
      }

      const updates = {};

      // Mapear datas da entrega para Ycompany
      if ((delivery.status === 'A_CAMINHO_DO_CLIENTE' || delivery.status === 'EM_DESOVA' || delivery.status === 'AGUARDANDO_ANEXO' || delivery.status === 'ANEXANDO_DOCUMENTOS_FINAIS' || delivery.status === 'EM_ROTA' || delivery.status === 'ENTREGUE' || delivery.status === 'FINALIZADO') && !ycompanyRecord.dtInicioRota) {
        // Para dtInicioRota, usar quando iniciou a rota, aproximar com createdAt se não tiver arrivedAt
        updates.dtInicioRota = delivery.arrivedAt || delivery.createdAt;
      }

      if (delivery.desovaStartAt && !ycompanyRecord.dtInicioDescarga) {
        updates.dtInicioDescarga = delivery.desovaStartAt;
      }

      if (delivery.desovaEndAt && !ycompanyRecord.dtFimDescarga) {
        updates.dtFimDescarga = delivery.desovaEndAt;
      }

      if (delivery.containerMontadoAt && !ycompanyRecord.dtRetiraPD) {
        updates.dtRetiraPD = delivery.containerMontadoAt;
      }

      if (delivery.horarioDevolucaoVazio && !ycompanyRecord.dtDevolucaoCNTR) {
        updates.dtDevolucaoCNTR = delivery.horarioDevolucaoVazio;
      }

      // Verificar observations para CONTAINER_VAZIO_DEVOLVIDO
      if (delivery.observations && delivery.observations.includes('(CONTAINER_VAZIO_DEVOLVIDO)') && !ycompanyRecord.dtDevolucaoCNTR) {
        updates.dtDevolucaoCNTR = delivery.updatedAt; // Usar updatedAt como aproximado
      }

      if (Object.keys(updates).length > 0) {
        await Ycompany.findByIdAndUpdate(ycompanyRecord._id, updates);
        console.log(`✅ Atualizado Ycompany ${ycompanyRecord.codigo}:`, Object.keys(updates));
        updatedCount++;
      }
    }

    console.log(`🎉 Sincronização concluída! ${updatedCount} registros Ycompany atualizados.`);
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  } finally {
    mongoose.connection.close();
  }
}

syncDeliveryDatesToYcompany();