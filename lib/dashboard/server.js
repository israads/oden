/**
 * Dashboard Server - Express.js + WebSocket
 * Real-time monitoring for Oden Forge agents and task orchestration
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs').promises;
const chalk = require('chalk');

class DashboardServer {
  constructor(port = 3333) {
    this.port = parseInt(port) || 3333;
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.clients = new Set();
    this.agentData = new Map();
    this.taskQueue = [];
    this.performanceMetrics = {
      executionTimes: [],
      successRate: 0,
      totalTasks: 0,
      completedTasks: 0,
      errorRate: 0
    };

    this.setupExpress();
    this.setupWebSocket();
    this.setupDataMonitoring();
  }

  setupExpress() {
    // Serve static React build files
    const webPath = path.join(__dirname, '../../web/public');
    this.app.use(express.static(webPath));

    // CORS middleware for development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    // API endpoints
    this.app.get('/api/agents', (req, res) => {
      const agents = Array.from(this.agentData.entries()).map(([id, data]) => ({
        id,
        ...data
      }));
      res.json(agents);
    });

    this.app.get('/api/tasks', (req, res) => {
      res.json(this.taskQueue);
    });

    this.app.get('/api/performance', (req, res) => {
      res.json(this.performanceMetrics);
    });

    // Serve React app for all other routes
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(webPath, 'index.html'));
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log(chalk.blue('📡 Dashboard client connected'));
      this.clients.add(ws);

      // Send initial data
      this.sendToClient(ws, {
        type: 'initial_data',
        data: {
          agents: Array.from(this.agentData.entries()).map(([id, data]) => ({
            id,
            ...data
          })),
          tasks: this.taskQueue,
          performance: this.performanceMetrics
        }
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log(chalk.yellow('📡 Dashboard client disconnected'));
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  setupDataMonitoring() {
    // Monitor agent files and task updates
    setInterval(() => {
      this.updateAgentData();
      this.updateTaskQueue();
      this.updatePerformanceMetrics();
    }, 1000); // Update every second

    // Broadcast updates every 500ms
    setInterval(() => {
      this.broadcastUpdates();
    }, 500);
  }

  async updateAgentData() {
    try {
      // Check for agent status files in .claude/agents/ directory
      const agentsPath = path.join(process.cwd(), '.claude/agents');

      try {
        const agentFiles = await fs.readdir(agentsPath);

        for (const file of agentFiles) {
          if (file.endsWith('-status.json')) {
            const agentId = file.replace('-status.json', '');
            const statusPath = path.join(agentsPath, file);

            try {
              const statusData = await fs.readFile(statusPath, 'utf-8');
              const status = JSON.parse(statusData);

              this.agentData.set(agentId, {
                ...status,
                lastSeen: new Date().toISOString(),
                health: this.calculateAgentHealth(status)
              });
            } catch (error) {
              // Agent file might be updating, skip this iteration
            }
          }
        }
      } catch (error) {
        // Agents directory might not exist yet
      }

      // Simulate some agent data if none exists (for development)
      if (this.agentData.size === 0) {
        this.simulateAgentData();
      }

    } catch (error) {
      console.error('Error updating agent data:', error);
    }
  }

  async updateTaskQueue() {
    try {
      // Check for task queue files
      const taskPath = path.join(process.cwd(), '.claude/queue');

      try {
        const queueFiles = await fs.readdir(taskPath);
        const tasks = [];

        for (const file of queueFiles) {
          if (file.endsWith('.json')) {
            const filePath = path.join(taskPath, file);
            const taskData = await fs.readFile(filePath, 'utf-8');
            tasks.push(JSON.parse(taskData));
          }
        }

        this.taskQueue = tasks.sort((a, b) => a.priority - b.priority);
      } catch (error) {
        // Queue directory might not exist
      }

      // Simulate task data if none exists
      if (this.taskQueue.length === 0) {
        this.simulateTaskData();
      }

    } catch (error) {
      console.error('Error updating task queue:', error);
    }
  }

  updatePerformanceMetrics() {
    // Calculate performance metrics from agent data
    const agents = Array.from(this.agentData.values());
    const completedTasks = agents.filter(a => a.status === 'completed').length;
    const errorTasks = agents.filter(a => a.status === 'error').length;
    const totalTasks = agents.length;

    this.performanceMetrics = {
      executionTimes: agents
        .filter(a => a.executionTime)
        .map(a => a.executionTime)
        .slice(-20), // Keep last 20 execution times
      successRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      totalTasks,
      completedTasks,
      errorRate: totalTasks > 0 ? (errorTasks / totalTasks) * 100 : 0,
      timestamp: new Date().toISOString()
    };
  }

  calculateAgentHealth(status) {
    // Simple health calculation based on status and performance
    if (status.status === 'error') return 'critical';
    if (status.status === 'idle') return 'healthy';
    if (status.status === 'running' && status.progress > 90) return 'warning';
    return 'healthy';
  }

  simulateAgentData() {
    // Development simulation data
    const agents = [
      {
        id: 'security-agent-001',
        status: 'running',
        progress: 67,
        currentTask: 'Scanning authentication modules',
        estimatedTime: '1 minute remaining',
        memoryUsage: '45MB',
        executionTime: 12.5
      },
      {
        id: 'performance-agent-002',
        status: 'idle',
        progress: 100,
        currentTask: 'Performance analysis complete',
        estimatedTime: null,
        memoryUsage: '23MB',
        executionTime: 8.2
      },
      {
        id: 'code-review-agent-003',
        status: 'running',
        progress: 23,
        currentTask: 'Analyzing React components',
        estimatedTime: '3 minutes remaining',
        memoryUsage: '67MB',
        executionTime: 15.8
      }
    ];

    agents.forEach(agent => {
      this.agentData.set(agent.id, {
        ...agent,
        lastSeen: new Date().toISOString(),
        health: this.calculateAgentHealth(agent)
      });
    });
  }

  simulateTaskData() {
    this.taskQueue = [
      {
        id: 'task-001',
        title: 'Implement user authentication',
        status: 'in-progress',
        priority: 1,
        estimatedTime: '2 hours',
        assignedAgent: 'security-agent-001',
        dependencies: [],
        stream: 'Backend'
      },
      {
        id: 'task-002',
        title: 'Create responsive dashboard layout',
        status: 'pending',
        priority: 2,
        estimatedTime: '3 hours',
        assignedAgent: null,
        dependencies: ['task-001'],
        stream: 'Frontend'
      },
      {
        id: 'task-003',
        title: 'Optimize database queries',
        status: 'pending',
        priority: 3,
        estimatedTime: '1.5 hours',
        assignedAgent: 'performance-agent-002',
        dependencies: [],
        stream: 'Database'
      }
    ];
  }

  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcast(data) {
    this.clients.forEach(client => {
      this.sendToClient(client, data);
    });
  }

  broadcastUpdates() {
    if (this.clients.size === 0) return;

    this.broadcast({
      type: 'data_update',
      timestamp: new Date().toISOString(),
      data: {
        agents: Array.from(this.agentData.entries()).map(([id, data]) => ({
          id,
          ...data
        })),
        tasks: this.taskQueue,
        performance: this.performanceMetrics
      }
    });
  }

  handleClientMessage(ws, message) {
    switch (message.type) {
      case 'pause_task':
        this.handlePauseTask(message.taskId);
        break;
      case 'resume_task':
        this.handleResumeTask(message.taskId);
        break;
      case 'reorder_tasks':
        this.handleReorderTasks(message.taskIds);
        break;
      case 'restart_agent':
        this.handleRestartAgent(message.agentId);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  handlePauseTask(taskId) {
    const task = this.taskQueue.find(t => t.id === taskId);
    if (task) {
      task.status = 'paused';
      this.broadcast({
        type: 'task_updated',
        data: task
      });
    }
  }

  handleResumeTask(taskId) {
    const task = this.taskQueue.find(t => t.id === taskId);
    if (task) {
      task.status = 'in-progress';
      this.broadcast({
        type: 'task_updated',
        data: task
      });
    }
  }

  handleReorderTasks(taskIds) {
    const reorderedTasks = [];
    taskIds.forEach((id, index) => {
      const task = this.taskQueue.find(t => t.id === id);
      if (task) {
        task.priority = index + 1;
        reorderedTasks.push(task);
      }
    });

    this.taskQueue = reorderedTasks.sort((a, b) => a.priority - b.priority);
    this.broadcast({
      type: 'tasks_reordered',
      data: this.taskQueue
    });
  }

  handleRestartAgent(agentId) {
    // This would integrate with the actual agent system
    console.log(`Restart request for agent: ${agentId}`);
    this.broadcast({
      type: 'agent_restarting',
      data: { agentId }
    });
  }

  async start() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(chalk.green('🚀 Dashboard server started'));
        console.log(chalk.blue(`📊 Dashboard: http://localhost:${this.port}`));
        console.log(chalk.blue(`🔌 WebSocket: ws://localhost:${this.port}`));
        resolve();
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      this.wss.clients.forEach(client => {
        client.close();
      });

      this.server.close(() => {
        console.log(chalk.yellow('📊 Dashboard server stopped'));
        resolve();
      });
    });
  }
}

module.exports = DashboardServer;

// CLI usage
if (require.main === module) {
  const port = process.argv[2] || 3333;
  const server = new DashboardServer(port);

  process.on('SIGTERM', () => server.stop());
  process.on('SIGINT', () => server.stop());

  server.start().catch(console.error);
}