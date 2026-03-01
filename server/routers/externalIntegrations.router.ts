/**
 * External Integrations Router
 *
 * Exposes tRPC procedures for all third-party API integrations:
 * Notion, Trello, Calendly, Zoom, GitHub, Email (Gmail/SMTP),
 * Anthropic (Claude), Synthesia, Todoist, and Asana.
 *
 * Each sub-router is namespaced under its service name.
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { ENV } from "../_core/env";

// ─── Notion Router ────────────────────────────────────────────────────────────
export const notionRouter = router({
  isConfigured: protectedProcedure.query(() => {
    return { configured: !!ENV.notionApiKey };
  }),

  testConnection: protectedProcedure.mutation(async () => {
    const { notionService } = await import("../services/notion.service");
    return notionService.testConnection();
  }),

  listDatabases: protectedProcedure.query(async () => {
    const { notionService } = await import("../services/notion.service");
    if (!notionService.isConfigured()) return [];
    return notionService.listDatabases();
  }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        filter: z.enum(["page", "database"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const { notionService } = await import("../services/notion.service");
      if (!notionService.isConfigured()) return { results: [] };
      return notionService.search(input.query, input.filter);
    }),

  queryDatabase: protectedProcedure
    .input(
      z.object({
        databaseId: z.string(),
        filter: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .query(async ({ input }) => {
      const { notionService } = await import("../services/notion.service");
      return notionService.queryDatabase(input.databaseId, input.filter);
    }),

  createPage: protectedProcedure
    .input(
      z.object({
        databaseId: z.string(),
        properties: z.record(z.string(), z.unknown()),
        children: z.array(z.record(z.string(), z.unknown())).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { notionService } = await import("../services/notion.service");
      return notionService.createPage(
        input.databaseId,
        input.properties,
        input.children
      );
    }),
});

// ─── Trello Router ────────────────────────────────────────────────────────────
export const trelloRouter = router({
  isConfigured: protectedProcedure.query(() => {
    return { configured: !!(ENV.trelloApiKey && ENV.trelloApiSecret) };
  }),

  testConnection: protectedProcedure.mutation(async () => {
    const { trelloService } = await import("../services/trello.service");
    return trelloService.testConnection();
  }),

  getBoards: protectedProcedure.query(async () => {
    const { trelloService } = await import("../services/trello.service");
    if (!trelloService.isConfigured()) return [];
    return trelloService.getBoards();
  }),

  getLists: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ input }) => {
      const { trelloService } = await import("../services/trello.service");
      return trelloService.getLists(input.boardId);
    }),

  getCards: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ input }) => {
      const { trelloService } = await import("../services/trello.service");
      return trelloService.getCards(input.boardId);
    }),

  createCard: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        name: z.string().min(1),
        desc: z.string().optional(),
        due: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { trelloService } = await import("../services/trello.service");
      return trelloService.createCard(
        input.listId,
        input.name,
        input.desc,
        input.due
      );
    }),

  updateCard: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        name: z.string().optional(),
        desc: z.string().optional(),
        due: z.string().optional(),
        closed: z.boolean().optional(),
        idList: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { trelloService } = await import("../services/trello.service");
      const { cardId, ...updates } = input;
      return trelloService.updateCard(cardId, updates);
    }),
});

// ─── Calendly Router ──────────────────────────────────────────────────────────
export const calendlyRouter = router({
  isConfigured: protectedProcedure.query(() => {
    return { configured: !!ENV.calendlyApiKey };
  }),

  testConnection: protectedProcedure.mutation(async () => {
    const { calendlyService } = await import("../services/calendly.service");
    return calendlyService.testConnection();
  }),

  getCurrentUser: protectedProcedure.query(async () => {
    const { calendlyService } = await import("../services/calendly.service");
    if (!calendlyService.isConfigured())
      return { uri: "", name: "", email: "", schedulingUrl: "", timezone: "" };
    return calendlyService.getCurrentUser();
  }),

  getTodaysEvents: protectedProcedure.query(async () => {
    const { calendlyService } = await import("../services/calendly.service");
    if (!calendlyService.isConfigured()) return [];
    return calendlyService.getTodaysEvents();
  }),

  listEvents: protectedProcedure
    .input(
      z.object({
        minStartTime: z.string().optional(),
        maxStartTime: z.string().optional(),
        status: z.enum(["active", "canceled"]).optional(),
        count: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { calendlyService } = await import("../services/calendly.service");
      if (!calendlyService.isConfigured()) return [];
      const user = await calendlyService.getCurrentUser();
      return calendlyService.listEvents(user.uri, input);
    }),

  getEventInvitees: protectedProcedure
    .input(z.object({ eventUri: z.string() }))
    .query(async ({ input }) => {
      const { calendlyService } = await import("../services/calendly.service");
      return calendlyService.getEventInvitees(input.eventUri);
    }),
});

// ─── Zoom Router ──────────────────────────────────────────────────────────────
export const zoomRouter = router({
  isConfigured: protectedProcedure.query(() => {
    return {
      configured: !!(
        ENV.zoomAccountId &&
        ENV.zoomClientId &&
        ENV.zoomClientSecret
      ),
    };
  }),

  testConnection: protectedProcedure.mutation(async () => {
    const { zoomService } = await import("../services/zoom.service");
    return zoomService.testConnection();
  }),

  getCurrentUser: protectedProcedure.query(async () => {
    const { zoomService } = await import("../services/zoom.service");
    if (!zoomService.isConfigured()) return null;
    return zoomService.getCurrentUser();
  }),

  listMeetings: protectedProcedure
    .input(
      z.object({
        type: z.enum(["scheduled", "live", "upcoming"]).default("upcoming"),
      })
    )
    .query(async ({ input }) => {
      const { zoomService } = await import("../services/zoom.service");
      if (!zoomService.isConfigured()) return [];
      return zoomService.listMeetings(input.type);
    }),

  createMeeting: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1),
        startTime: z.string(),
        duration: z.number().min(1).max(1440),
        agenda: z.string().optional(),
        timezone: z.string().optional(),
        password: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { zoomService } = await import("../services/zoom.service");
      return zoomService.createMeeting(input);
    }),

  deleteMeeting: protectedProcedure
    .input(z.object({ meetingId: z.number() }))
    .mutation(async ({ input }) => {
      const { zoomService } = await import("../services/zoom.service");
      await zoomService.deleteMeeting(input.meetingId);
      return { success: true };
    }),
});

// ─── GitHub Router ────────────────────────────────────────────────────────────
export const githubRouter = router({
  isConfigured: protectedProcedure.query(() => {
    return { configured: !!ENV.githubToken };
  }),

  testConnection: protectedProcedure.mutation(async () => {
    const { githubService } = await import("../services/github.service");
    return githubService.testConnection();
  }),

  getCurrentUser: protectedProcedure.query(async () => {
    const { githubService } = await import("../services/github.service");
    if (!githubService.isConfigured()) return null;
    return githubService.getCurrentUser();
  }),

  listRepos: protectedProcedure
    .input(
      z.object({
        type: z.enum(["all", "owner", "public", "private"]).default("all"),
        sort: z
          .enum(["updated", "created", "pushed", "full_name"])
          .default("updated"),
        perPage: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const { githubService } = await import("../services/github.service");
      if (!githubService.isConfigured()) return [];
      return githubService.listRepos(input.type, input.sort, input.perPage);
    }),

  listIssues: protectedProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
        state: z.enum(["open", "closed", "all"]).default("open"),
      })
    )
    .query(async ({ input }) => {
      const { githubService } = await import("../services/github.service");
      return githubService.listIssues(input.owner, input.repo, input.state);
    }),

  createIssue: protectedProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
        title: z.string().min(1),
        body: z.string().optional(),
        labels: z.array(z.string()).optional(),
        assignees: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { githubService } = await import("../services/github.service");
      return githubService.createIssue(
        input.owner,
        input.repo,
        input.title,
        input.body,
        input.labels,
        input.assignees
      );
    }),

  listPullRequests: protectedProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
        state: z.enum(["open", "closed", "all"]).default("open"),
      })
    )
    .query(async ({ input }) => {
      const { githubService } = await import("../services/github.service");
      return githubService.listPullRequests(
        input.owner,
        input.repo,
        input.state
      );
    }),
});

// ─── Email Router ─────────────────────────────────────────────────────────────
export const emailRouter = router({
  isConfigured: protectedProcedure.query(() => {
    return { configured: !!(ENV.smtpUser && ENV.smtpPass) };
  }),

  testConnection: protectedProcedure.mutation(async () => {
    const { emailService } = await import("../services/email.service");
    return emailService.testConnection();
  }),

  send: protectedProcedure
    .input(
      z.object({
        to: z.union([z.string().email(), z.array(z.string().email())]),
        subject: z.string().min(1),
        text: z.string().optional(),
        html: z.string().optional(),
        cc: z.union([z.string(), z.array(z.string())]).optional(),
        bcc: z.union([z.string(), z.array(z.string())]).optional(),
        replyTo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { emailService } = await import("../services/email.service");
      return emailService.send(input);
    }),

  sendNotification: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { emailService } = await import("../services/email.service");
      return emailService.sendNotification(input.to, input.subject, input.body);
    }),
});

// ─── Anthropic Router ─────────────────────────────────────────────────────────
export const anthropicRouter = router({
  isConfigured: protectedProcedure.query(() => {
    return { configured: !!ENV.anthropicApiKey };
  }),

  testConnection: protectedProcedure.mutation(async () => {
    const { anthropicService } = await import("../services/anthropic.service");
    return anthropicService.testConnection();
  }),

  ask: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        systemPrompt: z.string().optional(),
        model: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { anthropicService } = await import("../services/anthropic.service");
      const content = await anthropicService.ask(
        input.prompt,
        input.systemPrompt,
        input.model
      );
      return { content };
    }),

  complete: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        system: z.string().optional(),
        model: z.string().optional(),
        maxTokens: z.number().optional(),
        temperature: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { anthropicService } = await import("../services/anthropic.service");
      return anthropicService.complete(input.messages, {
        system: input.system,
        model: input.model,
        maxTokens: input.maxTokens,
        temperature: input.temperature,
      });
    }),
});

// ─── Synthesia Router ─────────────────────────────────────────────────────────
export const synthesiaRouter = router({
  isConfigured: protectedProcedure.query(() => {
    return { configured: !!ENV.synthesiaApiKey };
  }),

  testConnection: protectedProcedure.mutation(async () => {
    const { synthesiaService } = await import("../services/synthesia.service");
    return synthesiaService.testConnection();
  }),

  listAvatars: protectedProcedure.query(async () => {
    const { synthesiaService } = await import("../services/synthesia.service");
    if (!synthesiaService.isConfigured()) return [];
    return synthesiaService.listAvatars();
  }),

  listVideos: protectedProcedure.query(async () => {
    const { synthesiaService } = await import("../services/synthesia.service");
    if (!synthesiaService.isConfigured()) return [];
    return synthesiaService.listVideos();
  }),

  getVideo: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      const { synthesiaService } = await import("../services/synthesia.service");
      return synthesiaService.getVideo(input.videoId);
    }),

  createVideo: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        visibility: z.enum(["public", "private"]).default("private"),
        test: z.boolean().default(true),
        input: z.array(
          z.object({
            avatarId: z.string().optional(),
            script: z.string().min(1),
            voiceId: z.string().optional(),
            backgroundId: z.string().optional(),
            backgroundColor: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { synthesiaService } = await import("../services/synthesia.service");
      return synthesiaService.createVideo(input);
    }),
});

// ─── Todoist Router ───────────────────────────────────────────────────────────
export const todoistRouter = router({
  isConfigured: protectedProcedure.query(() => {
    return { configured: !!ENV.todoistApiKey };
  }),

  testConnection: protectedProcedure.mutation(async () => {
    const { todoistService } = await import("../services/todoist.service");
    return todoistService.testConnection();
  }),

  getProjects: protectedProcedure.query(async () => {
    const { todoistService } = await import("../services/todoist.service");
    if (!todoistService.isConfigured()) return [];
    return todoistService.getProjects();
  }),

  getTasks: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        filter: z.string().optional(),
        label: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { todoistService } = await import("../services/todoist.service");
      if (!todoistService.isConfigured()) return [];
      return todoistService.getTasks(input);
    }),

  getTodaysTasks: protectedProcedure.query(async () => {
    const { todoistService } = await import("../services/todoist.service");
    if (!todoistService.isConfigured()) return [];
    return todoistService.getTodaysTasks();
  }),

  createTask: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        description: z.string().optional(),
        projectId: z.string().optional(),
        priority: z.number().min(1).max(4).optional(),
        dueString: z.string().optional(),
        dueDate: z.string().optional(),
        labels: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { todoistService } = await import("../services/todoist.service");
      return todoistService.createTask({
        ...input,
        priority: input.priority as 1 | 2 | 3 | 4 | undefined,
      });
    }),

  closeTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      const { todoistService } = await import("../services/todoist.service");
      await todoistService.closeTask(input.taskId);
      return { success: true };
    }),

  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      const { todoistService } = await import("../services/todoist.service");
      await todoistService.deleteTask(input.taskId);
      return { success: true };
    }),
});

// ─── Asana Router ─────────────────────────────────────────────────────────────
export const asanaRouter = router({
  isConfigured: protectedProcedure.query(() => {
    return { configured: !!ENV.asanaApiKey };
  }),

  testConnection: protectedProcedure.mutation(async () => {
    const { asanaService } = await import("../services/asana-integration");
    return asanaService.testConnection();
  }),

  getWorkspaces: protectedProcedure.query(async () => {
    const { asanaService } = await import("../services/asana-integration");
    if (!asanaService.isConfigured()) return [];
    return asanaService.getWorkspaces();
  }),

  getProjects: protectedProcedure
    .input(z.object({ workspaceGid: z.string() }))
    .query(async ({ input }) => {
      const { asanaService } = await import("../services/asana-integration");
      return asanaService.getProjects(input.workspaceGid);
    }),

  getTasksInProject: protectedProcedure
    .input(z.object({ projectGid: z.string() }))
    .query(async ({ input }) => {
      const { asanaService } = await import("../services/asana-integration");
      return asanaService.getTasksInProject(input.projectGid);
    }),

  createTask: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        notes: z.string().optional(),
        projectGid: z.string(),
        dueOn: z.string().optional(),
        assigneeGid: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { asanaService } = await import("../services/asana-integration");
      return asanaService.createTask(input);
    }),

  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskGid: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const { asanaService } = await import("../services/asana-integration");
      return asanaService.updateTaskStatus(input.taskGid, input.completed);
    }),

  syncProject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        tasks: z.array(
          z.object({
            title: z.string(),
            description: z.string().optional(),
            dueDate: z.string().optional(),
            status: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { asanaService } = await import("../services/asana-integration");
      return asanaService.syncProjectToAsana(input);
    }),
});
