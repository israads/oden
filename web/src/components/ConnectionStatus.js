/**
 * Connection Status Component
 * Shows real-time WebSocket connection status
 */

import React from 'react';

const ConnectionStatus = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Connected':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: '🟢',
          message: 'Connected'
        };
      case 'Connecting':
      case 'Reconnecting':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: '🟡',
          message: status
        };
      case 'Disconnected':
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: '⚪',
          message: 'Disconnected'
        };
      case 'Error':
      case 'Failed':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: '🔴',
          message: 'Connection Failed'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: '⚪',
          message: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${config.color} ${config.bgColor} ${config.borderColor}`}>
      <span className="mr-2">{config.icon}</span>
      {config.message}
    </div>
  );
};

export default ConnectionStatus;