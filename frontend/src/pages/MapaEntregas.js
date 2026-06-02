import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaSatelliteDish,
  FaSync,
  FaTruck,
  FaUser,
} from 'react-icons/fa';
import { adminService } from '../services/authService';
import { useCity } from '../contexts/CityContext';
import { getProgramacaoDate } from '../utils/programacaoDate';
import { formatarAgendamento } from '../utils/date';

const cn = (...classes) => classes.filter(Boolean).join(' ');
const LIVE_MS = 2 * 60 * 1000;
const RECENT_MS = 10 * 60 * 1000;

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

const getLocation = (item) => {
  const loc = item?.lastLocation;
  const latitude = Number(loc?.latitude);
  const longitude = Number(loc?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    latitude,
    longitude,
    accuracy: Number(loc?.accuracy),
    updatedAt: loc?.updatedAt || loc?.capturedAt || item?.updatedAt,
  };
};

const getLocationAge = (loc) => {
  const time = new Date(loc?.updatedAt || 0).getTime();
  if (!Number.isFinite(time) || time <= 0) return Infinity;
  return Date.now() - time;
};

const getLocationState = (loc) => {
  const age = getLocationAge(loc);
  if (age <= LIVE_MS) return 'live';
  if (age <= RECENT_MS) return 'recent';
  return 'stale';
};

const formatLocationAge = (loc) => {
  const age = getLocationAge(loc);
  if (!Number.isFinite(age)) return 'sem horario';
  const minutes = Math.max(0, Math.floor(age / 60000));
  if (minutes <= 0) return 'agora';
  if (minutes === 1) return 'ha 1 min';
  return `ha ${minutes} min`;
};

