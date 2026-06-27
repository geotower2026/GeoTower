import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { useCity } from '../contexts/CityContext';
import Toast from '../components/Toast';
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaFutbol,
  FaTrophy,
  FaFlagCheckered,
  FaTruck,
} from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setCity } = useCity();

  useEffect(() => {
    if (!navigator.onLine && isAuthenticated) {
      navigate('/home', { replace: true });
      return;
    }

    const queryUsername = new URLSearchParams(window.location.search).get('username') || '';
    const savedCredentials = localStorage.getItem('loginCredentials');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedRememberMe && savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        setFormData((current) => ({
          ...current,
          username: credentials.username || '',
          password: credentials.password || '',
        }));
        setRememberMe(true);
      } catch (e) {
        localStorage.removeItem('loginCredentials');
        localStorage.removeItem('rememberMe');
      }
    } else if (queryUsername) {
      setFormData((current) => ({ ...current, username: queryUsername }));
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!navigator.onLine && isAuthenticated) {
        navigate('/home', { replace: true });
        return;
      }

      const response = await login(formData.username, formData.password);
      const userCity = response?.driver?.city || 'manaus';

      if (userCity !== 'both') {
        setCity(userCity);
      } else {
        const currentCity = localStorage.getItem('city') || 'manaus';
        setCity(currentCity);
      }

      if (rememberMe) {
        localStorage.setItem(
          'loginCredentials',
          JSON.stringify({
            username: formData.username,
            password: formData.password,
          })
        );
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('loginCredentials');
        localStorage.removeItem('rememberMe');
      }

      setToast({ message: 'Login realizado com sucesso!', type: 'success' });
      setTimeout(() => navigate('/home'), 900);
    } catch (error) {
      console.error('Login error (Login.js):', error);
      const serverMsg = error?.response?.data || error?.message || 'Erro ao fazer login';
      const toastMsg =
        typeof serverMsg === 'string' ? serverMsg : serverMsg.message || JSON.stringify(serverMsg);
      setToast({ message: toastMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    { icon: <FaTruck />, text: 'Operação em campo' },
    { icon: <FaFutbol />, text: 'Ritmo de Copa' },
    { icon: <FaTrophy />, text: 'Entrega campeã' },
  ];

  return (
    <div
      className="fixed inset-0 flex w-full overflow-hidden overscroll-none bg-slate-50"
      style={{ height: '100svh' }}
    >
      <div className="relative hidden w-1/2 overflow-hidden bg-[#075f36] lg:flex">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(135deg, #08723f 0%, #0a8a4f 42%, #f9d923 42%, #f9d923 49%, #0b5fbb 49%, #073f8f 100%)',
            backgroundSize: '56px 56px, 56px 56px, 100% 100%',
          }}
        />

        <div className="absolute left-10 right-10 top-10 bottom-10 rounded-lg border-2 border-white/35" />
        <div className="absolute left-1/2 top-10 bottom-10 w-px bg-white/35" />
        <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35" />
        <div className="absolute -left-16 top-1/2 h-40 w-28 -translate-y-1/2 rounded-r-full border-2 border-white/35" />
        <div className="absolute -right-16 top-1/2 h-40 w-28 -translate-y-1/2 rounded-l-full border-2 border-white/35" />

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-12 text-center text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/30 bg-black/20 px-4 py-2 text-sm font-black uppercase tracking-wide shadow-lg">
            <FaFlagCheckered className="text-yellow-300" />
            Modo Copa
          </div>

          <div className="mb-6 rounded-lg border border-white/30 bg-white/15 p-6 shadow-2xl backdrop-blur-sm">
            <img
              src="/logo.png"
              alt="GeoTower Logo"
              className="h-32 w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
            />
          </div>

          <h1 className="mb-3 text-5xl font-black tracking-tight drop-shadow-lg">GeoTower</h1>
          <p className="mb-8 max-w-sm text-lg font-semibold leading-relaxed text-white/90">
            Logística rodoviária em clima de torcida, sem sair da identidade da empresa.
          </p>

          <div className="grid w-full max-w-md grid-cols-3 gap-3">
            {highlights.map((item) => (
              <div
                key={item.text}
                className="rounded-lg border border-white/25 bg-white/15 px-3 py-4 text-center shadow-lg backdrop-blur-sm"
              >
                <div className="mb-2 flex justify-center text-2xl text-yellow-300">{item.icon}</div>
                <p className="text-xs font-extrabold uppercase leading-snug tracking-wide">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="relative flex flex-1 flex-col items-center justify-center overflow-auto px-4 py-8"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)',
          background:
            'linear-gradient(135deg, #f8fafc 0%, #ffffff 42%, #eef7f1 42%, #eef7f1 63%, #eef5ff 100%)',
        }}
      >
        <div className="pointer-events-none absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-[#079447] via-[#f7d21e] to-[#1455c0]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6 flex flex-col items-center lg:hidden">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wide text-emerald-800 shadow-sm">
              <FaFlagCheckered className="text-yellow-500" />
              Modo Copa
            </div>
            <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-lg">
              <img src="/logo.png" alt="GeoTower Logo" className="h-24 w-auto" />
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-emerald-900">GeoTower</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Logística rodoviária com excelência
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white/95 p-8 shadow-2xl backdrop-blur">
            <div className="mb-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-emerald-800">
                <FaFutbol className="text-emerald-600" />
                Temporada especial
              </div>
              <h2 className="text-2xl font-black text-slate-900">Bem-vindo de volta</h2>
              <p className="mt-1 text-sm text-slate-500">Faça login para acessar o sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Usuário ou Email
                </label>
                <div className="relative">
                  <FaUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-base shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    placeholder="seu.usuario ou email@example.com"
                    disabled={loading}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Senha</label>
                <div className="relative">
                  <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-base shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    placeholder="Digite sua senha"
                    disabled={loading}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 rounded-lg p-2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 bg-slate-100 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm font-medium text-slate-700">
                  Manter conectado
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg px-4 py-3.5 text-base font-extrabold text-white shadow-lg transition-all duration-200 active:scale-[0.98] ${
                  loading
                    ? 'cursor-not-allowed bg-slate-400'
                    : 'bg-gradient-to-r from-emerald-700 via-green-600 to-blue-700 shadow-emerald-100 hover:from-emerald-800 hover:via-green-700 hover:to-blue-800 hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} GeoTower · Todos os direitos reservados
          </p>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Login;
