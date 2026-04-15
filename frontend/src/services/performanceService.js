// Service para análise de produtividade e capacidade
import api from './api';

export const performanceService = {
  // Buscar dados de performance com filtros opcionais
  async getPerformanceData(filters = {}) {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      console.log('[PerformanceService] Chamando GET /admin/performance com filtros:', params);
      const response = await api.get('/admin/performance', { params });
      console.log('[PerformanceService] Resposta recebida:', response.data);
      
      // Se a resposta tem estrutura { success: true, data: {...} }, extrair apenas os dados
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('[PerformanceService] Erro ao buscar dados de performance:', error);
      throw error;
    }
  }
};