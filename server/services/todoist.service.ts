import axios from 'axios';
import { logger } from '../utils/logger';

const log = logger.module('TodoistService');

const TODOIST_API_BASE = 'https://api.todoist.com/rest/v2';

interface TodoistTask {
  id: string;
  content: string;
  description: string;
  project_id: string;
  section_id?: string;
  parent_id?: string;
  order: number;
  priority: number; // 1-4 (4 is highest)
  due?: {
    date: string;
    string: string;
    datetime?: string;
    timezone?: string;
  };
  labels: string[];
  is_completed: boolean;
  created_at: string;
  url: string;
}

interface TodoistProject {
  id: string;
  name: string;
  color: string;
  parent_id?: string;
  order: number;
  is_favorite: boolean;
  is_inbox_project: boolean;
  is_team_inbox: boolean;
  view_style: string;
  url: string;
}

export class TodoistService {
  private apiKey: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TODOIST_API_KEY || '';
    
    if (!this.apiKey) {
      log.warn('Todoist API key not configured');
    }
  }
  
  /**
   * Get all active tasks
   */
  async getTasks(filter?: string): Promise<TodoistTask[]> {
    if (!this.apiKey) {
      throw new Error('Todoist API key not configured');
    }
    
    try {
      const params: any = {};
      if (filter) {
        params.filter = filter;
      }
      
      const response = await axios.get(`${TODOIST_API_BASE}/tasks`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        params,
      });
      
      return response.data;
    } catch (error: any) {
      log.error('Failed to get Todoist tasks:', error);
      throw new Error(`Failed to get Todoist tasks: ${error.message}`);
    }
  }
  
  /**
   * Get a specific task by ID
   */
  async getTask(taskId: string): Promise<TodoistTask> {
    if (!this.apiKey) {
      throw new Error('Todoist API key not configured');
    }
    
    try {
      const response = await axios.get(`${TODOIST_API_BASE}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      log.error(`Failed to get Todoist task ${taskId}:`, error);
      throw new Error(`Failed to get Todoist task: ${error.message}`);
    }
  }
  
  /**
   * Create a new task
   */
  async createTask(task: {
    content: string;
    description?: string;
    project_id?: string;
    section_id?: string;
    parent_id?: string;
    order?: number;
    labels?: string[];
    priority?: number; // 1-4
    due_string?: string; // e.g., "tomorrow at 12:00"
    due_date?: string; // YYYY-MM-DD
    due_datetime?: string; // ISO 8601
  }): Promise<TodoistTask> {
    if (!this.apiKey) {
      throw new Error('Todoist API key not configured');
    }
    
    try {
      const response = await axios.post(
        `${TODOIST_API_BASE}/tasks`,
        task,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      log.info(`Created Todoist task: ${task.content}`);
      return response.data;
    } catch (error: any) {
      log.error('Failed to create Todoist task:', error);
      throw new Error(`Failed to create Todoist task: ${error.message}`);
    }
  }
  
  /**
   * Update a task
   */
  async updateTask(taskId: string, updates: {
    content?: string;
    description?: string;
    labels?: string[];
    priority?: number;
    due_string?: string;
    due_date?: string;
    due_datetime?: string;
  }): Promise<TodoistTask> {
    if (!this.apiKey) {
      throw new Error('Todoist API key not configured');
    }
    
    try {
      const response = await axios.post(
        `${TODOIST_API_BASE}/tasks/${taskId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      log.info(`Updated Todoist task: ${taskId}`);
      return response.data;
    } catch (error: any) {
      log.error(`Failed to update Todoist task ${taskId}:`, error);
      throw new Error(`Failed to update Todoist task: ${error.message}`);
    }
  }
  
  /**
   * Complete a task
   */
  async completeTask(taskId: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Todoist API key not configured');
    }
    
    try {
      await axios.post(
        `${TODOIST_API_BASE}/tasks/${taskId}/close`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      
      log.info(`Completed Todoist task: ${taskId}`);
    } catch (error: any) {
      log.error(`Failed to complete Todoist task ${taskId}:`, error);
      throw new Error(`Failed to complete Todoist task: ${error.message}`);
    }
  }
  
  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Todoist API key not configured');
    }
    
    try {
      await axios.delete(`${TODOIST_API_BASE}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      log.info(`Deleted Todoist task: ${taskId}`);
    } catch (error: any) {
      log.error(`Failed to delete Todoist task ${taskId}:`, error);
      throw new Error(`Failed to delete Todoist task: ${error.message}`);
    }
  }
  
  /**
   * Get all projects
   */
  async getProjects(): Promise<TodoistProject[]> {
    if (!this.apiKey) {
      throw new Error('Todoist API key not configured');
    }
    
    try {
      const response = await axios.get(`${TODOIST_API_BASE}/projects`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      log.error('Failed to get Todoist projects:', error);
      throw new Error(`Failed to get Todoist projects: ${error.message}`);
    }
  }
  
  /**
   * Get tasks by priority
   */
  async getTasksByPriority(priority: number): Promise<TodoistTask[]> {
    const tasks = await this.getTasks();
    return tasks.filter(t => t.priority === priority && !t.is_completed);
  }
  
  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<TodoistTask[]> {
    return await this.getTasks('overdue');
  }
  
  /**
   * Get tasks due today
   */
  async getTasksDueToday(): Promise<TodoistTask[]> {
    return await this.getTasks('today');
  }
  
  /**
   * Get tasks due this week
   */
  async getTasksDueThisWeek(): Promise<TodoistTask[]> {
    return await this.getTasks('7 days');
  }
  
  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getTasks();
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Convert Todoist priority (1-4) to our priority (urgent/high/normal/low)
   */
  convertPriority(todoistPriority: number): 'urgent' | 'high' | 'normal' | 'low' {
    switch (todoistPriority) {
      case 4: return 'urgent';
      case 3: return 'high';
      case 2: return 'normal';
      case 1:
      default: return 'low';
    }
  }
  
  /**
   * Convert our priority to Todoist priority
   */
  convertPriorityToTodoist(priority: 'urgent' | 'high' | 'normal' | 'low'): number {
    switch (priority) {
      case 'urgent': return 4;
      case 'high': return 3;
      case 'normal': return 2;
      case 'low':
      default: return 1;
    }
  }
}

// Export singleton instance
export const todoistService = new TodoistService();
