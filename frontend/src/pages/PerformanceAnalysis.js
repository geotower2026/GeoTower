import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { performanceService } from '../services/performanceService';

const PerformanceAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ 
    startDate: '', 
    endDate: '', 
    contratado: 'todos',
    minHours: '',
    maxHours: ''
  });
  const [contractorsList, setContractorsList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const response = await performanceService.getPerformanceData(filters);
      console.log('[PerformanceAnalysis] Dados recebidos:', response);
      
      if (response && response.entregasPorDia !== undefined) {
        setData(response);
        setError(null);
        console.log('[PerformanceAnalysis] Dados carregados com sucesso');
        
        // Extrair lista de contratados únicos para o filtro
        if (response.contratadosUtilizacao) {
          const contractors = response.contratadosUtilizacao.map(c => c.contratado);
          setContractorsList(['todos', ...contractors]);
        }
      } else {
        setError('Estrutura de dados inválida');
        console.error('[PerformanceAnalysis] Estrutura inválida:', response);
      }
    } catch (err) {
      console.error('[PerformanceAnalysis] Erro ao buscar performance:', err);
      setError(err.response?.data?.message || 'Erro de conexão com o servidor');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchData(true);
  };

  const handleClearFilters = () => {
    setFilters({ startDate: '', endDate: '' });
    setRefreshing(true);
    // Fetch sem filtros
    const tempFilters = { startDate: '', endDate: '' };
    performanceService.getPerformanceData(tempFilters)
      .then(response => {
        if (response && response.entregasPorDia !== undefined) {
          setData(response);
          setError(null);
        }
      })
      .catch(err => {
        console.error('[PerformanceAnalysis] Erro ao limpar filtros:', err);
        setError('Erro ao limpar filtros');
      })
      .finally(() => setRefreshing(false));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análise de performance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-6">
        <h3 className="font-bold mb-2">Erro ao carregar dados</h3>
        <p>{error}</p>
        <button 
          onClick={() => fetchData()}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Preparar dados para gráficos
  const dayData = data.entregasPorDia?.map(item => ({
    dia: item.dia,
    entregas: item.total
  })) || [];

  const contractorData = data.contratadosUtilizacao?.map(item => ({
    contratado: item.contratado,
    ativos: item.diasAtivos,
    ociosos: item.diasOciosos,
    totalEntregas: item.totalEntregas
  })) || [];

  // Converter faixas de objeto para array com as novas faixas
  const faixasObj = data.tempoCliente?.faixas || { '1-3h': 0, '4-6h': 0, '7-9h': 0, '10h+': 0 };
  const timeData = Object.entries(faixasObj).map(([nome, total]) => ({
    name: nome,
    value: total || 0
  })) || [];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">📊 Análise de Produtividade e Capacidade</h1>
        <p className="text-gray-600">Visualize dados analíticos de sua operação logística</p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data Inicial</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data Final</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contratado</label>
            <select
              value={filters.contratado}
              onChange={(e) => setFilters({...filters, contratado: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            >
              {contractorsList.map(contractor => (
                <option key={contractor} value={contractor}>
                  {contractor === 'todos' ? 'Todos os contratados' : contractor}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo Mínimo (h)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={filters.minHours}
              onChange={(e) => setFilters({...filters, minHours: e.target.value})}
              placeholder="Ex: 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo Máximo (h)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={filters.maxHours}
              onChange={(e) => setFilters({...filters, maxHours: e.target.value})}
              placeholder="Ex: 10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleApplyFilters}
            disabled={refreshing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-semibold transition"
          >
            {refreshing ? 'Carregando...' : 'Aplicar Filtros'}
          </button>
          <button
            onClick={handleClearFilters}
            disabled={refreshing}
            className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white px-4 py-2 rounded-md font-semibold transition"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Alertas */}
      {data.alertas && data.alertas.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🚨</span>
            Alertas Automáticos
          </h2>
          <div className="space-y-2">
            {data.alertas.map((alert, index) => {
              const mensagem = typeof alert === 'string' ? alert : alert.mensagem;
              return (
                <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded">
                  <p className="font-semibold">{mensagem}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Entregas</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{data.estatisticasGerais?.totalEntregas || 0}</p>
            </div>
            <span className="text-4xl text-blue-200">📦</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Tempo Médio</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{data.tempoCliente?.tempoMedioHoras?.toFixed(1) || 0}h</p>
            </div>
            <span className="text-4xl text-green-200">⏱️</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Dia com + Entregas</h3>
              <p className="text-lg font-bold text-purple-600 mt-1">{data.tempoCliente?.diaComMaisEntregas?.dia || 'N/A'}</p>
              <p className="text-sm text-gray-500">{data.tempoCliente?.diaComMaisEntregas?.total || 0} entregas</p>
            </div>
            <span className="text-4xl text-purple-200">📅</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Entregas {'>'}6h</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{data.estatisticasGerais?.percentualAcima6h?.toFixed(1) || 0}%</p>
            </div>
            <span className="text-4xl text-red-200">⚠️</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Contratados</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{data.estatisticasGerais?.totalContratados || 0}</p>
            </div>
            <span className="text-4xl text-indigo-200">🚚</span>
          </div>
        </div>
      </div>

      {/* Análise de Dias */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span>📅</span>
          Análise de Dias da Semana
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Dia com Mais Entregas</h3>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
              <div className="text-center">
                <h4 className="text-2xl font-bold mb-2">{data.tempoCliente?.diaComMaisEntregas?.dia || 'N/A'}</h4>
                <p className="text-lg">{data.tempoCliente?.diaComMaisEntregas?.total || 0} entregas</p>
                <p className="text-sm opacity-90">({data.tempoCliente?.percentualDiaMaisEntregas || 0}% do total)</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Distribuição por Dia</h3>
            <div className="space-y-2">
              {dayData
                .sort((a, b) => b.entregas - a.entregas)
                .map((dia, index) => (
                <div key={dia.dia} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{dia.dia}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(dia.entregas / Math.max(...dayData.map(d => d.entregas))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{dia.entregas}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico 2: Utilização dos contratados */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span>🚚</span>
          Utilização dos Contratados
        </h2>
        {contractorData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contractorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="contratado" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ativos" stackId="a" fill="#82ca9d" name="Dias Ativos" radius={[8, 8, 0, 0]} />
              <Bar dataKey="ociosos" stackId="a" fill="#ffc658" name="Dias Ociosos" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">Sem dados disponíveis</p>
        )}
      </div>

      {/* Gráfico 3: Faixas de tempo */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span>⏱️</span>
          Distribuição de Tempo no Cliente
        </h2>
        {timeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={timeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {timeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">Sem dados disponíveis</p>
        )}
      </div>

      {/* Estatísticas Detalhadas das Faixas */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span>📊</span>
          Estatísticas Detalhadas por Faixa de Tempo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.tempoCliente?.percentualFaixas || {}).map(([faixa, percentual]) => (
            <div key={faixa} className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg text-gray-800">{faixa}</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">{data.tempoCliente?.faixas?.[faixa] || 0}</p>
              <p className="text-sm text-gray-500">entregas ({percentual}%)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span>📋</span>
          Detalhes dos Contratados
        </h2>
        {contractorData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Contratado</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Entregas</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Dias Ativos</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Dias Ociosos</th>
                </tr>
              </thead>
              <tbody>
                {contractorData.map((contractor, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{contractor.contratado}</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">{contractor.totalEntregas}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                        {contractor.ativos}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                        {contractor.ociosos}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">Sem dados de contratados disponíveis</p>
        )}
      </div>
    </div>
  );
};

export default PerformanceAnalysis;