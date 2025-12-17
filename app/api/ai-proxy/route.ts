import { normalizeLLMConfig, isProviderType } from "@/app/lib/config-utils";
import type { LLMConfig, ProviderType } from "@/app/types/chat";
import { ErrorCodes, type ErrorCode } from "@/app/errors/error-codes";
import { createLogger } from "@/lib/logger";
import { streamText, stepCountIs, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { createModelFromConfig } from "@/app/api/chat/helpers/model-factory";
import { classifyError } from "@/app/api/chat/helpers/error-classifier";

const logger = createLogger("AI Proxy API");

type AiProxyRequest = {
  messages: UIMessage[];
  config: AiProxyIncomingConfig;
};

type AiProxyIncomingConfig = {
  providerType: string;
  modelName: string;
  apiUrl?: string;
  apiKey: string;
  systemPrompt?: string;
  temperature?: number;
  maxToolRounds?: number;
};

type AiProxyConfig = Omit<AiProxyIncomingConfig, "providerType"> & {
  providerType: ProviderType;
};

type AiProxyRequestParamsOk = {
  ok: true;
  messages: UIMessage[];
  rawConfig: AiProxyConfig;
};

type AiProxyRequestParamsError = {
  ok: false;
  error: { code: ErrorCode; message: string; status: number };
};

type AiProxyRequestParamsResult =
  | AiProxyRequestParamsOk
  | AiProxyRequestParamsError;

function apiError(
  code: ErrorCode,
  message: string,
  status = 500,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      success: false,
      code,
      message,
      error: { code, message },
      ...(details ?? {}),
    },
    { status, statusText: message },
  );
}

function validateRequest(body: unknown): AiProxyRequestParamsResult {
  const rawBody =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : undefined;

  const messages = rawBody?.messages as UIMessage[] | undefined;
  const config = rawBody?.config as AiProxyIncomingConfig | undefined;

  if (!Array.isArray(messages) || !config) {
    return {
      ok: false,
      error: {
        code: ErrorCodes.CHAT_MISSING_PARAMS,
        message: "Missing required parameters: messages or config",
        status: 400,
      },
    };
  }

  const providerType = config.providerType;
  if (!isProviderType(providerType)) {
    return {
      ok: false,
      error: {
        code: ErrorCodes.CHAT_INVALID_CONFIG,
        message: "Invalid providerType",
        status: 400,
      },
    };
  }

  if (typeof config.modelName !== "string" || !config.modelName.trim()) {
    return {
      ok: false,
      error: {
        code: ErrorCodes.CHAT_INVALID_CONFIG,
        message: "Missing required config field: modelName",
        status: 400,
      },
    };
  }

  if (typeof config.apiKey !== "string" || !config.apiKey.trim()) {
    return {
      ok: false,
      error: {
        code: ErrorCodes.CHAT_INVALID_CONFIG,
        message: "Missing required config field: apiKey",
        status: 400,
      },
    };
  }

  return { ok: true, messages, rawConfig: { ...config, providerType } };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiProxyRequest;
    const validation = validateRequest(body);

    if (!validation.ok) {
      return apiError(
        validation.error.code,
        validation.error.message,
        validation.error.status,
      );
    }

    const normalizedConfig: LLMConfig = normalizeLLMConfig({
      providerType: validation.rawConfig.providerType,
      modelName: validation.rawConfig.modelName,
      apiUrl: validation.rawConfig.apiUrl,
      apiKey: validation.rawConfig.apiKey,
      systemPrompt: validation.rawConfig.systemPrompt,
      temperature: validation.rawConfig.temperature,
      maxToolRounds: validation.rawConfig.maxToolRounds,
    });

    const model = createModelFromConfig(normalizedConfig);
    const modelMessages = convertToModelMessages(validation.messages);

    logger.info("收到 AI 代理请求", {
      provider: normalizedConfig.providerType,
      model: normalizedConfig.modelName,
      messagesCount: modelMessages.length,
    });

    const result = streamText({
      model,
      system: normalizedConfig.systemPrompt,
      messages: modelMessages,
      temperature: normalizedConfig.temperature,
      stopWhen: stepCountIs(normalizedConfig.maxToolRounds),
      abortSignal: req.signal,
    });

    return result.toUIMessageStreamResponse({ sendReasoning: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      logger.info("[AI Proxy API] 流式响应被用户中断");
      return apiError(
        ErrorCodes.CHAT_REQUEST_CANCELLED,
        "Request cancelled by user",
        499,
      );
    }

    logger.error("AI Proxy API error", error);
    const err = error as Error;
    const classified = classifyError(err);

    return apiError(classified.code, classified.message, classified.statusCode);
  }
}
