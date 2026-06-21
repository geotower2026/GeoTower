import React, { useEffect, useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClipboardList,
  FaExclamationTriangle,
  FaFileUpload,
  FaSearch,
  FaSync,
  FaTruck,
  FaUpload,
  FaUser,
  FaCalendarAlt,
  FaBoxes,
  FaBuilding,
  FaRegCommentDots,
  FaExchangeAlt,
  FaFileExcel,
  FaHistory,
  FaLock,
} from 'react-icons/fa';
import Toast from '../components/Toast';
import { adminService } from '../services/authService';
import { useAuth } from '../services/authContext';
import { useCity } from '../contexts/CityContext';
import { getDocumentLabel } from '../utils/documentLabels';
import { formatarData } from '../utils/date';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Field = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon size={12} className="text-slate-400" />}
      <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-black">
        {label}
      </p>
    </div>
    <p className="text-[13px] font-semibold text-slate-700 break-words leading-snug">
      {value || '-'}
    </p>
  </div>
);

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-2.5">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
        <Icon size={12} />
      </div>
      <div>
        <h3 className="text-[13px] font-black text-slate-900">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-slate-500 leading-tight">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

const formatScheduleValue = (value, city) => {
  if (!value) return '-';
  const text = String(value).trim();
  if (!text) return '-';

  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;

  return formatarData(text, city, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getScheduleInfo = (item, city) => {
  const isItajai = city === 'itajai';
  const value = isItajai
    ? (item.dtColeta || item.dataAgendamento)
    : (item.dataAgendamento || item.dtColeta);

  return {
    label: isItajai && item.dtColeta ? 'Dt. coleta' : 'Agendamento',
    value: formatScheduleValue(value, city),
  };
};

const getPartyLabel = (item, city) => {
  const sentido = String(item?.sentido || '').trim().toUpperCase();
  if (sentido === 'ORIGEM') return 'Remetente';
  if (sentido === 'DESTINO') return 'Recebedor';
  return city === 'itajai' ? 'Remetente' : 'Recebedor';
};

const formatSentido = (value) => {
  const sentido = String(value || '').trim().toUpperCase();
  if (sentido === 'ORIGEM') return 'Origem';
  if (sentido === 'DESTINO') return 'Destino';
  return '-';
};

const formatDeliveryStatus = (value) => {
  if (!value) return '-';
  const key = String(value).trim();
  if (key === 'submitted' || key === 'ENTREGUE') return 'OPERAÇÃO FINALIZADA';
  if (key === 'ENTREGUE_COM_PENDENCIA_CANHOTO') return 'FINALIZADO COM PENDÊNCIA';
  if (key === 'pending' || key === 'PENDING') return 'A CAMINHO DO CLIENTE';
  return key.replace(/_/g, ' ');
};

const buildExcelColumnWidths = (headers, rows) =>
  headers.map((header) => {
    const maxCellLength = rows.reduce((max, row) => {
      const value = row[header];
      const length = value ? String(value).length : 0;
      return Math.max(max, length);
    }, header.length);
    return { wch: Math.min(Math.max(maxCellLength + 2, 14), 48) };
  });

const RESPONSAVEL_CONFIG = {
  geolog: {
    label: 'GeoLog',
    field: 'retornoGeoLog',
    icon: FaTruck,
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    panel: 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50',
    button: 'bg-blue-600 hover:bg-blue-700',
    ring: 'focus:border-blue-300 focus:ring-blue-100',
  },
  geomar: {
    label: 'GeoMar',
    field: 'retornoGeoMar',
    icon: FaUser,
    badge: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    panel: 'border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50',
    button: 'bg-cyan-600 hover:bg-cyan-700',
    ring: 'focus:border-cyan-300 focus:ring-cyan-100',
  },
};

const getPendenciaResponsavel = (item) =>
  ['geomar', 'geolog'].includes(String(item?.pendenciaResponsavel || '').toLowerCase())
    ? String(item.pendenciaResponsavel).toLowerCase()
    : 'geolog';

const isOpenPendencia = (item) => {
  const status = String(item?.pendenciaStatus || '').trim().toUpperCase();
  const missingDocs = Array.isArray(item?.missingDocumentsAtSubmit)
    ? item.missingDocumentsAtSubmit
    : [];
  return missingDocs.length > 0 || status === 'AGUARDANDO_GEOLOG' || status === 'AGUARDANDO_GEOMAR';
};

const isResolvedPendencia = (item) => {
  const status = String(item?.pendenciaStatus || '').trim().toUpperCase();
  return status === 'RESOLVIDA' || (!isOpenPendencia(item) && Boolean(item?.retornosPendenciaUpdatedAt));
};

const getUserPendenciaGroup = (role) => {
  if (role === 'geomar') return 'geomar';
  if (role === 'admin') return 'geolog';
  return '';
};

const getNextResponsavel = (current) => current === 'geomar' ? 'geolog' : 'geomar';

const PendingDocumentControl = ({ doc, city, disabled, disabledLabel, onUpload }) => {
  const inputId = useId();

  return (
    <div className="group rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3 transition hover:shadow-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <FaExclamationTriangle size={12} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.16em] font-black text-amber-600">
            Documento pendente
          </p>
          <p className="text-[13px] font-bold truncate">
            {getDocumentLabel(doc, city)}
          </p>
        </div>
      </div>

      <div className="mt-2.5">
        <input
          id={inputId}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(event) => {
            if (disabled) {
              event.target.value = '';
              return;
            }
            onUpload(event.target.files);
            event.target.value = '';
          }}
        />

        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition',
            disabled
              ? 'cursor-wait bg-slate-200 text-slate-400'
              : 'cursor-pointer border border-amber-200 bg-white text-amber-700 hover:bg-amber-100'
          )}
        >
          <FaUpload size={11} />
          {disabled && disabledLabel ? disabledLabel : disabled ? 'Anexando...' : 'Selecionar arquivos'}
        </label>
      </div>
    </div>
  );
};

