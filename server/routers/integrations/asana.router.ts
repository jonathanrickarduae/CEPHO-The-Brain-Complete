import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { getAsanaService } from "../../services/asana-integration";

export const asanaRouter = router({
  /**
   * Get all Asana workspaces
   */
  getWorkspaces: protectedProcedure.query(async () => {
    const asana = getAsanaService();
    return await asana.getWorkspaces();
  }),

  /**
   * Get all projects in a workspace
   */
  getProjects: protectedProcedure
    .input(z.object({ workspaceGid: z.string() }))
    .query(async ({ input }) => {
      const asana = getAsanaService();
      return await asana.getProjects(input.workspaceGid);
    }),

  /**
   * Create a new Asana project
   */
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        notes: z.string().optional(),
        color: z.string().optional(),
        workspaceGid: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const asana = getAsanaService();
      return await asana.createProject(input);
    }),

  /**
   * Get all tasks in a project
   */
  getTasksInProject: protectedProcedure
    .input(z.object({ projectGid: z.string() }))
    .query(async ({ input }) => {
      const asana = getAsanaService();
      return await asana.getTasksInProject(input.projectGid);
    }),

  /**
   * Create a new task
   */
  createTask: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        notes: z.string().optional(),
        projectGid: z.string(),
        dueOn: z.string().optional(),
        assigneeGid: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const asana = getAsanaService();
      return await asana.createTask(input);
    }),

  /**
   * Update task status
   */
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskGid: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const asana = getAsanaService();
      return await asana.updateTaskStatus(input.taskGid, input.completed);
    }),

  /**
   * Sync a CEPHO project to Asana
   */
  syncProjectToAsana: protectedProcedure
    .input(
      z.object({
        name: z.string(),
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
      const asana = getAsanaService();
      return await asana.syncProjectToAsana(input);
    }),
});
