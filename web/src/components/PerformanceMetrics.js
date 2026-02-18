/**
 * Performance Metrics Component
 * Displays performance charts and metrics
 */

import React, { useState, useMemo } from 'react';

// Simple chart components (since we're avoiding external dependencies for now)
const BarChart = ({ data, height = 200, color = '#3B82F6' }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  return (
    <div className="flex items-end space-x-1" style={{ height }}>
      {data.map((value, index) => {
        const barHeight = ((value - minValue) / range) * (height - 20) + 10;
        return (
          <div
            key={index}
            className="flex-1 rounded-t transition-all duration-300 hover:opacity-75"
            style={{
              height: `${barHeight}px`,
              backgroundColor: color,
              minWidth: '8px'
            }}
            title={`${value}s`}
          />
        );
      })}
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, icon, color = 'blue', compact = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold text-gray-900 dark:text-gray-100 ${compact ? 'text-xl' : ''}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <span className="text-xl">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PerformanceMetrics = ({ performance = {}, detailed = false, compact = false }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  // Process performance data
  const processedData = useMemo(() => {
    const {
      executionTimes = [],
      successRate = 0,
      totalTasks = 0,
      completedTasks = 0,
      errorRate = 0,
      timestamp
    } = performance;

    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
      : 0;

    const lastUpdate = timestamp ? new Date(timestamp) : new Date();

    return {
      executionTimes: executionTimes.slice(-20), // Last 20 measurements
      successRate: Math.round(successRate),
      totalTasks,
      completedTasks,
      errorRate: Math.round(errorRate),
      avgExecutionTime: Math.round(avgExecutionTime * 10) / 10,
      lastUpdate
    };
  }, [performance]);

  const timeRangeOptions = [
    { value: '15m', label: '15 min' },
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' },
    { value: '24h', label: '24 hours' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Performance Metrics
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {processedData.lastUpdate.toLocaleTimeString()}
            </p>
          </div>

          {detailed && (
            <div className="mt-4 sm:mt-0">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Performance
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {processedData.totalTasks} tasks
          </span>
        </div>
      )}

      {/* Metrics cards */}
      <div className={`grid gap-4 ${
        compact
          ? 'grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }`}>
        <MetricCard
          title="Success Rate"
          value={`${processedData.successRate}%`}
          subtitle={`${processedData.completedTasks}/${processedData.totalTasks} tasks`}
          icon="✅"
          color={processedData.successRate >= 90 ? 'green' : processedData.successRate >= 70 ? 'yellow' : 'red'}
          compact={compact}
        />

        <MetricCard
          title="Avg Execution Time"
          value={`${processedData.avgExecutionTime}s`}
          subtitle={`Based on ${processedData.executionTimes.length} samples`}
          icon="⏱️"
          color="blue"
          compact={compact}
        />

        {!compact && (
          <>
            <MetricCard
              title="Total Tasks"
              value={processedData.totalTasks}
              subtitle={`${processedData.completedTasks} completed`}
              icon="📋"
              color="blue"
            />

            <MetricCard
              title="Error Rate"
              value={`${processedData.errorRate}%`}
              subtitle={processedData.errorRate === 0 ? 'No errors' : 'Needs attention'}
              icon="❌"
              color={processedData.errorRate === 0 ? 'green' : processedData.errorRate <= 10 ? 'yellow' : 'red'}
            />
          </>
        )}
      </div>

      {/* Execution time chart */}
      {processedData.executionTimes.length > 0 && !compact && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Execution Time Trends
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              Last {processedData.executionTimes.length} tasks
            </span>
          </div>

          <BarChart
            data={processedData.executionTimes}
            height={200}
            color="#3B82F6"
          />

          <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-500">
            <span>Older</span>
            <span>Recent</span>
          </div>
        </div>
      )}

      {/* Detailed metrics */}
      {detailed && !compact && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System health */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              System Health
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Overall Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  processedData.successRate >= 90
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : processedData.successRate >= 70
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {processedData.successRate >= 90 ? 'Healthy' : processedData.successRate >= 70 ? 'Warning' : 'Critical'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Tasks</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {processedData.totalTasks - processedData.completedTasks}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Performance Score</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {Math.round((processedData.successRate + (100 - processedData.errorRate)) / 2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Resource usage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Resource Usage
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>CPU Usage</span>
                  <span>42%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Memory Usage</span>
                  <span>68%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Network I/O</span>
                  <span>23%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {processedData.totalTasks === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No performance data yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Performance metrics will appear here once tasks start executing.
          </p>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;