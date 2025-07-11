import { n8nService } from './n8nService';

export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo: string;
  assignedBy: string;
  documentId?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  assignedTo: string;
  documentId?: string;
  estimatedHours?: number;
  tags?: string[];
}

class TaskService {
  private mockTasks: TaskData[] = [
    {
      id: '1',
      title: 'Review TechCorp Service Agreement',
      description: 'Legal review required for annual service agreement with TechCorp',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date('2024-01-25').toISOString(),
      assignedTo: 'Umar',
      assignedBy: 'Legal Team',
      createdAt: new Date('2024-01-20').toISOString(),
      updatedAt: new Date('2024-01-22').toISOString(),
      documentId: '1',
      estimatedHours: 4,
      actualHours: 2,
      tags: ['review', 'urgent']
    },
    {
      id: '2',
      title: 'Update NDA Template',
      description: 'Incorporate new privacy clauses into standard NDA template',
      status: 'todo',
      priority: 'medium',
      assignedTo: 'Legal Team',
      assignedBy: 'Umar',
      createdAt: new Date('2024-01-18').toISOString(),
      updatedAt: new Date('2024-01-18').toISOString(),
      estimatedHours: 2,
      tags: ['template', 'update']
    }
  ];

  async createTask(taskData: CreateTaskData): Promise<TaskData> {
    try {
      const newTask: TaskData = {
        id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description,
        status: 'todo',
        priority: taskData.priority,
        dueDate: taskData.dueDate?.toISOString(),
        assignedTo: taskData.assignedTo,
        assignedBy: 'current-user-id',
        documentId: taskData.documentId,
        estimatedHours: taskData.estimatedHours,
        tags: taskData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockTasks.push(newTask);

      // Send N8N webhook
      const mockUser = {
        id: 'current-user-id',
        name: 'Current User',
        email: 'user@example.com',
        role: 'team'
      };
      await n8nService.taskCreated(mockUser, newTask);

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async getTasks(status?: string, assignedTo?: string): Promise<TaskData[]> {
    try {
      let filteredTasks = [...this.mockTasks];

      if (status) {
        filteredTasks = filteredTasks.filter(task => task.status === status);
      }

      if (assignedTo) {
        filteredTasks = filteredTasks.filter(task => task.assignedTo === assignedTo);
      }

      return filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTask(id: string): Promise<TaskData | null> {
    try {
      return this.mockTasks.find(task => task.id === id) || null;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<TaskData>): Promise<TaskData> {
    try {
      const taskIndex = this.mockTasks.findIndex(task => task.id === id);
      if (taskIndex === -1) throw new Error('Task not found');

      const oldTask = this.mockTasks[taskIndex];
      const updatedTask = {
        ...oldTask,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.mockTasks[taskIndex] = updatedTask;

      // Send N8N webhook for task update
      const mockUser = {
        id: 'current-user-id',
        name: 'Current User',
        email: 'user@example.com',
        role: 'team'
      };
      await n8nService.taskUpdated(mockUser, updatedTask, updates);

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const taskIndex = this.mockTasks.findIndex(task => task.id === id);
      if (taskIndex === -1) throw new Error('Task not found');

      const task = this.mockTasks[taskIndex];
      this.mockTasks.splice(taskIndex, 1);

      // Send N8N webhook
      const mockUser = {
        id: 'current-user-id',
        name: 'Current User',
        email: 'user@example.com',
        role: 'team'
      };
      await n8nService.taskDeleted(mockUser, task);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async completeTask(id: string, actualHours?: number): Promise<TaskData> {
    try {
      const updates: Partial<TaskData> = {
        status: 'completed',
        actualHours,
      };

      const updatedTask = await this.updateTask(id, updates);

      // Send N8N webhook for task completion
      const mockUser = {
        id: 'current-user-id',
        name: 'Current User',
        email: 'user@example.com',
        role: 'team'
      };
      await n8nService.taskCompleted(mockUser, updatedTask);

      return updatedTask;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  async getTasksByDocument(documentId: string): Promise<TaskData[]> {
    try {
      return this.mockTasks.filter(task => task.documentId === documentId);
    } catch (error) {
      console.error('Error fetching tasks by document:', error);
      throw error;
    }
  }
}

export const taskService = new TaskService();