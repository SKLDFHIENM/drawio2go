# Milestone 1: 创建 BFF 纯代理端点

## 目标

创建一个纯粹的 AI 代理端点，只负责转发请求到 AI 提供商，不做任何业务逻辑处理。

## 新建文件

- `app/api/ai-proxy/route.ts`

## 职责

1. 接收前端请求 (messages, config)
2. 从 config 中提取 AI 配置 (providerType, modelName, apiUrl, apiKey)
3. 创建对应的 AI 模型实例
4. 调用 `streamText()` 转发请求
5. 流式返回响应

## 请求格式

```typescript
{
  messages: Message[],
  config: {
    providerType: string,
    modelName: string,
    apiUrl?: string,
    apiKey: string,
    systemPrompt?: string,
    temperature?: number,
    maxToolRounds?: number
  }
}
```

## 依赖

- 复用现有的 `createModelFromConfig` 函数
- 使用 `@ai-sdk/core` 的 `streamText`

## 验收标准

- [ ] 端点能接收前端请求并转发到 AI 提供商
- [ ] 支持 OpenAI、DeepSeek、Anthropic 等提供商
- [ ] 正确处理流式响应
- [ ] 不包含任何业务逻辑（无会话验证、无项目隔离）