const ReturnPanel = ({
  title,
  icon: Icon,
  value,
  draftValue,
  onChange,
  placeholder,
  disabled = false,
  helper,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
    <div className="flex items-center gap-2 mb-2.5">
      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
        <Icon size={13} />
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-black">
          Retorno operacional
        </p>
        <h4 className="text-[13px] font-black text-slate-900">{title}</h4>
      </div>
    </div>

    {value && (
      <div className="mb-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-[9px] uppercase tracking-[0.16em] text-slate-400 font-black mb-1">
          Último retorno
        </p>
        <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-snug max-h-24 overflow-y-auto">
          {value}
        </p>
      </div>
    )}

    <textarea
      value={draftValue ?? ''}
      onChange={onChange}
      disabled={disabled}
      rows={3}
      className={cn(
        'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-800 outline-none resize-y transition focus:bg-white focus:ring-4',
        disabled
          ? 'cursor-not-allowed text-slate-400'
          : 'focus:border-amber-300 focus:ring-amber-100'
      )}
      placeholder={placeholder}
    />
    {helper && (
      <p className="mt-2 text-[11px] font-semibold text-slate-500 leading-snug">
        {helper}
      </p>
    )}
  </div>
);

const DeliveryCardSkeleton = () => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
    <div className="p-5 space-y-4 animate-pulse">
      <div className="flex justify-between gap-4">
        <div className="space-y-2 w-1/2">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-6 w-56 rounded bg-slate-200" />
        </div>
        <div className="h-8 w-24 rounded-full bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="h-20 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="h-40 rounded-2xl bg-slate-100 xl:col-span-1" />
        <div className="h-40 rounded-2xl bg-slate-100 xl:col-span-2" />
      </div>
    </div>
  </div>
);

const ListCell = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-black">
      {label}
    </p>
    <p className="mt-1 text-sm font-bold text-slate-800 break-words">
      {value || '-'}
    </p>
  </div>
);

const getLastHistoryEntry = (item) => {
  const history = Array.isArray(item?.pendenciaHistorico)
    ? item.pendenciaHistorico
    : [];
  return history[history.length - 1] || null;
};

const getListRowValues = (item, city) => {
  const scheduleInfo = getScheduleInfo(item, city);
  const currentOwner = getPendenciaResponsavel(item);
  const currentConfig = RESPONSAVEL_CONFIG[currentOwner];
  const lastHistory = getLastHistoryEntry(item);
  const partyValue = item.recebedor || item.destinatario || item.remetente;
  const containerValue = Array.isArray(item.containerNumero)
    ? item.containerNumero.join(', ')
    : item.container || item.deliveryNumber;

  return {
    processoPrincipal: item.processoCAB || item.deliveryNumber || '',
    processoLog: item.processoLog || '',
    container: containerValue || '',
    recebedor: partyValue || '',
    agendamento: scheduleInfo.value || '',
    contratado: item.userName || '',
    responsavel: isOpenPendencia(item) ? currentConfig.label : 'Resolvido',
    justificativa: item.submissionObservation || item.documentsJustification || '',
    retornoGeoMar: item.retornoGeoMar || '',
    acao: lastHistory?.message || '',
    dataColeta: formatScheduleValue(item.dtColeta, city),
  };
};

