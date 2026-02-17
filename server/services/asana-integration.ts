import axios from 'axios';

interface AsanaProject {
  gid: string;
  name: string;
  workspace: { gid: string; name: string };
}

interface AsanaTask {
  gid: string;
  name: string;
  completed: boolean;
  due_on?: string;
  assignee?: { gid: string; name: string };
}

interface CreateProjectOptions {
  name: string;
  notes?: string;
  color?: string;
  workspaceGid?: string;
}

interface CreateTaskOptions {
  name: string;
  notes?: string;
  projectGid: string;
  dueOn?: string;
  assigneeGid?: string;
}

export class AsanaIntegrationService {
  private apiKey: string;
  private baseUrl = 'https://app.asana.com/api/1.0';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Asana API key is required');
    }
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get all workspaces
   */
  async getWorkspaces() {
    try {
      const response = await axios.get(`${this.baseUrl}/workspaces`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      console.error('[Asana] Failed to get workspaces:', error.response?.data || error.message);
      throw new Error(`Failed to get Asana workspaces: ${error.message}`);
    }
  }

  /**
   * Get all projects in a workspace
   */
  async getProjects(workspaceGid: string): Promise<AsanaProject[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/projects`, {
        headers: this.getHeaders(),
        params: {
          workspace: workspaceGid,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('[Asana] Failed to get projects:', error.response?.data || error.message);
      throw new Error(`Failed to get Asana projects: ${error.message}`);
    }
  }

  /**
   * Create a new project
   */
  async createProject(options: CreateProjectOptions): Promise<AsanaProject> {
    try {
      // Get default workspace if not provided
      let workspaceGid = options.workspaceGid;
      if (!workspaceGid) {
        const workspaces = await this.getWorkspaces();
        if (workspaces.length === 0) {
          throw new Error('No Asana workspaces found');
        }
        workspaceGid = workspaces[0].gid;
      }

      const response = await axios.post(
        `${this.baseUrl}/projects`,
        {
          data: {
            name: options.name,
            notes: options.notes || '',
            color: options.color || 'light-blue',
            workspace: workspaceGid,
          },
        },
        {
          headers: this.getHeaders(),
        }
      );

      console.log(`[Asana] Created project: ${options.name} (${response.data.data.gid})`);
      return response.data.data;
    } catch (error: any) {
      console.error('[Asana] Failed to create project:', error.response?.data || error.message);
      throw new Error(`Failed to create Asana project: ${error.message}`);
    }
  }

  /**
   * Get all tasks in a project
   */
  async getTasksInProject(projectGid: string): Promise<AsanaTask[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tasks`, {
        headers: this.getHeaders(),
        params: {
          project: projectGid,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('[Asana] Failed to get tasks:', error.response?.data || error.message);
      throw new Error(`Failed to get Asana tasks: ${error.message}`);
    }
  }

  /**
   * Create a new task
   */
  async createTask(options: CreateTaskOptions): Promise<AsanaTask> {
    try {
      const taskData: any = {
        name: options.name,
        notes: options.notes || '',
        projects: [options.projectGid],
      };

      if (options.dueOn) {
        taskData.due_on = options.dueOn;
      }

      if (options.assigneeGid) {
        taskData.assignee = options.assigneeGid;
      }

      const response = await axios.post(
        `${this.baseUrl}/tasks`,
        {
          data: taskData,
        },
        {
          headers: this.getHeaders(),
        }
      );

      console.log(`[Asana] Created task: ${options.name} (${response.data.data.gid})`);
      return response.data.data;
    } catch (error: any) {
      console.error('[Asana] Failed to create task:', error.response?.data || error.message);
      throw new Error(`Failed to create Asana task: ${error.message}`);
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskGid: string, completed: boolean): Promise<AsanaTask> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/tasks/${taskGid}`,
        {
          data: {
            completed,
          },
        },
        {
          headers: this.getHeaders(),
        }
      );

      console.log(`[Asana] Updated task ${taskGid} status to: ${completed ? 'completed' : 'incomplete'}`);
      return response.data.data;
    } catch (error: any) {
      console.error('[Asana] Failed to update task:', error.response?.data || error.message);
      throw new Error(`Failed to update Asana task: ${error.message}`);
    }
  }

  /**
   * Sync CEPHO project to Asana
   * Creates an Asana project and tasks based on CEPHO project data
   */
  async syncProjectToAsana(cephoProject: {
    name: string;
    description?: string;
    tasks: Array<{
      title: string;
      description?: string;
      dueDate?: string;
      status: string;
    }>;
  }) {
    try {
      // Create Asana project
      const asanaProject = await this.createProject({
        name: cephoProject.name,
        notes: cephoProject.description || '',
        color: 'light-blue',
      });

      // Create tasks
      const createdTasks = [];
      for (const task of cephoProject.tasks) {
        const asanaTask = await this.createTask({
          name: task.title,
          notes: task.description || '',
          projectGid: asanaProject.gid,
          dueOn: task.dueDate,
        });

        // Mark as completed if status is 'completed'
        if (task.status === 'completed') {
          await this.updateTaskStatus(asanaTask.gid, true);
        }

        createdTasks.push(asanaTask);
      }

      console.log(`[Asana] Synced project "${cephoProject.name}" with ${createdTasks.length} tasks`);

      return {
        project: asanaProject,
        tasks: createdTasks,
      };
    } catch (error: any) {
      console.error('[Asana] Failed to sync project:', error.message);
      throw error;
    }
  }
}

// Singleton instance
let asanaService: AsanaIntegrationService | null = null;

export function getAsanaService(): AsanaIntegrationService {
  if (!asanaService) {
    const apiKey = process.env.ASANA_API_KEY;
    if (!apiKey) {
      throw new Error('ASANA_API_KEY environment variable is not set');
    }
    asanaService = new AsanaIntegrationService(apiKey);
  }
  return asanaService;
}
