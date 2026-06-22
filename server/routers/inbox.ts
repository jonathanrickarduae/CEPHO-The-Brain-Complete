import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function callGmailMCP(toolName: string, input: Record<string, unknown>) {
  const inputJson = JSON.stringify(input);
  const cmd = `manus-mcp-cli tool call ${toolName} --server gmail --input '${inputJson.replace(/'/g, "'\\''")}'`;
  try {
    const { stdout } = await execAsync(cmd, { timeout: 30000 });
    // Parse the output — manus-mcp-cli returns JSON result
    const lines = stdout.trim().split("\n");
    // Find the JSON result line (last non-empty line or line starting with {)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith("{") || line.startsWith("[")) {
        return JSON.parse(line);
      }
    }
    // Try parsing the whole output
    return JSON.parse(stdout.trim());
  } catch (err: any) {
    throw new Error(`Gmail MCP error: ${err.message}`);
  }
}

export const inboxRouter = router({
  list: protectedProcedure
    .input(z.object({
      query: z.string().default("in:inbox"),
      maxResults: z.number().default(30),
      pageToken: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const result = await callGmailMCP("gmail_search_messages", {
        query: input.query,
        max_results: input.maxResults,
        ...(input.pageToken ? { page_token: input.pageToken } : {}),
      });
      // Result is an array of message objects with payload.headers
      return Array.isArray(result) ? result : (result.messages ?? result.data ?? []);
    }),

  send: protectedProcedure
    .input(z.object({
      to: z.string(),
      subject: z.string(),
      body: z.string(),
      isDraft: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const result = await callGmailMCP("gmail_send_messages", {
        messages: [{
          to: input.to,
          subject: input.subject,
          body: input.body,
          is_draft: input.isDraft,
        }],
      });
      return result;
    }),
});
