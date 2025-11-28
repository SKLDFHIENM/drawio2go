import type { UIMessage } from "ai";

export type ProviderType =
  | "openai-reasoning"
  | "openai-compatible"
  | "deepseek";

export interface LLMConfig {
  apiUrl: string;
  apiKey: string;
  temperature: number;
  modelName: string;
  systemPrompt: string;
  providerType: ProviderType;
  maxToolRounds: number;
}

export type ToolInvocationState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | "call"
  | "result";

export type ToolInvocationType =
  | "tool-call"
  | "tool-result"
  | "dynamic-tool"
  | "tool-invocation"
  | `tool-${string}`;

export interface ToolInvocation {
  type: ToolInvocationType;
  toolCallId?: string;
  toolName?: string;
  state?: ToolInvocationState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  providerExecuted?: boolean;
  preliminary?: boolean;
  dynamic?: boolean;
  invalid?: boolean;
  toolInvocation?: unknown;
  rawInput?: unknown;
  xmlVersionId?: string; // 关联的 XML 版本 ID
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolInvocations?: ToolInvocation[];
  createdAt?: Date;
}

export interface MessageMetadata {
  modelName?: string | null;
  createdAt?: number;
}

export type ChatUIMessage = UIMessage<MessageMetadata>;

// 会话管理相关类型（使用 UIMessage 从 @ai-sdk/react）
export interface ChatSession {
  id: string; // 唯一标识（UUID）
  title: string; // 会话标题（自动生成）
  messages: ChatUIMessage[]; // 消息列表
  createdAt: number; // 创建时间戳
  updatedAt: number; // 最后更新时间戳
}

// 所有会话集合
export interface ChatSessionsData {
  sessions: Record<string, ChatSession>; // 会话字典
  activeSessionId: string | null; // 当前活动会话 ID
  sessionOrder: string[]; // 会话显示顺序（按时间倒序）
}

// JSON 导出格式
export interface ChatExportData {
  version: string;
  exportDate: string;
  sessions: ChatSession[];
}
