import React, { useEffect, useState } from 'react';
import { adminService } from '../services/authService';
import { FaEdit, FaTrash, FaTimes, FaArrowLeft, FaFilter, FaSync } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const BaseDadosGeral = () => {
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    status: 'all',
    motorista: '',
    contratado: '',
    searchTerm: ''
  });

  // Função para retornar o status dos documentos
  const getDocumentsStatus = (delivery) => {
    if (!delivery) return 'PENDENTE';
    const requiredDocs = ['canhotCTE', 'diarioBordo', 'canhotNF', 'devolucaoVazio'];
    const docs = delivery.documents || {};
    const allAttached = requiredDocs.every(doc => docs[doc]);
    if (allAttached) return 'COMPLETO';
    const pending = requiredDocs.filter(doc => !docs[doc]);
    const pendingNames = pending.map(doc => {
      if (doc === 'canhotCTE') return 'CTE';
      if (doc === 'canhotNF') return 'NF';
      if (doc === 'diarioBordo') return 'DIÁRIO';
      if (doc === 'devolucaoVazio') return 'RIC';
      return doc;
    }).join(' + ');
    return `PENDENTE ${pendingNames}`;
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      const progRes = await adminService.getProgramacoes();
      const programacoes = progRes.data.programacoes || [];
      const entrRes = await adminService.getDeliveries({});
      const entregas = entrRes.data.deliveries || [];
      
      const mapEntregas = {};
      entregas.forEach(e => {
        const key = (e.deliveryNumber || '').toUpperCase().trim();
        if (key) mapEntregas[key] = e;
      });
      
      const dadosEnriquecidos = programacoes.map(prog => {
        const chaveContainer = (prog.container || '').toUpperCase().trim();
        const chaveProcesso = (prog.processo || '').toUpperCase().trim();
        const entrega = mapEntregas[chaveContainer] || mapEntregas[chaveProcesso];
        return { ...prog, _entrega: entrega || null };
      });
      
      setDados(dadosEnriquecidos);
      aplicarFiltros(dadosEnriquecidos);
    } catch (err) {
      console.error('Erro:', err);
      setToast({ message: 'Erro ao carregar dados', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (dataToFilter = dados) => {
    let filtered = dataToFilter;
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    if (filters.motorista) {
      filtered = filtered.filter(item => 
        (item.motorista || '').toLowerCase().includes(filters.motorista.toLowerCase()) ||
        (item._entrega?.driverName || '').toLowerCase().includes(filters.motorista.toLowerCase())
      );
    }
    if (filters.contratado) {
      filtered = filtered.filter(item => 
        (item.contratado || '').toLowerCase().includes(filters.contratado.toLowerCase())
      );
    }
    if (filters.searchTerm) {
      filtered = filtered.filter(item =>
        (item.processo || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (item.recebedor || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (item.container || '').toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filters]);

  const handleCellChange = async (itemId, field, value) => {
    try {
      const item = dados.find(d => d._id === itemId);
      if (!item) return;

      // Se for campo da programação
      if (['processo', 'recebedor', 'container', 'dataAgendamento', 'contratado', 'motorista', 'status'].includes(field)) {
        await adminService.updateProgramacao(itemId, { [field]: value });
      } 
      // Se for campo da entrega
      else if (item._entrega && ['observations', 'submissionObservation'].includes(field)) {
        await adminService.updateDelivery(item._entrega._id, { [field]: value });
      }

      setToast({ message: 'Atualizado com sucesso', type: 'success' });
      setEditingCell(null);
      carregarDados();
    } catch (err) {
      setToast({ message: 'Erro ao atualizar', type: 'error' });
    }
  };

  const handleDelete = async (id, item) => {
    if (window.confirm('Deletar esta entrada (entrega também será removida da Torre de Controle)?')) {
      try {
        await adminService.deleteProgramacao(id);
        if (item._entrega && item._entrega._id) {
          await adminService.deleteDelivery(item._entrega._id);
        }
        setToast({ message: 'Deletado com sucesso', type: 'success' });
        carregarDados();
      } catch (err) {
        setToast({ message: 'Erro ao deletar', type: 'error' });
      }
    }
  };

  const renderEditableCell = (item, field, value) => {
    const isEditing = editingCell?.id === item._id && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <input
          autoFocus
          type={field.includes('data') || field.includes('horario') ? 'datetime-local' : 'text'}
          value={value || ''}
          onChange={(e) => handleCellChange(item._id, field, e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      );
    }

    return (
      <div
        onClick={() => setEditingCell({ id: item._id, field })}
        className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition min-h-6 flex items-center"
        title="Clique para editar"
      >
        {value || '-'}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-full transition"
              title="Voltar"
            >
              <FaArrowLeft size={20} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Base de Dados Geral</h1>
              <p className="text-sm text-gray-600">Edite clicando nas células (estilo Excel)</p>
            </div>
          </div>
          <button
            onClick={() => { carregarDados(); setToast({ message: 'Dados recarregados', type: 'success' }); }}
            className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
            title="Recarregar"
          >
            <FaSync size={20} />
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              <FaFilter size={16} />
              Filtros
            </button>
            <span className="text-sm text-gray-600">
              Mostrando {filteredData.length} de {dados.length} registros
            </span>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Buscar</label>
                <input
                  type="text"
                  placeholder="Processo, Recebedor, Container..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos</option>
                  <option value="AGENDADO">AGENDADO</option>
                  <option value="EM_ROTA">EM_ROTA</option>
                  <option value="ENTREGUE">ENTREGUE</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Motorista</label>
                <input
                  type="text"
                  placeholder="Nome do motorista..."
                  value={filters.motorista}
                  onChange={(e) => setFilters({...filters, motorista: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Contratado</label>
                <input
                  type="text"
                  placeholder="Nome do contratado..."
                  value={filters.contratado}
                  onChange={(e) => setFilters({...filters, contratado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-4">
                <button
                  onClick={() => setFilters({ status: 'all', motorista: '', contratado: '', searchTerm: '' })}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition text-sm"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum registro encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Processo</th>
                    <th className="px-4 py-3 text-left font-semibold">Recebedor</th>
                    <th className="px-4 py-3 text-left font-semibold">Container</th>
                    <th className="px-4 py-3 text-left font-semibold">Data Agendamento</th>
                    <th className="px-4 py-3 text-left font-semibold">Contratado</th>
                    <th className="px-4 py-3 text-left font-semibold">Motorista</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Data Retirada</th>
                    <th className="px-4 py-3 text-left font-semibold">Chegada</th>
                    <th className="px-4 py-3 text-left font-semibold">Início</th>
                    <th className="px-4 py-3 text-left font-semibold">Fim</th>
                    <th className="px-4 py-3 text-left font-semibold">Docs</th>
                    <th className="px-4 py-3 text-left font-semibold">Observações</th>
                    <th className="px-4 py-3 text-left font-semibold">Obs Submissão</th>
                    <th className="px-4 py-3 text-center font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <tr key={item._id} className={`border-b transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                      <td className="px-4 py-3">{renderEditableCell(item, 'processo', item.processo)}</td>
                      <td className="px-4 py-3">{renderEditableCell(item, 'recebedor', item.recebedor)}</td>
                      <td className="px-4 py-3">{renderEditableCell(item, 'container', item.container)}</td>
                      <td className="px-4 py-3">{renderEditableCell(item, 'dataAgendamento', item.dataAgendamento)}</td>
                      <td className="px-4 py-3">{renderEditableCell(item, 'contratado', item.contratado)}</td>
                      <td className="px-4 py-3">{renderEditableCell(item, 'motorista', item.motorista || item._entrega?.driverName)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={item.status}
                          onChange={(e) => handleCellChange(item._id, 'status', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded cursor-pointer hover:bg-blue-50 text-xs"
                        >
                          <option value="AGENDADO">AGENDADO</option>
                          <option value="EM_ROTA">EM_ROTA</option>
                          <option value="ENTREGUE">ENTREGUE</option>
                          <option value="CANCELADO">CANCELADO</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs">{item._entrega?.containerMontadoAt ? new Date(item._entrega.containerMontadoAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                      <td className="px-4 py-3 text-xs">{item._entrega?.horarioChegada ? new Date(item._entrega.horarioChegada).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : (item._entrega?.arrivedAt ? new Date(item._entrega.arrivedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-')}</td>
                      <td className="px-4 py-3 text-xs">{item._entrega?.horarioInicioDesova ? new Date(item._entrega.horarioInicioDesova).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : (item._entrega?.desovaStartAt ? new Date(item._entrega.desovaStartAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-')}</td>
                      <td className="px-4 py-3 text-xs">{item._entrega?.horarioFimDesova ? new Date(item._entrega.horarioFimDesova).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : (item._entrega?.desovaEndAt ? new Date(item._entrega.desovaEndAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                          getDocumentsStatus(item._entrega).includes('COMPLETO') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getDocumentsStatus(item._entrega)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs max-w-xs">{renderEditableCell(item, 'observations', item._entrega?.observations)}</td>
                      <td className="px-4 py-3 text-xs max-w-xs">{renderEditableCell(item, 'submissionObservation', item._entrega?.submissionObservation)}</td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleDelete(item._id, item)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs font-semibold"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default BaseDadosGeral;
