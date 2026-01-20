import { apiClient } from '../../utils/api';

/**
 * Get aggregated KPIs for an agent
 * @param {string} agentId - Agent ID
 * @param {number} periodDays - Number of days to aggregate (default: 30)
 * @returns {Promise} Agent KPI data
 */
export const getAgentKPIs = (agentId, periodDays = 30) =>
    apiClient.get(`/agents/${agentId}/kpis`, { period_days: periodDays });

/**
 * Get all KPI schemas (static + dynamic) for an agent
 * @param {string} agentId - Agent ID
 * @param {boolean} includeStatic - Include static KPI schemas (default: true)
 * @returns {Promise} KPI schemas
 */
export const getKPISchemas = (agentId, includeStatic = true) =>
    apiClient.get(`/agents/${agentId}/kpis/schemas`, { include_static: includeStatic });

/**
 * Trigger dynamic KPI discovery for an agent
 * @param {string} agentId - Agent ID
 * @param {boolean} forceRefresh - Force re-discovery even if cached (default: false)
 * @returns {Promise} Discovered KPI schemas
 */
export const discoverAgentKPIs = (agentId, forceRefresh = false) =>
    apiClient.post(`/agents/${agentId}/kpis/discover`, null, { force_refresh: forceRefresh });

/**
 * Get KPI trends for a specific KPI type
 * @param {string} agentId - Agent ID
 * @param {string} kpiType - KPI type (e.g., 'fcr_rate', 'conversion_rate')
 * @param {number} periodDays - Number of days for trend (default: 30)
 * @param {number} intervalDays - Interval between data points (default: 1)
 * @returns {Promise} Trend data
 */
export const getKPITrends = (agentId, kpiType, periodDays = 30, intervalDays = 1) =>
    apiClient.get(`/agents/${agentId}/kpis/trends`, {
        kpi_type: kpiType,
        period_days: periodDays,
        interval_days: intervalDays
    });

/**
 * Get call details with KPIs included
 * @param {string} callId - Call ID
 * @returns {Promise} Call data with KPIs
 */
export const getCallWithKPIs = (callId) =>
    apiClient.get(`/calls/${callId}`, { include_kpis: true });

/**
 * Clear cached KPI schemas for an agent
 * @param {string} agentId - Agent ID
 * @returns {Promise} Confirmation
 */
export const clearKPISchemas = (agentId) =>
    apiClient.delete(`/agents/${agentId}/kpis/schemas`);

const kpiService = {
    getAgentKPIs,
    getKPISchemas,
    discoverAgentKPIs,
    getKPITrends,
    getCallWithKPIs,
    clearKPISchemas,
};

export default kpiService;
