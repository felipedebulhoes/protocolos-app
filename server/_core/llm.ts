import { env } from "./env";

type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = { type: "text"; text: string };
export type ImageContent = { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };
export type FileContent = {
  type: "file_url";
  file_url: { url: string; mime_type?: string };
};

export type Message = {
  role: Role;
  content: string | Array<ImageContent | TextContent | FileContent>;
};

export interface InvokeLLMParams {
  model?: string;
  messages: Message[];
  tools?: unknown[];
  tool_choice?: unknown;
  response_format?: unknown;
  thinking?: unknown;
  reasoning?: unknown;
  temperature?: number;
  max_tokens?: number;
}

export interface InvokeLLMResult {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason?: string;
  }>;
  [key: string]: unknown;
}

const base = () => (env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");

export async function invokeLLM(params: InvokeLLMParams): Promise<InvokeLLMResult> {
  const body: Record<string, unknown> = {
    model: params.model ?? "gpt-4o",
    messages: params.messages,
  };
  if (params.tools) body.tools = params.tools;
  if (params.tool_choice) body.tool_choice = params.tool_choice;
  if (params.response_format) body.response_format = params.response_format;
  if (params.thinking) body.thinking = params.thinking;
  if (params.reasoning) body.reasoning = params.reasoning;
  if (params.temperature !== undefined) body.temperature = params.temperature;
  if (params.max_tokens !== undefined) body.max_tokens = params.max_tokens;

  const resp = await fetch(`${base()}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.BUILT_IN_FORGE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`LLM request failed (${resp.status}): ${text}`);
  }
  return (await resp.json()) as InvokeLLMResult;
}

export async function listLLMModels(): Promise<{ data: Array<{ id: string; [k: string]: unknown }> }> {
  const resp = await fetch(`${base()}/v1/models`, {
    headers: { Authorization: `Bearer ${env.BUILT_IN_FORGE_API_KEY}` },
  });
  if (!resp.ok) {
    throw new Error(`listLLMModels failed (${resp.status})`);
  }
  return (await resp.json()) as { data: Array<{ id: string }> };
}
