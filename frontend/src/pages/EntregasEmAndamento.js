import React, { useEffect, useState } from 'react';
import { deliveryService } from '../services/authService';
import { useAuth } from '../services/authContext';
import Toast from '../components/Toast';

export default function EntregasEmAndamento() {
  const { user } = useAuth();
  const [programacoes, setProgramacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProgramacoes();
    // eslint-disable-next-line
  }, [user]);

  const loadProgramacoes = async () => {
    setLoading(true);
    try {
      const res = await deliveryService.getProgramacoesAssigned();
      const todas = res.data.programacoes || [];
      let nomeFiltro = '';
      if (user) {
        nomeFiltro = (user.username || user.name || '').trim().toUpperCase();
      }
      // Filtra entregas com status diferente de AGENDADO
      setProgramacoes(todas.filter(p => String(p.contratado).trim().toUpperCase() === nomeFiltro && p.status !== 'AGENDADO'));
    } catch (err) {
      setToast({ message: 'Erro ao carregar entregas em andamento', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-2 sm:px-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Entregas em Andamento</h2>
      {toast && <Toast message={toast.message} type={toast.type} />}
      {loading ? (
        <div className="text-center text-gray-500">Carregando...</div>
      ) : (
        programacoes.length === 0 ? (
          <div className="bg-white p-4 rounded shadow text-center">Nenhuma entrega em andamento encontrada</div>
        ) : (
          programacoes.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg mb-4 flex flex-col gap-2 p-4 border border-gray-200"
              style={{ boxShadow: '0 4px 16px rgba(102,126,234,0.08)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-emerald-700">Processo: {p.processo}</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{new Date(p.dataAgendamento).toLocaleString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <span className="text-base font-bold text-blue-700">Recebedor:</span>
                <span className="text-base font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">{p.recebedor}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <span className="text-base font-bold text-purple-700">Motorista:</span>
                <span className="text-base font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">{p.motorista || '-'}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm text-gray-700">Container: <span className="font-semibold">{p.container}</span></span>
                <span className="text-sm text-gray-700">Status: <span className="font-bold text-blue-600">{p.status}</span></span>
                <span className="text-sm text-gray-700">Contratado: <span className="font-semibold">{p.contratado}</span></span>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}
