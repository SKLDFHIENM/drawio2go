# Milestone 5: 简化服务器

## 目标

将 `server.js` 从 Socket.IO 服务器简化为纯 HTTP 服务器。

## 修改文件

- `server.js` (266 行 → ~20 行)

## 移除内容

1. Socket.IO 服务器初始化
2. `pendingRequests` Map
3. `projectMembers` Map
4. `socketJoinedProjects` Map
5. 所有 Socket 事件处理器：
   - `connection`
   - `join_project`
   - `leave_project`
   - `tool:result`
   - `disconnect`
6. `emitToolExecute` 函数导出
7. `resolvePendingRequest` 函数导出

## 保留内容

1. Next.js 应用初始化
2. HTTP 服务器创建
3. 请求处理器 (`handle`)
4. 端口监听

## 验收标准

- [ ] `server.js` 只包含纯 HTTP 服务器逻辑
- [ ] 开发环境 `npm dev` 正常启动
- [ ] 生产环境 `npm start` 正常启动
- [ ] 无 Socket.IO 相关代码残留
