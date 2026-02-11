import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import {
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Zap,
  TrendingDown,
  Activity,
  Filter,
  X,
  Mic,
  Brain,
  Volume2,
  Wrench,
} from 'lucide-react';

/* ================= CARD ================= */
const Card = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      {Icon && <Icon className="w-5 h-5 text-teal-400" />}
      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
    </div>
    {children}
  </div>
);

/* ================= METRIC CARD ================= */
const MetricCard = ({ title, icon, rate, count, onClick, isActive }) => {
  const percentage = rate !== undefined ? Math.round(rate * 100) : 0;
  return (
    <div
      onClick={onClick}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all cursor-pointer ${
        isActive
          ? 'border-teal-500/50 bg-teal-500/10 ring-2 ring-teal-500/20'
          : 'border-gray-700/50 hover:border-teal-500/30 hover:bg-gray-800/70'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-teal-400">{percentage}%</div>
        <p className="text-xs text-gray-400">
          Detected in {count || 0} {(count || 0) === 1 ? 'call' : 'calls'}
        </p>
      </div>
    </div>
  );
};

/* ================= ERROR METRIC CARD (NEW STYLE) ================= */
const ErrorMetricCard = ({ title, icon, count, onClick, isActive }) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg p-4 border transition-all cursor-pointer ${
        isActive
          ? 'border-red-500/50 bg-red-500/10 ring-2 ring-red-500/20'
          : 'border-gray-700/30 bg-gray-800/30 hover:border-red-500/30 hover:bg-gray-800/50'
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-red-500/20' : 'bg-gray-700/50'}`}>
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300">{title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">Errors</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${count > 0 ? 'text-red-400' : 'text-gray-500'}`}>
            {count || 0}
          </div>
          <p className="text-xs text-gray-500">{(count || 0) === 1 ? 'call' : 'calls'}</p>
        </div>
      </div>
    </div>
  );
};

/* ================= FILTER DROPDOWN ================= */
const FilterDropdown = ({ activeFilters, onFilterChange, onClearFilters }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
          hasActiveFilters
            ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
            : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:bg-gray-800/50'
        }`}
      >
        <Filter className="w-4 h-4" />
        Filters {hasActiveFilters && `(${Object.keys(activeFilters).length})`}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full mt-2 right-0 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-100">Active Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onClearFilters();
                    setIsOpen(false);
                  }}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {hasActiveFilters ? (
                <div className="space-y-2">
                  {Object.entries(activeFilters).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-200">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {typeof value === 'object'
                            ? `${Object.keys(value)[0]}: ${Object.values(value)[0]}`
                            : value}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newFilters = { ...activeFilters };
                          delete newFilters[key];
                          onFilterChange(newFilters);
                        }}
                        className="ml-3 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No active filters</p>
                  <p className="text-gray-500 text-xs mt-1">Click on metrics to filter calls</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ================= DUMMY DATA ================= */
const DUMMY_DATA = {
  totalCalls: 11,
  kpis: {
    issue_resolved: { rate: 0.5, count: 5 },
    hallucination: { rate: 0.22, count: 2 },
    gibberish: { rate: 0.33, count: 3 },
    disc_offered: { rate: 0.45, count: 5 },
    avg_latency: { value: 445, count: 11 },
    abandonment_reason: {
      distribution: {
        product: 1,
        technical: 3,
        pricing: 2,
        other: 1,
      },
    },
    // New error breakdown metrics
    stt_errors: { count: 2 },
    llm_errors: { count: 1 },
    tts_errors: { count: 3 },
    tool_errors: { count: 1 },
  },
};

/* ================= CONSISTENT TEAL COLOR SCHEME ================= */
const TEAL_COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a', '#042f2e'];

/* ================= KPI SECTION ================= */
const KPISection = ({ normalized, isLoadingKPIs, onFilterChange }) => {
  const [activeFilters, setActiveFilters] = React.useState({});

  // Use dummy data as fallback
  const safeData = normalized && normalized.kpis ? normalized : DUMMY_DATA;
  const { totalCalls = 0, kpis = {} } = safeData;

  const handleMetricClick = (metricKey, value) => {
    const newFilters = { ...activeFilters };

    // Toggle filter
    if (newFilters[metricKey]) {
      delete newFilters[metricKey];
    } else {
      // For boolean metrics (issue_resolved, hallucination, gibberish, disc_offered)
      if (['issue_resolved', 'hallucination', 'gibberish', 'disc_offered'].includes(metricKey)) {
        newFilters[metricKey] = { eq: true };
      }
      // For latency, filter by range
      else if (metricKey === 'avg_latency') {
        newFilters[metricKey] = { gt: value };
      }
      // For error metrics (stt_errors, llm_errors, tts_errors, tool_errors)
      else if (['stt_errors', 'llm_errors', 'tts_errors', 'tool_errors'].includes(metricKey)) {
        newFilters[metricKey] = { eq: true };
      }
    }

    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleAbandonmentClick = (reason) => {
    const newFilters = { ...activeFilters };
    const filterKey = 'abandonment_reason';

    // Toggle filter
    if (newFilters[filterKey]?.eq === reason) {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = { eq: reason };
    }

    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  /* ---------- LOADING ---------- */
  if (isLoadingKPIs) {
    return (
      <div className="space-y-6">
        {/* Filter Dropdown Skeleton */}
        <div className="flex justify-end">
          <div className="h-10 w-24 bg-gray-700/30 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - 2x2 grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-700/30 rounded-xl animate-pulse" />
            ))}
          </div>

          {/* Right side - Large pie chart */}
          <div className="h-96 bg-gray-700/30 rounded-xl animate-pulse" />
        </div>

        {/* Error metrics skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-700/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- PREPARE DATA ---------- */
  const abandonmentDistribution = kpis.abandonment_reason?.distribution || {};
  const abandonmentData = Object.entries(abandonmentDistribution)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      id: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      value: v,
    }));

  const totalAbandonment = abandonmentData.reduce((sum, d) => sum + d.value, 0);

  /* ---------- RENDER ---------- */
  return (
    <div className="space-y-6">
      {/* Filter Dropdown */}
      <div className="flex justify-end">
        <FilterDropdown
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - 2x2 grid of metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Issue Resolved */}
          <MetricCard
            title="Issue Resolved"
            icon={<CheckCircle className="w-5 h-5 text-teal-400" />}
            rate={kpis.issue_resolved?.rate}
            count={kpis.issue_resolved?.count}
            onClick={() => handleMetricClick('issue_resolved', true)}
            isActive={!!activeFilters.issue_resolved}
          />

          {/* Hallucination */}
          <MetricCard
            title="Hallucination"
            icon={<AlertTriangle className="w-5 h-5 text-teal-400" />}
            rate={kpis.hallucination?.rate}
            count={kpis.hallucination?.count}
            onClick={() => handleMetricClick('hallucination', true)}
            isActive={!!activeFilters.hallucination}
          />

          {/* Gibberish */}
          <MetricCard
            title="Gibberish"
            icon={<MessageSquare className="w-5 h-5 text-teal-400" />}
            rate={kpis.gibberish?.rate}
            count={kpis.gibberish?.count}
            onClick={() => handleMetricClick('gibberish', true)}
            isActive={!!activeFilters.gibberish}
          />

          {/* Average Latency */}
          <div
            className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all cursor-pointer ${
              activeFilters.avg_latency
                ? 'border-teal-500/50 bg-teal-500/10 ring-2 ring-teal-500/20'
                : 'border-gray-700/50 hover:border-teal-500/30 hover:bg-gray-800/70'
            }`}
            onClick={() => handleMetricClick('avg_latency', kpis.avg_latency?.value ?? 0)}
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-medium text-gray-300">Average Latency</h3>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-teal-400">
                {kpis.avg_latency?.value ?? 0} <span className="text-xl">ms</span>
              </div>
              <p className="text-xs text-gray-400">
                Across {kpis.avg_latency?.count || 0} calls
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Large Abandonment Reason Pie Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 relative">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-semibold text-gray-100">Abandonment Reason</h3>
          </div>

          {abandonmentData.length > 0 ? (
            <>
              <div className="h-64 relative">
                <ResponsivePie
                  data={abandonmentData}
                  colors={TEAL_COLORS}
                  innerRadius={0.6}
                  padAngle={2}
                  cornerRadius={4}
                  activeOuterRadiusOffset={8}
                  borderWidth={0}
                  arcLabel={(d) => `${d.value}`}
                  arcLabelsTextColor="#ffffff"
                  arcLabelsSkipAngle={10}
                  enableArcLinkLabels={false}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  onClick={(node) => handleAbandonmentClick(node.id)}
                  theme={{
                    labels: {
                      text: {
                        fontSize: 18,
                        fontWeight: 700,
                        fill: '#ffffff',
                      },
                    },
                    tooltip: {
                      container: {
                        background: '#1f2937',
                        color: '#fff',
                        fontSize: 13,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                        border: '1px solid #374151',
                        padding: '10px 14px',
                      },
                    },
                  }}
                  tooltip={({ datum }) => (
                    <div className="px-3 py-2">
                      <strong>{datum.label}</strong> · {datum.value} {datum.value === 1 ? 'call' : 'calls'}
                    </div>
                  )}
                />

                {/* Center label showing total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-3xl font-bold text-teal-400">{totalAbandonment}</div>
                  <div className="text-xs text-gray-400 mt-1">Total</div>
                </div>
              </div>

              {/* Legend below chart */}
              <div className="flex flex-wrap gap-2 mt-4">
                {abandonmentData.map((item, index) => {
                  const isActive = activeFilters.abandonment_reason?.eq === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleAbandonmentClick(item.id)}
                      className={`flex items-center gap-2 px-2 py-1 rounded transition-all ${
                        isActive
                          ? 'bg-teal-500/20 ring-1 ring-teal-400/50'
                          : 'hover:bg-gray-700/30'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: TEAL_COLORS[index % TEAL_COLORS.length] }}
                      />
                      <span className="text-xs text-gray-300">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Breakdown Section - NEW */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-gray-100">Error Breakdown</h3>
          <span className="text-xs text-gray-500 ml-auto">Click to filter calls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* STT Errors */}
          <ErrorMetricCard
            title="STT Errors"
            icon={<Mic className="w-5 h-5 text-red-400" />}
            count={kpis.stt_errors?.count}
            onClick={() => handleMetricClick('stt_errors', true)}
            isActive={!!activeFilters.stt_errors}
          />

          {/* LLM Errors */}
          <ErrorMetricCard
            title="LLM Errors"
            icon={<Brain className="w-5 h-5 text-red-400" />}
            count={kpis.llm_errors?.count}
            onClick={() => handleMetricClick('llm_errors', true)}
            isActive={!!activeFilters.llm_errors}
          />

          {/* TTS Errors */}
          <ErrorMetricCard
            title="TTS Errors"
            icon={<Volume2 className="w-5 h-5 text-red-400" />}
            count={kpis.tts_errors?.count}
            onClick={() => handleMetricClick('tts_errors', true)}
            isActive={!!activeFilters.tts_errors}
          />

          {/* Tool Call Errors */}
          <ErrorMetricCard
            title="Tool Errors"
            icon={<Wrench className="w-5 h-5 text-red-400" />}
            count={kpis.tool_errors?.count}
            onClick={() => handleMetricClick('tool_errors', true)}
            isActive={!!activeFilters.tool_errors}
          />
        </div>
      </div>

      {/* Sample Data Indicator */}
      {!normalized && (
        <div className="text-center text-xs text-gray-500 mt-4">
          <Activity className="w-4 h-4 inline-block mr-2" />
          Showing sample data
        </div>
      )}
    </div>
  );
};

export default KPISection;