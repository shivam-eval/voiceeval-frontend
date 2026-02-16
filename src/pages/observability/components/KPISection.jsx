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
  FileText,
  Calendar,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useReportData } from '../../../hooks/useKPIs';
import { exportReportPDF } from '../../../utils/exportReportPDF';


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

/* ================= DATE RANGE PICKER MODAL ================= */
const DateRangePickerModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }
    onSubmit(startDate, endDate);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-semibold text-white">Generate Report</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <p className="text-sm text-gray-400">
              Select a date range to generate a comprehensive PDF report with
              KPI metrics and hallucination analysis.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  max={today}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      setStartDate('');
                      return;
                    }
                    // Prevent selecting future dates (extra safety beyond max)
                    if (value > today) return;
                    setStartDate(value);
                    // Ensure end date is never before start date
                    if (endDate && new Date(value) > new Date(endDate)) {
                      setEndDate(value);
                    }
                  }}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2.5
                             text-white text-sm focus:outline-none focus:border-teal-500
                             transition [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  max={today}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      setEndDate('');
                      return;
                    }
                    // End date cannot be before start date
                    if (startDate && value < startDate) {
                      setEndDate(startDate);
                      return;
                    }
                    setEndDate(value);
                  }}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2.5
                             text-white text-sm focus:outline-none focus:border-teal-500
                             transition [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400
                         hover:bg-gray-800 transition text-sm font-medium
                         disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                         bg-teal-500/20 border border-teal-500/40 text-teal-400
                         hover:bg-teal-500/30 transition text-sm font-bold
                         disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Download Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ================= KPI SECTION ================= */
const KPISection = ({ normalized, isLoadingKPIs, onFilterChange, agentId }) => {
  const [filters, setFilters] = useState({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const reportMutation = useReportData();

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

  const handleGetReport = async (startDate, endDate) => {
    if (!agentId) {
      toast.error('No agent selected');
      return;
    }

    try {
      const reportData = await reportMutation.mutateAsync({
        agentId,
        startDate,
        endDate,
      });
      exportReportPDF(reportData);
      toast.success('Report downloaded successfully');
      setIsReportModalOpen(false);
    } catch (error) {
      toast.error(`Failed to generate report: ${error?.response?.data?.detail || error.message}`);
    }
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
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-teal-500/10 border border-teal-500/30
                     text-teal-400 hover:bg-teal-500/20
                     transition"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Get Report</span>
        </button>
      </div>

      <DateRangePickerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleGetReport}
        isLoading={reportMutation.isPending}
      />

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
          <div className="h-[260px] relative">
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
            {/* Total calls in donut center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-bold text-white">
                {abandonmentData.reduce((sum, d) => sum + d.value, 0)}
              </div>
              <div className="text-xs text-gray-400">Total Calls</div>
            </div>
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