const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const Delivery = require('../models/Delivery');
    const ProgramacaoEntrega = require('../models/ProgramacaoEntrega');

    // Filtros da query
    const { startDate, endDate, contratado, minHours, maxHours } = req.query;
    console.log('📊 [PERFORMANCE] Filtros aplicados:', { startDate, endDate, contratado, minHours, maxHours });

    // Construir filtros para ProgramacaoEntrega
    let programacaoFilter = {};
    if (startDate || endDate) {
      programacaoFilter.dataAgendamento = {};
      if (startDate) programacaoFilter.dataAgendamento.$gte = new Date(startDate);
      if (endDate) programacaoFilter.dataAgendamento.$lte = new Date(endDate);
    }
    if (contratado && contratado !== 'todos') {
      programacaoFilter.contratado = contratado;
    }

    // Construir filtros para Delivery (tempo no cliente)
    let deliveryFilter = {};
    if (minHours || maxHours) {
      // Para filtrar por tempo, precisamos buscar todas e filtrar depois
      // pois o tempo é calculado entre arrivedAt e desovaEndAt
    }

    const [deliveries, programacoes] = await Promise.all([
      Delivery.find(deliveryFilter).lean().exec(),
      ProgramacaoEntrega.find(programacaoFilter).lean().exec()
    ]);

    const deliveryMap = {};
    deliveries.forEach(d => {
      const key = (d.deliveryNumber || '').toUpperCase().trim();
      if (key) deliveryMap[key] = d;
    });

    const enriched = programacoes.map(p => ({
      ...p,
      _entrega: 
        deliveryMap[(p.container || '').toUpperCase().trim()] ||
        deliveryMap[(p.processo || '').toUpperCase().trim()] ||
        null
    }));

    if (!enriched || enriched.length === 0) {
      return res.json({ success: true, data: { entregasPorDia: [], contratadosUtilizacao: [], tempoCliente: { tempoMedioHoras: 0 }, estatisticasGerais: { totalEntregas: 0 }, alertas: [] } });
    }

    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const deliveriesByDay = { 'Domingo': 0, 'Segunda': 0, 'Terça': 0, 'Quarta': 0, 'Quinta': 0, 'Sexta': 0, 'Sábado': 0 };
    const contractorsMap = {};
    let totalHours = 0, countWithTime = 0;
    // Faixas de tempo atualizadas conforme solicitado
    const faixas = { '1-3h': 0, '4-6h': 0, '7-9h': 0, '10h+': 0 };

    enriched.forEach(item => {
      const agendDate = item.dataAgendamento || item.dtColeta;
      if (agendDate) {
        const d = new Date(agendDate);
        if (!isNaN(d)) deliveriesByDay[dayNames[d.getDay()]]++;
      }

      const contratado = (item.contratado || 'Sem contratado').trim();
      if (!contractorsMap[contratado]) contractorsMap[contratado] = { contratado, totalEntregas: 0, diasAtivos: new Set() };
      contractorsMap[contratado].totalEntregas++;

      const entrega = item._entrega;
      if (entrega && entrega.arrivedAt && entrega.desovaEndAt) {
        const a = new Date(entrega.arrivedAt);
        const o = new Date(entrega.desovaEndAt);
        if (!isNaN(a) && !isNaN(o)) {
          const h = (o - a) / (1000 * 60 * 60);
          
          // Aplicar filtro de horas se especificado
          if ((minHours && h < parseFloat(minHours)) || (maxHours && h > parseFloat(maxHours))) {
            return; // Pular este item se não estiver na faixa
          }
          
          totalHours += h;
          countWithTime++;
          
          // Faixas atualizadas: 1-3h, 4-6h, 7-9h, 10h+
          if (h >= 1 && h < 4) faixas['1-3h']++;
          else if (h >= 4 && h < 7) faixas['4-6h']++;
          else if (h >= 7 && h < 10) faixas['7-9h']++;
          else if (h >= 10) faixas['10h+']++;
        }
      }
    });

    const deliveriesByDayArray = Object.entries(deliveriesByDay).map(([d, t]) => ({ dia: d, total: t }));
    const contractorsUsage = Object.values(contractorsMap).map(c => ({ contratado: c.contratado, totalEntregas: c.totalEntregas })).sort((a, b) => b.totalEntregas - a.totalEntregas);
    const tempoMedioHoras = countWithTime > 0 ? parseFloat((totalHours / countWithTime).toFixed(1)) : 0;
    const totalEntregas = enriched.length;
    
    // Calcular percentual para cada faixa
    const percentualFaixas = {};
    Object.keys(faixas).forEach(key => {
      percentualFaixas[key] = totalEntregas > 0 ? Math.round((faixas[key] / totalEntregas) * 100) : 0;
    });

    // Análise de dias: qual dia tem mais entregas
    const diaComMaisEntregas = deliveriesByDayArray.reduce((max, dia) => 
      dia.total > max.total ? dia : max, 
      { dia: 'Nenhum', total: 0 }
    );

    // Percentual do dia com mais entregas
    const percentualDiaMaisEntregas = totalEntregas > 0 ? Math.round((diaComMaisEntregas.total / totalEntregas) * 100) : 0;

    // Alertas atualizados
    const alertas = [];
    if (percentualFaixas['10h+'] > 10) {
      alertas.push({ 
        tipo: 'alert', 
        mensagem: `🔴 ${percentualFaixas['10h+']}% das entregas levam mais de 10 horas` 
      });
    }

    if (diaComMaisEntregas.total > 0 && percentualDiaMaisEntregas > 40) {
      alertas.push({ 
        tipo: 'warning', 
        mensagem: `⚠️ Concentração alta: ${diaComMaisEntregas.dia} tem ${percentualDiaMaisEntregas}% das entregas` 
      });
    }

    console.log('✅ Resposta pronta - Total:', totalEntregas, 'Dia com mais:', diaComMaisEntregas.dia);

    res.json({
      success: true,
      data: {
        entregasPorDia: deliveriesByDayArray,
        contratadosUtilizacao: contractorsUsage,
        tempoCliente: { 
          tempoMedioHoras, 
          faixas,
          percentualFaixas,
          diaComMaisEntregas,
          percentualDiaMaisEntregas
        },
        produtividadePorDia: deliveriesByDayArray,
        estatisticasGerais: {
          totalEntregas,
          tempoMedioHoras,
          percentualAcima6h: percentualFaixas['7-9h'] + percentualFaixas['10h+'],
          totalContratados: contractorsUsage.length
        },
        alertas
      }
    });
        tempoCliente: { tempoMedioHoras, faixas },
        produtividadePorDia: deliveriesByDayArray,
        estatisticasGerais: { totalEntregas, tempoMedioHoras, percentualAcima6h, totalContratados: contractorsUsage.length },
        alertas: percentualAcima6h > 20?[{ tipo: 'alert', mensagem: 'Alta concentração acima 6h' }] : []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro', error: error.message });
  }
});

module.exports = router;
