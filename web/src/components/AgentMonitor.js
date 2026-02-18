/**
 * Agent Monitor Component
 * Displays real-time agent status and controls
 */

import React, { useState } from 'react';

const AgentCard = ({ agent, onRestartAgent, detailed = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'running':
        return {
          color: 'text-blue-700 dark:text-blue-300',
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: '🔄',
          label: 'Running'
        };
      case 'idle':
        return {
          color: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: '✅',
          label: 'Idle'
        };
      case 'error':
        return {
          color: 'text-red-700 dark:text-red-300',
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: '❌',
          label: 'Error'
        };
      case 'completed':
        return {
          color: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: '✨',
          label: 'Completed'
        };
      default:
        return {
          color: 'text-gray-700 dark:text-gray-300',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: '⚪',
          label: 'Unknown'
        };
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const statusConfig = getStatusConfig(agent.status);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border transition-colors duration-200 ${statusConfig.borderColor}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
              <span className="text-lg">{statusConfig.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {agent.id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor}`}>
                  {statusConfig.label}
                </span>
                <span className={`w-2 h-2 rounded-full ${getHealthColor(agent.health)}`} title={`Health: ${agent.health}`}></span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {detailed && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
                title="Toggle details"
              >
                {showDetails ? '📖' : '📋'}
              </button>
            )}
            <button
              onClick={() => onRestartAgent(agent.id)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
              title="Restart agent"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {agent.status === 'running' && agent.progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Progress</span>
              <span>{agent.progress}%</span>
            </div>
            <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, agent.progress))}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Current task */}
        {agent.currentTask && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Task:</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent.currentTask}</p>
            {agent.estimatedTime && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{agent.estimatedTime}</p>
            )}
          </div>
        )}

        {/* Resource usage */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {agent.memoryUsage && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Memory</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{agent.memoryUsage}</p>
            </div>
          )}
          {agent.executionTime !== undefined && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Exec Time</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{agent.executionTime}s</p>
            </div>
          )}
        </div>

        {/* Detailed information */}
        {detailed && showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Agent ID</p>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{agent.id}</p>
            </div>
            {agent.lastSeen && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Seen</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(agent.lastSeen).toLocaleString()}
                </p>
              </div>
            )}
            {agent.health && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Health Status</p>
                <p className={`text-sm font-medium ${getHealthColor(agent.health)}`}>
                  {agent.health.charAt(0).toUpperCase() + agent.health.slice(1)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AgentMonitor = ({ agents = [], onRestartAgent, detailed = false }) => {
  const [filter, setFilter] = useState('all');

  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true;
    return agent.status === filter;
  });

  const statusCounts = agents.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Agent Monitor
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {agents.length} agents • {statusCounts.running || 0} running • {statusCounts.idle || 0} idle
          </p>
        </div>

        {/* Filter controls */}
        <div className="mt-4 sm:mt-0">
          <div className="flex space-x-1">
            {['all', 'running', 'idle', 'error'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && statusCounts[status] ? ` (${statusCounts[status]})` : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent cards grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onRestartAgent={onRestartAgent}
              detailed={detailed}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No agents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all'
              ? 'No agents are currently registered or running.'
              : `No agents with status "${filter}" found.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentMonitor;