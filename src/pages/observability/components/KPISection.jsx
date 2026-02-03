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
  DollarSign,
} from 'lucide-react';

/* ================= CARD ================= */
const Card = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 hover:bg-gray-800/40 transition-colors ${className}`}>
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400 mb-6">
      {Icon && <Icon className="w-4 h-4" />}
      <span>{title}</span>
    </div>
    {children}
  </div>
);

/* ================= METRIC CARD ================= */
const MetricCard = ({ title, icon, rate, count, onClick, isActive }) => {
  const percentage = rate !== undefined ? Math.round(rate * 100) : 0;

  return (
    <Card
      title={title}
      icon={icon}
      className={`cursor-pointer ${isActive ? 'ring-2 ring-teal-400/50 bg-gray-800/50' : ''}`}
    >
      <div
        className="flex flex-col items-center justify-center py-6"
        onClick={onClick}
      >
        <div className="text-5xl font-bold text-teal-400 mb-2">
          {percentage}%
        </div>
        <div className="text-sm text-gray-500 uppercase tracking-wider">
          Detected in {count || 0} {(count || 0) === 1 ? 'call' : 'calls'}
        </div>
      </div>
    </Card>
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
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${hasActiveFilters
          ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
          : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:bg-gray-800/50'
          }`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">
          Filters {hasActiveFilters && `(${Object.keys(activeFilters).length})`}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700/50 rounded-lg shadow-2xl z-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Active Filters</h3>
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

              {hasActiveFilters ? (
                <div className="space-y-2">
                  {Object.entries(activeFilters).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
                    >
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm text-white font-medium">
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
                <div className="text-center py-8 text-gray-500">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active filters</p>
                  <p className="text-xs mt-1">Click on metrics to filter calls</p>
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
      <div className="mb-10">
        {/* Filter Dropdown Skeleton */}
        <div className="flex justify-end mb-4">
          <div className="h-10 w-32 bg-gray-800/30 border border-gray-700/50 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - 2x2 grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[180px] bg-gray-800/30 border border-gray-700/50 rounded-lg animate-pulse"
              >
                <div className="p-6">
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
                  <div className="h-12 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
          {/* Right side - Large pie chart */}
          <div className="h-full bg-gray-800/30 border border-gray-700/50 rounded-lg animate-pulse">
            <div className="p-6">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
              <div className="flex items-center justify-center h-[300px]">
                <div className="h-48 w-48 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
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
    <div className="mb-10">
      {/* Filter Dropdown */}
      <div className="flex justify-end mb-4">
        <FilterDropdown
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - 2x2 grid of metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Issue Resolved */}
          <MetricCard
            title="Issue Resolved"
            icon={CheckCircle}
            rate={kpis.issue_resolved?.rate}
            count={kpis.issue_resolved?.count}
            onClick={() => handleMetricClick('issue_resolved', true)}
            isActive={!!activeFilters.issue_resolved}
          />

          {/* Hallucination */}
          <MetricCard
            title="Hallucination"
            icon={AlertTriangle}
            rate={kpis.hallucination?.rate}
            count={kpis.hallucination?.count}
            onClick={() => handleMetricClick('hallucination', true)}
            isActive={!!activeFilters.hallucination}
          />

          {/* Gibberish */}
          <MetricCard
            title="Gibberish"
            icon={MessageSquare}
            rate={kpis.gibberish?.rate}
            count={kpis.gibberish?.count}
            onClick={() => handleMetricClick('gibberish', true)}
            isActive={!!activeFilters.gibberish}
          />

          {/* Discount Offered */}
          <MetricCard
            title="Discount Offered"
            icon={DollarSign}
            rate={kpis.disc_offered?.rate}
            count={kpis.disc_offered?.count}
            onClick={() => handleMetricClick('disc_offered', true)}
            isActive={!!activeFilters.disc_offered}
          />

          {/* Average Latency */}
          <Card
            title="Avg Latency"
            icon={Zap}
            className={`cursor-pointer ${activeFilters.avg_latency ? 'ring-2 ring-teal-400/50 bg-gray-800/50' : ''}`}
          >
            <div
              className="flex flex-col items-center justify-center py-6"
              onClick={() => handleMetricClick('avg_latency', kpis.avg_latency?.value ?? 0)}
            >
              <div className="text-5xl font-bold text-teal-400 mb-2">
                {kpis.avg_latency?.value ?? 0}
                <span className="text-2xl text-gray-400 ml-2">ms</span>
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">
                Across {kpis.avg_latency?.count || 0} calls
              </div>
            </div>
          </Card>
        </div>

        {/* Right side - Large Abandonment Reason Pie Chart */}
        <Card title="Abandonment Reason" icon={TrendingDown} className="h-full">
          {abandonmentData.length > 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative w-[240px] h-[240px]">
                <ResponsivePie
                  data={abandonmentData}
                  innerRadius={0.6}
                  padAngle={2}
                  cornerRadius={4}
                  activeOuterRadiusOffset={10}
                  colors={TEAL_COLORS}
                  borderWidth={0}
                  enableArcLabels={true}
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
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: datum.color }}
                      />
                      <span className="font-medium">{datum.label}</span>
                      <span className="text-gray-400">·</span>
                      <span>{datum.value} {datum.value === 1 ? 'call' : 'calls'}</span>

                    </div>
                  )}
                />
                {/* Center label showing total */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-teal-400">{totalAbandonment}</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide mt-2">Total</div>
                  </div>
                </div>
              </div>
              {/* Legend below chart */}
              <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-[240px]">
                {abandonmentData.map((item, index) => {
                  const isActive = activeFilters.abandonment_reason?.eq === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleAbandonmentClick(item.id)}
                      className={`flex items-center gap-2 px-2 py-1 rounded transition-all ${isActive
                        ? 'bg-teal-500/20 ring-1 ring-teal-400/50'
                        : 'hover:bg-gray-700/30'
                        }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: TEAL_COLORS[index % TEAL_COLORS.length] }}
                      />
                      <span className={`text-sm ${isActive ? 'text-teal-400' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <TrendingDown className="w-16 h-16 mb-3 opacity-50" />
              <p className="text-sm">No data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Sample Data Indicator */}
      {!normalized && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-sm">
            <Activity className="w-4 h-4" />
            <span>Showing sample data</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPISection;