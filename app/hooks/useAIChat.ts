"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";
import {
  DefaultChatTransport,
  asSchema,
  lastAssistantMessageIsCompleteWithToolCalls,
  type Tool,
  type UIMessage,
} from "ai";
import { useChat } from "@ai-sdk/react";

import type { DrawioEditorRef } from "@/app/components/DrawioEditorNative";
import { ErrorCodes } from "@/app/errors/error-codes";
import { getDrawioXML, replaceDrawioXML } from "@/app/lib/drawio-tools";
import {
  createFrontendDrawioTools,
  type FrontendToolContext,
} from "@/app/lib/frontend-tools";
import {
  drawioEditBatchInputSchema,
  drawioOverwriteInputSchema,
  drawioReadInputSchema,
} from "@/app/lib/schemas/drawio-tool-schemas";
import { TOOL_TIMEOUT_CONFIG } from "@/lib/constants/tool-config";
import { AI_TOOL_NAMES } from "@/lib/constants/tool-names";
import { createLogger } from "@/lib/logger";
import type { LLMConfig } from "@/app/types/chat";

export type DrawioRef = RefObject<DrawioEditorRef | null>;
export type Message = UIMessage;

const logger = createLogger("useAIChat");

const CHAT_REQUEST_TIMEOUT_MS = 10 * 60_000;

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "未知错误";
}

function createAbortError(message: string): Error {
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

function mergeAbortSignals(
  signals: Array<AbortSignal | undefined>,
): AbortSignal {
  const controller = new AbortController();

  const onAbort = () => {
    controller.abort();
  };

  for (const signal of signals) {
    if (!signal) continue;
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }

  return controller.signal;
}

async function withTimeout<T>(
  task: Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<T> {
  if (timeoutMs <= 0) return await task;

  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`[${ErrorCodes.TIMEOUT}] 操作超时（${timeoutMs}ms）`));
    }, timeoutMs);
  });

  try {
    if (!signal) {
      return await Promise.race([task, timeoutPromise]);
    }

    const abortPromise = new Promise<T>((_, reject) => {
      if (signal.aborted) {
        reject(createAbortError("已取消"));
        return;
      }
      signal.addEventListener(
        "abort",
        () => reject(createAbortError("已取消")),
        { once: true },
      );
    });

    return await Promise.race([task, timeoutPromise, abortPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

type UseAIChatOptions = {
  drawioRef: DrawioRef;
  config: LLMConfig;
  projectUuid: string;
  conversationId: string;
};

type UseAIChatResult = {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  append: (message: Message) => void;
  stop: () => void;
  isLoading: boolean;
  error: Error | null;
};

const TOOL_INPUT_SCHEMAS = {
  [AI_TOOL_NAMES.DRAWIO_READ]: drawioReadInputSchema.optional(),
  [AI_TOOL_NAMES.DRAWIO_EDIT_BATCH]: drawioEditBatchInputSchema,
  [AI_TOOL_NAMES.DRAWIO_OVERWRITE]: drawioOverwriteInputSchema,
} as const;

function buildToolSchemaPayload(
  tools: Record<string, { description?: string; inputSchema: unknown }>,
) {
  const payload: Record<
    string,
    {
      description?: string;
      inputJsonSchema: unknown;
    }
  > = {};

  for (const [name, tool] of Object.entries(tools)) {
    payload[name] = {
      description: tool.description,
      inputJsonSchema: asSchema(tool.inputSchema as never).jsonSchema,
    };
  }

  return payload;
}

async function getDrawioXmlFromRef(drawioRef: DrawioRef): Promise<string> {
  if (drawioRef.current) {
    const xml = await drawioRef.current.exportDiagram();
    if (typeof xml === "string" && xml.trim()) return xml;
  }

  const storageResult = await getDrawioXML();
  if (storageResult.success && storageResult.xml) return storageResult.xml;
  throw new Error(storageResult.error || "无法获取 DrawIO XML");
}

async function replaceDrawioXmlFromRef(
  drawioRef: DrawioRef,
  xml: string,
  options?: { requestId?: string; description?: string },
): Promise<{ success: boolean; error?: string }> {
  const result = await replaceDrawioXML(xml, {
    editorRef: drawioRef,
    requestId: options?.requestId,
    description: options?.description,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error || result.message || "replace_failed",
    };
  }

  return { success: true };
}

export function useAIChat(options: UseAIChatOptions): UseAIChatResult {
  const { drawioRef, config, projectUuid, conversationId } = options;

  const [input, setInput] = useState("");
  const [toolError, setToolError] = useState<Error | null>(null);

  const toolExecutionQueueRef = useRef<Promise<void>>(Promise.resolve());
  const activeRequestAbortRef = useRef<AbortController | null>(null);
  const activeToolAbortRef = useRef<AbortController | null>(null);
  const currentToolCallIdRef = useRef<string | null>(null);

  const frontendToolContext = useMemo<FrontendToolContext>(() => {
    return {
      getDrawioXML: async () => await getDrawioXmlFromRef(drawioRef),
      replaceDrawioXML: async (xml, ctxOptions) => {
        return await replaceDrawioXmlFromRef(drawioRef, xml, {
          requestId: currentToolCallIdRef.current ?? undefined,
          description: ctxOptions?.description,
        });
      },
      onVersionSnapshot: (description) => {
        // 可选：上层可监听这里做版本快照（当前 Hook 仅保留扩展点）
        logger.info("触发版本快照（占位）", { description });
      },
    };
  }, [drawioRef]);

  const frontendTools = useMemo(
    () => createFrontendDrawioTools(frontendToolContext),
    [frontendToolContext],
  );

  const frontendToolsRef = useRef(frontendTools);
  useEffect(() => {
    frontendToolsRef.current = frontendTools;
  }, [frontendTools]);

  const chatTransport = useMemo(() => {
    const fetchWithAbort: typeof fetch = async (request, init) => {
      const abortController = new AbortController();
      activeRequestAbortRef.current = abortController;

      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, CHAT_REQUEST_TIMEOUT_MS);

      try {
        const mergedSignal = mergeAbortSignals([
          init?.signal as AbortSignal | undefined,
          abortController.signal,
        ]);
        const nextInit = { ...init, signal: mergedSignal };
        return await fetch(request, nextInit);
      } finally {
        clearTimeout(timeoutId);
        if (activeRequestAbortRef.current === abortController) {
          activeRequestAbortRef.current = null;
        }
      }
    };

    return new DefaultChatTransport<Message>({
      api: "/api/ai-proxy",
      fetch: fetchWithAbort,
      prepareSendMessagesRequest: async (transportOptions) => {
        const toolSchemas = buildToolSchemaPayload(frontendToolsRef.current);

        return {
          body: {
            ...(transportOptions.body ?? {}),
            config,
            projectUuid,
            conversationId,
            tools: toolSchemas,
            messages: transportOptions.messages,
          },
        };
      },
    });
  }, [config, projectUuid, conversationId]);

  const {
    messages,
    sendMessage,
    stop: stopChat,
    status,
    error: chatError,
    addToolResult,
    clearError,
  } = useChat<Message>({
    id: conversationId,
    transport: chatTransport,
    onError: (error) => {
      logger.error("聊天请求失败", { error });
    },
    onToolCall: async ({ toolCall }) => {
      toolExecutionQueueRef.current = toolExecutionQueueRef.current
        .then(async () => {
          await executeToolCall({
            toolCall,
            toolsRef: frontendToolsRef,
            addToolResult,
            setToolError,
            currentToolCallIdRef,
            activeToolAbortRef,
          });
        })
        .catch((error) => {
          logger.error("工具队列执行失败", { error });
        });

      await toolExecutionQueueRef.current;
    },
    sendAutomaticallyWhen: ({ messages: currentMessages }) =>
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: currentMessages,
      }),
  });

  const append = useCallback(
    (message: Message) => {
      setToolError(null);
      clearError();
      sendMessage(message).catch((error) => {
        if (isAbortError(error)) return;
        logger.error("发送消息失败", { error });
      });
    },
    [clearError, sendMessage],
  );

  const stop = useCallback(() => {
    activeRequestAbortRef.current?.abort();
    activeToolAbortRef.current?.abort();

    stopChat().catch((error) => {
      if (isAbortError(error)) return;
      logger.warn("停止聊天失败", { error });
    });
  }, [stopChat]);

  const isLoading = status === "submitted" || status === "streaming";
  const error = toolError ?? chatError ?? null;

  return {
    messages,
    input,
    setInput,
    append,
    stop,
    isLoading,
    error,
  };
}

