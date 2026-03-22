import React from 'react';
import { useNavigate } from 'react-router-dom';

const sections = [
  {
    number: '1',
    title: 'Sobre a Plataforma',
    content:
      'O Sistema GeoTower é uma ferramenta destinada à gestão de operações logísticas, permitindo o controle de entregas, usuários e informações operacionais por meio de diferentes níveis de acesso, incluindo Administrador, Contratado e Motorista.',
  },
  {
    number: '2',
    title: 'Cadastro e Acesso',
    list: [
      'O acesso ao sistema é restrito a usuários autorizados.',
      'O usuário é responsável por manter suas credenciais em sigilo, não compartilhar login e senha, e utilizar o sistema apenas para fins profissionais e autorizados.',
      'O Sistema GeoTower poderá suspender acessos em caso de uso indevido ou suspeita de violação.',
    ],
  },
  {
    number: '3',
    title: 'Responsabilidades do Usuário',
    list: [
      'Inserir informações verdadeiras e atualizadas.',
      'Não utilizar o sistema para atividades ilícitas.',
      'Não tentar acessar áreas restritas sem autorização.',
      'Não comprometer a segurança da plataforma.',
    ],
  },
  {
    number: '4',
    title: 'Disponibilidade do Serviço',
    content:
      'O Sistema GeoTower busca manter o funcionamento contínuo, porém não garante disponibilidade ininterrupta, podendo ocorrer manutenções técnicas, atualizações do sistema e instabilidades externas de rede ou servidores.',
  },
  {
    number: '5',
    title: 'Limitação de Responsabilidade',
    list: [
      'Problemas decorrentes de uso inadequado da plataforma.',
      'Falhas de conexão do usuário.',
      'Informações inseridas incorretamente por terceiros.',
    ],
  },
  {
    number: '6',
    title: 'Propriedade Intelectual',
    content:
      'Todos os elementos do sistema, incluindo layout, logotipo, funcionalidades e códigos, são protegidos por direitos autorais e não podem ser copiados ou reproduzidos sem autorização.',
  },
  {
    number: '7',
    title: 'Alterações nos Termos',
    content:
      'Os presentes Termos de Uso podem ser atualizados a qualquer momento para refletir melhorias ou mudanças legais. O uso contínuo da plataforma após alterações representa concordância com os novos termos.',
  },
  {
    number: '8',
    title: 'Legislação Aplicável',
    content:
      'Estes Termos são regidos pelas leis da República Federativa do Brasil.',
  },
];

const SectionCard = ({ number, title, content, list }) => (
  <div className="group rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(15,23,42,0.10)] dark:border-slate-800 dark:bg-slate-900/85 dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-900/20">
        {number}
      </div>

      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>

        {content && (
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
            {content}
          </p>
        )}

        {list && (
          <ul className="mt-4 space-y-3">
            {list.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

const TermosUso = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_24%)] bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
          <div className="absolute top-16 right-0 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/10" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-violet-300/10 blur-3xl dark:bg-violet-500/10" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Documento Oficial
            </div>
          </div>

          <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/75 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 dark:shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_26%)]" />

            <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
              <div>
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                  Sistema GeoTower
                </div>

                <h1 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                  Termos de Uso
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  Estes Termos de Uso regulam o acesso e a utilização do
                  <strong> Sistema GeoTower</strong>, plataforma digital de gestão
                  logística e acompanhamento de entregas.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-100">
                    Última atualização: 24 de fevereiro de 2026
                  </span>

                  <a
                    href="https://entregascomgeotransportes.onrender.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-white/15"
                  >
                    Acessar plataforma
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm font-medium text-slate-300">Website oficial</p>
                  <a
                    href="https://entregascomgeotransportes.onrender.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block break-all text-sm font-bold text-white hover:underline"
                  >
                    entregascomgeotransportes.onrender.com
                  </a>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm font-medium text-slate-300">Abrangência</p>
                  <p className="mt-2 text-sm font-bold text-white">
                    Gestão logística, entregas, usuários e operações
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 p-5 backdrop-blur-md">
                  <p className="text-sm font-medium text-slate-300">Base legal</p>
                  <p className="mt-2 text-sm font-bold text-white">
                    Leis da República Federativa do Brasil
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  Visão geral
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Condições para uso da plataforma
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Ao acessar e utilizar o Sistema GeoTower, o usuário declara estar ciente
                  e de acordo com as condições, responsabilidades e limitações previstas
                  neste documento.
                </p>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Voltar
              </button>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-6">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                Conteúdo do documento
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Termos e condições
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Estrutura organizada para facilitar a leitura, compreensão e consulta dos termos.
              </p>
            </div>

            <div className="grid gap-6">
              {sections.map((section) => (
                <SectionCard key={section.number} {...section} />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/85 shadow-[0_20px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
              <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                <div className="p-6 sm:p-8">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    Encerramento
                  </span>

                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    Sistema GeoTower — Gestão Inteligente de Entregas
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Este documento estabelece as condições gerais para o uso da plataforma e
                    reforça o compromisso com segurança, controle operacional e uso responsável
                    do sistema por todos os perfis autorizados.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(-1)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Voltar
                    </button>

                    <a
                      href="https://entregascomgeotransportes.onrender.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      Acessar plataforma
                    </a>
                  </div>
                </div>

                <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 p-8 dark:from-emerald-600 dark:via-cyan-700 dark:to-indigo-800">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.12),_transparent_25%)]" />
                  <div className="relative w-full max-w-sm rounded-[1.75rem] border border-white/20 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Documento</span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        Oficial
                      </span>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                          Atualização
                        </p>
                        <p className="mt-1 font-bold">24 de fevereiro de 2026</p>
                      </div>

                      <div className="rounded-2xl bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                          Regência
                        </p>
                        <p className="mt-1 font-bold">Leis brasileiras</p>
                      </div>

                      <div className="rounded-2xl bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                          Plataforma
                        </p>
                        <p className="mt-1 break-all font-bold">
                          entregascomgeotransportes.onrender.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-10 pb-4 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Sistema GeoTower — Gestão Inteligente de Entregas
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Termos de Uso oficiais da plataforma
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TermosUso;
