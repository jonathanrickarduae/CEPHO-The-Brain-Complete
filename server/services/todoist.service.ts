import { ENV } from "../_core/env";

const TODOIST_API_BASE = "https://api.todoist.com/rest/v2";

function getHeaders(apiKey?: string) {
  return {
    Authorization: `Bearer ${apiKey ?? ENV.todoistApiKey}`,
    "Content-Type": "application/json",
  };
}

export interface TodoistProject {
  id: string;
  name: string;
  commentCount: number;
  color: string;
  isShared: boolean;
  isFavorite: boolean;
  isInboxProject: boolean;
  isTeamInbox: boolean;
  order: number;
  parentId: string | null;
  url: string;
}

export interface TodoistTask {
  id: string;
  projectId: string;
  sectionId: string | null;
  content: string;
  description: string;
  isCompleted: boolean;
  labels: string[];
  order: number;
  priority: 1 | 2 | 3 | 4;
  due: {
    date: string;
    isRecurring: boolean;
    datetime: string | null;
    string: string;
    timezone: string | null;
  } | null;
  url: string;
  commentCount: number;
  createdAt: string;
  creatorId: string;
  assigneeId: string | null;
  assignerId: string | null;
  parentId: string | null;
}

export class TodoistService {
  private apiKey: string;
  private baseUrl = TODOIST_API_BASE;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? ENV.todoistApiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private headers() {
    return getHeaders(this.apiKey);
  }

