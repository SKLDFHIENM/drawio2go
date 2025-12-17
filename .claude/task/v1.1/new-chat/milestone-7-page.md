# Milestone 7: 更新主页面

## 目标

更新 `app/page.tsx`，使用新的 `useAIChat` Hook 替代 `useDrawioSocket`。

## 修改文件

- `app/page.tsx`

## 移除内容

1. `useDrawioSocket` 导入和使用
2. Socket 连接状态相关的 UI
3. Socket 重连逻辑
4. `chatRunId` 相关逻辑（不再需要服务器端追踪）
5. 任何 Socket.IO 相关的状态和回调

## 新增内容

1. 导入新的 `useAIChat` Hook
2. 传递 DrawIO ref 给 Hook
3. 简化的聊天状态管理

## 状态简化

| 旧状态             | 新状态 | 说明               |
| ------------------ | ------ | ------------------ |
| `socketConnected`  | 移除   | 不再需要           |
| `chatRunId`        | 移除   | 前端自行管理       |
| `pendingToolCalls` | 移除   | 工具在前端同步执行 |

## 验收标准

- [ ] 聊天功能正常工作
- [ ] 工具调用正常执行
- [ ] 自动版本快照正常工作
- [ ] 无 Socket.IO 相关代码
- [ ] UI 无连接状态显示（不再需要）
