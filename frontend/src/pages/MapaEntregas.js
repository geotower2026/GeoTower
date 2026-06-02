import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCrosshairs,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaSatelliteDish,
  FaSync,
  FaTruck,
} from 'react-icons/fa';
import { adminService } from '../services/authService';
import { useCity } from '../contexts/CityContext';
import { getProgramacaoDate } from '../utils/programacaoDate';
import { formatarAgendamento } from '../utils/date';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const formatCoordinate = (value) =>
  typeof value === 'number' ? value.toFixed(6) : '-';

const getStatusLabel = (status) =>
  String(status || 'AGENDADO').replace(/_/g, ' ').toUpperCase();

const getPartyName = (item) =>
  item.recebedor || item.destinatario || item.remetente || '-';

const getContainerValue = (item) => {
  if (Array.isArray(item.containerNumero)) return item.containerNumero.filter(Boolean).join(', ');
  return item.container || item.containerNumero || item.deliveryNumber || '-';
};

const getMapSrc = (position) => {
  if (!position) return '';
  const { latitude, longitude } = position;
  const delta = 0.018;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude},${longitude}`;
};

const MapaEntregas = () => {
  const navigate = useNavigate();
  const { city } = useCity();
  const [position, setPosition] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const mapSrc = useMemo(() => getMapSrc(position), [position]);
  const mapsLink = position
    ? `https://www.google.com/maps/search/?api=1&query=${position.latitude},${position.longitude}`
    : '';

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Este navegador não permite leitura de localização.');
      return undefined;
    }

    setLocationStatus('loading');
    setLocationError('');

    const watcher = navigator.geolocation.watchPosition(
      (geo) => {
        setPosition({
          latitude: geo.coords.latitude,
          longitude: geo.coords.longitude,
          accuracy: geo.coords.accuracy,
          updatedAt: new Date().toISOString(),
        });
        setLocationStatus('ready');
      },
      (error) => {
        setLocationStatus('error');
        setLocationError(error?.message || 'Não foi possível obter a localização.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 15000,
      }
    );

    return watcher;
  }, []);

  useEffect(() => {
    const watcher = requestLocation();
    return () => {
      if (watcher !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watcher);
      }
    };
  }, [requestLocation]);

  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await adminService.getDeliveries({}, 'today');
      setItems(res.data?.deliveries || []);
    } catch (_) {
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems, city]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-800 via-indigo-800 to-cyan-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              title="Voltar"
            >
              <FaArrowLeft />
            </button>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                <FaSatelliteDish />
                Mapa operacional
              </div>
              <h1 className="text-2xl font-black leading-tight sm:text-3xl">
                Mapa das Entregas
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-cyan-50/80">
                Acompanhe sua posição real e use a lista lateral para orientar as entregas em andamento.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={requestLocation}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-50"
            >
              <FaCrosshairs />
              Atualizar posição
            </button>
            <button
              type="button"
              onClick={loadItems}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/20"
            >
              <FaSync />
              Atualizar entregas
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_380px]">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Localização atual
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                {position
                  ? `${formatCoordinate(position.latitude)}, ${formatCoordinate(position.longitude)}`
                  : 'Aguardando permissão do navegador'}
              </p>
            </div>
            <span className={cn(
              'rounded-full px-3 py-1 text-xs font-black',
              locationStatus === 'ready' && 'bg-emerald-400/15 text-emerald-200',
              locationStatus === 'loading' && 'bg-amber-400/15 text-amber-200',
              locationStatus === 'error' && 'bg-red-400/15 text-red-200',
              locationStatus === 'idle' && 'bg-slate-700 text-slate-200'
            )}>
              {locationStatus === 'ready' ? 'AO VIVO' : locationStatus === 'loading' ? 'BUSCANDO' : locationStatus === 'error' ? 'ERRO' : 'PARADO'}
            </span>
          </div>

          <div className="relative h-[62vh] min-h-[420px] bg-slate-800">
            {mapSrc ? (
              <iframe
                title="Mapa da localização atual"
                src={mapSrc}
                className="h-full w-full border-0"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                  <FaMapMarkerAlt size={24} />
                </div>
                <h2 className="text-lg font-black">Permita sua localização</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                  O mapa usa a localização real do usuário somente enquanto esta página estiver aberta.
                </p>
                {locationError && (
                  <p className="mt-3 text-sm font-semibold text-red-200">{locationError}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Precisão: {position?.accuracy ? `${Math.round(position.accuracy)} m` : '-'}
            </span>
            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-black text-cyan-200 hover:text-white"
              >
                Abrir no Google Maps
                <FaExternalLinkAlt size={10} />
              </a>
            )}
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="border-b border-white/10 px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
              Entregas
            </p>
            <h2 className="mt-1 text-lg font-black">
              {loadingItems ? 'Carregando...' : `${items.length} registro${items.length === 1 ? '' : 's'}`}
            </h2>
          </div>

          <div className="max-h-[68vh] overflow-y-auto p-3">
            {items.length === 0 && !loadingItems ? (
              <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-slate-400">
                Nenhuma entrega encontrada para o seu perfil.
              </div>
            ) : (
              <div className="space-y-3">
                {items.slice(0, 80).map((item) => {
                  const schedule = getProgramacaoDate(item, city);
                  return (
                    <div
                      key={item._id || item.deliveryNumber || item.processo}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.07]"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Processo
                          </p>
                          <p className="text-sm font-black text-white">
                            {item.processoCAB || item.processo || item.deliveryNumber || '-'}
                          </p>
                        </div>
                        <span className="rounded-full bg-cyan-400/15 px-2.5 py-1 text-[10px] font-black text-cyan-200">
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs leading-5 text-slate-300">
                        <p className="flex items-center gap-2">
                          <FaTruck className="text-emerald-300" />
                          {getContainerValue(item)}
                        </p>
                        <p className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-violet-300" />
                          {getPartyName(item)}
                        </p>
                        <p className="text-slate-400">
                          {schedule ? formatarAgendamento(schedule) : 'Sem agendamento'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MapaEntregas;
