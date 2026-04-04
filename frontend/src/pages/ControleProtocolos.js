import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaSearch, FaSync, FaTimes, FaChevronLeft, FaChevronRight,
  FaFilter, FaTable, FaDownload
} from 'react-icons/fa';
import { adminService } from '../services/authService';
import Toast from '../components/Toast';
import '../styles/ControleProtocolos.css';

/* ─────────────────────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────────────────────── */
const FIXED_COLUMNS = ['processo', 'container', 'embarcador', 'destinatario'];

const DOCUMENT_COLUMNS = [
  'CANHOTO DE DANFE',
  'COMPROVANTE DE DESOVA',
  'DIARIO DE BORDO',
  'DISCO/ARQUIVO TACOGRAFO',
  'NOSHOW',
  'RIC DE ABASTECIMENTO',
  'RIC DEPOT DESTINO',
  'RIC PORTO DESTINO',
  'SOLICITAÇÃO DE MONITORAMENTO',
  'VALE PALLET',
  'FOTOS',
  'RIC DEPOT',
  'RIC PORTO',
  'RIC RETROAREA'
];

const ALL_COLUMNS = [...FIXED_COLUMNS, ...DOCUMENT_COLUMNS];

/* ─────────────────────────────────────────────────────────────
   CELULA COM STATUS DE DOCUMENTO
───────────────────────────────────────────────────────────── */
const DocumentCell = ({ value }) => {
  const isPresent = value === true || value === 1 || value === '1' || value === 'true';
  
  return (
    <div className="cp-doc-cell">
      {isPresent ? (
        <span className="cp-badge cp-badge-success" title="Documento presente">
          ✅
        </span>
      ) : (
        <span className="cp-badge cp-badge-error" title="Documento faltando">
          ❌
        </span>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   LINHA SKELETON
───────────────────────────────────────────────────────────── */
const SkeletonRow = ({ numCols }) => (
  <tr className="cp-skeleton-row">
    {Array.from({ length: numCols }).map((_, i) => (
      <td key={i} className={`cp-td ${i < FIXED_COLUMNS.length ? 'cp-td-sticky' : ''}`}>
        <div className="cp-skeleton-pulse" />
      </td>
    ))}
  </tr>
);

/* ─────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────────────────── */
const ControleProtocolos = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [toast, setToast] = useState(null);

  // Buscar dados
  const fetchData = useCallback(async (term = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getControleProtocolos(term);
      if (response.data.success) {
        setData(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Erro ao buscar dados');
      }
    } catch (err) {
      console.error('Erro ao buscar protocolos:', err);
      setError(err.message);
      setToast({
        type: 'error',
        title: 'Erro',
        message: err.message || 'Erro ao carregar dados'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito inicial
  useEffect(() => {
    fetchData();
  }, []);

  // Debounce para busca
  const searchTimer = useRef(null);
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchData(value);
    }, 500);
  }, [fetchData]);

  // Refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData(searchTerm);
      setToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Dados atualizados com sucesso'
      });
    } finally {
      setRefreshing(false);
    }
  }, [fetchData, searchTerm]);

  // Controle de scroll horizontal
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        scrollElement.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll]);

  // Função para scroll
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Obter valor do documento
  const getDocumentValue = useCallback((record, docName) => {
    if (!record.documentos) return false;
    return record.documentos[docName] || false;
  }, []);

  // Renderizar célula fixa
  const renderFixedCell = (record, columnKey) => {
    const value = record[columnKey];
    return (
      <td key={columnKey} className="cp-td cp-td-sticky" data-sticky-index={FIXED_COLUMNS.indexOf(columnKey)}>
        <div className="cp-cell-content">{value || '—'}</div>
      </td>
    );
  };

  // Renderizar célula de documento
  const renderDocumentCell = (record, docName) => {
    const value = getDocumentValue(record, docName);
    return (
      <td key={docName} className="cp-td">
        <DocumentCell value={value} />
      </td>
    );
  };

  // Exportar para CSV
  const handleExportCSV = useCallback(() => {
    if (data.length === 0) {
      setToast({
        type: 'warning',
        title: 'Aviso',
        message: 'Nenhum dado para exportar'
      });
      return;
    }

    try {
      // Cabeçalhos
      const headers = ALL_COLUMNS.map(col => `"${col}"`).join(',');
      
      // Linhas
      const rows = data.map(record => {
        const values = [];
        
        // Colunas fixas
        FIXED_COLUMNS.forEach(col => {
          const val = record[col] || '';
          values.push(`"${String(val).replace(/"/g, '""')}"`);
        });
        
        // Colunas de documentos
        DOCUMENT_COLUMNS.forEach(docName => {
          const val = getDocumentValue(record, docName) ? 'SIM' : 'NÃO';
          values.push(`"${val}"`);
        });
        
        return values.join(',');
      });

      const csv = [headers, ...rows].join('\n');
      
      // Download
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `controle-protocolos-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      setToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Arquivo exportado com sucesso'
      });
    } catch (err) {
      console.error('Erro ao exportar:', err);
      setToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao exportar dados'
      });
    }
  }, [data, getDocumentValue]);

  return (
    <div className="cp-container">
      {/* Header */}
      <div className="cp-header">
        <div className="cp-header-top">
          <button
            onClick={() => navigate('/admin')}
            className="cp-btn cp-btn-back"
            title="Voltar"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="cp-title">Controle de Protocolos</h1>
          <div className="cp-header-actions">
            <button
              onClick={handleExportCSV}
              className="cp-btn cp-btn-action"
              title="Exportar CSV"
              disabled={data.length === 0}
            >
              <FaDownload size={16} />
              <span>Exportar</span>
            </button>
            <button
              onClick={handleRefresh}
              className={`cp-btn cp-btn-action ${refreshing ? 'cp-loading' : ''}`}
              title="Atualizar"
              disabled={refreshing || loading}
            >
              <FaSync size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="cp-search-wrapper">
          <div className="cp-search-input-container">
            <FaSearch className="cp-search-icon" />
            <input
              type="text"
              placeholder="Buscar por processo, container, embarcador ou destinatário..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="cp-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="cp-search-clear"
                title="Limpar busca"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>
          <p className="cp-results-info">
            {loading ? 'Carregando...' : `${data.length} protocolo${data.length !== 1 ? 's' : ''} encontrado${data.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="cp-error-message">
          <FaTimes size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Table Wrapper */}
      <div className="cp-table-wrapper">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="cp-scroll-btn cp-scroll-btn-left"
            title="Scroll esquerda"
          >
            <FaChevronLeft size={18} />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="cp-scroll-btn cp-scroll-btn-right"
            title="Scroll direita"
          >
            <FaChevronRight size={18} />
          </button>
        )}

        <div className="cp-table-scroll" ref={scrollRef}>
          <table className="cp-table">
            <thead className="cp-thead">
              <tr className="cp-tr-header">
                {/* Colunas Fixas */}
                {FIXED_COLUMNS.map((col, idx) => (
                  <th
                    key={col}
                    className={`cp-th cp-th-sticky`}
                    data-sticky-index={idx}
                  >
                    {col}
                  </th>
                ))}
                {/* Colunas de Documentos */}
                {DOCUMENT_COLUMNS.map((docName) => (
                  <th key={docName} className="cp-th cp-th-doc">
                    {docName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="cp-tbody">
              {loading ? (
                // Skeleton Loading
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={`skeleton-${i}`} numCols={ALL_COLUMNS.length} />
                ))
              ) : data.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={ALL_COLUMNS.length} className="cp-empty-state">
                    <FaTable size={40} className="cp-empty-icon" />
                    <p>Nenhum protocolo encontrado</p>
                    {searchTerm && (
                      <button
                        onClick={() => handleSearchChange('')}
                        className="cp-btn cp-btn-secondary"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                // Data Rows
                data.map((record, idx) => (
                  <tr key={record._id || idx} className="cp-tr-data">
                    {/* Colunas Fixas */}
                    {FIXED_COLUMNS.map((col) => renderFixedCell(record, col))}
                    {/* Colunas de Documentos */}
                    {DOCUMENT_COLUMNS.map((docName) => renderDocumentCell(record, docName))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ControleProtocolos;
