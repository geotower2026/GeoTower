import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, deliveryService } from '../services/authService';
import { useAuth } from '../services/authContext';

const EntregasCanhotosPendentes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadPendentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPendentes = async () => {
    setLoading(true);
    try {
      const res = await adminService.getProgramacoes();
      const todas = res.data.programacoes || [];
      const nomeFiltro = (user?.username || user?.name || '').trim().toUpperCase();
      const minhas = todas.filter(p => String(p.contratado).trim().toUpperCase() === nomeFiltro);
      const pendentes = minhas.filter(p => String(p.status || '').toUpperCase() === 'ENTREGUE_COM_PENDENCIA_CANHOTO');
      setItems(pendentes);
    } catch (err) {
      console.error('Erro ao carregar pendentes:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnexar = async (p, pending) => {
    // navigate to programadas and request opening the flow at finalDocs with pending info
    let url = `/entregas-programadas?q=${encodeURIComponent(p.processo || p.container || '')}`;
    url += `&step=finalDocs`;
    if (pending) {
      url += `&pending=${encodeURIComponent(pending)}`;
    }
    navigate(url);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <button onClick={() => navigate('/home')} className="text-sm text-purple-600 mb-4">← Voltar</button>
      <h2 className="text-2xl font-bold mb-4">Entregas com Canhotos Pendentes</h2>
      {loading ? (
        <div className="py-10 text-center">Carregando...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded p-6">Nenhuma entrega com canhotos pendentes.</div>
      ) : (
        <div className="space-y-4">
          {items.map(p => {
            const pendingDocs = p.missingDocumentsAtSubmit || [];
            const pending = pendingDocs.length > 0 ? pendingDocs[0] : '';
            return (
            <div key={p._id} className="bg-white rounded shadow p-4 flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">Processo</div>
                <div className="font-bold text-lg">{p.processo || p.container}</div>
                <div className="text-xs text-gray-600">Container: {p.container || '-'}</div>
                <div className="text-xs text-gray-600">Recebedor: {p.recebedor || '-'}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAnexar(p, pending)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded"
                >
                  Anexar Canhoto
                </button>
                <button onClick={() => navigate('/entregas-programadas')} className="px-4 py-2 bg-gray-200 rounded">Abrir Programadas</button>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default EntregasCanhotosPendentes;
