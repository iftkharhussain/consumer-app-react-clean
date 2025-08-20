import { setRequest } from '../../utils/helper';

export const logsApi = {
  // Get logs with pagination and filters
  getLogs: async (params = {}) => {
    return await setRequest('GET_LOGS', params, '/app-logs', 'GET');
  },

  // Search logs
  searchLogs: async (params) => {
    return await setRequest('SEARCH_LOGS', params, '/app-logs/search', 'GET');
  },

  // Get filter options
  getFilters: async () => {
    return await setRequest('GET_LOG_FILTERS', null, '/app-logs/filters', 'GET');
  },

  // Get statistics
  getStatistics: async (params = {}) => {
    return await setRequest('GET_LOG_STATISTICS', params, '/app-logs/statistics', 'GET');
  },

  // Get dashboard data
  getDashboard: async (params = {}) => {
    return await setRequest('GET_LOG_DASHBOARD', params, '/app-logs/dashboard', 'GET');
  },

  // Mark log as resolved
  markAsResolved: async (logId) => {
    return await setRequest('MARK_LOG_RESOLVED', null, `/app-logs/${logId}/resolve`, 'PUT');
  },

  // Bulk delete logs
  bulkDelete: async (logIds) => {
    const formData = new FormData();
    formData.append('logIds', JSON.stringify(logIds));
    return await setRequest('BULK_DELETE_LOGS', formData, '/app-logs/bulk-delete', 'DELETE');
  },

  // Cleanup old logs
  cleanup: async (params = {}) => {
    const formData = new FormData();
    Object.keys(params).forEach(key => {
      formData.append(key, params[key]);
    });
    return await setRequest('CLEANUP_LOGS', formData, '/app-logs/cleanup', 'POST');
  },

  // Export logs
  export: async (params = {}) => {
    return await setRequest('EXPORT_LOGS', params, '/app-logs/export', 'GET');
  }
};