const EntregasCanhotosPendentes = () => {
  const navigate = useNavigate();
  const { city } = useCity();
  const { user } = useAuth();
  const userPendenciaGroup = getUserPendenciaGroup(user?.role);
  const isManagerViewOnly = user?.role === 'manager';

  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState(userPendenciaGroup || 'geomar');
  const [expandedId, setExpandedId] = useState(null);
  const viewMode = 'professional';

  const loadPendencias = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCanhotosPendentes({ includeResolved: true });
      const deliveries = res.data?.deliveries || [];

      setItems(deliveries);
      setDrafts((prev) => {
        const next = {};
        deliveries.forEach((item) => {
          next[item._id] = prev[item._id] || {
            retornoGeoMar: '',
            retornoGeoLog: '',
          };
        });
        return next;
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Erro ao carregar documentos pendentes',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const searchedItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (!term) return true;

      return [
        item.processoCAB,
        item.processoLog,
        item.deliveryNumber,
        item.container,
        item.userName,
        item.driverName,
        item.recebedor,
        item.retornoGeoMar,
        item.retornoGeoLog,
      ].some((value) => String(value || '').toLowerCase().includes(term));
    });
  }, [items, search]);

  const openItems = useMemo(() => items.filter(isOpenPendencia), [items]);
  const resolvedItems = useMemo(() => items.filter(isResolvedPendencia), [items]);

  const searchedOpenItems = useMemo(() => {
    const openIds = new Set(openItems.map((item) => item._id));
    return searchedItems.filter((item) => openIds.has(item._id));
  }, [openItems, searchedItems]);

  const filteredItems = useMemo(() => {
    if (ownerFilter === 'resolved') {
      return searchedItems
        .filter(isResolvedPendencia)
        .sort((a, b) => new Date(b.retornosPendenciaUpdatedAt || 0) - new Date(a.retornosPendenciaUpdatedAt || 0));
    }
    return searchedOpenItems.filter((item) => getPendenciaResponsavel(item) === ownerFilter);
  }, [ownerFilter, searchedItems, searchedOpenItems]);

  const visibleItems = filteredItems;

  useEffect(() => {
    setOwnerFilter(userPendenciaGroup || 'geomar');
  }, [userPendenciaGroup]);

  const totalComGeoMar = openItems.filter(
    (item) => getPendenciaResponsavel(item) === 'geomar'
  ).length;

  const totalComGeoLog = openItems.filter(
    (item) => getPendenciaResponsavel(item) === 'geolog'
  ).length;

  const totalResolvidas = resolvedItems.length;

  const exportListToExcel = () => {
    const headers = [
      'Processo principal',
      'Processo Log',
      'Container',
      'Recebedor',
      'Agendamento',
      'Contratado',
      'Responsavel',
      'Justificativa',
      'Retorno GeoMar',
      'acao',
      'Data da coleta',
      'Status',
      'Resolvido em',
      'Atualizado por',
    ];

    const rows = visibleItems.map((item) => {
      const row = getListRowValues(item, city);

      return {
        'Processo principal': row.processoPrincipal,
        'Processo Log': row.processoLog,
        Container: row.container,
        Recebedor: row.recebedor,
        Agendamento: row.agendamento,
        Contratado: row.contratado,
        Responsavel: row.responsavel,
        Justificativa: row.justificativa,
        'Retorno GeoMar': row.retornoGeoMar,
        acao: row.acao,
        'Data da coleta': row.dataColeta,
        Status: item.pendenciaStatus || '',
        'Resolvido em': item.retornosPendenciaUpdatedAt ? formatarData(item.retornosPendenciaUpdatedAt, city) : '',
        'Atualizado por': item.retornosPendenciaUpdatedBy || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows, { header: headers, defval: '' });
    ws['!cols'] = buildExcelColumnWidths(headers, rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Documentos Pendentes');
    XLSX.writeFile(wb, 'documentos-pendentes.xlsx');
  };

  const updateDraft = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        retornoGeoMar: '',
        retornoGeoLog: '',
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const saveRetornos = async (item) => {
    const draft = drafts[item._id] || {};
    const currentOwner = getPendenciaResponsavel(item);
    const currentConfig = RESPONSAVEL_CONFIG[currentOwner];
    const nextOwner = getNextResponsavel(currentOwner);

    if (currentOwner !== userPendenciaGroup) {
      setToast({
        type: 'warning',
        message: `Esta pendência está com ${currentConfig.label}. Aguarde o repasse para responder.`,
      });
      return;
    }

    const message = String(draft[currentConfig.field] || '').trim();

    if (!message) {
      setToast({
        type: 'warning',
        message: 'Digite uma nova observação antes de repassar',
      });
      return;
    }

    setSavingId(item._id);

    try {
      const res = await adminService.updateCanhotoRetornos(item._id, {
        [currentConfig.field]: message,
        repassarPara: nextOwner,
      });

      const updated = res.data?.delivery || {};

      setItems((prev) =>
        prev.map((row) =>
          row._id === item._id
            ? {
                ...row,
                retornoGeoMar: updated.retornoGeoMar ?? draft.retornoGeoMar ?? '',
                retornoGeoLog: updated.retornoGeoLog ?? draft.retornoGeoLog ?? '',
                pendenciaResponsavel:
                  updated.pendenciaResponsavel || nextOwner,
                pendenciaStatus:
                  updated.pendenciaStatus || row.pendenciaStatus,
                pendenciaHistorico:
                  updated.pendenciaHistorico || row.pendenciaHistorico || [],
                retornosPendenciaUpdatedAt:
                  updated.retornosPendenciaUpdatedAt || new Date().toISOString(),
                retornosPendenciaUpdatedBy:
                  updated.retornosPendenciaUpdatedBy || row.retornosPendenciaUpdatedBy,
              }
            : row
        )
      );

      setDrafts((prev) => ({
        ...prev,
        [item._id]: {
          retornoGeoMar: '',
          retornoGeoLog: '',
        },
      }));

      setToast({
        type: 'success',
        message: `Pendência repassada para ${RESPONSAVEL_CONFIG[nextOwner].label}`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Erro ao salvar retornos',
      });
    } finally {
      setSavingId(null);
    }
  };

  const concluirPendencia = async (item) => {
    const currentOwner = getPendenciaResponsavel(item);
    const draft = drafts[item._id] || {};
    const message = String(draft.retornoGeoMar || '').trim();
    const pendingDocs = Array.isArray(item.missingDocumentsAtSubmit)
      ? item.missingDocumentsAtSubmit
      : [];

    if (currentOwner !== 'geomar' || userPendenciaGroup !== 'geomar') {
      setToast({
        type: 'warning',
        message: 'A conclusão fica disponível apenas para GeoMar quando a pendência estiver com ela.',
      });
      return;
    }

    if (pendingDocs.length > 0) {
      setToast({
        type: 'warning',
        message: 'Ainda existem documentos pendentes para anexar antes da conclusão.',
      });
      return;
    }

    setSavingId(item._id);

    try {
      await adminService.concluirCanhotoPendencia(item._id, { mensagem: message });
      setItems((prev) => prev.filter((row) => row._id !== item._id));
      setDrafts((prev) => ({
        ...prev,
        [item._id]: {
          retornoGeoMar: '',
          retornoGeoLog: '',
        },
      }));
      setToast({
        type: 'success',
        message: 'Pendência concluída pela GeoMar',
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Erro ao concluir pendência',
      });
    } finally {
      setSavingId(null);
    }
  };

  const uploadDocumento = async (item, doc, files) => {
    const selected = Array.from(files || []);
    if (!selected.length) return;
    const currentOwner = getPendenciaResponsavel(item);

    if (currentOwner !== userPendenciaGroup) {
      setToast({
        type: 'warning',
        message: `Esta pendência está com ${RESPONSAVEL_CONFIG[currentOwner].label}. Aguarde o repasse para anexar.`,
      });
      return;
    }

    const uploadKey = `${item._id}:${doc}`;
    setUploadingDoc(uploadKey);

    try {
      const res = await adminService.uploadCanhotoDocumento(item._id, doc, selected);
      const updated = res.data?.delivery || {};
      const remaining = updated.missingDocumentsAtSubmit || [];

      setItems((prev) =>
        prev.map((row) =>
          row._id === item._id
            ? {
                ...row,
                ...updated,
                missingDocumentsAtSubmit: remaining,
              }
            : row
        )
      );

      setToast({
        type: 'success',
        message:
          remaining.length === 0
            ? 'Todos os documentos foram anexados. Repasse para a GeoMar conferir e concluir.'
            : `${getDocumentLabel(doc, city)} anexado com sucesso`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Erro ao anexar documento',
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
      <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={() => navigate('/home')}
                className="mt-0.5 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition shadow-sm"
                title="Voltar"
              >
                <FaArrowLeft />
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
                <FaClipboardList size={15} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 border border-slate-200">
                    Painel administrativo
                  </span>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-700 border border-amber-200">
                    Pendências documentais
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Documentos Pendentes
                </h1>
                <p className="text-sm text-slate-500 mt-0.5 leading-snug max-w-2xl">
                  Acompanhe entregas finalizadas com documentos faltantes e registre retornos operacionais com mais clareza.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <FaSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={13}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar processo, motorista, retorno..."
                  className="w-full sm:w-80 lg:w-96 pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 outline-none shadow-sm transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                />
              </div>

              <button
                onClick={loadPendencias}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-black transition shadow-sm"
              >
                <FaSync size={12} />
                Atualizar
              </button>
              <button
                type="button"
                onClick={exportListToExcel}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition shadow-sm"
              >
                <FaFileExcel size={13} />
                Excel
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[
              { key: 'geomar', label: 'Com GeoMar', value: totalComGeoMar, icon: FaUser, activeClass: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-100', idleClass: 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50' },
              { key: 'geolog', label: 'Com GeoLog', value: totalComGeoLog, icon: FaTruck, activeClass: 'bg-blue-600 border-blue-600 text-white shadow-blue-100', idleClass: 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50' },
              { key: 'resolved', label: 'Histórico', value: totalResolvidas, icon: FaCheckCircle, activeClass: 'bg-slate-900 border-slate-900 text-white shadow-slate-200', idleClass: 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' },
            ].map((filter) => {
              const Icon = filter.icon;
              const active = ownerFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => {
                    setOwnerFilter(filter.key);
                    setExpandedId(null);
                  }}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition shadow-sm',
                    active ? filter.activeClass : filter.idleClass
                  )}
                >
                  <Icon size={12} />
                  <span>{filter.label}</span>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[11px]',
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  )}>
                    {filter.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-4">
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <DeliveryCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && visibleItems.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-10 sm:p-14 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <FaCheckCircle size={28} />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Nenhuma pendência encontrada
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
              Não há entregas finalizadas com documentos faltantes para os filtros atuais.
            </p>
          </div>
        )}

        {!loading && visibleItems.length > 0 && viewMode === 'professional' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-black">
                    {ownerFilter === 'resolved' ? 'Histórico operacional' : 'Fila operacional'}
                  </p>
                  <h2 className="text-lg font-black text-slate-900">
                    {ownerFilter === 'resolved'
                      ? `${visibleItems.length} processo${visibleItems.length === 1 ? '' : 's'} resolvido${visibleItems.length === 1 ? '' : 's'}`
                      : `${visibleItems.length} processo${visibleItems.length === 1 ? '' : 's'} com pendência`}
                  </h2>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {ownerFilter === 'resolved'
                    ? 'Consulta em formato compacto para auditoria e conferência.'
                    : 'Abra apenas o processo que precisa tratar. O restante fica recolhido.'}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {visibleItems.map((item) => {
                const draft = drafts[item._id] || {};
                const pendingDocs = item.missingDocumentsAtSubmit || [];
                const isSaving = savingId === item._id;
                const scheduleInfo = getScheduleInfo(item, city);
                const currentOwner = getPendenciaResponsavel(item);
                const currentConfig = RESPONSAVEL_CONFIG[currentOwner];
                const CurrentIcon = currentConfig.icon;
                const nextOwner = getNextResponsavel(currentOwner);
                const nextConfig = RESPONSAVEL_CONFIG[nextOwner];
                const isMyTurn = !isManagerViewOnly && currentOwner === userPendenciaGroup;
                const canConclude = isMyTurn && currentOwner === 'geomar' && pendingDocs.length === 0;
                const history = Array.isArray(item.pendenciaHistorico)
                  ? item.pendenciaHistorico
                  : [];
                const partyValue = item.recebedor || item.destinatario || item.remetente;
                const containerValue = Array.isArray(item.containerNumero)
                  ? item.containerNumero.join(', ')
                  : item.container || item.deliveryNumber;
                const isExpanded = expandedId === item._id;
                const isResolvedView = ownerFilter === 'resolved';

                return (
                  <div key={item._id} className="bg-white">
                    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr_0.9fr_0.7fr_auto] gap-3 px-4 py-3 hover:bg-slate-50/80 transition">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-black text-slate-950">
                            {item.processoCAB || item.deliveryNumber || '-'}
                          </p>
                          {isResolvedView ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                              <FaCheckCircle size={10} />
                              Resolvido
                            </span>
                          ) : (
                            <>
                              <span className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black border',
                                currentConfig.badge
                              )}>
                                <CurrentIcon size={10} />
                                {currentConfig.label}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700">
                                <FaExclamationTriangle size={10} />
                                {pendingDocs.length} pend.
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                          {item.processoLog && <span>Log: {item.processoLog}</span>}
                          {item.deliveryNumber && <span>Delivery: {item.deliveryNumber}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.18em] font-black text-slate-400">
                            Container
                          </p>
                          <p className="font-bold text-slate-800 truncate">{containerValue || '-'}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.18em] font-black text-slate-400">
                            {scheduleInfo.label}
                          </p>
                          <p className="font-bold text-slate-800 truncate">{scheduleInfo.value}</p>
                        </div>
                      </div>

                      <div className="min-w-0 text-sm">
                        <p className="text-[9px] uppercase tracking-[0.18em] font-black text-slate-400">
                          {getPartyLabel(item, city)}
                        </p>
                        <p className="font-bold text-slate-800 truncate">{partyValue || '-'}</p>
                        <p className="text-xs text-slate-500 truncate">{item.userName || '-'}</p>
                      </div>

                      <div className="min-w-0 text-sm">
                        <p className="text-[9px] uppercase tracking-[0.18em] font-black text-slate-400">
                          {isResolvedView ? 'Resolvido em' : 'Último retorno'}
                        </p>
                        <p className="font-semibold text-slate-600 truncate">
                          {isResolvedView
                            ? (item.retornosPendenciaUpdatedAt ? formatarData(item.retornosPendenciaUpdatedAt, city) : '-')
                            : (item[currentConfig.field] || item.submissionObservation || item.documentsJustification || 'Sem retorno')}
                        </p>
                        {isResolvedView && item.retornosPendenciaUpdatedBy && (
                          <p className="text-xs text-slate-500 truncate">por {item.retornosPendenciaUpdatedBy}</p>
                        )}
                      </div>

                      <div className="flex xl:justify-end items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : item._id)}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-100"
                        >
                          {isExpanded ? 'Ocultar' : isResolvedView ? 'Ver histórico' : 'Detalhes'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-4">
                        <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.35fr] gap-4">
                          <div className="space-y-3">
                            <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                              <SectionTitle
                                icon={FaBoxes}
                                title="Dados da entrega"
                                subtitle="Informações principais do processo"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <Field label="Container" value={containerValue} icon={FaBoxes} />
                                <Field label={scheduleInfo.label} value={scheduleInfo.value} icon={FaCalendarAlt} />
                                <Field label="Contratado" value={item.userName} icon={FaBuilding} />
                                <Field label="Motorista" value={item.driverName} icon={FaTruck} />
                                <div className="sm:col-span-2">
                                  <Field label={getPartyLabel(item, city)} value={partyValue} icon={FaUser} />
                                </div>
                              </div>
                            </div>

                            {(item.submissionObservation || item.documentsJustification) && (
                              <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-black">
                                  Justificativa
                                </p>
                                <p className="mt-1 text-sm leading-snug text-slate-700 whitespace-pre-wrap">
                                  {item.submissionObservation || item.documentsJustification}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            {!isResolvedView && (
                              <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                                <SectionTitle
                                  icon={FaFileUpload}
                                  title="Documentos pendentes"
                                  subtitle={isMyTurn ? 'Anexe somente quando for tratar este processo' : `Aguardando ${currentConfig.label}`}
                                />
                                {pendingDocs.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    {pendingDocs.map((doc) => (
                                      <PendingDocumentControl
                                        key={doc}
                                        doc={doc}
                                        city={city}
                                        disabled={uploadingDoc === `${item._id}:${doc}` || !isMyTurn}
                                        disabledLabel={
                                          !isMyTurn
                                            ? `Com ${currentConfig.label}`
                                            : undefined
                                        }
                                        onUpload={(files) => uploadDocumento(item, doc, files)}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                                    Nenhum documento pendente.
                                  </div>
                                )}
                              </div>
                            )}

                            <div className={cn(
                              'grid grid-cols-1 gap-3',
                              isResolvedView ? 'xl:grid-cols-1' : 'xl:grid-cols-[1.05fr_0.95fr]'
                            )}>
                              {!isResolvedView && (
                                <ReturnPanel
                                  title={`Responder como ${currentConfig.label}`}
                                  icon={currentConfig.icon}
                                  value={item[currentConfig.field]}
                                  draftValue={draft[currentConfig.field]}
                                  onChange={(e) =>
                                    updateDraft(item._id, currentConfig.field, e.target.value)
                                  }
                                  placeholder={
                                    isMyTurn
                                      ? `Descreva a tratativa e repasse para ${nextConfig.label}...`
                                      : isManagerViewOnly
                                        ? 'Modo visualização para gerente.'
                                        : `Aguardando repasse para ${RESPONSAVEL_CONFIG[userPendenciaGroup]?.label || 'seu perfil'}...`
                                  }
                                  disabled={!isMyTurn || isSaving}
                                  helper={
                                    isMyTurn
                                      ? canConclude
                                        ? 'Revise os anexos e conclua a pendência para remover da tela.'
                                        : `Ao salvar, esta pendência sai da sua fila e vai para ${nextConfig.label}.`
                                      : isManagerViewOnly
                                        ? 'Perfil gerente acompanha sem alterar o fluxo.'
                                        : `Você responde quando estiver com ${RESPONSAVEL_CONFIG[userPendenciaGroup]?.label || 'seu perfil'}.`
                                  }
                                />
                              )}

                              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                                <SectionTitle
                                  icon={FaHistory}
                                  title="Histórico"
                                  subtitle="Últimos repasses"
                                />
                                {history.length === 0 ? (
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-500">
                                    Nenhum repasse registrado ainda.
                                  </div>
                                ) : (
                                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                                    {history.slice().reverse().slice(0, 4).map((entry, index) => {
                                      const from = RESPONSAVEL_CONFIG[entry.from]?.label || '-';
                                      const to = RESPONSAVEL_CONFIG[entry.to]?.label || '-';
                                      const titleText = entry.action === 'documento_anexado'
                                        ? 'Documento'
                                        : `${from} para ${to}`;
                                      return (
                                        <div key={`${entry.createdAt || index}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                                            {titleText}
                                          </p>
                                          <p className="mt-1 text-[13px] font-semibold text-slate-700 whitespace-pre-wrap leading-snug">
                                            {entry.message || '-'}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>

                            {!isResolvedView && (
                            <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                              <div className="text-[13px] text-slate-500 leading-snug">
                                {item.retornosPendenciaUpdatedAt ? (
                                  <span>
                                    <span className="font-bold text-slate-700">Última atualização:</span>{' '}
                                    {formatarData(item.retornosPendenciaUpdatedAt, city)}
                                    {item.retornosPendenciaUpdatedBy
                                      ? ` por ${item.retornosPendenciaUpdatedBy}`
                                      : ''}
                                  </span>
                                ) : (
                                  <span>Nenhum retorno salvo ainda.</span>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2">
                                {canConclude && (
                                  <button
                                    onClick={() => saveRetornos(item)}
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-sm font-black transition disabled:opacity-60 shadow-sm"
                                  >
                                    <FaExchangeAlt size={12} />
                                    Repassar para GeoLog
                                  </button>
                                )}

                                <button
                                  onClick={() => canConclude ? concluirPendencia(item) : saveRetornos(item)}
                                  disabled={isSaving || !isMyTurn}
                                  className={cn(
                                    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-black transition disabled:opacity-60 shadow-sm',
                                    canConclude
                                      ? 'bg-emerald-600 hover:bg-emerald-700'
                                      : isMyTurn ? currentConfig.button : 'bg-slate-400 cursor-not-allowed'
                                  )}
                                >
                                  {isMyTurn ? (canConclude ? <FaCheckCircle size={12} /> : <FaExchangeAlt size={12} />) : <FaLock size={12} />}
                                  {isSaving
                                    ? canConclude ? 'Concluindo...' : 'Repassando...'
                                    : canConclude
                                      ? 'Concluir pendência'
                                      : isMyTurn
                                      ? `Repassar para ${nextConfig.label}`
                                      : `Aguardando ${currentConfig.label}`}
                                </button>
                              </div>
                            </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && visibleItems.length > 0 && viewMode === 'list' && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-black">
                    Lista estilo planilha
                  </p>
                  <h2 className="text-lg font-black text-slate-900">
                    {visibleItems.length} entrega{visibleItems.length === 1 ? '' : 's'} com documentos pendentes
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Inclui pendências com GeoMar e GeoLog.
                </p>
              </div>
              <button
                type="button"
                onClick={exportListToExcel}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
              >
                <FaFileExcel size={13} />
                Baixar Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1480px] w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    {[
                      'Processo principal',
                      'Processo Log',
                      'Container',
                      'Recebedor',
                      'Agendamento',
                      'Contratado',
                      'Responsavel',
                      'Justificativa',
                      'Retorno GeoMar',
                      'acao',
                      'Data da coleta',
                    ].map((column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-[10px] uppercase tracking-[0.16em] font-black text-slate-500 border-r border-slate-200 last:border-r-0"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleItems.map((item) => {
                    const row = getListRowValues(item, city);
                    const currentOwner = getPendenciaResponsavel(item);
                    const currentConfig = RESPONSAVEL_CONFIG[currentOwner];
                    return (
                      <tr key={item._id} className="odd:bg-white even:bg-slate-50/70 hover:bg-amber-50/60 transition">
                        <td className="px-4 py-3 text-sm font-black text-slate-900 border-r border-slate-100 align-top">
                          {row.processoPrincipal || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700 border-r border-slate-100 align-top">
                          {row.processoLog || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-700 border-r border-slate-100 align-top">
                          {row.container || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700 border-r border-slate-100 align-top">
                          {row.recebedor || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 border-r border-slate-100 align-top">
                          {row.agendamento || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 border-r border-slate-100 align-top">
                          {row.contratado || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm border-r border-slate-100 align-top">
                          <span className={cn(
                            'inline-flex rounded-full px-3 py-1 text-xs font-black border',
                            isOpenPendencia(item) ? currentConfig.badge : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          )}>
                            {row.responsavel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 border-r border-slate-100 align-top min-w-[260px] max-w-[360px]">
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {row.justificativa || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 border-r border-slate-100 align-top min-w-[260px] max-w-[360px]">
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {row.retornoGeoMar || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 border-r border-slate-100 align-top min-w-[220px] max-w-[320px]">
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {row.acao || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 align-top">
                          {row.dataColeta || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="hidden">
              {filteredItems.map((item) => {
                const pendingDocs = item.missingDocumentsAtSubmit || [];
                const scheduleInfo = getScheduleInfo(item, city);
                const currentOwner = getPendenciaResponsavel(item);
                const currentConfig = RESPONSAVEL_CONFIG[currentOwner];
                const CurrentIcon = currentConfig.icon;
                const history = Array.isArray(item.pendenciaHistorico)
                  ? item.pendenciaHistorico
                  : [];
                const lastHistory = history[history.length - 1];
                const partyValue = item.recebedor || item.destinatario || item.remetente;

                return (
                  <div key={item._id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition">
                    <div className="flex flex-col xl:flex-row xl:items-start gap-4">
                      <div className="xl:w-72 min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-black">
                          Processo principal
                        </p>
                        <h3 className="mt-1 text-lg font-black text-slate-900 break-words">
                          {item.processoCAB || item.deliveryNumber || '-'}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-200">
                            {formatDeliveryStatus(item.status)}
                          </span>
                          <span className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black border',
                            currentConfig.badge
                          )}>
                            <CurrentIcon size={10} />
                            {currentConfig.label}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4 flex-1 min-w-0">
                        <ListCell label="Processo Log" value={item.processoLog} />
                        <ListCell
                          label="Container"
                          value={Array.isArray(item.containerNumero) ? item.containerNumero.join(', ') : item.container || item.deliveryNumber}
                        />
                        <ListCell label={scheduleInfo.label} value={scheduleInfo.value} />
                        <ListCell label="Contratado" value={item.userName} />
                        <ListCell label="Motorista" value={item.driverName} />
                        <ListCell label={getPartyLabel(item, city)} value={partyValue} />
                        <ListCell label="Sentido" value={formatSentido(item.sentido)} />
                        <ListCell label="Armador" value={item.armador} />
                        <ListCell label="Atualizado em" value={item.retornosPendenciaUpdatedAt ? formatarData(item.retornosPendenciaUpdatedAt, city) : '-'} />
                        <ListCell label="Atualizado por" value={item.retornosPendenciaUpdatedBy} />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3">
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-amber-700 font-black mb-2">
                          Documentos pendentes
                        </p>
                        {pendingDocs.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {pendingDocs.map((doc) => (
                              <span key={doc} className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                                {getDocumentLabel(doc, city)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-emerald-700">
                            Nenhum documento pendente.
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-black mb-2">
                          Justificativa e último retorno
                        </p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {item.submissionObservation || item.documentsJustification || 'Sem justificativa registrada.'}
                        </p>
                        {lastHistory && (
                          <p className="mt-2 text-xs text-slate-500 whitespace-pre-wrap leading-relaxed">
                            <span className="font-black text-slate-700">Último retorno:</span>{' '}
                            {lastHistory.message || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && filteredItems.length > 0 && viewMode === 'cards' && (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const draft = drafts[item._id] || {};
              const pendingDocs = item.missingDocumentsAtSubmit || [];
              const isSaving = savingId === item._id;
              const scheduleInfo = getScheduleInfo(item, city);
              const currentOwner = getPendenciaResponsavel(item);
              const currentConfig = RESPONSAVEL_CONFIG[currentOwner];
              const CurrentIcon = currentConfig.icon;
              const nextOwner = getNextResponsavel(currentOwner);
              const nextConfig = RESPONSAVEL_CONFIG[nextOwner];
              const isMyTurn = !isManagerViewOnly && currentOwner === userPendenciaGroup;
              const canConclude = isMyTurn && currentOwner === 'geomar' && pendingDocs.length === 0;
              const history = Array.isArray(item.pendenciaHistorico)
                ? item.pendenciaHistorico
                : [];

              return (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                >
                  <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col xl:flex-row gap-4">
                      <div className="xl:w-[35%] 2xl:w-[33%] min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">
                              Processo principal
                            </p>
                            <h2 className="text-xl font-black text-slate-900 break-words mt-0.5">
                              {item.processoCAB || item.deliveryNumber || '-'}
                            </h2>

                            {(item.processoLog || item.deliveryNumber) && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {item.processoLog && (
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                                    Processo Log: {item.processoLog}
                                  </span>
                                )}
                                {item.deliveryNumber && (
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                                    Delivery: {item.deliveryNumber}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-black border border-amber-200">
                              <FaExclamationTriangle size={11} />
                              {pendingDocs.length} pend.
                            </span>
                            <span className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border',
                              currentConfig.badge
                            )}>
                              <CurrentIcon size={11} />
                              Com {currentConfig.label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <SectionTitle
                            icon={FaBoxes}
                            title="Informações da entrega"
                            subtitle="Dados operacionais principais"
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-2.5">
                            <Field
                              label="Container"
                              value={
                                Array.isArray(item.containerNumero)
                                  ? item.containerNumero.join(', ')
                                  : item.container || item.deliveryNumber
                              }
                              icon={FaBoxes}
                            />
                            <Field
                              label={scheduleInfo.label}
                              value={scheduleInfo.value}
                              icon={FaCalendarAlt}
                            />
                            <Field
                              label="Contratado"
                              value={item.userName}
                              icon={FaBuilding}
                            />
                            <Field
                              label="Motorista"
                              value={item.driverName}
                              icon={FaTruck}
                            />
                            <div className="md:col-span-2 xl:col-span-1 2xl:col-span-2">
                              <Field
                                label={getPartyLabel(item, city)}
                                value={item.recebedor || item.destinatario || item.remetente}
                                icon={FaUser}
                              />
                            </div>
                          </div>
                        </div>

                        {(item.submissionObservation || item.documentsJustification) && (
                          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-200/70 text-slate-600 flex items-center justify-center">
                                <FaRegCommentDots size={12} />
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-black">
                                  Justificativa
                                </p>
                                <p className="text-[13px] font-black text-slate-800">
                                  Observação do motorista
                                </p>
                              </div>
                            </div>

                            <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-snug">
                              {item.submissionObservation || item.documentsJustification}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="xl:flex-1 min-w-0 space-y-4">
                        <div>
                          <SectionTitle
                            icon={FaFileUpload}
                            title="Documentos pendentes"
                            subtitle="Anexe os arquivos faltantes para concluir a pendência"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2.5">
                            {pendingDocs.map((doc) => (
                              <PendingDocumentControl
                                key={doc}
                                doc={doc}
                                city={city}
                                disabled={uploadingDoc === `${item._id}:${doc}` || !isMyTurn}
                                disabledLabel={
                                  !isMyTurn
                                    ? `Com ${currentConfig.label}`
                                    : undefined
                                }
                                onUpload={(files) => uploadDocumento(item, doc, files)}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <SectionTitle
                            icon={FaRegCommentDots}
                            title="Passe e repasse"
                            subtitle={`A pendência está com ${currentConfig.label}`}
                          />

                          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-3">
                            <ReturnPanel
                              title={`Responder como ${currentConfig.label}`}
                              icon={currentConfig.icon}
                              value={item[currentConfig.field]}
                              draftValue={draft[currentConfig.field]}
                              onChange={(e) =>
                                updateDraft(item._id, currentConfig.field, e.target.value)
                              }
                              placeholder={
                                isMyTurn
                                  ? `Descreva a tratativa e repasse para ${nextConfig.label}...`
                                  : isManagerViewOnly
                                    ? 'Modo visualização para gerente.'
                                    : `Aguardando repasse para ${RESPONSAVEL_CONFIG[userPendenciaGroup]?.label || 'seu perfil'}...`
                              }
                              disabled={!isMyTurn || isSaving}
                              helper={
                                isMyTurn
                                  ? canConclude
                                    ? 'Revise os anexos e conclua a pendência para remover da tela.'
                                    : `Ao salvar, esta pendência sai da sua fila e vai para ${nextConfig.label}.`
                                  : isManagerViewOnly
                                    ? 'Perfil gerente acompanha a pendência sem alterar o fluxo.'
                                    : `Você consegue responder apenas quando a pendência estiver com ${RESPONSAVEL_CONFIG[userPendenciaGroup]?.label || 'seu perfil'}.`
                              }
                            />

                            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                              <div className="flex items-center gap-2 mb-2.5">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                  <FaHistory size={13} />
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-black">
                                    Histórico
                                  </p>
                                  <h4 className="text-[13px] font-black text-slate-900">
                                    Últimos repasses
                                  </h4>
                                </div>
                              </div>

                              {history.length === 0 ? (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-500">
                                  Nenhum repasse registrado ainda.
                                </div>
                              ) : (
                                <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                                  {history.slice().reverse().slice(0, 5).map((entry, index) => {
                                    const from = RESPONSAVEL_CONFIG[entry.from]?.label || '-';
                                    const to = RESPONSAVEL_CONFIG[entry.to]?.label || '-';
                                    const titleColor = entry.from === 'geomar' || entry.to === 'geomar'
                                      ? 'text-cyan-700'
                                      : entry.from === 'geolog' || entry.to === 'geolog'
                                        ? 'text-blue-700'
                                        : 'text-slate-500';
                                    const titleText = entry.action === 'documento_anexado'
                                      ? 'Documento'
                                      : `${from} para ${to}`;
                                    return (
                                      <div key={`${entry.createdAt || index}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                        <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em]">
                                          <span className={titleColor}>{titleText}</span>
                                          {entry.createdAt && (
                                            <span className="text-slate-600 bg-white/80 border border-slate-200 rounded-md px-1.5 py-0.5">
                                              {formatarData(entry.createdAt, city)}
                                            </span>
                                          )}
                                        </div>
                                        <p className="mt-1 text-[13px] font-semibold text-slate-700 whitespace-pre-wrap leading-snug">
                                          {entry.message || '-'}
                                        </p>
                                        {entry.by && (
                                          <p className="mt-1 text-[11px] text-slate-400">
                                            por {entry.by}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div className="text-[13px] text-slate-500 leading-snug">
                            {item.retornosPendenciaUpdatedAt ? (
                              <span>
                                <span className="font-bold text-slate-700">Última atualização:</span>{' '}
                                {formatarData(item.retornosPendenciaUpdatedAt, city)}
                                {item.retornosPendenciaUpdatedBy
                                  ? ` por ${item.retornosPendenciaUpdatedBy}`
                                  : ''}
                              </span>
                            ) : (
                              <span>Nenhum retorno salvo ainda.</span>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            {canConclude && (
                              <button
                                onClick={() => saveRetornos(item)}
                                disabled={isSaving}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-sm font-black transition disabled:opacity-60 shadow-sm"
                              >
                                <FaExchangeAlt size={12} />
                                Repassar para GeoLog
                              </button>
                            )}

                            <button
                              onClick={() => canConclude ? concluirPendencia(item) : saveRetornos(item)}
                              disabled={isSaving || !isMyTurn}
                              className={cn(
                                'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-black transition disabled:opacity-60 shadow-sm',
                                canConclude
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : isMyTurn ? currentConfig.button : 'bg-slate-400 cursor-not-allowed'
                              )}
                            >
                              {isMyTurn ? (canConclude ? <FaCheckCircle size={12} /> : <FaExchangeAlt size={12} />) : <FaLock size={12} />}
                              {isSaving
                                ? canConclude ? 'Concluindo...' : 'Repassando...'
                                : canConclude
                                  ? 'Concluir pendência'
                                  : isMyTurn
                                  ? `Repassar para ${nextConfig.label}`
                                  : `Aguardando ${currentConfig.label}`}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default EntregasCanhotosPendentes;