const getMapSrc = (location) => {
  if (!location) return '';
  const { latitude, longitude } = location;
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
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadItems = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoadingItems(true);
    setRefreshing(true);
    try {
      const res = await adminService.getDeliveries({ _refresh: Date.now() }, 'today');
      setItems(res.data?.deliveries || []);
      setLastRefresh(new Date().toISOString());
    } catch (_) {
      setItems([]);
    } finally {
      if (!silent) setLoadingItems(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
    const interval = setInterval(() => loadItems({ silent: true }), 15000);
    return () => clearInterval(interval);
  }, [loadItems, city]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const locA = getLocation(a);
      const locB = getLocation(b);
      const timeA = new Date(locA?.updatedAt || 0).getTime();
      const timeB = new Date(locB?.updatedAt || 0).getTime();
      if (!!locA !== !!locB) return locA ? -1 : 1;
      return timeB - timeA;
    });
  }, [items]);

  const itemsWithLocation = useMemo(
    () => sortedItems.filter((item) => !!getLocation(item)),
    [sortedItems]
  );

  useEffect(() => {
    if (itemsWithLocation.length === 0) {
      setSelectedId('');
      return;
    }
    if (!selectedId || !itemsWithLocation.some((item) => String(item._id) === String(selectedId))) {
      setSelectedId(String(itemsWithLocation[0]._id));
    }
  }, [itemsWithLocation, selectedId]);

  const selectedItem = useMemo(
    () => itemsWithLocation.find((item) => String(item._id) === String(selectedId)) || itemsWithLocation[0] || null,
    [itemsWithLocation, selectedId]
  );
  const selectedLocation = getLocation(selectedItem);
  const mapSrc = useMemo(() => getMapSrc(selectedLocation), [selectedLocation]);
  const mapsLink = selectedLocation
    ? `https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}`
    : '';
  const selectedLocationState = getLocationState(selectedLocation);

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
                Acompanhe em tempo real o ultimo GPS compartilhado pelos motoristas em rota.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lastRefresh && (
              <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-cyan-50/80">
                Atualizado {formatLocationAge({ updatedAt: lastRefresh })}
              </span>
            )}
            <button
              type="button"
              onClick={() => loadItems()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/20"
            >
              <FaSync className={refreshing ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_400px]">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Motorista selecionado
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                {selectedItem
                  ? `${selectedItem.driverName || selectedItem.userName || 'Motorista'} - ${selectedItem.processoCAB || selectedItem.processo || selectedItem.deliveryNumber || '-'}`
                  : 'Nenhum GPS ativo no momento'}
              </p>
              {selectedLocation && (
                <p className="mt-1 text-xs text-slate-400">
                  {formatCoordinate(selectedLocation.latitude)}, {formatCoordinate(selectedLocation.longitude)}
                </p>
              )}
            </div>
            <span className={cn(
              'rounded-full px-3 py-1 text-xs font-black',
              selectedLocationState === 'live' && 'bg-emerald-400/15 text-emerald-200',
              selectedLocationState === 'recent' && 'bg-amber-400/15 text-amber-200',
              selectedLocationState === 'stale' && 'bg-slate-700 text-slate-200'
            )}>
              {selectedLocation ? formatLocationAge(selectedLocation) : 'SEM GPS'}
            </span>
          </div>

          <div className="relative h-[62vh] min-h-[420px] bg-slate-800">
            {mapSrc ? (
              <iframe
                title="Mapa da localizacao do motorista"
                src={mapSrc}
                className="h-full w-full border-0"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                  <FaMapMarkerAlt size={24} />
                </div>
                <h2 className="text-lg font-black">Aguardando GPS dos motoristas</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                  Quando o motorista abrir uma entrega e permitir localizacao no navegador, o ponto aparece aqui.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Precisao: {selectedLocation?.accuracy ? `${Math.round(selectedLocation.accuracy)} m` : '-'}
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
              Entregas rastreadas
            </p>
            <h2 className="mt-1 text-lg font-black">
              {loadingItems ? 'Carregando...' : `${itemsWithLocation.length} com GPS / ${items.length} entregas`}
            </h2>
          </div>

          <div className="max-h-[68vh] overflow-y-auto p-3">
            {sortedItems.length === 0 && !loadingItems ? (
              <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-slate-400">
                Nenhuma entrega encontrada para hoje.
              </div>
            ) : (
              <div className="space-y-3">
                {sortedItems.slice(0, 100).map((item) => {
                  const schedule = getProgramacaoDate(item, city);
                  const loc = getLocation(item);
                  const locState = getLocationState(loc);
                  const hasLocation = !!loc;
                  const selected = hasLocation && String(item._id) === String(selectedItem?._id);
                  return (
                    <button
                      key={item._id || item.deliveryNumber || item.processo}
                      type="button"
                      disabled={!hasLocation}
                      onClick={() => setSelectedId(String(item._id))}
                      className={cn(
                        'w-full rounded-xl border p-3 text-left transition',
                        selected ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/10 bg-white/[0.04]',
                        hasLocation ? 'hover:bg-white/[0.07]' : 'cursor-not-allowed opacity-55'
                      )}
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
                        <span className={cn(
                          'rounded-full px-2.5 py-1 text-[10px] font-black',
                          !hasLocation && 'bg-slate-700 text-slate-300',
                          hasLocation && locState === 'live' && 'bg-emerald-400/15 text-emerald-200',
                          hasLocation && locState === 'recent' && 'bg-amber-400/15 text-amber-200',
                          hasLocation && locState === 'stale' && 'bg-slate-700 text-slate-200'
                        )}>
                          {hasLocation ? formatLocationAge(loc) : 'SEM GPS'}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs leading-5 text-slate-300">
                        <p className="flex items-center gap-2">
                          <FaUser className="text-cyan-300" />
                          {item.driverName || item.userName || 'Motorista nao informado'}
                        </p>
                        <p className="flex items-center gap-2">
                          <FaTruck className="text-emerald-300" />
                          {getContainerValue(item)}
                        </p>
                        <p className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-violet-300" />
                          {getPartyName(item)}
                        </p>
                        <div className="flex items-center justify-between gap-3 pt-1 text-slate-400">
                          <span>{schedule ? formatarAgendamento(schedule) : 'Sem agendamento'}</span>
                          <span className="font-black text-cyan-200">{getStatusLabel(item.status)}</span>
                        </div>
                      </div>
                    </button>
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
