import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Clock3,
  Filter,
  Package,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  Users
} from 'lucide-react';
import { performanceService } from '../services/performanceService';

const defaultFilters = {
  startDate: '',
  endDate: '',
  contratado: 'todos',
  minHours: '',
  maxHours: ''
};

const COLORS = ['#0F766E', '#2563EB', '#D97706', '#DC2626'];

const cardBase =
  'rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300';

const sectionBase =
  'rounded-2xl border border-slate-200 bg-white shadow-sm';

const PerformanceAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [contractorsList, setContractorsList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false, customFilters = filters) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await performanceService.getPerformanceData(customFilters);
      console.log('[PerformanceAnalysis] Dados recebidos:', response);

      if (response && response.entregasPorDia !== undefined) {
        setData(response);
        setError(null);

        if (response.contratadosUtilizacao) {
          const contractors = response.contratadosUtilizacao.map((c) => c.contratado);
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
    setFilters(defaultFilters);
    fetchData(true, defaultFilters);
  };

  const dayData = useMemo(() => {
    return (
      data?.entregasPorDia?.map((item) => ({
        dia: item.dia,
        entregas: item.total
      })) || []
    );
  }, [data]);

  const sortedDayData = useMemo(() => {
    return [...dayData].sort((a, b) => b.entregas - a.entregas);
  }, [dayData]);

  const contractorData = useMemo(() => {
    return (
      data?.contratadosUtilizacao?.map((item) => ({
        contratado: item.contratado,
        ativos: item.diasAtivos,
        ociosos: item.diasOciosos,
        totalEntregas: item.totalEntregas
      })) || []
    );
  }, [data]);

  const timeData = useMemo(() => {
    const faixasObj = data?.tempoCliente?.faixas || {
      '1-3h': 0,
      '4-6h': 0,
      '7-9h': 0,
      '10h+': 0
    };

    return Object.entries(faixasObj).map(([name, value]) => ({
      name,
      value: value || 0
    }));
  }, [data]);

  const maxEntregas = useMemo(() => {
    if (!dayData.length) return 0;
    return Math.max(...dayData.map((d) => d.entregas));
  }, [dayData]);

  const statsCards = [
    {
      title: 'Total de Entregas',
      value: data?.estatisticasGerais?.totalEntregas || 0,
      icon: Package,
      iconWrap: 'bg-blue-50 text-blue-600',
      valueColor: 'text-slate-900'
    },
    {
      title: 'Tempo Médio',
      value: `${data?.tempoCliente?.tempoMedioHoras?.toFixed(1) || 0}h`,
      icon: Clock3,
      iconWrap: 'bg-emerald-50 text-emerald-600',
      valueColor: 'text-slate-900'
    },
    {
      title: 'Dia com Mais Entregas',
      value: data?.tempoCliente?.diaComMaisEntregas?.dia || 'N/A',
      subValue: `${data?.tempoCliente?.diaComMaisEntregas?.total || 0} entregas`,
      icon: CalendarDays,
      iconWrap: 'bg-violet-50 text-violet-600',
      valueColor: 'text-slate-900'
    },
    {
      title: 'Entregas Acima de 6h',
      value: `${data?.estatisticasGerais?.percentualAcima6h?.toFixed(1) || 0}%`,
      icon: AlertTriangle,
      iconWrap: 'bg-rose-50 text-rose-600',
      valueColor: 'text-slate-900'
    },
    {
      title: 'Contratados',
      value: data?.estatisticasGerais?.totalContratados || 0,
      icon: Truck,
      iconWrap: 'bg-indigo-50 text-indigo-600',
      valueColor: 'text-slate-900'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <RefreshCw className="h-7 w-7 animate-spin text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Carregando análise de performance</h3>
          <p className="mt-2 text-sm text-slate-500">
            Aguarde enquanto processamos os dados da operação.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-700">Erro ao carregar dados</h3>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              onClick={() => fetchData()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-200">
                <Activity className="h-4 w-4" />
                Dashboard Analítico
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Análise de Produtividade e Capacidade
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
                Visualize a performance da operação logística com indicadores,
                distribuição de carga, tempo no cliente e utilização dos contratados.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">Total de entregas</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {data?.estatisticasGerais?.totalEntregas || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">Contratados</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {data?.estatisticasGerais?.totalContratados || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className={`${sectionBase} mb-8 p-6`}>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <Filter className="h-5 w-5 text-blue-600" />
                Filtros avançados
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Refine os dados por período, contratado e tempo no cliente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Data inicial</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Data final</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Contratado</label>
              <select
                value={filters.contratado}
                onChange={(e) => setFilters({ ...filters, contratado: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                {contractorsList.map((contractor) => (
                  <option key={contractor} value={contractor}>
                    {contractor === 'todos' ? 'Todos os contratados' : contractor}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Tempo mínimo (h)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={filters.minHours}
                onChange={(e) => setFilters({ ...filters, minHours: e.target.value })}
                placeholder="Ex: 1"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Tempo máximo (h)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={filters.maxHours}
                onChange={(e) => setFilters({ ...filters, maxHours: e.target.value })}
                placeholder="Ex: 10"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleApplyFilters}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Aplicar filtros
                </>
              )}
            </button>

            <button
              onClick={handleClearFilters}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Limpar filtros
            </button>
          </div>
        </div>

        {/* Alertas */}
        {data.alertas && data.alertas.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-semibold text-slate-900">Alertas automáticos</h2>
            </div>

            <div className="space-y-3">
              {data.alertas.map((alert, index) => {
                const mensagem = typeof alert === 'string' ? alert : alert.mensagem;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
                  >
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-amber-100">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">{mensagem}</p>
                      <p className="mt-1 text-sm text-amber-700">
                        Recomendamos revisar este ponto para otimizar a operação.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className={`${cardBase} p-5`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {card.title}
                    </p>
                    <p className={`mt-3 truncate text-2xl font-bold ${card.valueColor}`}>
                      {card.value}
                    </p>
                    {card.subValue && (
                      <p className="mt-1 text-sm text-slate-500">{card.subValue}</p>
                    )}
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconWrap}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Linha 1 */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Análise de Dias */}
          <div className={`${sectionBase} p-6`}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Análise dos dias da semana</h2>
                <p className="text-sm text-slate-500">
                  Distribuição de entregas por dia e pico operacional.
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
              <p className="text-sm text-violet-100">Dia com maior volume</p>
              <h3 className="mt-2 text-3xl font-bold">
                {data?.tempoCliente?.diaComMaisEntregas?.dia || 'N/A'}
              </h3>
              <p className="mt-2 text-sm text-violet-100">
                {data?.tempoCliente?.diaComMaisEntregas?.total || 0} entregas •{' '}
                {data?.tempoCliente?.percentualDiaMaisEntregas || 0}% do total
              </p>
            </div>

            <div className="space-y-3">
              {sortedDayData.map((dia) => (
                <div
                  key={dia.dia}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{dia.dia}</span>
                    <span className="text-sm font-semibold text-slate-900">{dia.entregas}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                      style={{
                        width: `${maxEntregas ? (dia.entregas / maxEntregas) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Utilização dos contratados */}
          <div className={`${sectionBase} p-6`}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Utilização dos contratados</h2>
                <p className="text-sm text-slate-500">
                  Comparativo entre dias ativos e ociosos por contratado.
                </p>
              </div>
            </div>

            {contractorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={contractorData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="contratado" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="ativos"
                    stackId="a"
                    fill="#10B981"
                    name="Dias Ativos"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="ociosos"
                    stackId="a"
                    fill="#F59E0B"
                    name="Dias Ociosos"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[340px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                <div className="text-center">
                  <Truck className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                  <p className="font-medium text-slate-600">Sem dados disponíveis</p>
                  <p className="text-sm text-slate-500">Não há informações de contratados para exibir.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Linha 2 */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Pizza */}
          <div className={`${sectionBase} p-6 xl:col-span-1`}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Tempo no cliente</h2>
                <p className="text-sm text-slate-500">
                  Distribuição por faixa de permanência.
                </p>
              </div>
            </div>

            {timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={timeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                <div className="text-center">
                  <Clock3 className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                  <p className="font-medium text-slate-600">Sem dados disponíveis</p>
                </div>
              </div>
            )}
          </div>

          {/* Estatísticas detalhadas */}
          <div className={`${sectionBase} p-6 xl:col-span-2`}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Estatísticas detalhadas por faixa
                </h2>
                <p className="text-sm text-slate-500">
                  Quantidade e representatividade percentual por faixa de tempo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Object.entries(data?.tempoCliente?.percentualFaixas || {}).map(
                ([faixa, percentual], index) => (
                  <div
                    key={faixa}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Faixa
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{faixa}</h3>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {data?.tempoCliente?.faixas?.[faixa] || 0}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      entregas • {percentual}%
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className={`${sectionBase} overflow-hidden`}>
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Detalhes dos contratados</h2>
                <p className="text-sm text-slate-500">
                  Visão consolidada da produtividade individual por contratado.
                </p>
              </div>
            </div>
          </div>

          {contractorData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contratado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total de Entregas
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dias Ativos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dias Ociosos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contractorData.map((contractor, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Truck className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-800">
                            {contractor.contratado}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {contractor.totalEntregas}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                          {contractor.ativos}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                          {contractor.ociosos}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <p className="font-medium text-slate-600">Sem dados de contratados disponíveis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalysis;
