import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { adminService } from '../services/authService';
import { useAuth } from '../services/authContext';
import {
  FaArrowLeft,
  FaPlus,
  FaEye,
  FaTruck,
  FaBox,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaFileAlt,
  FaUndo,
  FaShippingFast,
  FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';

/* ─── Status Columns Configuration ────────────────────────────────────── */
const STATUS_COLUMNS = [
  {
    key: 'NOVO_PROCESSO',
    title: 'Novo Processo',
    description: 'Processos sem motorista atribuído',
    icon: <FaPlus className="text-blue-400" />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    filter: (p) => !p.motorista || p.motorista === '-' || p.motorista.trim() === ''
  },
  {
    key: 'PROGRAMADO',
    title: 'Processo Programado',
    description: 'Processos agendados com motorista',
    icon: <FaClock className="text-purple-400" />,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    filter: (p) => p.status === 'AGENDADO' && p.motorista && p.motorista !== '-' && p.motorista.trim() !== ''
  },
  {
    key: 'CNTR_COLETADO',
    title: 'CNTR Coletado',
    description: 'Container montado',
    icon: <FaBox className="text-green-400" />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    filter: (p) => p.status === 'CONTAINER_MONTADO'
  },
  {
    key: 'INICIAR_VIAGEM',
    title: 'Iniciar Viagem',
    description: 'A caminho do cliente',
    icon: <FaTruck className="text-orange-400" />,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    filter: (p) => p.status === 'A_CAMINHO_DO_CLIENTE'
  },
  {
    key: 'CHEGADA_CLIENTE',
    title: 'Chegada ao Cliente',
    description: 'Aguardando desova',
    icon: <FaMapMarkerAlt className="text-yellow-400" />,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    filter: (p) => p.status === 'AGUARDANDO_DESOVA'
  },
  {
    key: 'OPERACAO_INICIADA',
    title: 'Operação Iniciada',
    description: 'Em desova',
    icon: <FaShippingFast className="text-red-400" />,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    filter: (p) => p.status === 'EM_DESOVA'
  },
  {
    key: 'OPERACAO_FINALIZADA',
    title: 'Operação Finalizada',
    description: 'Desova concluída',
    icon: <FaCheckCircle className="text-emerald-400" />,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    filter: (p) => p.status === 'FINALIZADO' || p.status === 'ENTREGUE'
  },
  {
    key: 'ANEXANDO_DOCUMENTOS',
    title: 'Anexando Documentos',
    description: 'Anexando documentos finais',
    icon: <FaFileAlt className="text-indigo-400" />,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-800',
    filter: (p) => p.status === 'ANEXANDO_DOCUMENTOS_FINAIS'
  },
  {
    key: 'VIAGEM_RETORNO',
    title: 'Viagem Retorno',
    description: 'Em rota de retorno',
    icon: <FaUndo className="text-cyan-400" />,
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-800',
    filter: (p) => p.status === 'EM_ROTA'
  },
  {
    key: 'CNTR_ENTREGUE',
    title: 'CNTR Entregue',
    description: 'Container devolvido',
    icon: <FaCheckCircle className="text-teal-400" />,
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-800',
    filter: (p) => p.status === 'ENTREGUE'
  }
];

/* ─── Process Card Component ──────────────────────────────────────────── */
const ProcessCard = ({ process, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => onViewDetails(process)}>
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold text-gray-900 text-sm">
          {process.processo}
        </div>
        <div className="text-xs text-gray-500">
          {process.container || 'N/A'}
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        <div><strong>Recebedor:</strong> {process.recebedor}</div>
        <div><strong>Contratado:</strong> {process.contratado}</div>
        {process.motorista && process.motorista !== '-' && (
          <div><strong>Motorista:</strong> {process.motorista}</div>
        )}
        <div><strong>Agendamento:</strong> {process.dataAgendamento}</div>
      </div>

      {process.observacoes && (
        <div className="mt-2 text-xs text-gray-500 italic">
          {process.observacoes}
        </div>
      )}
    </div>
  );
};

/* ─── Status Column Component ────────────────────────────────────────── */
const StatusColumn = ({ column, processes, onViewDetails }) => {
  return (
    <div className={`flex-1 min-w-0 ${column.bgColor} rounded-lg border ${column.borderColor} p-4`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {column.icon}
        </div>
        <div>
          <h3 className={`font-semibold ${column.textColor}`}>
            {column.title}
          </h3>
          <p className="text-xs text-gray-600">
            {column.description}
          </p>
        </div>
        <div className="ml-auto">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${column.bgColor} ${column.textColor} border ${column.borderColor}`}>
            {processes.length}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {processes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-2xl mb-2">{column.icon}</div>
            <p className="text-sm">Nenhum processo</p>
          </div>
        ) : (
          processes.map(process => (
            <ProcessCard
              key={process._id}
              process={process}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────── */
const MonitorProcessos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [programacoes, setProgramacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);

  useEffect(() => {
    if (!user || !['manager', 'admin', 'geomar'].includes(user.role)) {
      navigate('/home');
      return;
    }
    loadProgramacoes();
  }, [user, navigate]);

  const loadProgramacoes = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProgramacoes();
      setProgramacoes(response.data || []);
    } catch (error) {
      setToast({
        message: 'Erro ao carregar programações',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (process) => {
    setSelectedProcess(process);
    // Aqui você pode abrir um modal ou navegar para detalhes
    console.log('Visualizar detalhes:', process);
  };

  const getProcessesByStatus = (filterFn) => {
    return programacoes.filter(filterFn);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSync className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando processos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast} setToast={setToast} />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft />
                <span className="hidden sm:inline">Voltar</span>
              </button>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Monitor de Processos
                </h1>
                <p className="text-sm text-gray-600">
                  Acompanhe o status de todos os processos de entrega
                </p>
              </div>
            </div>

            <button
              onClick={loadProgramacoes}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {STATUS_COLUMNS.map(column => (
            <StatusColumn
              key={column.key}
              column={column}
              processes={getProcessesByStatus(column.filter)}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resumo Geral
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-4">
            {STATUS_COLUMNS.map(column => {
              const count = getProcessesByStatus(column.filter).length;
              return (
                <div key={column.key} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${column.bgColor} border ${column.borderColor} mb-2`}>
                    {column.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600">{column.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Process Details Modal (placeholder) */}
      {selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Detalhes do Processo</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Processo:</strong> {selectedProcess.processo}</p>
              <p><strong>Recebedor:</strong> {selectedProcess.recebedor}</p>
              <p><strong>Container:</strong> {selectedProcess.container}</p>
              <p><strong>Status:</strong> {selectedProcess.status}</p>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedProcess(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  // Implementar navegação para edição
                  setSelectedProcess(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorProcessos;