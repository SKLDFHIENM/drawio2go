# Milestone 2: 前端工具定义和执行器

## 目标

将所有 DrawIO 工具定义和执行逻辑迁移到前端，后端仅作 BFF 转发以绕开 CORS 限制。

## 状态: ✅ 已完成

## 完成的工作

### 新建文件

- `app/lib/frontend-tools.ts` (929 行)

### 实现内容

#### 1. 工具定义

使用 `ai` 包的 `tool()` 函数定义三个工具：

| 工具名              | 功能         | 说明                          |
| ------------------- | ------------ | ----------------------------- |
| `drawio_read`       | 读取图表内容 | 支持 ls/id/xpath 三种查询模式 |
| `drawio_edit_batch` | 批量编辑操作 | 原子性执行，支持 6 种操作类型 |
| `drawio_overwrite`  | 完全覆盖图表 | 替换整个 XML 内容             |

#### 2. XML 处理

- 使用浏览器原生 `DOMParser` 解析 XML
- 使用浏览器原生 `XMLSerializer` 序列化 XML
- 使用 `document.evaluate()` 实现 XPath 查询
- 支持 XPath 1.0 标准，正确处理特殊字符

#### 3. 编辑操作类型

| 操作类型           | 必需字段           | 说明            |
| ------------------ | ------------------ | --------------- |
| `set_attribute`    | key, value         | 设置/更新属性值 |
| `remove_attribute` | key                | 删除属性        |
| `insert_element`   | new_xml, position? | 插入新 XML 节点 |
| `remove_element`   | -                  | 删除匹配的元素  |
| `replace_element`  | new_xml            | 替换元素        |
| `set_text_content` | value              | 设置文本内容    |

#### 4. 原子性和回滚机制

- **操作原子性**: 所有操作在内存中的 Document 对象上执行，任何操作失败则全部不生效
- **写入失败回滚**: 如果 `replaceDrawioXML` 失败，自动尝试恢复原始 XML
- **详细错误信息**: 包含失败的操作索引、定位器、操作类型等上下文

### 导出接口

```typescript
// 工具上下文接口
export interface FrontendToolContext {
  getDrawioXML: () => Promise<string>;
  replaceDrawioXML: (
    xml: string,
    options?: { description?: string },
  ) => Promise<{ success: boolean; error?: string }>;
  onVersionSnapshot?: (description: string) => void;
}

// 创建工具函数
export function createFrontendDrawioTools(
  context: FrontendToolContext,
): Record<string, Tool>;
```

### 使用示例

```typescript
import {
  createFrontendDrawioTools,
  type FrontendToolContext,
} from "@/lib/frontend-tools";

// 创建上下文（连接到 DrawIO 编辑器）
const context: FrontendToolContext = {
  getDrawioXML: async () => (await editorRef.current?.exportDiagram()) ?? "",
  replaceDrawioXML: async (xml, options) => {
    try {
      await editorRef.current?.mergeDiagram(xml);
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  },
  onVersionSnapshot: (desc) => createVersionSnapshot(desc),
};

// 创建工具集
const tools = createFrontendDrawioTools(context);

// 传递给 AI SDK 的 streamText（前端直接调用）
const result = await streamText({
  model,
  messages,
  tools,
});
```

## 验证结果

| 检查项              | 状态              |
| ------------------- | ----------------- |
| TypeScript 类型检查 | ✅ 通过           |
| ESLint 检查         | ✅ 通过           |
| Schema 兼容性       | ✅ 正确导入和使用 |
| 浏览器 API 兼容     | ✅ 使用原生 API   |

## 后续集成工作

要完成 **方案 B（全部迁移到前端）**，还需要：

### Milestone 3: 前端 AI 调用集成

1. **修改前端聊天组件**
   - 使用前端的 `streamText` 替代后端 `/api/chat` 调用
   - 在前端创建工具上下文并连接到 DrawIO 编辑器
   - 处理流式响应和工具调用循环

2. **BFF 代理端点**
   - 利用现有的 `/api/ai-proxy` 或创建新端点
   - 仅转发 HTTP 请求到 AI Provider，不处理业务逻辑
   - 处理 CORS 和 API Key 转发

3. **移除 Socket.IO 工具调用机制**
   - 不再需要 `tool:execute` / `tool:result` 事件
   - 简化 `useDrawioSocket.ts`
   - 清理后端 `tool-executor.ts` 中的相关代码

### 架构对比

| 项目     | 旧架构                    | 新架构                   |
| -------- | ------------------------- | ------------------------ |
| 工具定义 | 后端 `drawio-ai-tools.ts` | 前端 `frontend-tools.ts` |
| 工具执行 | 后端 + Socket.IO 转发     | 前端直接执行             |
| XML 处理 | 后端 `@xmldom/xmldom`     | 前端原生 `DOMParser`     |
| AI 调用  | 后端 `streamText`         | 前端 `streamText`        |
| 后端角色 | 业务逻辑 + 工具编排       | 仅 HTTP 代理             |

## 相关文件

- `app/lib/frontend-tools.ts` - 前端工具定义和执行器 ✅ 新建
- `app/lib/schemas/drawio-tool-schemas.ts` - 工具 Schema 定义（复用）
- `app/lib/constants/tool-names.ts` - 工具名称常量（复用）
- `app/types/drawio-tools.ts` - 工具返回类型（复用）
