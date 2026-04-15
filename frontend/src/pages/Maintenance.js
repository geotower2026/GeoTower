import React from 'react';

const Maintenance = ({ message }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-10 shadow-2xl shadow-black/40">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-600/20 text-purple-200 text-4xl mx-auto">
            🛠️
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Estamos em manutenção</h1>
          <p className="text-slate-300 text-lg leading-8">
            {message || 'O sistema está passando por manutenção. Voltaremos em breve.'}
          </p>
          <p className="text-slate-500">Aguarde alguns minutos e atualize esta página.</p>
          <div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500"
            >
              Atualizar página
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
