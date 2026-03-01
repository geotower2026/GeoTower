import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';

const Toast = ({ message, type = 'info', onClose, duration = 3500 }) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const exitTimer = useRef(null);

  const cfg = useMemo(() => {
    // Mantendo paleta da empresa (roxo/azul/esmeralda)
    switch (type) {
      case 'success':
        return {
          label: 'Sucesso',
          Icon: FaCheckCircle,
          accent: 'bg-emerald-600',
          ring: 'focus:ring-emerald-200/70',
          progress: 'from-emerald-600 to-blue-600'
        };
      case 'error':
        return {
          label: 'Atenção',
          Icon: FaExclamationCircle,
          accent: 'bg-purple-700',
          ring: 'focus:ring-purple-200/70',
          progress: 'from-purple-700 to-blue-600'
        };
      case 'warning':
        return {
          label: 'Aviso',
          Icon: FaExclamationTriangle,
          accent: 'bg-blue-600',
          ring: 'focus:ring-blue-200/70',
          progress: 'from-blue-600 to-emerald-600'
        };
      default:
        return {
          label: 'Informação',
          Icon: FaInfoCircle,
          accent: 'bg-blue-600',
          ring: 'focus:ring-blue-200/70',
          progress: 'from-blue-600 to-purple-700'
        };
    }
  }, [type]);

  const requestClose = () => {
    // animação de saída
    setOpen(false);
    if (exitTimer.current) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => onClose?.(), 180);
  };

  useEffect(() => {
    // animação de entrada
    const t = setTimeout(() => setOpen(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!duration || duration <= 0) return;

    closeTimer.current = setTimeout(() => requestClose(), duration);
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
  }, []);

  const role = type === 'error' ? 'alert' : 'status';

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999] flex justify-center px-4"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div
        role={role}
        className={[
          // container premium
          'relative w-full max-w-md overflow-hidden rounded-2xl',
          'bg-white/92 backdrop-blur-xl',
          'border border-white/40 shadow-2xl',
          // transição
          'transition-all duration-200 ease-out',
          open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-[0.99]'
        ].join(' ')}
        onMouseEnter={() => {
          // pausa o auto-close enquanto hover (opcional, mas “premium”)
          if (closeTimer.current) clearTimeout(closeTimer.current);
        }}
        onMouseLeave={() => {
          if (!duration || duration <= 0) return;
          closeTimer.current = setTimeout(() => requestClose(), 1200);
        }}
      >
        {/* Barra superior com gradiente da marca (não mexe na paleta) */}
        <div className="h-1.5 bg-gradient-to-r from-purple-700 via-blue-600 to-emerald-600" />

        <div className="flex gap-4 p-4">
          {/* Accent + ícone */}
          <div className="flex items-start">
            <div className={`mt-0.5 h-10 w-10 rounded-xl ${cfg.accent} text-white flex items-center justify-center shadow-sm`}>
              <cfg.Icon />
            </div>
          </div>

          {/* Texto */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-extrabold text-gray-900">
                {cfg.label}
              </p>

              <button
                type="button"
                onClick={requestClose}
                className={[
                  'p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-black/5 transition',
                  'focus:outline-none focus:ring-4',
                  cfg.ring
                ].join(' ')}
                aria-label="Fechar notificação"
              >
                <FaTimes />
              </button>
            </div>

            <p className="mt-1 text-sm text-gray-700 leading-relaxed break-words">
              {message}
            </p>
          </div>
        </div>

        {/* Barra de progresso (usa cores da marca por tipo) */}
        {duration > 0 && (
          <div className="h-1 w-full bg-gray-100">
            <div
              className={`h-full bg-gradient-to-r ${cfg.progress}`}
              style={{
                width: '100%',
                animation: `toast-progress ${duration}ms linear forwards`
              }}
            />
          </div>
        )}

        {/* Keyframes local (sem dependência) */}
        <style>{`
          @keyframes toast-progress {
            from { transform: translateX(0%); }
            to { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Toast;
