import { query } from "@anthropic-ai/claude-agent-sdk";
import type { HookJSONOutput } from "@anthropic-ai/claude-agent-sdk";
import * as path from "path";
import { AGENT_PROMPT } from "./agent-prompt";
import type { SDKMessage, SDKUserMessage } from "./types";
import {
  type AttachmentPayload,
  type ContentBlock,
} from "../shared/types/messages";
import { composeUserContent } from "./messages";
import {
  ensureSessionWorkspace,
  getSessionWorkspacePath,
} from "./utils/session-workspace";

export interface AIQueryOptions {
  maxTurns?: number;
  cwd?: string;
  model?: string;
  allowedTools?: string[];
  systemPrompt?: string;
  mcpServers?: any;
  hooks?: any;
  resume?: string;
}

export class AIClient {
  private defaultOptions: AIQueryOptions;
  private readonly sessionId: string | null;
  private readonly workspaceReady: Promise<string> | null;

  constructor(sessionId?: string, options?: Partial<AIQueryOptions>) {
    this.sessionId = sessionId ?? null;

    const workspacePath = this.sessionId
      ? getSessionWorkspacePath(this.sessionId)
      : process.cwd();

    this.workspaceReady = this.sessionId
      ? ensureSessionWorkspace(this.sessionId)
      : null;

    this.defaultOptions = {
      maxTurns: 100,
      cwd: workspacePath,
      // model: "opus",
      allowedTools: [
        "Task", "Bash", "Glob", "Grep", "LS", "ExitPlanMode", "Read", "Edit", "MultiEdit", "Write", "NotebookEdit",
        "WebFetch", "TodoWrite", "WebSearch", "BashOutput", "KillBash",
      ],
      // appendSystemPrompt: AGENT_PROMPT,
      systemPrompt: AGENT_PROMPT,
      mcpServers: {
        "n8n-mcp": {
          command: "npx",
          args: ["n8n-mcp"],
          env: {
            MCP_MODE: "stdio",
            LOG_LEVEL: "error",
            DISABLE_CONSOLE_OUTPUT: "true",
            N8N_API_URL: process.env.N8N_API_URL || "http://localhost:5678/",
            N8N_API_KEY: process.env.N8N_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZTdkNzA0MS04NDc1LTRkMzAtYmFhZS00NjkyMDlmY2MwZTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYxMjA3OTAzfQ.MOsZqs4udjGgmf3mhF8zew-9M281lu4o_2zsA7WgG1A",
          }
        }
      },
      hooks: {
        PreToolUse: [
          {
            matcher: "Write|Edit|MultiEdit",
            hooks: [
              async (input: any): Promise<HookJSONOutput> => {
                const toolName = input.tool_name;
                const toolInput = input.tool_input;

                if (!['Write', 'Edit', 'MultiEdit'].includes(toolName)) {
                  return { continue: true };
                }

                let filePath = '';
                if (toolName === 'Write' || toolName === 'Edit') {
                  filePath = toolInput.file_path || '';
                } else if (toolName === 'MultiEdit') {
                  filePath = toolInput.file_path || '';
                }

                const ext = path.extname(filePath).toLowerCase();
                if (ext === '.js' || ext === '.ts') {
                  const customScriptsPath = path.join(process.cwd(), 'agent', 'custom_scripts');

                  if (!filePath.startsWith(customScriptsPath)) {
                    return {
                      decision: 'block',
                      stopReason: `Script files (.js and .ts) must be written to the custom_scripts directory. Please use the path: ${customScriptsPath}/${path.basename(filePath)}`,
                      continue: false
                    };
                  }
                }

                return { continue: true };
              }
            ]
          }
        ]
      },
      ...options
    };
  }

