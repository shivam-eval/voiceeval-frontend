import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { useKPIs, useTrends, useTraces } from '../../hooks/useObservability';
import MetricCard from './components/MetricCard';
import TraceCard from './components/TraceCard';

const ObservabilityDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Fetch data
  const { data: kpis, isLoading: kpisLoading } = useKPIs(selectedAgent, timeRange);
  const { data: trends, isLoading: trendsLoading } = useTrends(selectedAgent, timeRange);
  const { data: recentTraces, isLoading: tracesLoading } = useTraces({ 
    page: 1, 
    limit: 5,
    agentId: selectedAgent 
  });

  const timeRangeOptions = [
    { value: '1d', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
  ];

  // Prepare chart data
  const scoreChartData = trends?.dates?.length > 0 ? [{
    id: 'score',
    data: trends.dates.map((date, idx) => ({
      x: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      y: trends.scores[idx],
    }))
  }] : [];

  const volumeChartData = trends?.dates?.map((date, idx) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: trends.volumes[idx],
  })) || [];

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Observability Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Monitor production voice agent performance in real-time
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Link
              to="/observability/traces"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
            >
              View All Traces
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Calls"
          value={kpis?.total_calls || 0}
          change={kpis?.calls_change}
          changeLabel="vs prev period"
          icon={PhoneIcon}
          trend="positive"
        />
        <MetricCard
          title="Pass Rate"
          value={kpis?.pass_rate || 0}
          change={kpis?.pass_rate_change}
          changeLabel="vs prev period"
          format="percentage"
          icon={CheckCircleIcon}
          trend="positive"
        />
        <MetricCard
          title="Total Cost"
          value={kpis?.total_cost || 0}
          change={kpis?.cost_change}
          changeLabel="vs prev period"
          format="currency"
          icon={CurrencyDollarIcon}
          trend="negative"
        />
        <MetricCard
          title="Avg Duration"
          value={kpis?.avg_duration || 0}
          change={kpis?.duration_change}
          changeLabel="vs prev period"
          format="duration"
          icon={ClockIcon}
          trend="negative"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Score Trend */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Score Trend</h2>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div style={{ height: '250px' }}>
            {scoreChartData.length > 0 && scoreChartData[0].data.length > 0 ? (
              <ResponsiveLine
                data={scoreChartData}
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: 100 }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                colors={['#3B82F6']}
                pointSize={8}
                pointColor="#3B82F6"
                pointBorderWidth={2}
                pointBorderColor="#fff"
                enableGridX={false}
                gridYValues={5}
                theme={{
                  axis: {
                    ticks: {
                      text: { fill: '#9CA3AF', fontSize: 11 }
                    }
                  },
                  grid: {
                    line: { stroke: '#374151', strokeWidth: 1 }
                  },
                  crosshair: {
                    line: { stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '6 6' }
                  }
                }}
                useMesh={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Volume Trend */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Call Volume</h2>
            <PhoneIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div style={{ height: '250px' }}>
            {volumeChartData.length > 0 ? (
              <ResponsiveBar
                data={volumeChartData}
                keys={['volume']}
                indexBy="date"
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                padding={0.3}
                colors={['#3B82F6']}
                borderRadius={4}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                enableLabel={false}
                theme={{
                  axis: {
                    ticks: {
                      text: { fill: '#9CA3AF', fontSize: 11 }
                    }
                  },
                  grid: {
                    line: { stroke: '#374151', strokeWidth: 1 }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Traces */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Traces</h2>
          <Link
            to="/observability/traces"
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium flex items-center gap-1"
          >
            View All
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {tracesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : recentTraces?.traces?.length > 0 ? (
          <div className="space-y-3">
            {recentTraces.traces.map(trace => (
              <TraceCard key={trace.trace_id} trace={trace} compact />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PhoneIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No traces found</p>
            <p className="text-sm text-gray-500 mt-1">
              Start ingesting traces from your production agents
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObservabilityDashboard;