  /** Get all projects */
  async getProjects(): Promise<TodoistProject[]> {
    const res = await fetch(`${this.baseUrl}/projects`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Todoist getProjects failed: ${res.statusText}`);
    const data = await res.json();
    return data.map(this.mapProject);
  }

  /** Get a single project */
  async getProject(projectId: string): Promise<TodoistProject> {
    const res = await fetch(`${this.baseUrl}/projects/${projectId}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Todoist getProject failed: ${res.statusText}`);
    return this.mapProject(await res.json());
  }

  /** Create a project */
  async createProject(
    name: string,
    options?: { color?: string; parentId?: string; isFavorite?: boolean }
  ): Promise<TodoistProject> {
    const res = await fetch(`${this.baseUrl}/projects`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        name,
        color: options?.color,
        parent_id: options?.parentId,
        is_favorite: options?.isFavorite,
      }),
    });
    if (!res.ok) throw new Error(`Todoist createProject failed: ${res.statusText}`);
    return this.mapProject(await res.json());
  }

  /** Get all tasks (optionally filtered) */
  async getTasks(options?: {
    projectId?: string;
    sectionId?: string;
    label?: string;
    filter?: string;
    lang?: string;
    ids?: string[];
  }): Promise<TodoistTask[]> {
    const params = new URLSearchParams();
    if (options?.projectId) params.set("project_id", options.projectId);
    if (options?.sectionId) params.set("section_id", options.sectionId);
    if (options?.label) params.set("label", options.label);
    if (options?.filter) params.set("filter", options.filter);
    if (options?.ids) params.set("ids", options.ids.join(","));

    const url = `${this.baseUrl}/tasks${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) throw new Error(`Todoist getTasks failed: ${res.statusText}`);
    const data = await res.json();
    return data.map(this.mapTask);
  }

  /** Get a single task */
  async getTask(taskId: string): Promise<TodoistTask> {
    const res = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Todoist getTask failed: ${res.statusText}`);
    return this.mapTask(await res.json());
  }

  /** Create a task */
  async createTask(options: {
    content: string;
    description?: string;
    projectId?: string;
    sectionId?: string;
    parentId?: string;
    labels?: string[];
    priority?: 1 | 2 | 3 | 4;
    dueString?: string;
    dueDate?: string;
    dueDatetime?: string;
    assigneeId?: string;
  }): Promise<TodoistTask> {
    const res = await fetch(`${this.baseUrl}/tasks`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        content: options.content,
        description: options.description,
        project_id: options.projectId,
        section_id: options.sectionId,
        parent_id: options.parentId,
        labels: options.labels,
        priority: options.priority,
        due_string: options.dueString,
        due_date: options.dueDate,
        due_datetime: options.dueDatetime,
        assignee_id: options.assigneeId,
      }),
    });
    if (!res.ok) throw new Error(`Todoist createTask failed: ${res.statusText}`);
    return this.mapTask(await res.json());
  }

  /** Update a task */
  async updateTask(
    taskId: string,
    updates: Partial<{
      content: string;
      description: string;
      labels: string[];
      priority: 1 | 2 | 3 | 4;
      dueString: string;
      dueDate: string;
      dueDatetime: string;
      assigneeId: string;
    }>
  ): Promise<TodoistTask> {
    const res = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        content: updates.content,
        description: updates.description,
        labels: updates.labels,
        priority: updates.priority,
        due_string: updates.dueString,
        due_date: updates.dueDate,
        due_datetime: updates.dueDatetime,
        assignee_id: updates.assigneeId,
      }),
    });
    if (!res.ok) throw new Error(`Todoist updateTask failed: ${res.statusText}`);
    return this.mapTask(await res.json());
  }

  /** Close (complete) a task */
  async closeTask(taskId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/tasks/${taskId}/close`, {
      method: "POST",
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Todoist closeTask failed: ${res.statusText}`);
  }

  /** Reopen a task */
  async reopenTask(taskId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/tasks/${taskId}/reopen`, {
      method: "POST",
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Todoist reopenTask failed: ${res.statusText}`);
  }

  /** Delete a task */
  async deleteTask(taskId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Todoist deleteTask failed: ${res.statusText}`);
  }

  /** Get today's tasks */
  async getTodaysTasks(): Promise<TodoistTask[]> {
    return this.getTasks({ filter: "today | overdue" });
  }

  /** Test connection */
  async testConnection(): Promise<{ ok: boolean; projectCount?: number; error?: string }> {
    try {
      const projects = await this.getProjects();
      return { ok: true, projectCount: projects.length };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }

  private mapProject(p: Record<string, unknown>): TodoistProject {
    return {
      id: p.id as string,
      name: p.name as string,
      commentCount: (p.comment_count as number) ?? 0,
      color: p.color as string,
      isShared: (p.is_shared as boolean) ?? false,
      isFavorite: (p.is_favorite as boolean) ?? false,
      isInboxProject: (p.is_inbox_project as boolean) ?? false,
      isTeamInbox: (p.is_team_inbox as boolean) ?? false,
      order: (p.order as number) ?? 0,
      parentId: (p.parent_id as string) ?? null,
      url: p.url as string,
    };
  }

  private mapTask(t: Record<string, unknown>): TodoistTask {
    return {
      id: t.id as string,
      projectId: t.project_id as string,
      sectionId: (t.section_id as string) ?? null,
      content: t.content as string,
      description: (t.description as string) ?? "",
      isCompleted: (t.is_completed as boolean) ?? false,
      labels: (t.labels as string[]) ?? [],
      order: (t.order as number) ?? 0,
      priority: (t.priority as 1 | 2 | 3 | 4) ?? 1,
      due: t.due
        ? {
            date: (t.due as Record<string, unknown>).date as string,
            isRecurring: (t.due as Record<string, unknown>).is_recurring as boolean,
            datetime: ((t.due as Record<string, unknown>).datetime as string) ?? null,
            string: (t.due as Record<string, unknown>).string as string,
            timezone: ((t.due as Record<string, unknown>).timezone as string) ?? null,
          }
        : null,
      url: t.url as string,
      commentCount: (t.comment_count as number) ?? 0,
      createdAt: t.created_at as string,
      creatorId: t.creator_id as string,
      assigneeId: (t.assignee_id as string) ?? null,
      assignerId: (t.assigner_id as string) ?? null,
      parentId: (t.parent_id as string) ?? null,
    };
  }
}

export const todoistService = new TodoistService();
export default TodoistService;