  async *queryStream(
    prompt:
      | string
      | AsyncIterable<SDKUserMessage>
      | {
          user:
            | {
                text: string;
                attachments?: AttachmentPayload[];
                sessionId?: string;
              }
            | {
                content: ContentBlock[];
                sessionId?: string;
              };
        },
    options?: Partial<AIQueryOptions>,
  ): AsyncIterable<SDKMessage> {
    if (this.workspaceReady) {
      await this.workspaceReady;
    }

    const mergedOptions = { ...this.defaultOptions, ...options };

    console.log("=== AIClient queryStream 完整配置 ===");
    console.log("maxTurns:", mergedOptions.maxTurns);
    console.log("cwd:", mergedOptions.cwd);
    console.log("model:", mergedOptions.model);
    console.log("allowedTools:", mergedOptions.allowedTools);
    console.log("\n--- mcpServers 配置 ---");
    console.log(JSON.stringify(mergedOptions.mcpServers, null, 2));
    console.log("\n--- hooks 配置结构 ---");
    console.log("hooks keys:", Object.keys(mergedOptions.hooks || {}));
    if (mergedOptions.hooks?.PreToolUse) {
      console.log("PreToolUse hooks count:", mergedOptions.hooks.PreToolUse.length);
      mergedOptions.hooks.PreToolUse.forEach((hook: any, index: number) => {
        console.log(`  Hook ${index}:`, {
          matcher: hook.matcher,
          hooksCount: hook.hooks?.length || 0
        });
      });
    }
    console.log("\n--- systemPrompt (前200字符) ---");
    console.log(mergedOptions.systemPrompt?.substring(0, 200) + "...");
    console.log("=====================================\n");

    const promptSource = this.resolvePrompt(prompt);

    for await (const message of query({
      prompt: promptSource,
      options: mergedOptions,
    })) {
      console.log("AIClient queryStream message:", message);
      yield message;
    }
  }

  async querySingle(prompt: string, options?: Partial<AIQueryOptions>): Promise<{
    messages: SDKMessage[];
    cost: number;
    duration: number;
  }> {
    const messages: SDKMessage[] = [];
    let totalCost = 0;
    let duration = 0;

    for await (const message of this.queryStream(prompt, options)) {
      messages.push(message);

      if (message.type === "result" && message.subtype === "success") {
        totalCost = message.total_cost_usd;
        duration = message.duration_ms;
      }
    }

    return { messages, cost: totalCost, duration };
  }

  private resolvePrompt(
    prompt:
      | string
      | AsyncIterable<SDKUserMessage>
      | {
          user:
            | {
                text: string;
                attachments?: AttachmentPayload[];
                sessionId?: string;
              }
            | {
                content: ContentBlock[];
                sessionId?: string;
              };
        },
  ): string | AsyncIterable<SDKUserMessage> {
    if (typeof prompt === "string") {
      return prompt;
    }

    if (isAsyncIterable(prompt)) {
      return prompt;
    }

    if ("user" in prompt) {
      const { user } = prompt;
      const sessionId = user.sessionId;

      let content: ContentBlock[];
      if ("content" in user) {
        content = user.content;
      } else {
        content = composeUserContent(user.text, user.attachments);
      }

      return createUserMessageGenerator(content, sessionId);
    }

    throw new Error("Unsupported prompt type for AIClient.queryStream");
  }
}

const isAsyncIterable = (
  value: unknown,
): value is AsyncIterable<SDKUserMessage> => {
  return Boolean(
    value &&
      typeof value === "object" &&
      Symbol.asyncIterator in (value as AsyncIterable<SDKUserMessage>),
  );
};

const createUserMessageGenerator = (
  content: ContentBlock[],
  sessionId?: string,
): AsyncIterable<SDKUserMessage> => {
  return (async function* generateMessages() {
    const message = {
      type: "user",
      parent_tool_use_id: null,
      message: {
        role: "user",
        content,
      },
    } as SDKUserMessage;

    if (sessionId) {
      message.session_id = sessionId;
    }

    yield message;
  })();
};
