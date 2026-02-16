import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Download } from 'lucide-react';
import { exportKPIsToPDF } from '../../../utils/exportKPIsToPDF';


/* ================= CONSTANTS ================= */
const TEAL_COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a', '#042f2e'];

const BOOLEAN_METRICS = {
  issue_resolved: { title: 'Issue Resolved', icon: CheckCircle },
  hallucination: { title: 'Hallucination', icon: AlertTriangle },
  gibberish: { title: 'Gibberish', icon: MessageSquare },
};

/* ================= FALLBACK DATA ================= */
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

/* ================= GENERIC CARD ================= */
const Card = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 ${className}`}>
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400 mb-6">
      {Icon && <Icon className="w-4 h-4" />}
      {title}
    </div>
    {children}
  </div>
);

/* ================= METRIC CARD ================= */
const MetricCard = ({ title, icon, rate, count, active, onClick }) => (
  <Card
    title={title}
    icon={icon}
    className={`cursor-pointer transition ${active ? 'ring-2 ring-teal-400/50 bg-gray-800/50' : ''}`}
  >
    <div className="flex flex-col items-center py-6" onClick={onClick}>
      <div className="text-5xl font-bold text-teal-400">
        {Math.round((rate ?? 0) * 100)}%
      </div>
      <div className="text-sm text-gray-500 mt-2">
        Detected in {count ?? 0} calls
      </div>
    </div>
  </Card>
);

/* ================= FILTER DROPDOWN ================= */
const FilterDropdown = ({ filters, onRemove, onClear }) => {
  const [open, setOpen] = useState(false);
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
          hasFilters
            ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
            : 'bg-gray-800/30 border-gray-700/50 text-gray-400'
        }`}
      >
        <Filter className="w-4 h-4" />
        Filters {hasFilters && `(${Object.keys(filters).length})`}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700/50 rounded-lg z-20">
            <div className="p-4">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-semibold">Active Filters</span>
                {hasFilters && (
                  <button onClick={onClear} className="text-xs text-teal-400">
                    Clear All
                  </button>
                )}
              </div>

              {hasFilters ? (
                Object.entries(filters).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-3 bg-gray-800/50 rounded mb-2">
                    <div>
                      <div className="text-xs text-gray-400 uppercase">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm">
                        {val.eq ?? val.gt}
                      </div>
                    </div>
                    <button onClick={() => onRemove(key)}>
                      <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-sm py-6">
                  No active filters
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ================= KPI SECTION ================= */
const KPISection = ({ normalized, isLoadingKPIs, onFilterChange }) => {
  const [filters, setFilters] = useState({});

  const data = normalized?.kpis ? normalized : DUMMY_DATA;
  const { kpis } = data;

  const toggleFilter = (key, value) => {
    setFilters(prev => {
      const updated = { ...prev };
      updated[key] ? delete updated[key] : (updated[key] = value);
      onFilterChange?.(updated);
      return updated;
    });
  };

  const abandonmentData = useMemo(() => {
    return Object.entries(kpis.abandonment_reason?.distribution ?? {})
      .filter(([, v]) => v > 0)
      .map(([id, value]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        value,
      }));
  }, [kpis]);

  if (isLoadingKPIs) return <div className="h-64 animate-pulse bg-gray-800/30 rounded-lg" />;

  return (
    <div className="mb-10">
      <div className="flex justify-end gap-3 mb-4">
        <FilterDropdown
          filters={filters}
          onRemove={key => toggleFilter(key)}
          onClear={() => setFilters({})}
        />

        <button
          onClick={() => exportKPIsToPDF(data, filters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-gray-800/30 border border-gray-700/50
                     text-gray-400 hover:bg-gray-800/50
                     transition"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Download</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* METRICS */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
          {Object.entries(BOOLEAN_METRICS).map(([key, cfg]) => (
            <MetricCard
              key={key}
              {...cfg}
              rate={kpis[key]?.rate}
              count={kpis[key]?.count}
              active={!!filters[key]}
              onClick={() => toggleFilter(key, { eq: true })}
            />
          ))}

          {/* AVG LATENCY */}
          <Card title="Avg Latency" icon={Zap}>
            <div
              className="text-center cursor-pointer"
              onClick={() => toggleFilter('avg_latency', { gt: kpis.avg_latency?.value })}
            >
              <div className="text-5xl font-bold text-teal-400">
                {kpis.avg_latency?.value} ms
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Across {kpis.avg_latency?.count} calls
              </div>
            </div>
          </Card>
        </div>

        {/* ABANDONMENT PIE */}
        <Card title="Abandonment Reason" icon={TrendingDown}>
          <div className="h-[260px]">
            <ResponsivePie
              data={abandonmentData}
              innerRadius={0.6}
              padAngle={2}
              colors={TEAL_COLORS}
              enableArcLabels
              arcLabel={d => d.value}
              enableArcLinkLabels={false}
              activeOuterRadiusOffset={6}
              onClick={d => toggleFilter('abandonment_reason', { eq: d.id })}
              tooltip={({ datum }) => (
                <div className="bg-[#020617] px-3 py-2 rounded-lg border border-gray-700 text-xs">
                  <div className="text-gray-400">{datum.label}</div>
                  <div className="text-teal-300 font-semibold">{datum.value} calls</div>
                </div>
              )}
              theme={{
                tooltip: {
                  container: {
                    background: '#020617',
                    color: '#fff',
                    fontSize: 12,
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>

      {!normalized && (
        <div className="mt-6 text-center text-teal-400 text-sm">
          <Activity className="inline w-4 h-4 mr-2" />
          Showing sample data
        </div>
      )}
    </div>
  );
};

export default KPISection;