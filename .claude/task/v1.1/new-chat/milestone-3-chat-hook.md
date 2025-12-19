# Milestone 3: 重构聊天 Hook

## 目标

创建新的聊天 Hook，使用 AI SDK 的 `useChat` 并在前端执行工具。

## 新建文件

- `app/hooks/useAIChat.ts`

## 职责

1. 封装 `@ai-sdk/react` 的 `useChat`
2. 配置 API 端点指向 `/api/ai-proxy`
3. 实现 `onToolCall` 回调，在前端执行所有工具
4. 处理请求取消（使用 `AbortController`）
5. 处理错误和超时

## 接口设计

```typescript
function useAIChat(options: {
  drawioRef: DrawioRef;
  config: LLMConfig;
  projectUuid: string;
  conversationId: string;
}): {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  append: (message: Message) => void;
  stop: () => void;
  isLoading: boolean;
  error: Error | null;
};
```

## 与旧 Hook 的区别

| 特性     | useDrawioSocket (旧) | useAIChat (新) |
| -------- | -------------------- | -------------- |
| 通信方式 | HTTP + Socket.IO     | 纯 HTTP        |
| 工具执行 | 后端转发             | 前端直接执行   |
| 复杂度   | 642 行               | ~150 行        |

## 验收标准

- [ ] 能发送消息并接收流式响应
- [ ] 工具调用在前端正确执行
- [ ] 支持取消正在进行的请求
- [ ] 错误处理完善
