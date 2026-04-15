// Nova rota para análise de produtividade e capacidade
const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

// Conexão MongoDB (reutilizar lógica existente)
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGO_DB || "delivery-docs";
const COLLECTION = process.env.MONGO_COLLECTION || "icompany";

// Middleware de autenticação (reutilizar existente)
const auth = require('../middleware/auth');

// GET /api/admin/performance
router.get('/performance', auth, async (req, res) => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    // Filtros de data (última semana)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Entregas por dia da semana
    const deliveriesByDay = await collection.aggregate([
      {
        $match: {
          dtColeta: { $gte: weekAgo, $lte: now },
          status: { $ne: 'CANCELADO' } // Excluir cancelados
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$dtColeta' },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          dia: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 1] }, then: 'Domingo' },
                { case: { $eq: ['$_id', 2] }, then: 'Segunda' },
                { case: { $eq: ['$_id', 3] }, then: 'Terça' },
                { case: { $eq: ['$_id', 4] }, then: 'Quarta' },
                { case: { $eq: ['$_id', 5] }, then: 'Quinta' },
                { case: { $eq: ['$_id', 6] }, then: 'Sexta' },
                { case: { $eq: ['$_id', 7] }, then: 'Sábado' }
              ],
              default: 'Desconhecido'
            }
          },
          total: 1
        }
      },
      { $sort: { '_id': 1 } }
    ]).toArray();

    // 2. Utilização dos contratados
    const contractorsUsage = await collection.aggregate([
      {
        $match: {
          dtColeta: { $gte: weekAgo, $lte: now },
          contratado: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$contratado',
          totalEntregas: { $sum: 1 },
          diasAtivos: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$dtColeta' } } }
        }
      },
      {
        $project: {
          contratado: '$_id',
          totalEntregas: 1,
          diasAtivos: { $size: '$diasAtivos' },
          diasOciosos: { $subtract: [7, { $size: '$diasAtivos' }] }
        }
      },
      { $sort: { totalEntregas: -1 } }
    ]).toArray();

    // 3. Tempo no cliente
    const timeAtClient = await collection.aggregate([
      {
        $match: {
          dataChegadaCliente: { $exists: true },
          dataSaidaCliente: { $exists: true },
          dtColeta: { $gte: weekAgo, $lte: now }
        }
      },
      {
        $project: {
          tempoHoras: {
            $divide: [
              { $subtract: ['$dataSaidaCliente', '$dataChegadaCliente'] },
              1000 * 60 * 60 // ms para horas
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          tempoMedioHoras: { $avg: '$tempoHoras' },
          faixas: {
            $push: {
              $switch: {
                branches: [
                  { case: { $and: [{ $gte: ['$tempoHoras', 2] }, { $lt: ['$tempoHoras', 4] }] }, then: '2-4h' },
                  { case: { $and: [{ $gte: ['$tempoHoras', 4] }, { $lt: ['$tempoHoras', 6] }] }, then: '4-6h' },
                  { case: { $gte: ['$tempoHoras', 7] }, then: '+7h' }
                ],
                default: 'outros'
              }
            }
          }
        }
      },
      {
        $project: {
          tempoMedioHoras: { $round: ['$tempoMedioHoras', 1] },
          faixas: {
            $reduce: {
              input: '$faixas',
              initialValue: { '2-4h': 0, '4-6h': 0, '+7h': 0 },
              in: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$$this', '2-4h'] }, then: { $add: ['$$value.2-4h', 1] } },
                    { case: { $eq: ['$$this', '4-6h'] }, then: { $add: ['$$value.4-6h', 1] } },
                    { case: { $eq: ['$$this', '+7h'] }, then: { $add: ['$$value.+7h', 1] } }
                  ],
                  default: '$$value'
                }
              }
            }
          }
        }
      }
    ]).toArray();

    // 4. Produtividade por dia (igual ao 1, mas garantido)
    const productivityByDay = deliveriesByDay; // Reutilizar

    // Estatísticas gerais
    const totalDeliveries = await collection.countDocuments({
      dtColeta: { $gte: weekAgo, $lte: now },
      status: { $ne: 'CANCELADO' }
    });

    const activeContractors = contractorsUsage.length;

    const longDeliveries = timeAtClient[0]?.faixas?.['+7h'] || 0;
    const percentLong = totalDeliveries > 0 ? Math.round((longDeliveries / totalDeliveries) * 100) : 0;

    // Alertas automáticos
    const alerts = [];
    const mondayDeliveries = deliveriesByDay.find(d => d.dia === 'Segunda')?.total || 0;
    const totalWeek = deliveriesByDay.reduce((sum, d) => sum + d.total, 0);
    if (mondayDeliveries > totalWeek * 0.3) {
      alerts.push('Alta concentração de entregas no início da semana');
    }
    const idleContractors = contractorsUsage.filter(c => c.diasOciosos > 2).length;
    if (idleContractors > 0) {
      alerts.push(`${idleContractors} contratados com mais de 2 dias ociosos`);
    }
    if (percentLong > 20) {
      alerts.push(`Alta quantidade de entregas acima de 6h (${percentLong}%)`);
    }

    res.json({
      success: true,
      data: {
        totalDeliveries,
        tempoMedioHoras: timeAtClient[0]?.tempoMedioHoras || 0,
        percentLongDeliveries: percentLong,
        activeContractors,
        deliveriesByDay,
        contractorsUsage,
        timeAtClient: timeAtClient[0] || { tempoMedioHoras: 0, faixas: {} },
        productivityByDay,
        alerts
      }
    });

    await client.close();
  } catch (error) {
    console.error('Erro na análise de performance:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router;