type AddToolResultFn = (
  args:
    | {
        state?: "output-available";
        tool: string;
        toolCallId: string;
        output: unknown;
      }
    | {
        state: "output-error";
        tool: string;
        toolCallId: string;
        errorText: string;
      },
) => Promise<void>;

async function executeToolCall(options: {
  toolCall: { toolCallId: string; toolName: string; input: unknown };
  toolsRef: MutableRefObject<Record<string, Tool>>;
  addToolResult: AddToolResultFn;
  setToolError: (error: Error | null) => void;
  currentToolCallIdRef: MutableRefObject<string | null>;
  activeToolAbortRef: MutableRefObject<AbortController | null>;
}): Promise<void> {
  const {
    toolCall,
    addToolResult,
    setToolError,
    currentToolCallIdRef,
    activeToolAbortRef,
  } = options;
  const toolName = toolCall.toolName;
  const toolCallId = toolCall.toolCallId;

  const tool = options.toolsRef.current[toolName];

  if (!tool || typeof tool.execute !== "function") {
    const errorText = `未知工具: ${toolName}`;
    setToolError(new Error(errorText));
    await addToolResult({
      state: "output-error",
      tool: toolName,
      toolCallId,
      errorText,
    });
    return;
  }

  const schema = (
    TOOL_INPUT_SCHEMAS as Record<
      string,
      { safeParse: (input: unknown) => { success: boolean; data?: unknown } }
    >
  )[toolName];
  if (!schema) {
    const errorText = `缺少工具 schema: ${toolName}`;
    setToolError(new Error(errorText));
    await addToolResult({
      state: "output-error",
      tool: toolName,
      toolCallId,
      errorText,
    });
    return;
  }

  const parsed = schema.safeParse(toolCall.input);
  if (!parsed.success) {
    const errorText = `工具输入校验失败: ${toolName}`;
    setToolError(new Error(errorText));
    await addToolResult({
      state: "output-error",
      tool: toolName,
      toolCallId,
      errorText,
    });
    return;
  }

  currentToolCallIdRef.current = toolCallId;
  const abortController = new AbortController();
  activeToolAbortRef.current = abortController;

  try {
    const timeoutMs =
      TOOL_TIMEOUT_CONFIG[toolName as keyof typeof TOOL_TIMEOUT_CONFIG] ??
      30_000;

    const output = await withTimeout(
      Promise.resolve(
        tool.execute(parsed.data as never, {
          toolCallId,
          messages: [],
          abortSignal: abortController.signal,
        }),
      ),
      timeoutMs,
      abortController.signal,
    );

    await addToolResult({
      tool: toolName,
      toolCallId,
      output,
    });
  } catch (error) {
    if (isAbortError(error)) {
      await addToolResult({
        state: "output-error",
        tool: toolName,
        toolCallId,
        errorText: "已取消",
      });
      return;
    }

    const errorText = toErrorMessage(error);
    setToolError(error instanceof Error ? error : new Error(errorText));

    await addToolResult({
      state: "output-error",
      tool: toolName,
      toolCallId,
      errorText,
    });
  } finally {
    if (activeToolAbortRef.current === abortController) {
      activeToolAbortRef.current = null;
    }
    if (currentToolCallIdRef.current === toolCallId) {
      currentToolCallIdRef.current = null;
    }
  }
}
