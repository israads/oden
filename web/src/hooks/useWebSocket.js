/**
 * useWebSocket Hook
 * Manages WebSocket connection and real-time data updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 10;

export const useWebSocket = (url = 'ws://localhost:3333') => {
  const [connectionStatus, setConnectionStatus] = useState('Connecting');
  const [data, setData] = useState({
    agents: [],
    tasks: [],
    performance: {}
  });
  const [lastMessage, setLastMessage] = useState(null);

  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('🔌 WebSocket connected');
        setConnectionStatus('Connected');
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);

          switch (message.type) {
            case 'initial_data':
            case 'data_update':
              setData(message.data);
              break;
            case 'agent_status_update':
              setData(prev => ({
                ...prev,
                agents: prev.agents.map(agent =>
                  agent.id === message.data.agentId
                    ? { ...agent, ...message.data }
                    : agent
                )
              }));
              break;
            case 'task_updated':
              setData(prev => ({
                ...prev,
                tasks: prev.tasks.map(task =>
                  task.id === message.data.id
                    ? { ...task, ...message.data }
                    : task
                )
              }));
              break;
            case 'tasks_reordered':
              setData(prev => ({
                ...prev,
                tasks: message.data
              }));
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code);
        setConnectionStatus('Disconnected');

        // Attempt to reconnect
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          console.log(`Reconnecting... (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);

          reconnectTimeout.current = setTimeout(() => {
            setConnectionStatus('Reconnecting');
            connect();
          }, RECONNECT_INTERVAL);
        } else {
          console.error('Max reconnection attempts reached');
          setConnectionStatus('Failed');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('Error');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setConnectionStatus('Disconnected');
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket not connected. Cannot send message:', message);
      return false;
    }
  }, []);

  // Task management functions
  const pauseTask = useCallback((taskId) => {
    return sendMessage({
      type: 'pause_task',
      taskId
    });
  }, [sendMessage]);

  const resumeTask = useCallback((taskId) => {
    return sendMessage({
      type: 'resume_task',
      taskId
    });
  }, [sendMessage]);

  const reorderTasks = useCallback((taskIds) => {
    return sendMessage({
      type: 'reorder_tasks',
      taskIds
    });
  }, [sendMessage]);

  const restartAgent = useCallback((agentId) => {
    return sendMessage({
      type: 'restart_agent',
      agentId
    });
  }, [sendMessage]);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    data,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect,

    // Task management
    pauseTask,
    resumeTask,
    reorderTasks,
    restartAgent
  };
};