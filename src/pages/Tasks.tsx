import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, Flag, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { taskService, TaskData, CreateTaskData } from '../services/taskService';

export default function Tasks() {
  const [activeTab, setActiveTab] = useState<'todo' | 'completed'>('todo');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState<CreateTaskData>({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    tags: []
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await taskService.getTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const todoTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const handleCreateTask = async () => {
    try {
      if (!newTask.title.trim() || !newTask.assignedTo.trim()) {
        alert('Please fill in all required fields');
        return;
      }

      await taskService.createTask(newTask);
      setShowNewTaskForm(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        tags: []
      });
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await taskService.completeTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (confirm('Are you sure you want to delete this task?')) {
        await taskService.deleteTask(taskId);
        await loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskData['status']) => {
    try {
      await taskService.updateTask(taskId, { status });
      await loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600 bg-red-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50',
      urgent: 'text-purple-600 bg-purple-50'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getPriorityIcon = (priority: string) => {
    return <Flag size={14} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">Manage your tasks and assignments</p>
        </div>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select 
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value ? new Date(e.target.value) : undefined})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign To *</label>
              <input
                type="text"
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter assignee name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
              <input
                type="text"
                onChange={(e) => setNewTask({...newTask, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="urgent, review, legal"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-6">
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Task
            </button>
            <button
              onClick={() => setShowNewTaskForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex space-x-6 p-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('todo')}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === 'todo'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            To-do ({todoTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({completedTasks.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'todo' && (
            <div className="space-y-4">
              {todoTasks.length > 0 ? (
                todoTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span>{task.assignedTo}</span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                            {getPriorityIcon(task.priority)}
                            <span className="capitalize">{task.priority}</span>
                          </div>
                        </div>
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {task.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskData['status'])}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                          title="Mark as Complete"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending tasks</h3>
                  <p className="text-gray-600">You're all caught up! Create a new task to get started.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="space-y-4">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-700 mb-2 line-through">{task.title}</h4>
                        <p className="text-sm text-gray-500 mb-3">{task.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span>{task.assignedTo}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>Completed {new Date(task.updatedAt).toLocaleDateString()}</span>
                          </div>
                          {task.actualHours && (
                            <span>{task.actualHours}h actual</span>
                          )}
                        </div>
                      </div>
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed tasks</h3>
                  <p className="text-gray-600">Completed tasks will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}