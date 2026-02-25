import React, { useEffect, useState } from 'react';
import { adminService } from '../services/authService';
import axios from 'axios';

const colunas = [
  'Processo',
  'Recebedor',
  'Container',
  'Data Agendamento',
  'Contratado',
  'Motorista',
  'Status',
  'Data Retirada Cheio',
  'Chegada no Cliente',
  'Inicio',
  'Fim',
  'Docs',
  'Ações'
];

const BaseDadosGeral = () => {
  const [dados, setDados] = useState([]);
  const [deliveriesMap, setDeliveriesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgramacoes = async () => {
      setLoading(true);
      try {
        const res = await adminService.getProgramacoes();
        setDados(res.data.programacoes || []);

        // Buscar todas as deliveries para alimentar colunas de dados do fluxo
        try {
          const deliveriesRes = await axios.get('/api/admin/deliveries');
          const deliveries = deliveriesRes.data.deliveries || [];
          // Mapeia por deliveryNumber
          const map = {};
          deliveries.forEach(d => {
            map[(d.deliveryNumber || '').toUpperCase()] = d;
          });
          setDeliveriesMap(map);
        } catch (err) {
          console.warn('Erro ao buscar deliveries:', err);
          setDeliveriesMap({});
        }
      } catch (err) {
        setDados([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProgramacoes();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-6">Base de Dados Geral</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              {colunas.map(col => (
                <th key={col} className="px-2 py-2 border-b bg-slate-100 text-left font-semibold">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colunas.length} className="text-center py-6">Carregando...</td></tr>
            ) : (
              dados.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-slate-50">
                  <td className="border px-2 py-1">{item.processo}</td>
                  <td className="border px-2 py-1">{item.recebedor}</td>
                  <td className="border px-2 py-1">{item.container}</td>
                  <td className="border px-2 py-1">{item.dataAgendamento}</td>
                  <td className="border px-2 py-1">{item.contratado}</td>
                  <td className="border px-2 py-1">{item.motorista}</td>
                  <td className="border px-2 py-1">{item.status}</td>
                  <td className="border px-2 py-1 text-xs">{deliveriesMap[(item.container || item.processo || '').toUpperCase()]?.containerMontadoAt ? new Date(deliveriesMap[(item.container || item.processo || '').toUpperCase()].containerMontadoAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                  <td className="border px-2 py-1 text-xs">{deliveriesMap[(item.container || item.processo || '').toUpperCase()]?.arrivedAt ? new Date(deliveriesMap[(item.container || item.processo || '').toUpperCase()].arrivedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                  <td className="border px-2 py-1 text-xs">{deliveriesMap[(item.container || item.processo || '').toUpperCase()]?.desovaStartAt ? new Date(deliveriesMap[(item.container || item.processo || '').toUpperCase()].desovaStartAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                  <td className="border px-2 py-1 text-xs">{deliveriesMap[(item.container || item.processo || '').toUpperCase()]?.desovaEndAt ? new Date(deliveriesMap[(item.container || item.processo || '').toUpperCase()].desovaEndAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                  <td className="border px-2 py-1 text-xs">{deliveriesMap[(item.container || item.processo || '').toUpperCase()]?.documentsJustification || '-'}</td>
                  <td className="border px-2 py-1">{/* Ações */}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BaseDadosGeral;
