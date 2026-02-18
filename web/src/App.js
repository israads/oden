/**
 * Main Dashboard Application
 * Real-time monitoring interface for Oden Forge
 */

import React, { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import AgentMonitor from './components/AgentMonitor';
import TaskQueue from './components/TaskQueue';
import PerformanceMetrics from './components/PerformanceMetrics';
import ConnectionStatus from './components/ConnectionStatus';

const App = () => {
  const {
    connectionStatus,
    data,
    pauseTask,
    resumeTask,
    reorderTasks,
    restartAgent
  } = useWebSocket();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or default to light mode
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'agents', name: 'Agents', icon: '🤖' },
    { id: 'tasks', name: 'Tasks', icon: '📋' },
    { id: 'performance', name: 'Performance', icon: '📈' }
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <AgentMonitor
                agents={data.agents || []}
                onRestartAgent={restartAgent}
              />
            </div>
            <div>
              <TaskQueue
                tasks={data.tasks || []}
                onPauseTask={pauseTask}
                onResumeTask={resumeTask}
                onReorderTasks={reorderTasks}
                compact={true}
              />
            </div>
            <div>
              <PerformanceMetrics
                performance={data.performance || {}}
                compact={true}
              />
            </div>
          </div>
        );

      case 'agents':
        return (
          <AgentMonitor
            agents={data.agents || []}
            onRestartAgent={restartAgent}
            detailed={true}
          />
        );

      case 'tasks':
        return (
          <TaskQueue
            tasks={data.tasks || []}
            onPauseTask={pauseTask}
            onResumeTask={resumeTask}
            onReorderTasks={reorderTasks}
            detailed={true}
          />
        );

      case 'performance':
        return (
          <PerformanceMetrics
            performance={data.performance || {}}
            detailed={true}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode
        ? 'bg-gray-900 text-gray-100'
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors duration-200 ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and title */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-600">⚡ Oden Forge Dashboard</h1>
              </div>
              <ConnectionStatus status={connectionStatus} />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* Refresh button */}
              <button
                onClick={() => window.location.reload()}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className={`border-b transition-colors duration-200 ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : `border-transparent hover:border-gray-300 ${
                        darkMode
                          ? 'text-gray-300 hover:text-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                      }`
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {connectionStatus === 'Failed' && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Connection Failed
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>
                    Unable to connect to the dashboard server. Please ensure the server is running on localhost:3333.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-red-50 dark:bg-red-900/50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className={`mt-12 border-t transition-colors duration-200 ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm">
            <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              Oden Forge v3.0 Dashboard - Real-time Agent Monitoring
            </div>
            <div className={`flex items-center space-x-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>Last Update: {new Date().toLocaleTimeString()}</span>
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'Connected' ? 'bg-green-400' :
                connectionStatus === 'Connecting' || connectionStatus === 'Reconnecting' ? 'bg-yellow-400' :
                'bg-red-400'
              }`}></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;