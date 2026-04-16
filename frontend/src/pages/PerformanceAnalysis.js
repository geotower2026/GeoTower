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
  CalendarRange,
  CheckCircle2,
  Clock3,
  Filter,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  Users,
  Package,
  TimerReset
} from 'lucide-react';
import { performanceService } from '../services/performanceService';

const defaultFilters = {
  startDate: '',
  endDate: '',
  contratado: 'todos',
  minHours: '',
  maxHours: ''
};

const CHART_COLORS = ['#0F766E', '#2563EB', '#D97706', '#DC2626'];

const SectionCard = ({ title, subtitle, icon: Icon, children, actions = null, className = '' }) => (
  <section
    className={`rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] ${className}`}
  >
    <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const StatCard = ({ title, value, subtitle, icon: Icon, tone = 'blue' }) => {
  const toneMap = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      ring: 'ring-blue-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      ring: 'ring-emerald-100'
    },
    violet: {
      bg: 'bg-violet-50',
      icon: 'text-violet-600',
      ring: 'ring-violet-100'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      ring: 'ring-amber-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      ring: 'ring-indigo-100'
    }
  };

  const styles = toneMap[tone] || toneMap.blue;

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {title}
          </p>
          <p className="mt-3 truncate text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.bg} ${styles.icon} ring-1 ${styles.ring}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const FilterField = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
    {children}
  </div>
);

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
    <div className="px-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.10)]">
      {label && <p className="mb-2 text-sm font-semibold text-slate-900">{label}</p>}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-5 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600">{entry.name}</span>
            </div>
            <span className="font-semibold text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PerformanceAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [contractorsList, setContractorsList] = useState(['todos']);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false, customFilters = filters) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await performanceService.getPerformanceData(customFilters);

      if (response && response.entregasPorDia !== undefined) {
        setData(response);
        setError(null);

        if (Array.isArray(response.contratadosUtilizacao)) {
          const contractors = response.contratadosUtilizacao
            .map((c) => c.contratado)
            .filter(Boolean);

          setContractorsList(['todos', ...contractors]);
        } else {
          setContractorsList(['todos']);
        }
      } else {
        setError('Estrutura de dados inválida retornada pelo servidor.');
      }
    } catch (err) {
      console.error('[PerformanceAnalysis] erro ao buscar performance:', err);
      setError(err?.response?.data?.message || 'Erro de conexão com o servidor.');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchData(true, filters);
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
    return Math.max(...dayData.map((item) => item.entregas));
  }, [dayData]);

  const totalEntregas = data?.estatisticasGerais?.totalEntregas || 0;
  const tempoMedio = data?.tempoCliente?.tempoMedioHoras?.toFixed(1) || '0.0';
  const diaTop = data?.tempoCliente?.diaComMaisEntregas?.dia || 'N/A';
  const diaTopTotal = data?.tempoCliente?.diaComMaisEntregas?.total || 0;
  const percentualAcima6h = data?.estatisticasGerais?.percentualAcima6h?.toFixed(1) || '0.0';
  const totalContratados = data?.estatisticasGerais?.totalContratados || 0;

  const activeFilterBadges = [
    filters.startDate ? `Início: ${filters.startDate}` : null,
    filters.endDate ? `Fim: ${filters.endDate}` : null,
    filters.contratado && filters.contratado !== 'todos'
      ? `Contratado: ${filters.contratado}`
      : null,
    filters.minHours ? `Mín: ${filters.minHours}h` : null,
    filters.maxHours ? `Máx: ${filters.maxHours}h` : null
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Carregando análise de performance
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Estamos processando os indicadores operacionais para montar o dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                <AlertCircle className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  Não foi possível carregar os dados
                </h3>
                <p className="mt-2 text-sm text-slate-600">{error}</p>

                <button
                  onClick={() => fetchData()}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_left,rgba(16,185,129,0.14),transparent_24%)]" />
            <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:px-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium tracking-[0.12em] text-slate-200 uppercase backdrop-blur">
                  <Activity className="h-4 w-4" />
                  Performance Dashboard
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Análise de Produtividade e Capacidade
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Painel executivo para acompanhamento da operação logística, com visão
                  consolidada de entregas, tempo no cliente, utilização dos contratados e
                  alertas automáticos de performance.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {activeFilterBadges.length > 0 ? (
                    activeFilterBadges.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
                      Visualização geral sem filtros ativos
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    Total de entregas
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">{totalEntregas}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Operação consolidada
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    Tempo médio
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">{tempoMedio}h</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                    <TimerReset className="h-4 w-4 text-blue-400" />
                    Média operacional
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SectionCard
          title="Filtros avançados"
          subtitle="Refine a análise por período, contratado e faixa de tempo no cliente."
          icon={Filter}
          className="mb-8"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <FilterField label="Data inicial">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />
            </FilterField>

            <FilterField label="Data final">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />
            </FilterField>

            <FilterField label="Contratado">
              <select
                value={filters.contratado}
                onChange={(e) => setFilters({ ...filters, contratado: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              >
                {contractorsList.map((contractor) => (
                  <option key={contractor} value={contractor}>
                    {contractor === 'todos' ? 'Todos os contratados' : contractor}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Tempo mínimo (h)">
              <input
                type="number"
                min="0"
                step="0.5"
                value={filters.minHours}
                onChange={(e) => setFilters({ ...filters, minHours: e.target.value })}
                placeholder="Ex: 1"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />
            </FilterField>

            <FilterField label="Tempo máximo (h)">
              <input
                type="number"
                min="0"
                step="0.5"
                value={filters.maxHours}
                onChange={(e) => setFilters({ ...filters, maxHours: e.target.value })}
                placeholder="Ex: 10"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />
            </FilterField>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleApplyFilters}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Limpar filtros
            </button>
          </div>
        </SectionCard>

        {data.alertas && data.alertas.length > 0 && (
          <SectionCard
            title="Alertas automáticos"
            subtitle="Itens identificados automaticamente que merecem atenção operacional."
            icon={AlertTriangle}
            className="mb-8"
          >
            <div className="space-y-3">
              {data.alertas.map((alert, index) => {
                const mensagem = typeof alert === 'string' ? alert : alert.mensagem;

                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-600 ring-1 ring-amber-100">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900">{mensagem}</p>
                      <p className="mt-1 text-sm text-amber-700">
                        Recomendação: revisar este indicador para otimização da operação.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total de Entregas"
            value={totalEntregas}
            subtitle="Volume consolidado da operação"
            icon={Package}
            tone="blue"
          />
          <StatCard
            title="Tempo Médio"
            value={`${tempoMedio}h`}
            subtitle="Tempo médio no cliente"
            icon={Clock3}
            tone="emerald"
          />
          <StatCard
            title="Dia com Mais Entregas"
            value={diaTop}
            subtitle={`${diaTopTotal} entregas`}
            icon={CalendarRange}
            tone="violet"
          />
          <StatCard
            title="Entregas Acima de 6h"
            value={`${percentualAcima6h}%`}
            subtitle="Percentual crítico de permanência"
            icon={AlertTriangle}
            tone="amber"
          />
          <StatCard
            title="Contratados"
            value={totalContratados}
            subtitle="Base ativa considerada"
            icon={Truck}
            tone="indigo"
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard
            title="Análise dos dias da semana"
            subtitle="Distribuição do volume de entregas por dia."
            icon={BarChart3}
          >
            <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
              <p className="text-sm font-medium text-slate-300">Maior concentração operacional</p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight">{diaTop}</h3>
              <p className="mt-2 text-sm text-slate-300">
                {diaTopTotal} entregas
                {data?.tempoCliente?.percentualDiaMaisEntregas !== undefined &&
                  ` • ${data.tempoCliente.percentualDiaMaisEntregas}% do total`}
              </p>
            </div>

            <div className="space-y-3">
              {sortedDayData.length > 0 ? (
                sortedDayData.map((dia) => (
                  <div
                    key={dia.dia}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{dia.dia}</span>
                      <span className="text-sm font-semibold text-slate-900">{dia.entregas}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                        style={{
                          width: `${maxEntregas ? (dia.entregas / maxEntregas) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="Sem dados por dia"
                  description="Não há distribuição de entregas por dia para exibir."
                />
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Utilização dos contratados"
            subtitle="Comparativo entre dias ativos e ociosos."
            icon={Truck}
          >
            {contractorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={contractorData} barCategoryGap={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="contratado"
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="ativos"
                    stackId="status"
                    fill="#10B981"
                    name="Dias Ativos"
                    radius={[10, 10, 0, 0]}
                  />
                  <Bar
                    dataKey="ociosos"
                    stackId="status"
                    fill="#F59E0B"
                    name="Dias Ociosos"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Truck}
                title="Sem dados de contratados"
                description="Não existem informações suficientes para montar o gráfico."
              />
            )}
          </SectionCard>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            title="Distribuição de tempo no cliente"
            subtitle="Participação de cada faixa de permanência."
            icon={Clock3}
          >
            {timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={timeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Clock3}
                title="Sem dados de tempo"
                description="Não há distribuição de tempo disponível para este recorte."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Estatísticas detalhadas por faixa"
            subtitle="Quantidade de entregas e representatividade percentual por faixa."
            icon={Activity}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Object.entries(data?.tempoCliente?.percentualFaixas || {}).length > 0 ? (
                Object.entries(data?.tempoCliente?.percentualFaixas || {}).map(
                  ([faixa, percentual], index) => (
                    <div
                      key={faixa}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <span
                          className="h-3.5 w-3.5 rounded-full"
                          style={{
                            backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                          }}
                        />
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Faixa
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900">{faixa}</h3>
                      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        {data?.tempoCliente?.faixas?.[faixa] || 0}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        entregas • {percentual}%
                      </p>
                    </div>
                  )
                )
              ) : (
                <div className="col-span-full">
                  <EmptyState
                    icon={Activity}
                    title="Sem estatísticas por faixa"
                    description="Não há dados suficientes para detalhar as faixas de tempo."
                  />
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Detalhes dos contratados"
          subtitle="Visão consolidada de produtividade por contratado."
          icon={Users}
        >
          {contractorData.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Contratado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Total de Entregas
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Dias Ativos
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Dias Ociosos
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {contractorData.map((contractor, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                              <Truck className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {contractor.contratado}
                              </p>
                              <p className="text-sm text-slate-500">Operação monitorada</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-base font-semibold text-slate-900">
                            {contractor.totalEntregas}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            {contractor.ativos}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700 ring-1 ring-amber-200">
                            {contractor.ociosos}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="Sem dados de contratados"
              description="Nenhum contratado foi retornado para este conjunto de filtros."
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default PerformanceAnalysis;
