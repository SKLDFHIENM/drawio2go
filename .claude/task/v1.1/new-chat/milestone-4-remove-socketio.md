# Milestone 4: 删除 Socket.IO 相关代码

## 目标

彻底移除所有 Socket.IO 相关的代码和依赖。

## 删除文件

| 文件                           | 行数 | 说明                   |
| ------------------------------ | ---- | ---------------------- |
| `app/hooks/useDrawioSocket.ts` | 642  | Socket.IO 客户端 Hook  |
| `app/types/socket-protocol.ts` | ~100 | Socket.IO 协议类型定义 |
| `app/lib/tool-executor.ts`     | ~200 | 后端工具执行器         |
| `app/api/chat/cancel/route.ts` | ~50  | 取消聊天 API           |
| `app/api/chat/unload/route.ts` | ~30  | 卸载清理 API           |

## 移除依赖

从 `package.json` 中移除：

- `socket.io`
- `socket.io-client`

## 清理引用

搜索并清理以下关键词的引用：

- `socket.io`
- `useDrawioSocket`
- `tool:execute`
- `tool:result`
- `tool:cancel`
- `pendingRequests`
- `projectMembers`
- `socketJoinedProjects`

## 验收标准

- [ ] 所有 Socket.IO 相关文件已删除
- [ ] `package.json` 中无 socket.io 依赖
- [ ] 代码中无 Socket.IO 相关引用
- [ ] 项目能正常编译
