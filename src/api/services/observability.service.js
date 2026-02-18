import api from '../index';

/**
 * Observability API Service
 * 
 * Provides methods to interact with the observability backend API
 */

class ObservabilityService {
  /**
   * Ingest a trace from LangFuse
   */
  async ingestTrace(traceId, agentId) {
    const response = await api.post('/observability/traces/ingest', {
      trace_id: traceId,
      agent_id: agentId
    });
    return response.data;
  }

  /**
   * Get list of traces with filters and pagination
   */
  async getTraces({ 
    agentId, 
    sessionId, 
    status, 
    startDate, 
    endDate, 
    search, 
    page = 1, 
    limit = 20 
  } = {}) {
    const params = new URLSearchParams();
    
    if (agentId) params.append('agent_id', agentId);
    if (sessionId) params.append('session_id', sessionId);
    if (status) params.append('status', status);
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('limit', limit);
    
    const response = await api.get(`/observability/traces?${params.toString()}`);
    return response.data;
  }

  /**
   * Get a single trace by ID
   */
  async getTrace(traceId) {
    const response = await api.get(`/observability/traces/${traceId}`);
    return response.data;
  }

  /**
   * Get evaluation result for a trace
   */
  async getTraceEvaluation(traceId) {
    const response = await api.get(`/observability/traces/${traceId}/evaluation`);
    return response.data;
  }

  /**
   * Evaluate a single trace
   */
  async evaluateTrace(traceId, options = {}) {
    const response = await api.post(`/observability/traces/${traceId}/evaluate`, {
      flow_config: options.flowConfig,
      test_case: options.testCase,
      evaluate_immediately: options.evaluateImmediately ?? true
    });
    return response.data;
  }

  /**
   * Get traces for a session
   */
  async getSessionTraces(sessionId) {
    const response = await api.get(`/observability/sessions/${sessionId}/traces`);
    return response.data;
  }

  /**
   * Get session details
   */
  async getSession(sessionId) {
    const response = await api.get(`/observability/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Evaluate all traces in a session
   */
  async evaluateSession(sessionId, options = {}) {
    const response = await api.post(`/observability/sessions/${sessionId}/evaluate`, {
      flow_config: options.flowConfig,
      evaluate_immediately: options.evaluateImmediately ?? true
    });
    return response.data;
  }

  /**
   * Evaluate traces in batch
   */
  async evaluateBatch(traceIds, options = {}) {
    const response = await api.post('/observability/batch/evaluate', {
      trace_ids: traceIds,
      flow_config: options.flowConfig,
      evaluate_immediately: options.evaluateImmediately ?? true
    });
    return response.data;
  }

  /**
   * Evaluate traces in a time range
   */
  async evaluateTimeRange(startTime, endTime, options = {}) {
    const response = await api.post('/observability/timerange/evaluate', {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      agent_id: options.agentId,
      flow_config: options.flowConfig,
      evaluate_immediately: options.evaluateImmediately ?? true
    });
    return response.data;
  }

  /**
   * Get KPIs for dashboard
   */
  async getKPIs(agentId = null, timeRange = '7d') {
    const params = new URLSearchParams();
    if (agentId) params.append('agent_id', agentId);
    params.append('time_range', timeRange);
    
    const response = await api.get(`/observability/kpis?${params.toString()}`);
    return response.data;
  }

  /**
   * Get trends data for charts
   */
  async getTrends(agentId = null, timeRange = '7d') {
    const params = new URLSearchParams();
    if (agentId) params.append('agent_id', agentId);
    params.append('time_range', timeRange);
    
    const response = await api.get(`/observability/trends?${params.toString()}`);
    return response.data;
  }

  /**
   * Trigger manual sync from LangFuse
   */
  async syncNow(force = false) {
    const response = await api.post('/observability/sync/now', { force });
    return response.data;
  }

  /**
   * Get sync worker status
   */
  async getSyncStatus() {
    const response = await api.get('/observability/sync/status');
    return response.data;
  }

  /**
   * Get sync history
   */
  async getSyncHistory(limit = 10) {
    const response = await api.get(`/observability/sync/history?limit=${limit}`);
    return response.data;
  }
}

export default new ObservabilityService();
