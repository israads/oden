/**
 * Task Queue Component
 * Displays and manages task queue with drag-and-drop reordering
 */

import React, { useState } from 'react';

const TaskItem = ({
  task,
  onPauseTask,
  onResumeTask,
  detailed = false,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'in-progress':
        return {
          color: 'text-blue-700 dark:text-blue-300',
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-l-blue-500',
          icon: '▶️',
          label: 'In Progress'
        };
      case 'pending':
        return {
          color: 'text-gray-700 dark:text-gray-300',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-l-gray-500',
          icon: '⏸️',
          label: 'Pending'
        };
      case 'paused':
        return {
          color: 'text-yellow-700 dark:text-yellow-300',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          borderColor: 'border-l-yellow-500',
          icon: '⏸️',
          label: 'Paused'
        };
      case 'completed':
        return {
          color: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-l-green-500',
          icon: '✅',
          label: 'Completed'
        };
      case 'error':
        return {
          color: 'text-red-700 dark:text-red-300',
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-l-red-500',
          icon: '❌',
          label: 'Error'
        };
      default:
        return {
          color: 'text-gray-700 dark:text-gray-300',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-l-gray-500',
          icon: '⚪',
          label: 'Unknown'
        };
    }
  };

  const getPriorityColor = (priority) => {
    if (priority <= 1) return 'text-red-600 dark:text-red-400';
    if (priority <= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const statusConfig = getStatusConfig(task.status);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task.id)}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 transition-all duration-200 hover:shadow-md cursor-move ${statusConfig.borderColor}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm">{statusConfig.icon}</span>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {task.title}
              </h3>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor}`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                P{task.priority}
              </span>
              {task.estimatedTime && (
                <span>⏱️ {task.estimatedTime}</span>
              )}
              {task.assignedAgent && (
                <span>🤖 {task.assignedAgent.replace('-', ' ')}</span>
              )}
              {task.stream && (
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                  {task.stream}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-2">
            {task.status === 'in-progress' && (
              <button
                onClick={() => onPauseTask(task.id)}
                className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 rounded"
                title="Pause task"
              >
                ⏸️
              </button>
            )}
            {(task.status === 'paused' || task.status === 'pending') && (
              <button
                onClick={() => onResumeTask(task.id)}
                className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded"
                title="Resume task"
              >
                ▶️
              </button>
            )}
            {detailed && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                title="Toggle details"
              >
                {showDetails ? '📖' : '📋'}
              </button>
            )}
          </div>
        </div>

        {/* Dependencies */}
        {task.dependencies && task.dependencies.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Depends on:</span>
              {task.dependencies.map((depId) => (
                <span
                  key={depId}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                >
                  {depId}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detailed information */}
        {detailed && showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Task ID:</span>
              <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">{task.id}</span>
            </div>
            {task.assignedAgent && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Assigned Agent:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{task.assignedAgent}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500 dark:text-gray-400">Priority:</span>
              <span className={`ml-2 font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority} ({task.priority <= 1 ? 'High' : task.priority <= 3 ? 'Medium' : 'Low'})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskQueue = ({
  tasks = [],
  onPauseTask,
  onResumeTask,
  onReorderTasks,
  detailed = false,
  compact = false
}) => {
  const [filter, setFilter] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const handleDragStart = (e, taskId) => {
    setDraggedItem(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTaskId) => {
    e.preventDefault();

    if (draggedItem && draggedItem !== targetTaskId) {
      const draggedIndex = tasks.findIndex(t => t.id === draggedItem);
      const targetIndex = tasks.findIndex(t => t.id === targetTaskId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newTaskOrder = [...tasks];
        const [draggedTask] = newTaskOrder.splice(draggedIndex, 1);
        newTaskOrder.splice(targetIndex, 0, draggedTask);

        const newTaskIds = newTaskOrder.map(t => t.id);
        onReorderTasks(newTaskIds);
      }
    }

    setDraggedItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Task Queue
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tasks.length} tasks • {statusCounts['in-progress'] || 0} active • {statusCounts.pending || 0} pending
            </p>
          </div>

          {/* Filter controls */}
          <div className="mt-4 sm:mt-0">
            <div className="flex space-x-1">
              {['all', 'in-progress', 'pending', 'paused', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  {status !== 'all' && statusCounts[status] ? ` (${statusCounts[status]})` : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Task Queue
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} tasks
          </span>
        </div>
      )}

      {/* Task list */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onPauseTask={onPauseTask}
              onResumeTask={onResumeTask}
              detailed={detailed}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all'
              ? 'The task queue is empty. Tasks will appear here when work begins.'
              : `No tasks with status "${filter.replace('-', ' ')}" found.`
            }
          </p>
        </div>
      )}

      {/* Drag and drop hint */}
      {filteredTasks.length > 1 && !compact && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          💡 Drag and drop tasks to reorder them
        </div>
      )}
    </div>
  );
};

export default TaskQueue;