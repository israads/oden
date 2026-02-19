# Oden Dashboard Command

Launch the real-time monitoring dashboard for agent orchestration and task management.

## Usage

```bash
/oden:dashboard [port]
```

## Parameters

- `port` (optional) - Port number for dashboard server (default: 3333)

## Description

The dashboard provides real-time monitoring of:
- **Agent Status**: Live monitoring of all active agents with progress tracking
- **Task Queue**: Visual task management with drag-and-drop reordering
- **Performance Metrics**: Charts and analytics for system performance
- **Resource Usage**: Memory, CPU, and execution time monitoring

## Features

### Real-time Monitoring
- WebSocket connections for <500ms update latency
- Live agent status with health indicators
- Task progress tracking and completion estimates
- Performance metrics with historical trends

### Interactive Controls
- Pause/resume individual tasks
- Restart agents with one click
- Drag-and-drop task reordering
- Filter and search capabilities

### Responsive Design
- Desktop-optimized dashboard (1920x1080+)
- Tablet-friendly layout (768x1024)
- Mobile-accessible interface (375x667+)
- Dark/light mode toggle

## Implementation

```bash
# Start dashboard server
DASHBOARD_PORT=${1:-3333}
echo "🚀 Starting Oden Forge Dashboard..."

# Check if port is available
if lsof -i :$DASHBOARD_PORT > /dev/null 2>&1; then
  echo "❌ Port $DASHBOARD_PORT is already in use"
  echo "Please specify a different port or stop the existing process"
  exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Start the dashboard server
echo "📊 Dashboard server starting on port $DASHBOARD_PORT..."
echo "🔗 URL: http://localhost:$DASHBOARD_PORT"

cd "$SCRIPT_DIR"

# Check if Node.js dependencies exist
if [ ! -f "lib/dashboard/server.js" ]; then
  echo "❌ Dashboard server not found"
  echo "Please run: npm install or reinstall oden-forge"
  exit 1
fi

# Install required dependencies if they don't exist
if [ ! -d "node_modules/express" ] || [ ! -d "node_modules/ws" ]; then
  echo "📦 Installing dashboard dependencies..."
  npm install express ws --no-save 2>/dev/null || {
    echo "⚠️  Could not install dependencies automatically"
    echo "Please run: npm install express ws"
    echo "Then retry the dashboard command"
    exit 1
  }
fi

# Create directories if they don't exist
mkdir -p .claude/agents .claude/queue .claude/logs

# Start the server
echo "🎯 Starting dashboard server..."
echo "   • WebSocket: ws://localhost:$DASHBOARD_PORT"
echo "   • HTTP API: http://localhost:$DASHBOARD_PORT/api"
echo "   • Dashboard: http://localhost:$DASHBOARD_PORT"
echo ""
echo "💡 The dashboard will:"
echo "   • Monitor agent status in real-time"
echo "   • Display task queue with controls"
echo "   • Show performance metrics and trends"
echo "   • Provide interactive management interface"
echo ""

# Launch dashboard server with proper signal handling
trap 'echo ""; echo "🛑 Stopping dashboard server..."; kill $SERVER_PID 2>/dev/null; exit 0' INT TERM

node lib/dashboard/server.js "$DASHBOARD_PORT" &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Check if server started successfully
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "✅ Dashboard server started successfully!"
  echo ""
  echo "🌐 Open in browser: http://localhost:$DASHBOARD_PORT"
  echo "📱 Mobile-friendly interface available"
  echo "🌙 Dark mode toggle in top-right corner"
  echo ""
  echo "Press Ctrl+C to stop the dashboard server"
  echo ""

  # Try to open in default browser
  if command -v open > /dev/null 2>&1; then
    open "http://localhost:$DASHBOARD_PORT" 2>/dev/null &
  elif command -v xdg-open > /dev/null 2>&1; then
    xdg-open "http://localhost:$DASHBOARD_PORT" 2>/dev/null &
  fi

  # Keep the script running until interrupted
  wait $SERVER_PID
else
  echo "❌ Failed to start dashboard server"
  echo "Please check the logs and try again"
  exit 1
fi
```

## Integration

The dashboard integrates with:
- `/oden:work` - Orchestrator provides real-time agent data
- Agent pipeline - Specialized agents report status via JSON files
- Task system - Queue management and progress tracking
- Performance monitoring - Execution metrics and analytics

## WebSocket API

### Message Types

**Server → Client:**
```javascript
// Initial data on connection
{
  type: 'initial_data',
  data: { agents: [...], tasks: [...], performance: {...} }
}

// Real-time updates
{
  type: 'data_update',
  data: { agents: [...], tasks: [...], performance: {...} }
}

// Agent status change
{
  type: 'agent_status_update',
  data: { agentId: 'agent-001', status: 'running', progress: 45 }
}
```

**Client → Server:**
```javascript
// Pause task
{ type: 'pause_task', taskId: 'task-001' }

// Resume task
{ type: 'resume_task', taskId: 'task-001' }

// Reorder tasks
{ type: 'reorder_tasks', taskIds: ['task-002', 'task-001', 'task-003'] }

// Restart agent
{ type: 'restart_agent', agentId: 'agent-001' }
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using the port
lsof -i :3333

# Kill the process
kill -9 <PID>

# Or use different port
/oden:dashboard 3334
```

### Connection Issues
- Ensure WebSocket port (3333) is not blocked by firewall
- Check if Node.js and required dependencies are installed
- Verify agent status files exist in `.claude/agents/`

### Performance Issues
- Dashboard updates every 500ms by default
- Large task queues (>100 items) may impact performance
- Consider filtering or pagination for large datasets

## Requirements

- **Node.js**: 16+ (for WebSocket server)
- **Express**: Web server framework
- **ws**: WebSocket implementation
- **Modern browser**: Chrome 80+, Firefox 75+, Safari 13+

## Security Notes

- Dashboard runs on localhost only by default
- No authentication required for local development
- WebSocket connections are not encrypted (use HTTPS proxy if needed)
- API endpoints are read-only except for task management