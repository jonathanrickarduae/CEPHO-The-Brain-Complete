import axios from "axios";
import { logger } from "../utils/logger";
import { ENV } from "../_core/env";
const log = logger.module("AsanaIntegration");

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
  private baseUrl = "https://app.asana.com/api/1.0";

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? ENV.asanaApiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /** Test connection by fetching workspaces */
  async testConnection(): Promise<{ ok: boolean; workspaceCount?: number; error?: string }> {
    try {
      const workspaces = await this.getWorkspaces();
      return { ok: true, workspaceCount: workspaces.length };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
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
    } catch (error: unknown) {
      log.error(
        "[Asana] Failed to get workspaces:",
        (error as { response?: { data?: unknown }; message?: string }).response?.data || (error as Error).message
      );
      throw new Error(`Failed to get Asana workspaces: ${(error as Error).message}`);
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
    } catch (error: unknown) {
      log.error(
        "[Asana] Failed to get projects:",
        (error as { response?: { data?: unknown }; message?: string }).response?.data || (error as Error).message
      );
      throw new Error(`Failed to get Asana projects: ${(error as Error).message}`);
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
          throw new Error("No Asana workspaces found");
        }
        workspaceGid = workspaces[0].gid;
      }

      const response = await axios.post(
        `${this.baseUrl}/projects`,
        {
          data: {
            name: options.name,
            notes: options.notes || "",
            color: options.color || "light-blue",
            workspace: workspaceGid,
          },
        },
        {
          headers: this.getHeaders(),
        }
      );

      log.debug(
        `[Asana] Created project: ${options.name} (${response.data.data.gid})`
      );
      return response.data.data;
    } catch (error: unknown) {
      log.error(
        "[Asana] Failed to create project:",
        (error as { response?: { data?: unknown }; message?: string }).response?.data || (error as Error).message
      );
      throw new Error(`Failed to create Asana project: ${(error as Error).message}`);
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
    } catch (error: unknown) {
      log.error(
        "[Asana] Failed to get tasks:",
        (error as { response?: { data?: unknown }; message?: string }).response?.data || (error as Error).message
      );
      throw new Error(`Failed to get Asana tasks: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new task
   */
  async createTask(options: CreateTaskOptions): Promise<AsanaTask> {
    try {
      const taskData: Record<string, unknown> = {
        name: options.name,
        notes: options.notes || "",
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

      log.debug(
        `[Asana] Created task: ${options.name} (${response.data.data.gid})`
      );
      return response.data.data;
    } catch (error: unknown) {
      log.error(
        "[Asana] Failed to create task:",
        (error as { response?: { data?: unknown }; message?: string }).response?.data || (error as Error).message
      );
      throw new Error(`Failed to create Asana task: ${(error as Error).message}`);
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskGid: string,
    completed: boolean
  ): Promise<AsanaTask> {
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

      log.debug(
        `[Asana] Updated task ${taskGid} status to: ${completed ? "completed" : "incomplete"}`
      );
      return response.data.data;
    } catch (error: unknown) {
      log.error(
        "[Asana] Failed to update task:",
        (error as { response?: { data?: unknown }; message?: string }).response?.data || (error as Error).message
      );
      throw new Error(`Failed to update Asana task: ${(error as Error).message}`);
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
        notes: cephoProject.description || "",
        color: "light-blue",
      });

      // Create tasks
      const createdTasks = [];
      for (const task of cephoProject.tasks) {
        const asanaTask = await this.createTask({
          name: task.title,
          notes: task.description || "",
          projectGid: asanaProject.gid,
          dueOn: task.dueDate,
        });

        // Mark as completed if status is 'completed'
        if (task.status === "completed") {
          await this.updateTaskStatus(asanaTask.gid, true);
        }

        createdTasks.push(asanaTask);
      }

      log.debug(
        `[Asana] Synced project "${cephoProject.name}" with ${createdTasks.length} tasks`
      );

      return {
        project: asanaProject,
        tasks: createdTasks,
      };
    } catch (error: unknown) {
      log.error("[Asana] Failed to sync project:", (error as Error).message);
      throw error;
    }
  }
}

// Singleton instance — uses ENV.asanaApiKey (ASANA_API env var)
let _asanaService: AsanaIntegrationService | null = null;

export function getAsanaService(): AsanaIntegrationService {
  if (!_asanaService) {
    _asanaService = new AsanaIntegrationService();
  }
  return _asanaService;
}

export const asanaService = new AsanaIntegrationService();
